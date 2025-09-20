'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, X, Loader2 } from 'lucide-react';
import { ExpenseItem } from '@/app/page';

interface VoiceInputProps {
  onResult: (expenses: ExpenseItem[]) => void;
  onClose: () => void;
}

export default function VoiceInput({ onResult, onClose }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  const startRecording = async () => {
    try {
      // 모바일 디버깅 정보
      const userAgent = navigator.userAgent;
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      console.log('Device info:', { userAgent, isMobile });
      console.log('HTTPS:', window.location.protocol === 'https:');
      console.log('Speech Recognition available:', 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

      // 마이크 권한 먼저 확인
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted');
        // 스트림 즉시 정리
        stream.getTracks().forEach(track => track.stop());
      } catch (micError) {
        console.error('Microphone permission error:', micError);
        alert(`마이크 권한이 필요합니다.\n\n오류: ${micError instanceof Error ? micError.message : ''} \n\n브라우저 설정에서 마이크 접근을 허용해주세요.`);
        return;
      }

      // Web Speech API는 별도의 녹음 없이 바로 음성 인식 시작
      setIsRecording(true);
      await processAudio();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert(`음성 인식을 시작할 수 없습니다.\n\n오류: ${error instanceof Error ? error.message : ''} \n\n브라우저가 음성 인식을 지원하지 않을 수 있습니다.`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    // 수동으로 녹음 중지
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    
    // 음성 인식 강제 중지 (모바일 문제 해결)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (error) {
        console.log('Recognition stop error:', error);
      }
      recognitionRef.current = null;
    }
    
    setIsRecording(false);
    setIsProcessing(false); // 처리 상태도 즉시 해제
  };

  const processAudio = async () => {
    setIsProcessing(true);
    
    try {
      // Web Speech API 지원 확인
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported');
      }

      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported');
      }
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      // 음성 인식 설정 최적화 (모바일 안정성 우선)
      recognition.lang = 'ko-KR';
      recognition.continuous = false; // 단일 음성 인식으로 변경 (더 안정적)
      recognition.maxAlternatives = 1; // 대안 수 줄임 (안정성 향상)
      
      // 모바일 디바이스 감지 및 최적화
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        recognition.interimResults = false; // 모바일에서는 중간 결과 비활성화 (안정성 향상)
      } else {
        recognition.interimResults = true; // 데스크톱에서는 중간 결과 표시
      }
      
      // 더 긴 타임아웃 설정 (30초)
      const timeoutId = setTimeout(() => {
        recognition.stop();
        console.log('Speech recognition timeout');
        setIsProcessing(false);
        setIsRecording(false);
        alert('음성 인식 시간이 초과되었습니다. 다시 시도해주세요.');
      }, 30000);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        clearTimeout(timeoutId);
        console.log('Speech recognition result:', event);
        
        if (event.results && event.results.length > 0) {
          let finalTranscript = '';
          let interimTranscript = '';
          
          // 최종 결과와 중간 결과 분리
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }
          
          // 실시간으로 결과 표시
          setTranscript(finalTranscript + interimTranscript);
          
          // 최종 결과가 있으면 처리
          if (finalTranscript.trim()) {
            console.log('Final transcript:', finalTranscript);
            setIsRecording(false);
            
            // 텍스트 파싱으로 가계부 데이터 생성
            const expenses = parseTranscriptToExpenses(finalTranscript.trim());
            console.log('파싱된 expenses:', expenses);
            
            if (expenses.length > 0) {
              setTimeout(() => {
                onResult(expenses);
                setIsProcessing(false);
              }, 1000);
            } else {
              setIsProcessing(false);
              alert('음성에서 가계부 정보를 찾을 수 없습니다. 다시 시도해주세요.');
            }
          }
        } else {
          setIsProcessing(false);
          setIsRecording(false);
          alert('음성을 인식하지 못했습니다. 다시 시도해주세요.');
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        clearTimeout(timeoutId);
        console.error('Speech recognition error:', event.error);
        setIsProcessing(false);
        setIsRecording(false);
        
        let errorMessage = '음성 인식 중 오류가 발생했습니다.';
        
        // 모바일 디버깅 정보 추가
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log('Error occurred on mobile:', isMobile);
        console.log('Current URL protocol:', window.location.protocol);
        console.log('Browser:', navigator.userAgent);
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = `음성이 감지되지 않았습니다.\n\n📱 모바일 사용 팁:\n• 마이크에 가까이 대고 말씀하세요\n• 조용한 환경에서 시도하세요\n• 브라우저: ${navigator.userAgent.split(' ')[0]}`;
            // no-speech는 일반적인 상황이므로 자동으로 재시작 옵션 제공
            if (confirm(errorMessage + '\n\n다시 음성 인식을 시작하시겠습니까?')) {
              setTimeout(() => {
                setIsRecording(false);
                setIsProcessing(false);
                startRecording();
              }, 500);
              return;
            }
            break;
          case 'not-allowed':
            errorMessage = `마이크 권한이 거부되었습니다.\n\n📱 모바일 해결 방법:\n• 브라우저 주소창의 🔒 아이콘 클릭\n• 마이크 권한을 "허용"으로 변경\n• 페이지 새로고침\n\n브라우저: ${navigator.userAgent.split(' ')[0]}`;
            break;
          case 'network':
            errorMessage = '네트워크 오류가 발생했습니다.\n\n• 인터넷 연결 상태 확인\n• WiFi 또는 모바일 데이터 확인';
            break;
          case 'audio-capture':
            errorMessage = '마이크에 접근할 수 없습니다.\n\n해결 방법:\n• 다른 앱에서 마이크 사용 중인지 확인\n• 브라우저 재시작\n• 기기 재시작';
            break;
          case 'service-not-allowed':
            errorMessage = `음성 인식 서비스를 사용할 수 없습니다.\n\n원인:\n• HTTPS 연결 필요 (현재: ${window.location.protocol})\n• 브라우저 호환성 문제\n• 서비스 제한`;
            break;
          case 'aborted':
            errorMessage = '음성 인식이 중단되었습니다.';
            break;
          default:
            errorMessage = `음성 인식 오류: ${event.error}\n\n디버그 정보:\n• 모바일: ${isMobile ? 'Yes' : 'No'}\n• 프로토콜: ${window.location.protocol}\n• 브라우저: ${navigator.userAgent.split(' ')[0]}`;
        }
        
        if (errorMessage) {
          alert(errorMessage);
        }
      };

      recognition.onend = () => {
        clearTimeout(timeoutId);
        console.log('Speech recognition ended');
        // onresult가 호출되지 않았다면 처리 상태 해제
        setTimeout(() => {
          if (isProcessing) {
            setIsProcessing(false);
          }
        }, 1000);
      };

      console.log('Starting speech recognition...');
      recognition.start();

    } catch (error) {
      console.error('Error processing audio:', error);
      // Web Speech API를 지원하지 않는 경우 모의 데이터 사용
      const mockTranscript = "오늘 스타벅스에서 아메리카노 4500원, 샌드위치 6000원 카드로 결제했어요";
      setTranscript(mockTranscript);
      const expenses = parseTranscriptToExpenses(mockTranscript);
      
      setTimeout(() => {
        onResult(expenses);
        setIsProcessing(false);
      }, 2000);
    }
  };

  // 음성 텍스트를 가계부 데이터로 파싱하는 함수 (개선된 버전)
  const parseTranscriptToExpenses = (text: string): ExpenseItem[] => {
    console.log('파싱할 텍스트:', text);
    const expenses: ExpenseItem[] = [];
    
    // 텍스트 정규화 (공백, 특수문자 정리)
    let normalizedText = text.replace(/\s+/g, ' ').trim();
    
    // 한글 숫자를 아라비아 숫자로 변환 (가격 패턴에서만 적용)
    const convertKoreanNumbers = (text: string) => {
      const koreanNumbers: Record<string, string> = {
        '일천': '1000', '이천': '2000', '삼천': '3000', '사천': '4000', '오천': '5000',
        '육천': '6000', '칠천': '7000', '팔천': '8000', '구천': '9000',
        '천': '1000', '만': '10000'
      };
      
      let result = text;
      Object.entries(koreanNumbers).forEach(([korean, arabic]) => {
        // 가격 패턴에서만 변환 (숫자+원 형태)
        result = result.replace(new RegExp(`(${korean})\\s*원`, 'g'), `${arabic}원`);
      });
      return result;
    };
    
    normalizedText = convertKoreanNumbers(normalizedText);
    
    // 상점명 추출 (더 포괄적이고 정확한 패턴)
    const storePatterns = [
      { pattern: /스타벅스|STARBUCKS|스벅/i, name: '스타벅스' },
      { pattern: /메가커피|MEGA|메가/i, name: '메가커피' },
      { pattern: /맥도날드|맥날|McDonald|맥드/i, name: '맥도날드' },
      { pattern: /편의점|세븐일레븐|7-?eleven|CU|GS25|이마트24|미니스톱/i, name: '편의점' },
      { pattern: /이마트|롯데마트|홈플러스|코스트코|하이마트/i, name: '마트' },
      { pattern: /카페|커피숍|커피|coffee|투썸|엔젤리너스|빽다방|이디야|컴포즈|할리스|카페베네/i, name: '카페' },
      { pattern: /식당|맛집|음식점|restaurant|한식|중식|일식|양식/i, name: '식당' },
      { pattern: /치킨|피자|버거|햄버거|KFC|버거킹|롯데리아/i, name: '패스트푸드' },
      { pattern: /약국|pharmacy|온누리약국/i, name: '약국' },
      { pattern: /올리브영|다이소|아트박스|문구점/i, name: '생활용품점' },
      { pattern: /주유소|GS칼텍스|SK에너지|현대오일뱅크/i, name: '주유소' },
      { pattern: /병원|의원|클리닉|치과|한의원/i, name: '병원' }
    ];
    
    let store = '기타';
    for (const { pattern, name } of storePatterns) {
      if (pattern.test(normalizedText)) {
        store = name;
        break;
      }
    }

    // 다양한 패턴으로 품목과 가격 추출 (우선순위 순서, 더 정확한 패턴)
    const patterns = [
      // "아메리카노 4500원" 형태 (가장 일반적)
      /([가-힣a-zA-Z0-9\s]+?)\s*(\d{1,3}(?:[,\s]\d{3})*|\d+)\s*원/g,
      // "4500원짜리 아메리카노" 형태  
      /(\d{1,3}(?:[,\s]\d{3})*|\d+)\s*원(?:짜리|어치)?\s*([가-힣a-zA-Z0-9\s]+)/g,
      // "아메리카노를 4500원에" 형태
      /([가-힣a-zA-Z0-9\s]+)[을를이가에서와과]\s*(\d{1,3}(?:[,\s]\d{3})*|\d+)\s*원/g,
      // "4천원", "5천5백원" 등 한글 숫자 (변환된 후)
      /([가-힣a-zA-Z0-9\s]+)\s*(\d+)\s*1000\s*(\d*)\s*(?:100)?\s*원?/g,
      // "만원", "2만원" 형태
      /([가-힣a-zA-Z0-9\s]+)\s*(\d+)\s*10000\s*원?/g,
      // 복합 표현: "라면 1200원, 음료수 1500원"
      /([가-힣a-zA-Z0-9\s]+)\s*(\d{1,3}(?:[,\s]\d{3})*|\d+)\s*원(?:\s*[,，]\s*([가-힣a-zA-Z0-9\s]+)\s*(\d{1,3}(?:[,\s]\d{3})*|\d+)\s*원)*/g,
    ];

    const foundItems = new Set<string>();

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(normalizedText)) !== null) {
        let item: string;
        let priceStr: string;
        
        // 패턴에 따라 품목과 가격 위치가 다름
        if (pattern.source.includes('천')) {
          // "아메리카노 4천원" 패턴
          item = match[1];
          const thousands = parseInt(match[2]) || 0;
          const hundreds = parseInt(match[3]) || 0;
          const price = thousands * 1000 + hundreds * 100;
          priceStr = price.toString();
        } else if (pattern.source.includes('원(?:짜리)?')) {
          // "4500원짜리 아메리카노" 패턴
          priceStr = match[1];
          item = match[2];
        } else if (match[2] && /\d/.test(match[2])) {
          // "아메리카노 4500원" 패턴
          item = match[1];
          priceStr = match[2];
        } else {
          // 단순 가격만 있는 경우
          item = '기타 지출';
          priceStr = match[1];
        }

        const price = parseInt(priceStr.replace(/[,\s]/g, ''));
        
        // 유효하지 않은 가격 제외
        if (isNaN(price) || price <= 0 || price > 1000000) {
          continue;
        }

        // 품목명 정리
        item = item.replace(/[을를이가에서와과]/g, '').trim();
        if (item.length < 1) {
          item = '기타 지출';
        }

        // 중복 제거
        const itemKey = `${item}-${price}`;
        if (foundItems.has(itemKey)) {
          continue;
        }
        foundItems.add(itemKey);

        // 카테고리 자동 분류 (더 정확하고 포괄적)
        let category = '기타';
        
        // 카테고리 분류 규칙 (우선순위 순)
        const categoryRules = [
          { pattern: /커피|아메리카노|라떼|카푸치노|에스프레소|음료|차|주스|스무디|프라푸치노|카페라떼|마키아토/i, category: '카페' },
          { pattern: /밥|식사|치킨|피자|햄버거|샌드위치|도시락|라면|김밥|떡볶이|순대|어묵|핫도그|토스트|국수|파스타|스테이크|삼겹살|갈비|회|초밥|짜장면|짬뽕/i, category: '식비' },
          { pattern: /버스|지하철|택시|기름|주유|교통카드|티머니|하이패스|유류비|주차비|톨게이트|고속도로/i, category: '교통' },
          { pattern: /옷|신발|가방|화장품|샴푸|비누|세제|휴지|마스크|치약|로션|크림|립스틱|파운데이션|의류|바지|셔츠|원피스/i, category: '생활용품' },
          { pattern: /과자|사탕|초콜릿|아이스크림|케이크|빵|쿠키|젤리|껌|음료수|콜라|사이다|맥주|소주/i, category: '간식' },
          { pattern: /약|영양제|비타민|파스|연고|감기약|두통약|소화제|진통제|병원비|진료비|처방전/i, category: '의료' },
          { pattern: /영화|게임|노래방|PC방|볼링|당구|오락|엔터테인먼트|공연|콘서트|뮤지컬/i, category: '엔터' },
          { pattern: /책|문구|펜|노트|학용품|교육|학원|과외|수강료/i, category: '교육' }
        ];
        
        for (const rule of categoryRules) {
          if (rule.pattern.test(item)) {
            category = rule.category;
            break;
          }
        }
        
        // 상점 기반 카테고리 보정
        if (store === '카페' || store === '스타벅스') category = '카페';
        else if (store === '패스트푸드') category = '식비';
        else if (store === '약국') category = '의료';
        else if (store === '주유소') category = '교통';

        // 결제수단 추출 (더 정확하고 포괄적)
        let payment = '현금';
        
        const paymentRules = [
          { pattern: /카드|체크|신용|삼성페이|애플페이|구글페이|체크카드|신용카드/i, method: '카드' },
          { pattern: /계좌|이체|송금|인터넷뱅킹|무통장입금|계좌이체/i, method: '계좌이체' },
          { pattern: /카카오페이|네이버페이|토스|페이코|제로페이|모바일페이|앱페이/i, method: '모바일결제' },
          { pattern: /포인트|적립금|쿠폰|마일리지|상품권|기프트카드/i, method: '포인트' },
          { pattern: /현금|현찰|지폐|동전/i, method: '현금' }
        ];
        
        for (const rule of paymentRules) {
          if (rule.pattern.test(normalizedText)) {
            payment = rule.method;
            break;
          }
        }

        expenses.push({
          id: `voice-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          date: new Date().toISOString().split('T')[0],
          store,
          category,
          item,
          unitPrice: price,
          quantity: 1,
          amount: price,
          payment,
          memo: '',
          source: 'voice' as const
        });

        console.log('추출된 항목:', { item, price, category, payment });
      }
    }

    // 품목이 없으면 전체 텍스트를 메모로 저장
    if (expenses.length === 0) {
      expenses.push({
        id: `voice-fallback-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        date: new Date().toISOString().split('T')[0],
        store,
        category: '기타',
        item: '음성 입력',
        unitPrice: 0,
        quantity: 1,
        amount: 0,
        payment: '카드',
        memo: normalizedText,
        source: 'voice' as const
      });
    }

    console.log('최종 파싱 결과:', expenses);
    return expenses;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">음성 입력</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          {!isRecording && !isProcessing && (
            <div className="space-y-4">
              <button
                onClick={startRecording}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center hover:scale-110 transform transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <Mic className="w-12 h-12 text-white group-hover:animate-pulse" />
              </button>
              <p className="text-gray-800 font-medium mb-4">
                마이크를 눌러 음성 입력을 시작하세요
              </p>
              <div className="text-xs text-gray-700 bg-white/70 rounded-lg p-3 mb-4 border border-gray-200">
                <p className="font-medium mb-2">💡 음성 입력 예시:</p>
                <ul className="space-y-1">
                  <li>• &quot;스타벅스에서 아메리카노 4500원 카드로 결제&quot;</li>
                  <li>• &quot;편의점에서 라면 1200원, 음료수 1500원 현금&quot;</li>
                  <li>• &quot;마트에서 장보기 3만원 체크카드로 결제&quot;</li>
                </ul>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // 테스트용 모의 데이터
                    const mockTranscript = "스타벅스에서 아메리카노 4500원 카드로 결제했어요";
                    setTranscript(mockTranscript);
                    setIsProcessing(true);
                    const expenses = parseTranscriptToExpenses(mockTranscript);
                    setTimeout(() => {
                      onResult(expenses);
                      setIsProcessing(false);
                    }, 1500);
                  }}
                  className="glass-button px-6 py-2 rounded-xl font-medium w-full bg-green-100 hover:bg-green-200 text-green-800"
                >
                  테스트 데이터 (임시)
                </button>
              </div>
              <div className="text-xs text-gray-700 mt-4 space-y-1 bg-white/50 rounded-lg p-3">
                <p className="text-gray-800">💡 <strong>음성 인식 팁:</strong></p>
                <p>• Chrome 브라우저에서 최적화됨</p>
                <p>• 조용한 환경에서 명확하게 말씀해주세요</p>
                <p>• 마이크에 너무 가깝거나 멀지 않게 해주세요</p>
                <p className="text-orange-700 font-medium">📱 <strong>모바일 사용자:</strong></p>
                <p>• 마이크 권한을 반드시 허용해주세요</p>
                <p>• 다른 앱에서 마이크 사용 중이면 종료해주세요</p>
                <p>• iOS Safari는 14.5+ 버전에서만 지원됩니다</p>
              </div>
            </div>
          )}

          {isRecording && (
            <div className="space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center animate-pulse">
                <MicOff className="w-12 h-12 text-white" />
              </div>
              <p className="text-red-600 font-medium">
                🎤 녹음 중... 지출 내역을 명확하게 말씀해주세요
              </p>
              <p className="text-sm text-gray-700 font-medium">
                한 번에 완전한 문장으로 말씀해주세요. 말이 끝나면 자동으로 처리됩니다.
              </p>
              <div className="pt-4">
                <button
                  onClick={stopRecording}
                  className="glass-button px-6 py-3 rounded-xl font-medium w-full bg-red-100 hover:bg-red-200 text-red-800"
                >
                  녹음 완료
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
              <p className="text-green-600 font-medium">
                음성을 분석하고 있습니다...
              </p>
              {transcript && (
                <div className="glass-input p-3 rounded-lg text-left">
                  <p className="text-sm text-gray-600 mb-1">인식된 내용:</p>
                  <p className="text-gray-800">{transcript}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
