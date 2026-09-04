'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export interface AnomalyShift {
  id: string;
  user: { fullName: string; username: string };
  checkinTime: string;
  checkoutTime?: string;
  distanceMeters?: number;
  outputVolumeKg?: number;
  calculatedWage?: number;
  anomalyReasons: string[];
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
}

export default function AdminAnomaliesPage() {
  const [anomalies, setAnomalies] = useState<AnomalyShift[]>([]);
  const [loading, setLoading] = useState(true);

  // Adjust Volume Modal State
  const [selectedShift, setSelectedShift] = useState<AnomalyShift | null>(null);
  const [newVolumeKg, setNewVolumeKg] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<AnomalyShift[]>('/shifts/admin/all?isAnomaly=true');
      setAnomalies(data);
    } catch (err) {
      console.error('Lỗi tải danh sách bất thường:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustVolume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShift) return;
    setModalError(null);

    try {
      await apiFetch(`/shifts/admin/${selectedShift.id}/adjust-volume`, {
        method: 'PATCH',
        body: JSON.stringify({
          newVolumeKg: parseFloat(newVolumeKg),
          reason: adjustReason,
        }),
      });

      setSelectedShift(null);
      setNewVolumeKg('');
      setAdjustReason('');
      fetchAnomalies();
    } catch (err: any) {
      setModalError(err.message || 'Điều chỉnh sản lượng thất bại');
    }
  };

  const handleReview = async (shiftId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiFetch(`/shifts/admin/${shiftId}/review`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          reason: status === 'APPROVED' ? 'Admin phê duyệt ca bất thường' : 'Admin từ chối ca bất thường',
        }),
      });

      fetchAnomalies();
    } catch (err) {
      alert('Xử lý phê duyệt thất bại');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Xử Lý Ca Làm Việc Bất Thường</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm tra các ca sai lệch GPS & điều chỉnh sản lượng có lưu vết Audit Log
          </p>
        </div>
        <button
          onClick={fetchAnomalies}
          disabled={loading}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-xs font-bold rounded-xl text-slate-700 border border-slate-300 shadow-sm flex items-center gap-2 disabled:opacity-60 transition-all"
        >
          <svg className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Đang làm mới...' : 'Làm mới'}
        </button>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {anomalies.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-500 text-sm rounded-2xl border border-slate-200 shadow-sm">
            🎉 Không có ca làm việc bất thường nào cần xử lý!
          </div>
        ) : (
          anomalies.map((shift) => (
            <div key={shift.id} className="bg-white p-6 rounded-2xl border-2 border-amber-300 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-800">{shift.user.fullName}</h3>
                    <span className="text-xs font-mono font-bold text-indigo-600">({shift.user.username})</span>
                    <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {shift.status === 'PENDING_REVIEW' ? 'Chờ Duyệt' : shift.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Check-in: {new Date(shift.checkinTime).toLocaleString('vi-VN')}
                    {shift.checkoutTime && ` - Check-out: ${new Date(shift.checkoutTime).toLocaleString('vi-VN')}`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">Sản lượng báo cáo</p>
                    <p className="text-xl font-black text-indigo-600">{shift.outputVolumeKg || 0} kg</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedShift(shift);
                      setNewVolumeKg(shift.outputVolumeKg?.toString() || '');
                    }}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 border border-amber-300 rounded-lg transition-colors"
                  >
                    ✏ Sửa sản lượng
                  </button>
                </div>
              </div>

              {/* Anomaly Flag Reasons */}
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1">
                <span className="font-bold">Lý do bị gán nhãn bất thường:</span>
                <ul className="list-disc list-inside">
                  {shift.anomalyReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3 pt-2">
                <button
                  onClick={() => handleReview(shift.id, 'REJECTED')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  TỪ CHỐI CA
                </button>
                <button
                  onClick={() => handleReview(shift.id, 'APPROVED')}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  PHÊ DUYỆT CA
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Adjust Volume */}
      {selectedShift && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl relative">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Điều Chỉnh Sản Lượng</h3>
            <p className="text-xs text-slate-500 mb-4">
              Nhân công: <span className="text-indigo-600 font-bold">{selectedShift.user.fullName}</span>
            </p>
            {modalError && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs mb-4">{modalError}</div>}
            <form onSubmit={handleAdjustVolume} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Sản lượng cũ (kg)</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedShift.outputVolumeKg || 0} kg`}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1 font-semibold">Sản lượng mới (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newVolumeKg}
                  onChange={(e) => setNewVolumeKg(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-base focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1 font-semibold">
                  Lý do điều chỉnh <span className="text-red-600">* (Bắt buộc để lưu Audit Log)</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Nhập lý do điều chỉnh sản lượng..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedShift(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-semibold"
                >
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm">
                  Lưu Điều Chỉnh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
