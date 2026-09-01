'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export interface WageRateItem {
  id: string;
  pricePerKg: number;
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy: string;
  user?: { fullName: string; username: string };
  createdAt: string;
}

export default function AdminWageRatesPage() {
  const [rates, setRates] = useState<WageRateItem[]>([]);
  const [currentRate, setCurrentRate] = useState<WageRateItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [newPrice, setNewPrice] = useState<string>('5000');
  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const [allRates, active] = await Promise.all([
        apiFetch<WageRateItem[]>('/wage-rates'),
        apiFetch<WageRateItem | null>('/wage-rates/current'),
      ]);

      setRates(allRates);
      setCurrentRate(active);
    } catch (err) {
      console.error('Lỗi tải đơn giá:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    try {
      await apiFetch('/wage-rates', {
        method: 'POST',
        body: JSON.stringify({
          pricePerKg: parseFloat(newPrice),
          effectiveFrom: new Date(effectiveFrom).toISOString(),
        }),
      });

      fetchRates();
      alert('Cập nhật đơn giá mới thành công! Các ca đã hoàn thành trước đó vẫn giữ nguyên đơn giá cũ.');
    } catch (err: any) {
      setModalError(err.message || 'Thiết lập đơn giá thất bại');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Quản Lý Đơn Giá Tiền Công</h1>
        <p className="text-sm text-slate-400 mt-1">
          Thiết lập đơn giá theo kg & bảo lưu lịch sử đơn giá (Historical Rate Versioning)
        </p>
      </div>

      {/* Current Active Rate Banner */}
      <div className="glass-card p-6 border-purple-500/30 bg-gradient-to-r from-slate-900/90 to-purple-950/40 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đơn giá áp dụng hiện tại</span>
          <h2 className="text-3xl font-extrabold text-emerald-400 mt-1">
            {currentRate ? `${currentRate.pricePerKg.toLocaleString('vi-VN')} VNĐ / kg` : 'Chưa thiết lập'}
          </h2>
          {currentRate && (
            <p className="text-xs text-slate-400 mt-1">
              Hiệu lực từ: {new Date(currentRate.effectiveFrom).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>

        <div className="badge-green px-4 py-2 rounded-xl text-xs font-bold">
          Áp dụng toàn hệ thống
        </div>
      </div>

      {/* Form Set New Rate */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Thiết Lập Đơn Giá Mới</h3>
        {modalError && <div className="badge-red p-3 rounded-lg text-xs">{modalError}</div>}

        <form onSubmit={handleCreateRate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Đơn giá mới (VNĐ / kg)</label>
            <input
              type="number"
              required
              step="100"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="5000"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-lg"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Thời điểm bắt đầu áp dụng</label>
            <input
              type="date"
              required
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="gradient-button py-2.5 px-6 font-bold text-sm rounded-xl h-[44px]"
          >
            CẬP NHẬT ĐƠN GIÁ
          </button>
        </form>
      </div>

      {/* Rate History Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 font-bold text-slate-200 text-sm">
          Lịch Sử Thay Đổi Đơn Giá
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Đơn giá (VNĐ/kg)</th>
                <th className="px-6 py-3">Áp dụng cho</th>
                <th className="px-6 py-3">Bắt đầu</th>
                <th className="px-6 py-3">Kết thúc</th>
                <th className="px-6 py-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rates.map((rate) => (
                <tr key={rate.id} className="hover:bg-slate-900/40">
                  <td className="px-6 py-4 font-bold text-emerald-400 text-base">
                    {rate.pricePerKg.toLocaleString('vi-VN')} VNĐ
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {rate.user ? `Riêng: ${rate.user.fullName}` : 'Toàn hệ thống'}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    {new Date(rate.effectiveFrom).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                    {rate.effectiveTo ? new Date(rate.effectiveTo).toLocaleDateString('vi-VN') : 'Đang hiệu lực'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!rate.effectiveTo ? (
                      <span className="badge-green text-xs px-2.5 py-1 rounded-md font-semibold">Đang dùng</span>
                    ) : (
                      <span className="bg-slate-800 text-slate-500 text-xs px-2.5 py-1 rounded-md">Lịch sử</span>
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
