import { google } from 'googleapis';

// 구글 시트 설정 상수
export const GOOGLE_SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// 환경변수 검증 함수
export function validateGoogleSheetsConfig() {
  const requiredEnvVars = [
    'GOOGLE_PROJECT_ID',
    'GOOGLE_PRIVATE_KEY_ID',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_CLIENT_ID'
  ];
  
  // GOOGLE_SHEET_ID 또는 GOOGLE_SHEETS_SPREADSHEET_ID 중 하나는 필수
  const hasSheetId = process.env.GOOGLE_SHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  if (!hasSheetId) {
    throw new Error('Missing required environment variable: GOOGLE_SHEET_ID or GOOGLE_SHEETS_SPREADSHEET_ID');
  }

  return true;
}

// 구글 인증 객체 생성
export function createGoogleAuth() {
  validateGoogleSheetsConfig();

  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`,
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: GOOGLE_SHEETS_SCOPES,
  });

  return auth;
}

// 구글 시트 클라이언트 생성
export function createSheetsClient() {
  const auth = createGoogleAuth();
  return google.sheets({ version: 'v4', auth });
}

// 시트 헤더 설정
export const SHEET_HEADERS = [
  '날짜', '상점', '카테고리', '품목', '단가', '수량', '금액', '결제수단', '메모', '입력방식'
];

// 가계부 데이터 타입
export interface ExpenseData {
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
  source: string;
}

// 가계부 데이터를 시트 행으로 변환
export function expenseToSheetRow(expense: ExpenseData): (string | number)[] {
  return [
    expense.date,
    expense.store,
    expense.category,
    expense.item,
    expense.unitPrice,
    expense.quantity,
    expense.amount,
    expense.payment,
    expense.memo || '',
    expense.source || 'voice'
  ];
}

// 구글 시트에 데이터 저장
export async function saveExpensesToSheet(expenses: ExpenseData[]) {
  const sheets = createSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID or GOOGLE_SHEETS_SPREADSHEET_ID environment variable is not set');
  }

  // 헤더 확인 및 설정
  const headerRange = 'A1:J1';
  
  try {
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: headerRange,
    });

    // 헤더가 없거나 다르면 설정
    if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: headerRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [SHEET_HEADERS],
        },
      });
    }
  } catch (error) {
    console.warn('Header setup warning:', error);
    // 헤더 설정 실패해도 계속 진행
  }

  // 데이터 변환
  const values = expenses.map(expenseToSheetRow);

  // 시트에 데이터 추가
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'A:J',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values,
    },
  });

  return {
    success: true,
    updatedRows: response.data.updates?.updatedRows || 0,
    updatedRange: response.data.updates?.updatedRange,
  };
}

// 구글 시트 연결 테스트 (간단한 버전)
export async function testGoogleSheetsConnection() {
  try {
    // 환경변수만 확인하고 인증 객체 생성 테스트
    validateGoogleSheetsConfig();
    
    const auth = createGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // 실제 API 호출 없이 클라이언트 생성만 테스트
    if (sheets && auth) {
      return {
        success: true,
        message: 'Google Sheets client configuration successful',
      };
    } else {
      throw new Error('Failed to create Google Sheets client');
    }
  } catch (error) {
    console.error('Google Sheets connection test failed:', error);
    
    let errorMessage = 'Connection test failed';
    if (error instanceof Error) {
      if (error.message.includes('Missing required environment variables')) {
        errorMessage = 'Environment variables not configured properly';
      } else if (error.message.includes('Invalid private key')) {
        errorMessage = 'Invalid private key format';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
