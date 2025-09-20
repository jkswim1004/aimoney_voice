# 🎤 AI 가계부 자동화 (AIMoney)

음성 인식을 통해 간편하게 가계부를 작성하고 구글시트에 자동으로 저장하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- 🎙️ **음성 인식**: 브라우저의 Web Speech API를 활용한 한국어 음성 인식
- 📊 **자동 분류**: AI가 음성 내용을 분석하여 카테고리, 결제수단 자동 분류
- ✏️ **수동 편집**: 잘못 인식된 내용을 테이블에서 직접 수정 가능
- 📈 **실시간 요약**: 카테고리별, 결제수단별 지출 현황 실시간 표시
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 최적화된 UI
- 🔗 **구글시트 연동**: 입력된 데이터를 개인 구글시트에 자동 저장

## 🚀 시작하기

### 1. 프로젝트 클론 및 설치

```bash
git clone <repository-url>
cd aimoney-app
npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# 구글 시트 연동을 위한 서비스 계정 정보
GOOGLE_PROJECT_ID=your-google-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-content\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_SHEET_ID=your-google-sheet-id
# 또는 GOOGLE_SHEETS_SPREADSHEET_ID=your-google-sheet-id (같은 값, 둘 중 아무거나 사용)

# OpenAI API 키 (향후 AI 분석 기능용 - 선택사항)
OPENAI_API_KEY=your-openai-api-key
```

### 3. 구글 시트 설정

#### 3.1 구글 클라우드 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Google Sheets API 활성화

#### 3.2 서비스 계정 생성
1. IAM 및 관리자 > 서비스 계정으로 이동
2. "서비스 계정 만들기" 클릭
3. 서비스 계정 이름 입력 (예: aimoney-service)
4. 역할: "편집자" 권한 부여
5. JSON 키 파일 다운로드

