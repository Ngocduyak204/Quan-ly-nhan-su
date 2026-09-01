'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export interface ShiftItem {
  id: string;
  userId: string;
  user: { fullName: string; username: string; phone?: string };
  checkinTime: string;
  checkinLat: number;
  checkinLng: number;
  checkinAccuracy: number;
  checkinPhotoUrl: string;
  checkoutTime?: string;
  checkoutLat?: number;
  checkoutLng?: number;
  checkoutAccuracy?: number;
  checkoutPhotoUrl?: string;
  outputVolumeKg?: number;
  volumeProofPhotoUrl?: string;
  appliedWageRate?: number;
  calculatedWage?: number;
  distanceMeters?: number;
  status: 'WORKING' | 'COMPLETED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  isAnomaly: boolean;
  anomalyReasons: string[];
}

export default function AdminShiftsPage() {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<ShiftItem | null>(null);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<ShiftItem[]>('/shifts/admin/all');
      setShifts(data);
    } catch (err) {
      console.error('Lỗi tải danh sách chấm công:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Giám Sát Chấm Công & Bằng Chứng</h1>
          <p className="text-sm text-slate-400 mt-1">
            Kiểm tra chi tiết hình ảnh minh chứng, tọa độ GPS & tiền công
          </p>
        </div>
        <button
          onClick={fetchShifts}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200"
        >
          Làm mới
        </button>
      </div>

      {/* Shifts Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Nhân công</th>
                <th className="px-6 py-4">Check-in</th>
                <th className="px-6 py-4">Check-out</th>
                <th className="px-6 py-4">Khoảng cách GPS</th>
                <th className="px-6 py-4">Sản lượng (kg)</th>
                <th className="px-6 py-4">Tiền công (VNĐ)</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Minh chứng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">{shift.user.fullName}</p>
                    <p className="text-xs text-slate-500">{shift.user.username}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    {new Date(shift.checkinTime).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    {shift.checkoutTime ? new Date(shift.checkoutTime).toLocaleString('vi-VN') : 'Đang ca'}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {shift.distanceMeters !== undefined ? (
                      <span className={shift.distanceMeters > 100 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                        {shift.distanceMeters} m
                      </span>
                    ) : '---'}
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-400">
                    {shift.outputVolumeKg ? `${shift.outputVolumeKg} kg` : '---'}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-400">
                    {shift.calculatedWage ? `${shift.calculatedWage.toLocaleString('vi-VN')} VNĐ` : '---'}
                  </td>
                  <td className="px-6 py-4">
                    {shift.status === 'COMPLETED' && <span className="badge-green text-xs px-2.5 py-1 rounded-md font-semibold">Thành công</span>}
                    {shift.status === 'PENDING_REVIEW' && <span className="badge-amber text-xs px-2.5 py-1 rounded-md font-semibold">Chờ duyệt</span>}
                    {shift.status === 'WORKING' && <span className="badge-amber text-xs px-2.5 py-1 rounded-md font-semibold">Đang làm</span>}
                    {shift.status === 'APPROVED' && <span className="badge-green text-xs px-2.5 py-1 rounded-md font-semibold">Đã duyệt</span>}
                    {shift.status === 'REJECTED' && <span className="badge-red text-xs px-2.5 py-1 rounded-md font-semibold">Từ chối</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedShift(shift)}
                      className="text-xs gradient-button px-3 py-1.5 rounded-lg font-semibold"
                    >
                      Xem Bằng Chứng
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Evidence Viewer */}
      {selectedShift && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-3xl w-full p-6 relative space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Minh Chứng Phiên Làm Việc</h3>
                <p className="text-xs text-slate-400">Nhân công: <span className="text-purple-300 font-bold">{selectedShift.user.fullName}</span></p>
              </div>
              <button
                onClick={() => setSelectedShift(null)}
                className="text-slate-400 hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 block">1. Ảnh Check-in</span>
                {selectedShift.checkinPhotoUrl ? (
                  <img src={selectedShift.checkinPhotoUrl} alt="Checkin" className="w-full aspect-square object-cover rounded-lg" />
                ) : (
                  <div className="w-full aspect-square bg-slate-950 flex items-center justify-center text-xs text-slate-600 rounded-lg">Không có ảnh</div>
                )}
                <a
                  href={`https://maps.google.com/?q=${selectedShift.checkinLat},${selectedShift.checkinLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-xs text-blue-400 hover:underline pt-1"
                >
                  📍 Xem Check-in trên Maps
                </a>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 block">2. Ảnh Check-out</span>
                {selectedShift.checkoutPhotoUrl ? (
                  <img src={selectedShift.checkoutPhotoUrl} alt="Checkout" className="w-full aspect-square object-cover rounded-lg" />
                ) : (
                  <div className="w-full aspect-square bg-slate-950 flex items-center justify-center text-xs text-slate-600 rounded-lg">Không có ảnh</div>
                )}
                {selectedShift.checkoutLat && (
                  <a
                    href={`https://maps.google.com/?q=${selectedShift.checkoutLat},${selectedShift.checkoutLng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-xs text-blue-400 hover:underline pt-1"
                  >
                    📍 Xem Check-out trên Maps
                  </a>
                )}
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 block">3. Minh Chứng Sản Lượng</span>
                {selectedShift.volumeProofPhotoUrl ? (
                  <img src={selectedShift.volumeProofPhotoUrl} alt="Proof" className="w-full aspect-square object-cover rounded-lg" />
                ) : (
                  <div className="w-full aspect-square bg-slate-950 flex items-center justify-center text-xs text-slate-600 rounded-lg">Không có ảnh</div>
                )}
                <p className="text-center text-xs font-bold text-emerald-400 pt-1">
                  Sản lượng: {selectedShift.outputVolumeKg || 0} kg
                </p>
              </div>
            </div>

            {/* Anomaly Details if present */}
            {selectedShift.isAnomaly && (
              <div className="p-4 badge-red rounded-xl text-xs space-y-1">
                <p className="font-bold text-red-300">⚠ Dấu hiệu bất thường phát hiện bởi hệ thống:</p>
                <ul className="list-disc list-inside space-y-1">
                  {selectedShift.anomalyReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
