'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export interface WagePeriodItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
  lockedAt?: string;
  locker?: { fullName: string };
  _count?: { workShifts: number };
}

export default function AdminPeriodsPage() {
  const [periods, setPeriods] = useState<WagePeriodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('Kỳ Tiền Công Mới');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<WagePeriodItem[]>('/wage-periods');
      setPeriods(data);
    } catch (err) {
      console.error('Lỗi tải kỳ tiền công:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    try {
      await apiFetch('/wage-periods', {
        method: 'POST',
        body: JSON.stringify({ name, startDate, endDate }),
      });

      fetchPeriods();
      alert('Tạo kỳ tiền công mới thành công');
    } catch (err: any) {
      setModalError(err.message || 'Tạo kỳ thất bại');
    }
  };

  const handleLockPeriod = async (periodId: string) => {
    if (!confirm('Bạn có chắc chắn muốn CHỐT KỲ TIỀN CÔNG này? Sau khi chốt, toàn bộ sản lượng và tiền công trong kỳ sẽ bị KHÓA (Read-Only) để thanh toán.')) {
      return;
    }

    try {
      await apiFetch(`/wage-periods/${periodId}/lock`, {
        method: 'PATCH',
      });

      fetchPeriods();
      alert('Đã chốt kỳ tiền công thành công!');
    } catch (err: any) {
      alert(err.message || 'Chốt kỳ thất bại');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Chốt Kỳ Tiền Công (Wage Period Lock)</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Tạo kỳ tiền công và đóng băng dữ liệu lịch sử (Read-Only) để phục vụ thanh toán
        </p>
      </div>

      {/* Form Create Period Light Theme */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Tạo Kỳ Tiền Công Mới</h3>
        {modalError && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold">{modalError}</div>}

        <form onSubmit={handleCreatePeriod} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tên kỳ tiền công</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Kỳ 01/09/2026 - 07/09/2026"
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Từ ngày</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Đến ngày</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-sm transition-all"
          >
            TẠO KỲ TIỀN CÔNG
          </button>
        </form>
      </div>

      {/* Periods Table Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 font-extrabold text-slate-900 text-base">
          Danh Sách Các Kỳ Tiền Công
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="bg-slate-100 text-sm font-extrabold text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Tên kỳ</th>
                <th className="px-6 py-3.5">Thời gian</th>
                <th className="px-6 py-3.5">Số phiên</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {periods.map((period) => (
                <tr key={period.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{period.name}</td>
                  <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700">
                    {new Date(period.startDate).toLocaleDateString('vi-VN')} ➔ {new Date(period.endDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-indigo-600">
                    {period._count?.workShifts || 0} ca
                  </td>
                  <td className="px-6 py-4">
                    {period.isLocked ? (
                      <span className="badge-red text-sm px-2.5 py-1 rounded-md font-bold">🔒 Đã chốt</span>
                    ) : (
                      <span className="badge-amber text-sm px-2.5 py-1 rounded-md font-bold">Đang mở</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!period.isLocked && (
                      <button
                        onClick={() => handleLockPeriod(period.id)}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                      >
                        🔒 CHỐT KỲ NGAY
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