#### 3.3 구글 시트 준비
1. [Google Sheets](https://sheets.google.com)에서 새 시트 생성
2. 시트 URL에서 ID 추출: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
3. 시트를 서비스 계정 이메일과 공유 (편집 권한)

### 4. 환경변수 설정

#### 4.1 환경변수 파일 생성
```bash
# env.example 파일을 .env.local로 복사
cp env.example .env.local
```

#### 4.2 필수 환경변수 설정
`.env.local` 파일을 열고 다음 값들을 설정하세요:

```bash
# Google Cloud 설정 (JSON 키 파일에서 복사)
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id

# Google Sheets ID (시트 URL에서 추출)
GOOGLE_SHEET_ID=your-google-sheet-id
```

#### 4.3 환경변수 값 찾는 방법

**Google Cloud 정보 (JSON 키 파일에서)**:
- 다운로드한 JSON 키 파일을 열어 각 값을 복사
- `private_key`는 따옴표 안에 전체를 복사 (줄바꿈 포함)

**Google Sheets ID**:
- Google Sheets URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
- `[SHEET_ID]` 부분을 복사

**⚠️ 중요**: Google Sheets를 서비스 계정과 공유해야 합니다!

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🎯 사용 방법

### 음성 입력
1. "음성으로 가계부 입력하기" 버튼 클릭
2. 마이크 권한 허용
3. 다음과 같은 형태로 말하기:
   - "스타벅스에서 아메리카노 4500원 카드로 결제했어요"
   - "편의점에서 라면 1200원, 음료수 1500원 현금으로 샀어요"
   - "마트에서 장보기 35000원 체크카드로 결제"

### 데이터 수정
- 테이블의 편집 버튼을 클릭하여 내용 수정
- 카테고리, 결제수단 등을 드롭다운에서 선택
- 단가와 수량을 수정하면 총액 자동 계산

### 구글시트 저장
- "저장하기" 버튼을 클릭하여 구글시트에 데이터 전송
- 저장 후 테이블 자동 초기화

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Custom Glass UI
- **Icons**: Lucide React
- **API**: Google Sheets API v4
- **음성 인식**: Web Speech API
- **인증**: Google Service Account

## 📱 지원 브라우저

음성 인식 기능은 다음 브라우저에서 최적화되어 있습니다:
- ✅ Chrome (권장)
- ✅ Edge
- ⚠️ Safari (제한적 지원)
- ❌ Firefox (Web Speech API 미지원)

## 🔧 개발 정보

### 프로젝트 구조
```
src/
├── app/
│   ├── api/save-expenses/    # 구글시트 저장 API
│   ├── globals.css           # 글로벌 스타일
│   ├── layout.tsx           # 레이아웃 컴포넌트
│   └── page.tsx             # 메인 페이지
└── components/
    ├── ExpenseTable.tsx     # 가계부 테이블
    ├── SummaryPanel.tsx     # 요약 패널
    └── VoiceInput.tsx       # 음성 입력 모달
```

### 환경변수 확인
API 상태를 확인하려면 다음 엔드포인트에 접속하세요:
```
GET /api/save-expenses
```

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 🔧 문제 해결

### 환경변수 관련 오류

**오류**: `Missing required environment variables`
```bash
# 해결방법:
1. env.example 파일을 .env.local로 복사했는지 확인
2. 모든 필수 환경변수가 설정되었는지 확인
3. 환경변수 값에 따옴표나 공백이 올바른지 확인
```

**오류**: `GOOGLE_PRIVATE_KEY` 관련 오류
```bash
# 해결방법:
1. Private Key를 따옴표로 감쌌는지 확인
2. \n 문자가 실제 줄바꿈으로 변환되는지 확인
3. JSON 키 파일에서 전체 키를 복사했는지 확인
```

### Google Sheets API 오류

**오류**: `403 Permission Denied`
```bash
# 해결방법:
1. Google Sheets API가 활성화되었는지 확인
2. Google Drive API도 활성화 (선택사항)
3. Google Sheets를 서비스 계정과 공유했는지 확인
4. 서비스 계정에 "편집자" 권한이 있는지 확인
5. "무시하고 공유" 클릭했는지 확인
```

**오류**: `404 Not Found` 또는 시트를 찾을 수 없음
```bash
# 해결방법:
1. GOOGLE_SHEET_ID가 올바른지 확인
2. 시트 URL에서 ID를 정확히 추출했는지 확인
3. 시트가 삭제되지 않았는지 확인
```

### 음성 인식 문제

**모바일에서 음성 인식이 안됨**:
```bash
# 해결방법:
1. Chrome 브라우저 사용 (권장)
2. HTTPS 연결 확인 (HTTP에서는 작동 안함)
3. 마이크 권한 허용
4. 다른 앱에서 마이크 사용 중인지 확인
5. iOS Safari는 14.5+ 버전 필요
```

**"no-speech" 오류**:
```bash
# 해결방법:
1. 조용한 환경에서 테스트
2. 마이크에 가까이 대고 말하기
3. 명확하게 발음하기
4. 마이크 권한 재설정
```

### 배포 관련 문제

**Vercel 배포 시 환경변수 오류**:
```bash
# 해결방법:
1. Vercel 대시보드 > 프로젝트 > Settings > Environment Variables
2. 모든 환경변수를 Production, Preview, Development에 설정
3. GOOGLE_PRIVATE_KEY는 따옴표 없이 입력
4. 재배포 실행
```

## 🎨 UI/UX 특징

- **Glass Morphism**: 현대적인 반투명 글래스 효과
- **반응형 디자인**: 모바일 카드뷰 / 데스크톱 테이블뷰
- **실시간 피드백**: 음성 인식 상태 시각적 표시
- **부드러운 애니메이션**: CSS 트랜지션과 호버 효과

## 🔮 향후 계획

- [ ] 영수증 OCR 기능 추가
- [ ] AI 기반 소비 패턴 분석
- [ ] 예산 설정 및 알림 기능
- [ ] 월별/연도별 리포트 생성
- [ ] 다중 시트 지원
- [ ] 음성 명령어 확장

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ for better financial management**
