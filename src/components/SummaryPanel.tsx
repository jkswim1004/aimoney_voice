'use client';

import { PieChart, TrendingUp, CreditCard, Calendar } from 'lucide-react';
import { ExpenseItem } from '@/app/page';

interface SummaryPanelProps {
  expenses: ExpenseItem[];
  totalAmount: number;
}

export default function SummaryPanel({ expenses, totalAmount }: SummaryPanelProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 카테고리별 합계 계산
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // 결제수단별 합계 계산
  const paymentTotals = expenses.reduce((acc, expense) => {
    acc[expense.payment] = (acc[expense.payment] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // 상위 카테고리 (상위 3개)
  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // 오늘 날짜
  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter(expense => expense.date === today);
  const todayTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // 카테고리별 색상 매핑
  const categoryColors: Record<string, string> = {
    '식비': 'bg-red-100 text-red-800',
    '카페': 'bg-orange-100 text-orange-800',
    '교통': 'bg-blue-100 text-blue-800',
    '생활용품': 'bg-green-100 text-green-800',
    '의료': 'bg-purple-100 text-purple-800',
    '엔터': 'bg-pink-100 text-pink-800',
    '간식': 'bg-yellow-100 text-yellow-800',
    '기타': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-4">
      {/* 총 금액 카드 */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">총 지출</h3>
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-2">
          {formatCurrency(totalAmount)}원
        </p>
        <p className="text-sm text-gray-600">
          총 {expenses.length}개 항목
        </p>
      </div>

      {/* 오늘 지출 카드 */}
      {todayExpenses.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">오늘 지출</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(todayTotal)}원
          </p>
          <p className="text-sm text-gray-600">
            {todayExpenses.length}개 항목
          </p>
        </div>
      )}

      {/* 카테고리별 지출 */}
      {topCategories.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">카테고리별</h3>
          </div>
          <div className="space-y-3">
            {topCategories.map(([category, amount]) => {
              const percentage = totalAmount > 0 ? (amount / totalAmount * 100) : 0;
              const colorClass = categoryColors[category] || categoryColors['기타'];
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${colorClass}`}>
                      {category}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(amount)}원
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 결제수단별 지출 */}
      {Object.keys(paymentTotals).length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">결제수단</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(paymentTotals)
              .sort(([,a], [,b]) => b - a)
              .map(([payment, amount]) => (
                <div key={payment} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{payment}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(amount)}원
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 입력 소스별 통계 */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">입력 방식</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">음성 입력</span>
            <span className="text-sm font-medium text-gray-900">
              {expenses.filter(e => e.source === 'voice').length}개
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">영수증 촬영</span>
            <span className="text-sm font-medium text-gray-900">
              {expenses.filter(e => e.source === 'receipt').length}개
            </span>
          </div>
        </div>
      </div>

      {/* 팁 카드 - 항상 맨 아래 표시 */}
      <div className="glass-card rounded-2xl p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 사용 팁</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• &quot;스타벅스에서 아메리카노 4500원 카드로 결제&quot;</li>
          <li>• &quot;편의점에서 라면 1200원, 음료수 1500원 현금&quot;</li>
          <li>• &quot;마트에서 장보기 3만원 체크카드로 결제&quot;</li>
          <li>• 잘못된 내용은 표에서 직접 수정 가능합니다</li>
        </ul>
      </div>
    </div>
  );
}
