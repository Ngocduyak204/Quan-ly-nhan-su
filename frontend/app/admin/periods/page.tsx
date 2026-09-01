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
        <h1 className="text-2xl font-extrabold text-white">Chốt Kỳ Tiền Công (Wage Period Lock)</h1>
        <p className="text-sm text-slate-400 mt-1">
          Tạo kỳ tiền công và đóng băng dữ liệu lịch sử (Read-Only) để phục vụ thanh toán
        </p>
      </div>

      {/* Form Create Period */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Tạo Kỳ Tiền Công Mới</h3>
        {modalError && <div className="badge-red p-3 rounded-lg text-xs">{modalError}</div>}

        <form onSubmit={handleCreatePeriod} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Tên kỳ tiền công</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Kỳ 01/09/2026 - 07/09/2026"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Từ ngày</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Đến ngày</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="gradient-button py-2.5 px-6 font-bold text-sm rounded-xl"
          >
            TẠO KỲ TIỀN CÔNG
          </button>
        </form>
      </div>

      {/* Periods Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 font-bold text-slate-200 text-sm">
          Danh Sách Các Kỳ Tiền Công
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Tên kỳ</th>
                <th className="px-6 py-3">Thời gian</th>
                <th className="px-6 py-3">Số phiên</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {periods.map((period) => (
                <tr key={period.id} className="hover:bg-slate-900/40">
                  <td className="px-6 py-4 font-bold text-white">{period.name}</td>
                  <td className="px-6 py-4 text-xs font-mono">
                    {new Date(period.startDate).toLocaleDateString('vi-VN')} ➔ {new Date(period.endDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-purple-300">
                    {period._count?.workShifts || 0} ca
                  </td>
                  <td className="px-6 py-4">
                    {period.isLocked ? (
                      <span className="badge-red text-xs px-2.5 py-1 rounded-md font-semibold">🔒 Đã chốt</span>
                    ) : (
                      <span className="badge-amber text-xs px-2.5 py-1 rounded-md font-semibold">Đang mở</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!period.isLocked && (
                      <button
                        onClick={() => handleLockPeriod(period.id)}
                        className="gradient-button px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-purple-500/20"
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
