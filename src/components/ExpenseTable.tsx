'use client';

import { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { ExpenseItem } from '@/app/page';

interface ExpenseTableProps {
  expenses: ExpenseItem[];
  onUpdate: (expenses: ExpenseItem[]) => void;
}

const categories = ['식비', '카페', '교통', '생활용품', '의료', '엔터', '간식', '기타'];
const stores = ['스타벅스', '메가커피', '편의점', '마트', '식당', '패스트푸드', '약국', '생활용품점', '주유소', '병원', '기타'];
const paymentMethods = ['카드', '현금', '계좌이체', '모바일결제', '포인트'];

export default function ExpenseTable({ expenses, onUpdate }: ExpenseTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  
  // 한글 입력을 위한 ref들 (모든 입력 필드)
  const itemInputRef = useRef<HTMLInputElement>(null);
  const memoInputRef = useRef<HTMLInputElement>(null);
  const unitPriceInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const desktopItemInputRef = useRef<HTMLInputElement>(null);
  const desktopMemoInputRef = useRef<HTMLInputElement>(null);
  const desktopUnitPriceInputRef = useRef<HTMLInputElement>(null);
  const desktopQuantityInputRef = useRef<HTMLInputElement>(null);

  const startEdit = (expense: ExpenseItem) => {
    setEditingId(expense.id);
    setEditingExpense({ ...expense });
  };

  // ref 값들을 초기화하는 useEffect
  useEffect(() => {
    if (editingExpense) {
      // 모바일 입력 필드 초기화 (강제 업데이트)
      if (itemInputRef.current) {
        itemInputRef.current.value = editingExpense.item;
      }
      if (memoInputRef.current) {
        memoInputRef.current.value = editingExpense.memo;
      }
      if (unitPriceInputRef.current) {
        unitPriceInputRef.current.value = editingExpense.unitPrice.toString();
      }
      if (quantityInputRef.current) {
        quantityInputRef.current.value = editingExpense.quantity.toString();
      }
      // 데스크톱 입력 필드 초기화 (강제 업데이트)
      if (desktopItemInputRef.current) {
        desktopItemInputRef.current.value = editingExpense.item;
      }
      if (desktopMemoInputRef.current) {
        desktopMemoInputRef.current.value = editingExpense.memo;
      }
      if (desktopUnitPriceInputRef.current) {
        desktopUnitPriceInputRef.current.value = editingExpense.unitPrice.toString();
      }
      if (desktopQuantityInputRef.current) {
        desktopQuantityInputRef.current.value = editingExpense.quantity.toString();
      }
    }
  }, [editingExpense]);

  // 편집 시작할 때 ref 값 강제 설정
  useEffect(() => {
    if (editingId && editingExpense) {
      // 약간의 지연 후 값 설정 (DOM 업데이트 후)
      setTimeout(() => {
        if (itemInputRef.current) {
          itemInputRef.current.value = editingExpense.item;
        }
        if (memoInputRef.current) {
          memoInputRef.current.value = editingExpense.memo;
        }
        if (unitPriceInputRef.current) {
          unitPriceInputRef.current.value = editingExpense.unitPrice.toString();
        }
        if (quantityInputRef.current) {
          quantityInputRef.current.value = editingExpense.quantity.toString();
        }
        if (desktopItemInputRef.current) {
          desktopItemInputRef.current.value = editingExpense.item;
        }
        if (desktopMemoInputRef.current) {
          desktopMemoInputRef.current.value = editingExpense.memo;
        }
        if (desktopUnitPriceInputRef.current) {
          desktopUnitPriceInputRef.current.value = editingExpense.unitPrice.toString();
        }
        if (desktopQuantityInputRef.current) {
          desktopQuantityInputRef.current.value = editingExpense.quantity.toString();
        }
      }, 10);
    }
  }, [editingId, editingExpense]);

  const cancelEdit = () => {
    setEditingId(null);
    setEditingExpense(null);
  };

  const saveEdit = () => {
    if (editingExpense) {
      // ref에서 최신 값들을 가져와서 업데이트
      const updatedExpense = { ...editingExpense };
      
      // ref 상태 디버깅
      console.log('=== REF 상태 체크 ===');
      console.log('모바일 품목 ref:', !!itemInputRef.current, itemInputRef.current?.value);
      console.log('데스크톱 품목 ref:', !!desktopItemInputRef.current, desktopItemInputRef.current?.value);
      console.log('모바일 메모 ref:', !!memoInputRef.current, memoInputRef.current?.value);
      console.log('데스크톱 메모 ref:', !!desktopMemoInputRef.current, desktopMemoInputRef.current?.value);
      console.log('모바일 단가 ref:', !!unitPriceInputRef.current, unitPriceInputRef.current?.value);
      console.log('데스크톱 단가 ref:', !!desktopUnitPriceInputRef.current, desktopUnitPriceInputRef.current?.value);
      console.log('모바일 수량 ref:', !!quantityInputRef.current, quantityInputRef.current?.value);
      console.log('데스크톱 수량 ref:', !!desktopQuantityInputRef.current, desktopQuantityInputRef.current?.value);
      
      // 화면 크기에 따라 적절한 ref 선택 (더 정확한 로직)
      const isDesktop = window.innerWidth >= 1024; // lg 브레이크포인트
      console.log('현재 화면 크기:', window.innerWidth, 'isDesktop:', isDesktop);
      
      // 품목 업데이트
      if (isDesktop && desktopItemInputRef.current) {
        updatedExpense.item = desktopItemInputRef.current.value;
        console.log('데스크톱 품목 업데이트:', desktopItemInputRef.current.value);
      } else if (!isDesktop && itemInputRef.current) {
        updatedExpense.item = itemInputRef.current.value;
        console.log('모바일 품목 업데이트:', itemInputRef.current.value);
      } else if (itemInputRef.current) {
        updatedExpense.item = itemInputRef.current.value;
        console.log('폴백 모바일 품목 업데이트:', itemInputRef.current.value);
      } else if (desktopItemInputRef.current) {
        updatedExpense.item = desktopItemInputRef.current.value;
        console.log('폴백 데스크톱 품목 업데이트:', desktopItemInputRef.current.value);
      }
      
      // 메모 업데이트
      if (isDesktop && desktopMemoInputRef.current) {
        updatedExpense.memo = desktopMemoInputRef.current.value;
        console.log('데스크톱 메모 업데이트:', desktopMemoInputRef.current.value);
      } else if (!isDesktop && memoInputRef.current) {
        updatedExpense.memo = memoInputRef.current.value;
        console.log('모바일 메모 업데이트:', memoInputRef.current.value);
      } else if (memoInputRef.current) {
        updatedExpense.memo = memoInputRef.current.value;
        console.log('폴백 모바일 메모 업데이트:', memoInputRef.current.value);
      } else if (desktopMemoInputRef.current) {
        updatedExpense.memo = desktopMemoInputRef.current.value;
        console.log('폴백 데스크톱 메모 업데이트:', desktopMemoInputRef.current.value);
      }
      
      // 단가 업데이트
      if (isDesktop && desktopUnitPriceInputRef.current) {
        updatedExpense.unitPrice = parseInt(desktopUnitPriceInputRef.current.value) || 0;
        console.log('데스크톱 단가 업데이트:', desktopUnitPriceInputRef.current.value);
      } else if (!isDesktop && unitPriceInputRef.current) {
        updatedExpense.unitPrice = parseInt(unitPriceInputRef.current.value) || 0;
        console.log('모바일 단가 업데이트:', unitPriceInputRef.current.value);
      } else if (unitPriceInputRef.current) {
        updatedExpense.unitPrice = parseInt(unitPriceInputRef.current.value) || 0;
        console.log('폴백 모바일 단가 업데이트:', unitPriceInputRef.current.value);
      } else if (desktopUnitPriceInputRef.current) {
        updatedExpense.unitPrice = parseInt(desktopUnitPriceInputRef.current.value) || 0;
        console.log('폴백 데스크톱 단가 업데이트:', desktopUnitPriceInputRef.current.value);
      }
      
      // 수량 업데이트
      if (isDesktop && desktopQuantityInputRef.current) {
        updatedExpense.quantity = parseInt(desktopQuantityInputRef.current.value) || 1;
        console.log('데스크톱 수량 업데이트:', desktopQuantityInputRef.current.value);
      } else if (!isDesktop && quantityInputRef.current) {
        updatedExpense.quantity = parseInt(quantityInputRef.current.value) || 1;
        console.log('모바일 수량 업데이트:', quantityInputRef.current.value);
      } else if (quantityInputRef.current) {
        updatedExpense.quantity = parseInt(quantityInputRef.current.value) || 1;
        console.log('폴백 모바일 수량 업데이트:', quantityInputRef.current.value);
      } else if (desktopQuantityInputRef.current) {
        updatedExpense.quantity = parseInt(desktopQuantityInputRef.current.value) || 1;
        console.log('폴백 데스크톱 수량 업데이트:', desktopQuantityInputRef.current.value);
      }
      
      // select box 필드들도 editingExpense에서 가져오기
      if (editingExpense.category) {
        updatedExpense.category = editingExpense.category;
        console.log('카테고리 업데이트:', editingExpense.category);
      }
      if (editingExpense.store) {
        updatedExpense.store = editingExpense.store;
        console.log('상점 업데이트:', editingExpense.store);
      }
      if (editingExpense.payment) {
        updatedExpense.payment = editingExpense.payment;
        console.log('결제수단 업데이트:', editingExpense.payment);
      }
      if (editingExpense.date) {
        updatedExpense.date = editingExpense.date;
        console.log('날짜 업데이트:', editingExpense.date);
      }
      
      // 총액 재계산
      updatedExpense.amount = updatedExpense.unitPrice * updatedExpense.quantity;
      
      console.log('최종 업데이트된 expense:', updatedExpense);
      
      const updatedExpenses = expenses.map(expense => 
        expense.id === updatedExpense.id ? updatedExpense : expense
      );
      onUpdate(updatedExpenses);
      setEditingId(null);
      setEditingExpense(null);
    }
  };

  const deleteExpense = (id: string) => {
    if (confirm('이 항목을 삭제하시겠습니까?')) {
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      onUpdate(updatedExpenses);
    }
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <Edit2 className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
        </div>
        <p className="text-gray-700 text-base md:text-lg font-medium">아직 입력된 가계부 내역이 없습니다</p>
        <p className="text-gray-400 text-sm mt-2">음성 입력이나 영수증 촬영으로 시작해보세요</p>
      </div>
    );
  }

  // 모바일 카드 뷰
  const MobileCardView = () => (
    <div className="block md:hidden space-y-4">
      {expenses.map((expense) => (
        <div key={expense.id} className="glass-card rounded-xl p-4 space-y-3">
          {editingId === expense.id ? (
            // 편집 모드 - 모바일
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-800 mb-2 block font-medium">날짜</label>
                  <input
                    type="date"
                    value={editingExpense?.date || ''}
                    onChange={(e) => setEditingExpense(prev => prev ? {...prev, date: e.target.value} : null)}
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-800 mb-2 block font-medium">카테고리</label>
                  <select
                    value={editingExpense?.category || ''}
                    onChange={(e) => setEditingExpense(prev => prev ? {...prev, category: e.target.value} : null)}
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-800 mb-2 block font-medium">상점</label>
                  <select
                    value={editingExpense?.store || ''}
                    onChange={(e) => setEditingExpense(prev => prev ? {...prev, store: e.target.value} : null)}
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  >
                    {stores.map(store => (
                      <option key={store} value={store}>{store}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-800 mb-2 block font-medium">결제수단</label>
                  <select
                    value={editingExpense?.payment || ''}
                    onChange={(e) => setEditingExpense(prev => prev ? {...prev, payment: e.target.value} : null)}
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-800 mb-2 block font-medium">품목</label>
                <input
                  key={`mobile-item-${editingExpense?.id}`}
                  ref={itemInputRef}
                  type="text"
                  defaultValue={editingExpense?.item || ''}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  placeholder="품목을 입력하세요"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-800 mb-2 block font-medium">단가</label>
                  <input
                    key={`mobile-unitPrice-${editingExpense?.id}`}
                    ref={unitPriceInputRef}
                    type="number"
                    defaultValue={editingExpense?.unitPrice || 0}
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    placeholder="단가"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-800 mb-2 block font-medium">수량</label>
                  <input
                    key={`mobile-quantity-${editingExpense?.id}`}
                    ref={quantityInputRef}
                    type="number"
                    defaultValue={editingExpense?.quantity || 1}
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    placeholder="수량"
                    min="1"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-800 mb-2 block font-medium">금액</label>
                  <div className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded">
                    {formatCurrency(editingExpense?.amount || 0)}원
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-800 mb-2 block font-medium">메모</label>
                <input
                  key={`mobile-memo-${editingExpense?.id}`}
                  ref={memoInputRef}
                  type="text"
                  defaultValue={editingExpense?.memo || ''}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  placeholder="메모를 입력하세요"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={saveEdit}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  저장
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 shadow-md"
                >
                  <X className="w-4 h-4" />
                  취소
                </button>
              </div>
            </div>
          ) : (
            // 보기 모드 - 모바일
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{expense.item}</h3>
                  <p className="text-sm text-gray-600">{expense.store} • {expense.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">{formatCurrency(expense.amount)}원</p>
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => startEdit(expense)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {expense.category}
                </span>
                <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800">
                  {expense.payment}
                </span>
                {expense.memo && (
                  <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {expense.memo}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 데스크톱 테이블 뷰
  const DesktopTableView = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 font-medium text-gray-700">날짜</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">카테고리</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">상점</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">품목</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">단가</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">수량</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">금액</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">결제</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">메모</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">액션</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50/50">
              {editingId === expense.id ? (
                // 편집 모드
                <>
                  <td className="py-2 px-2">
                    <input
                      type="date"
                      value={editingExpense?.date || ''}
                      onChange={(e) => setEditingExpense(prev => prev ? {...prev, date: e.target.value} : null)}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <select
                      value={editingExpense?.category || ''}
                      onChange={(e) => setEditingExpense(prev => prev ? {...prev, category: e.target.value} : null)}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <select
                      value={editingExpense?.store || ''}
                      onChange={(e) => setEditingExpense(prev => prev ? {...prev, store: e.target.value} : null)}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    >
                      {stores.map(store => (
                        <option key={store} value={store}>{store}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      key={`desktop-item-${editingExpense?.id}`}
                      ref={desktopItemInputRef}
                      type="text"
                      defaultValue={editingExpense?.item || ''}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                      placeholder="품목을 입력하세요"
                      inputMode="text"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      key={`desktop-unitPrice-${editingExpense?.id}`}
                      ref={desktopUnitPriceInputRef}
                      type="number"
                      defaultValue={editingExpense?.unitPrice || 0}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                      placeholder="단가"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      key={`desktop-quantity-${editingExpense?.id}`}
                      ref={desktopQuantityInputRef}
                      type="number"
                      defaultValue={editingExpense?.quantity || 1}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                      placeholder="수량"
                      min="1"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(editingExpense?.amount || 0)}원
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <select
                      value={editingExpense?.payment || ''}
                      onChange={(e) => setEditingExpense(prev => prev ? {...prev, payment: e.target.value} : null)}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    >
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      key={`desktop-memo-${editingExpense?.id}`}
                      ref={desktopMemoInputRef}
                      type="text"
                      defaultValue={editingExpense?.memo || ''}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                      placeholder="메모를 입력하세요"
                      inputMode="text"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex gap-1">
                      <button
                        onClick={saveEdit}
                        className="p-1 text-green-700 hover:bg-green-100 rounded shadow-sm bg-white/80"
                        title="저장"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-gray-700 hover:bg-gray-100 rounded shadow-sm bg-white/80"
                        title="취소"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                // 보기 모드
                <>
                  <td className="py-2 px-2 text-sm text-gray-700">{expense.date}</td>
                  <td className="py-2 px-2 text-sm text-gray-700">{expense.category}</td>
                  <td className="py-2 px-2">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {expense.store}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-sm text-gray-700">{expense.item}</td>
                  <td className="py-2 px-2 text-sm text-gray-700">{formatCurrency(expense.unitPrice)}원</td>
                  <td className="py-2 px-2 text-sm text-gray-700">{expense.quantity}</td>
                  <td className="py-2 px-2 text-sm font-medium text-gray-900">
                    {formatCurrency(expense.amount)}원
                  </td>
                  <td className="py-2 px-2">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {expense.payment}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-sm text-gray-700">{expense.memo || '-'}</td>
                  <td className="py-2 px-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(expense)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="편집"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <MobileCardView />
      <DesktopTableView />
    </div>
  );
}
