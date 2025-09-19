import { NextRequest, NextResponse } from 'next/server';
import { 
  saveExpensesToSheet, 
  testGoogleSheetsConnection, 
  validateGoogleSheetsConfig,
  type ExpenseData 
} from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { expenses } = await request.json();

    // 입력 데이터 검증
    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return NextResponse.json(
        { error: '유효하지 않은 데이터입니다.' },
        { status: 400 }
      );
    }

    // 환경변수 검증
    try {
      validateGoogleSheetsConfig();
    } catch (error) {
      console.error('Configuration error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : '환경변수 설정 오류' },
        { status: 500 }
      );
    }

    // 데이터 타입 변환
    const expenseData: ExpenseData[] = expenses.map((expense: Record<string, unknown>) => ({
      date: (expense.date as string) || new Date().toISOString().split('T')[0],
      store: (expense.store as string) || '기타',
      category: (expense.category as string) || '기타',
      item: (expense.item as string) || '미분류',
      unitPrice: Number(expense.unitPrice) || 0,
      quantity: Number(expense.quantity) || 1,
      amount: Number(expense.amount) || 0,
      payment: (expense.payment as string) || '현금',
      memo: (expense.memo as string) || '',
      source: (expense.source as 'voice' | 'receipt') || 'voice'
    }));

    // 구글 시트에 저장
    const result = await saveExpensesToSheet(expenseData);

    console.log('Save result:', result);

    return NextResponse.json({
      success: true,
      message: `${expenses.length}개의 항목이 성공적으로 저장되었습니다.`,
      updatedRows: result.updatedRows,
      updatedRange: result.updatedRange,
    });

  } catch (error) {
    console.error('Save expenses error:', error);
    
    // 구체적인 오류 메시지 제공
    let errorMessage = '가계부 저장 중 오류가 발생했습니다.';
    
    if (error instanceof Error) {
      if (error.message.includes('PERMISSION_DENIED')) {
        errorMessage = '구글 시트 접근 권한이 없습니다. 서비스 계정 설정을 확인해주세요.';
      } else if (error.message.includes('INVALID_ARGUMENT')) {
        errorMessage = '구글 시트 ID가 올바르지 않습니다.';
      } else if (error.message.includes('NOT_FOUND')) {
        errorMessage = '지정된 구글 시트를 찾을 수 없습니다.';
      } else if (error.message.includes('Missing required environment variables')) {
        errorMessage = `환경변수가 설정되지 않았습니다: ${error.message}`;
      } else {
        errorMessage = `오류: ${error.message}`;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET 요청으로 API 상태 확인 및 연결 테스트
export async function GET() {
  try {
    // 환경변수 검증
    validateGoogleSheetsConfig();
    
    // 실제 구글 시트 연결 테스트
    const connectionTest = await testGoogleSheetsConnection();
    
    if (connectionTest.success) {
      return NextResponse.json({
        status: 'ready',
        message: '구글 시트 연동이 준비되었습니다.',
        details: connectionTest.message,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        status: 'configuration_error',
        message: '구글 시트 설정에 문제가 있습니다.',
        error: connectionTest.error,
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('API status check error:', error);
    
    const requiredEnvVars = [
      'GOOGLE_PROJECT_ID',
      'GOOGLE_PRIVATE_KEY_ID', 
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_CLIENT_EMAIL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_SHEET_ID'
    ];

    const envStatus = requiredEnvVars.reduce((acc, varName) => {
      acc[varName] = !!process.env[varName];
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json({
      status: 'configuration_needed',
      message: '환경변수 설정이 필요합니다.',
      environment_variables: envStatus,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
