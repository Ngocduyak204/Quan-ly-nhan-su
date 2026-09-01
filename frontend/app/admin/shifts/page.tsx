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
          <h1 className="text- font-black text-slate-800">Giám Sát Chấm Công & Bằng Chứng</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Kiểm tra chi tiết hình ảnh minh chứng, tọa độ GPS & tiền công
          </p>
        </div>
        <button
          onClick={fetchShifts}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-xs font-bold rounded-xl text-slate-700 border border-slate-300 shadow-sm"
        >
          Làm mới
        </button>
      </div>

      {/* Shifts Table Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="bg-slate-100 text-xs font-extrabold text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Nhân công</th>
                <th className="px-6 py-3.5">Check-in</th>
                <th className="px-6 py-3.5">Check-out</th>
                <th className="px-6 py-3.5">Khoảng cách GPS</th>
                <th className="px-6 py-3.5">Sản lượng (kg)</th>
                <th className="px-6 py-3.5">Tiền công (VNĐ)</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Minh chứng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700">{shift.user.fullName}</p>
                    <p className="text-xs text-slate-500 font-bold">@{shift.user.username}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700">
                    {new Date(shift.checkinTime).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700">
                    {shift.checkoutTime ? new Date(shift.checkoutTime).toLocaleString('vi-VN') : 'Đang ca'}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm font-bold">
                    {shift.distanceMeters !== undefined ? (
                      <span className={shift.distanceMeters > 100 ? 'text-red-600 font-extrabold' : 'text-slate-700'}>
                        {shift.distanceMeters}
                      </span>
                    ) : '---'}
                  </td>
                  <td className="px-6 py-4 font-black text-indigo-600">
                    {shift.outputVolumeKg ? `${shift.outputVolumeKg} kg` : '---'}
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-600">
                    {shift.calculatedWage ? `${shift.calculatedWage.toLocaleString('vi-VN')} VNĐ` : '---'}
                  </td>
                  <td className="px-6 py-4">
                    {shift.status === 'COMPLETED' && <span className="badge-emerald text-xs px-2.5 py-1 rounded-md font-bold">Thành công</span>}
                    {shift.status === 'PENDING_REVIEW' && <span className="badge-amber text-xs px-2.5 py-1 rounded-md font-bold">Chờ duyệt</span>}
                    {shift.status === 'WORKING' && <span className="badge-purple text-xs px-2.5 py-1 rounded-md font-bold">Đang làm</span>}
                    {shift.status === 'APPROVED' && <span className="badge-emerald text-xs px-2.5 py-1 rounded-md font-bold">Đã duyệt</span>}
                    {shift.status === 'REJECTED' && <span className="badge-red text-xs px-2.5 py-1 rounded-md font-bold">Từ chối</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedShift(shift)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
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

      {/* Modal Evidence Viewer Light Theme */}
      {selectedShift && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full p-6 rounded-2xl border border-slate-200 shadow-xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Minh Chứng Phiên Làm Việc</h3>
                <p className="text-xs text-slate-500 font-medium">Nhân công: <span className="text-indigo-600 font-bold">{selectedShift.user.fullName}</span></p>
              </div>
              <button
                onClick={() => setSelectedShift(null)}
                className="text-slate-400 hover:text-slate-900 p-2 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-extrabold text-slate-700 block">1. Ảnh Check-in</span>
                {selectedShift.checkinPhotoUrl ? (
                  <img src={selectedShift.checkinPhotoUrl} alt="Checkin" className="w-full aspect-square object-cover rounded-lg border border-slate-200" />
                ) : (
                  <div className="w-full aspect-square bg-slate-100 flex items-center justify-center text-xs text-slate-400 rounded-lg">Không có ảnh</div>
                )}
                <a
                  href={`https://maps.google.com/?q=${selectedShift.checkinLat},${selectedShift.checkinLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-xs text-indigo-600 font-bold hover:underline pt-1"
                >
                  📍 Xem Check-in trên Maps
                </a>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-extrabold text-slate-700 block">2. Ảnh Check-out</span>
                {selectedShift.checkoutPhotoUrl ? (
                  <img src={selectedShift.checkoutPhotoUrl} alt="Checkout" className="w-full aspect-square object-cover rounded-lg border border-slate-200" />
                ) : (
                  <div className="w-full aspect-square bg-slate-100 flex items-center justify-center text-xs text-slate-400 rounded-lg">Không có ảnh</div>
                )}
                {selectedShift.checkoutLat && (
                  <a
                    href={`https://maps.google.com/?q=${selectedShift.checkoutLat},${selectedShift.checkoutLng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-xs text-indigo-600 font-bold hover:underline pt-1"
                  >
                    📍 Xem Check-out trên Maps
                  </a>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-extrabold text-slate-700 block">3. Minh Chứng Sản Lượng</span>
                {selectedShift.volumeProofPhotoUrl ? (
                  <img src={selectedShift.volumeProofPhotoUrl} alt="Proof" className="w-full aspect-square object-cover rounded-lg border border-slate-200" />
                ) : (
                  <div className="w-full aspect-square bg-slate-100 flex items-center justify-center text-xs text-slate-400 rounded-lg">Không có ảnh</div>
                )}
                <p className="text-center text-xs font-black text-emerald-600 pt-1">
                  Sản lượng: {selectedShift.outputVolumeKg || 0} kg
                </p>
              </div>
            </div>

            {/* Anomaly Details if present */}
            {selectedShift.isAnomaly && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1">
                <p className="font-extrabold">⚠ Dấu hiệu bất thường phát hiện bởi hệ thống:</p>
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
