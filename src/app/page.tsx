'use client';

import { useState } from 'react';
import { Mic, Save, Edit3 } from 'lucide-react';
import VoiceInput from '@/components/VoiceInput';
import ExpenseTable from '@/components/ExpenseTable';
import SummaryPanel from '@/components/SummaryPanel';

export interface ExpenseItem {
  id: string;
  date: string;
  store: string;
  category: string;
  item: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  payment: string;
  memo: string;
  source: 'voice';
}

export default function Home() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const handleVoiceResult = (newExpenses: ExpenseItem[]) => {
    console.log('음성 결과 받음:', newExpenses);
    
    // 중복 방지: 이미 같은 ID나 내용이 있는지 확인
    const filteredExpenses = newExpenses.filter(newExpense => {
      const isDuplicate = expenses.some(existing => 
        existing.id === newExpense.id || 
        (existing.item === newExpense.item && 
         existing.amount === newExpense.amount && 
         existing.date === newExpense.date &&
         existing.store === newExpense.store)
      );
      return !isDuplicate;
    });
    
    if (filteredExpenses.length > 0) {
      setExpenses(prev => [...prev, ...filteredExpenses]);
    }
    setShowVoiceInput(false);
  };


  const handleExpenseUpdate = (updatedExpenses: ExpenseItem[]) => {
    setExpenses(updatedExpenses);
  };

  const handleSave = async () => {
    if (expenses.length === 0) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/save-expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expenses }),
      });

      if (response.ok) {
        alert('가계부가 성공적으로 저장되었습니다!');
        setExpenses([]);
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
            AI 가계부 자동화
          </h1>
          <p className="text-sm md:text-base text-gray-600 px-4">
            음성으로 간편하게 가계부를 작성하세요
          </p>
        </header>

        {/* 음성 입력 버튼 */}
        <div className="flex justify-center mb-8 md:mb-10 px-4">
          <button
            onClick={() => setShowVoiceInput(true)}
            className="glass-button shine-effect px-8 md:px-12 py-4 md:py-6 rounded-2xl flex items-center justify-center gap-4 text-lg md:text-xl font-medium hover:scale-105 transform transition-all duration-300"
            disabled={isProcessing}
          >
            <Mic className="w-6 h-6 md:w-8 md:h-8" />
            음성으로 가계부 입력하기
          </button>
        </div>

        {/* 메인 컨텐츠 */}
        {expenses.length === 0 ? (
          /* 빈 상태 - 중앙 집중 레이아웃 */
          <div className="max-w-4xl mx-auto px-4">
            <div className="glass-card rounded-2xl p-8 lg:p-12 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <Edit3 className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                가계부를 시작해보세요! 🎉
              </h2>
              
              <p className="text-gray-600 mb-8 text-lg">
                음성으로 간편하게 지출 내역을 기록하고 자동으로 구글시트에 저장됩니다
              </p>

              {/* 사용법 카드 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
                  🎤 음성 입력 예시
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-blue-600 font-medium mb-2">☕ 카페</div>
                    <div className="text-gray-800">"스타벅스에서 아메리카노 4500원 카드로 결제"</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-green-600 font-medium mb-2">🏪 편의점</div>
                    <div className="text-gray-800">"편의점에서 라면 1200원, 음료수 1500원 현금"</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-purple-600 font-medium mb-2">🛒 마트</div>
                    <div className="text-gray-800">"마트에서 장보기 3만원 체크카드로 결제"</div>
                  </div>
                </div>
              </div>

              {/* 기능 소개 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">자동 분류</h4>
                  <p className="text-sm text-gray-600">상점, 카테고리, 결제수단을 AI가 자동으로 분류해드려요</p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">✏️</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">수동 편집</h4>
                  <p className="text-sm text-gray-600">잘못 인식된 내용은 표에서 직접 수정할 수 있어요</p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">구글시트 연동</h4>
                  <p className="text-sm text-gray-600">입력된 데이터가 자동으로 개인 구글시트에 저장돼요</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  💡 <strong>팁:</strong> Chrome 브라우저에서 가장 정확한 음성 인식이 가능합니다
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* 데이터 있을 때 - 기존 레이아웃 */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 px-2 lg:px-0">
            {/* 가계부 테이블 */}
            <div className="lg:col-span-3 order-1 lg:order-1">
              <div className="glass-card rounded-2xl p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <h2 className="text-lg lg:text-2xl font-semibold text-gray-800 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 lg:w-6 lg:h-6" />
                    가계부 내역
                  </h2>
                  <button
                    onClick={handleSave}
                    disabled={isProcessing}
                    className="glass-button px-4 lg:px-6 py-2 rounded-lg flex items-center justify-center gap-2 font-medium text-sm lg:text-base w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4" />
                    {isProcessing ? '저장 중...' : '저장하기'}
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <ExpenseTable 
                    expenses={expenses} 
                    onUpdate={handleExpenseUpdate}
                  />
                </div>
              </div>
            </div>

            {/* 요약 패널 */}
            <div className="lg:col-span-1 order-2 lg:order-2">
              <SummaryPanel expenses={expenses} totalAmount={totalAmount} />
            </div>
          </div>
        )}

        {/* 모달들 */}
        {showVoiceInput && (
          <VoiceInput
            onResult={handleVoiceResult}
            onClose={() => setShowVoiceInput(false)}
          />
        )}
      </div>
    </div>
  );
}