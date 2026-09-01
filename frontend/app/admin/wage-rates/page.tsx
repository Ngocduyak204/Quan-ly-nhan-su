'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export interface WageRateItem {
  id: string;
  pricePerKg: number;
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy: string;
  user?: { id: string; fullName: string; username: string };
  createdAt: string;
}

export interface UserOption {
  id: string;
  fullName: string;
  username: string;
  role: string;
}

export default function AdminWageRatesPage() {
  const [rates, setRates] = useState<WageRateItem[]>([]);
  const [currentRate, setCurrentRate] = useState<WageRateItem | null>(null);
  const [workers, setWorkers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [newPrice, setNewPrice] = useState<string>('20000');
  const [selectedUserId, setSelectedUserId] = useState<string>(''); // Chuỗi rỗng = Toàn hệ thống
  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchRatesAndWorkers();
  }, []);

  const fetchRatesAndWorkers = async () => {
    try {
      setLoading(true);
      const [allRates, active, allUsers] = await Promise.all([
        apiFetch<WageRateItem[]>('/wage-rates'),
        apiFetch<WageRateItem | null>('/wage-rates/current'),
        apiFetch<UserOption[]>('/users'),
      ]);

      // Đảm bảo thời gian tạo MỚI NHẤT luôn đứng ở TRÊN CÙNG
      const sortedRates = [...allRates].sort((a, b) => {
        const timeA = new Date(a.createdAt || a.effectiveFrom).getTime();
        const timeB = new Date(b.createdAt || b.effectiveFrom).getTime();
        return timeB - timeA;
      });

      setRates(sortedRates);
      setCurrentRate(active);
      setWorkers(allUsers.filter((u) => u.role === 'WORKER'));
    } catch (err) {
      console.error('Lỗi tải đơn giá:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const payload: any = {
      pricePerKg: parseFloat(newPrice),
      effectiveFrom: new Date(effectiveFrom).toISOString(),
    };

    if (selectedUserId && selectedUserId.trim() !== '') {
      payload.userId = selectedUserId.trim();
    }

    try {
      await apiFetch('/wage-rates', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSelectedUserId('');
      fetchRatesAndWorkers();
      alert('Cập nhật đơn giá mới thành công! Đơn giá mới tạo được đưa lên trên cùng.');
    } catch (err: any) {
      setModalError(err.message || 'Thiết lập đơn giá thất bại');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Quản Lý Đơn Giá Tiền Công</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Thiết lập đơn giá theo kg (Toàn hệ thống hoặc Theo từng nhân công riêng) & Bảo lưu lịch sử đơn giá theo thời gian tạo
        </p>
      </div>

      {/* Current Active Rate Banner Light Theme */}
      <div className="bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Đơn giá chung áp dụng hiện tại</span>
          <h2 className="text-3xl font-black text-emerald-600 mt-1">
            {currentRate ? `${currentRate.pricePerKg.toLocaleString('vi-VN')} VNĐ / kg` : 'Chưa thiết lập'}
          </h2>
          {currentRate && (
            <p className="text-sm text-slate-500 font-bold mt-1">
              Hiệu lực từ: {new Date(currentRate.effectiveFrom).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>

        <div className="badge-emerald px-4 py-2 rounded-xl text-sm font-extrabold">
          Áp dụng toàn hệ thống
        </div>
      </div>

      {/* Form Set New Rate Light Theme */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
        <h3 className="text-base font-extrabold text-slate-900 mb-1">Thiết Lập Đơn Giá Mới</h3>
        {modalError && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-bold">{modalError}</div>}

        <form onSubmit={handleCreateRate} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Áp dụng cho đối tượng</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-indigo-600"
              >
                <option value="">🌐 Toàn bộ hệ thống (Mặc định chung)</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    Đơn giá riêng: {w.fullName} (@{w.username})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đơn giá mới (VNĐ / kg)</label>
              <input
                type="number"
                required
                step="100"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="20000"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-black text-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bắt đầu áp dụng từ ngày</label>
              <input
                type="date"
                required
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all"
            >
              CẬP NHẬT ĐƠN GIÁ
            </button>
          </div>
        </form>
      </div>

      {/* Rate History Table Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 font-extrabold text-slate-900 text-base flex justify-between items-center">
          <span>Lịch Sử Thay Đổi Đơn Giá</span>
          <span className="text-xs text-slate-500 font-medium">Tổng: {rates.length} bản ghi</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="bg-slate-100 text-xs font-extrabold text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Đơn giá (VNĐ/kg)</th>
                <th className="px-6 py-3.5">Áp dụng cho</th>
                <th className="px-6 py-3.5">Thời gian tạo</th>
                <th className="px-6 py-3.5">Bắt đầu hiệu lực</th>
                <th className="px-6 py-3.5">Kết thúc hiệu lực</th>
                <th className="px-6 py-3.5 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {rates.map((rate) => (
                <tr key={rate.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black text-emerald-600 text-base">
                    {rate.pricePerKg.toLocaleString('vi-VN')} VNĐ
                  </td>
                  <td className="px-6 py-4 text-xs font-bold">
                    {rate.user ? (
                      <span className="text-indigo-600 font-extrabold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 inline-flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Riêng: {rate.user.fullName} (@{rate.user.username})
                      </span>
                    ) : (
                      <span className="text-slate-700 font-bold inline-flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8" />
                        </svg>
                        Toàn hệ thống
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-indigo-600">
                    {new Date(rate.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-slate-700">
                    {new Date(rate.effectiveFrom).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 font-bold">
                    {rate.effectiveTo ? new Date(rate.effectiveTo).toLocaleDateString('vi-VN') : 'Đang hiệu lực'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!rate.effectiveTo ? (
                      <span className="badge-emerald text-xs px-2.5 py-1 rounded-md font-bold">Đang dùng</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-md font-bold">Lịch sử</span>
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
