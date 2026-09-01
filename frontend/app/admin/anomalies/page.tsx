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
          <h1 className="text-2xl font-extrabold text-white">Xử Lý Ca Làm Việc Bất Thường</h1>
          <p className="text-sm text-slate-400 mt-1">
            Kiểm tra các ca sai lệch GPS & điều chỉnh sản lượng có lưu vết Audit Log
          </p>
        </div>
        <button
          onClick={fetchAnomalies}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200"
        >
          Làm mới
        </button>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {anomalies.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500 text-sm">
            🎉 Không có ca làm việc bất thường nào cần xử lý!
          </div>
        ) : (
          anomalies.map((shift) => (
            <div key={shift.id} className="glass-card p-6 border-amber-500/20 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-white">{shift.user.fullName}</h3>
                    <span className="text-xs font-mono text-purple-300">({shift.user.username})</span>
                    <span className="badge-amber text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      {shift.status === 'PENDING_REVIEW' ? 'Chờ Duyệt' : shift.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Check-in: {new Date(shift.checkinTime).toLocaleString('vi-VN')}
                    {shift.checkoutTime && ` - Check-out: ${new Date(shift.checkoutTime).toLocaleString('vi-VN')}`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Sản lượng báo cáo</p>
                    <p className="text-xl font-bold text-blue-400">{shift.outputVolumeKg || 0} kg</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedShift(shift);
                      setNewVolumeKg(shift.outputVolumeKg?.toString() || '');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-amber-500/30 rounded-lg"
                  >
                    ✏ Sửa sản lượng
                  </button>
                </div>
              </div>

              {/* Anomaly Flag Reasons */}
              <div className="p-3 badge-red rounded-xl text-xs space-y-1">
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
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold rounded-xl"
                >
                  TỪ CHỐI CA
                </button>
                <button
                  onClick={() => handleReview(shift.id, 'APPROVED')}
                  className="gradient-button px-5 py-2 text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 relative">
            <h3 className="text-lg font-bold text-white mb-1">Điều Chỉnh Sản Lượng</h3>
            <p className="text-xs text-slate-400 mb-4">
              Nhân công: <span className="text-purple-300 font-bold">{selectedShift.user.fullName}</span>
            </p>
            {modalError && <div className="badge-red p-3 rounded-lg text-xs mb-4">{modalError}</div>}
            <form onSubmit={handleAdjustVolume} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Sản lượng cũ (kg)</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedShift.outputVolumeKg || 0} kg`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Sản lượng mới (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newVolumeKg}
                  onChange={(e) => setNewVolumeKg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-base"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Lý do điều chỉnh <span className="text-red-400">* (Bắt buộc để lưu Audit Log)</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Nhập lý do điều chỉnh sản lượng..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedShift(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg font-semibold"
                >
                  Hủy
                </button>
                <button type="submit" className="gradient-button px-4 py-2 text-xs font-bold rounded-lg">
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
