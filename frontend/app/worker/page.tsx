'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';

export interface ActiveShift {
  id: string;
  checkinTime: string;
  checkinLat: number;
  checkinLng: number;
  checkinAccuracy: number;
  checkinPhotoUrl: string;
  status: string;
}

export interface WorkShiftItem {
  id: string;
  checkinTime: string;
  checkoutTime?: string;
  outputVolumeKg?: number;
  calculatedWage?: number;
  status: string;
  isAnomaly: boolean;
}

export default function WorkerDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [shifts, setShifts] = useState<WorkShiftItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [activeData, myShiftsData] = await Promise.all([
        apiFetch<ActiveShift | null>('/shifts/active'),
        apiFetch<WorkShiftItem[]>('/shifts/my-shifts'),
      ]);

      setActiveShift(activeData);
      setShifts(myShiftsData);
    } catch (err) {
      console.error('Lỗi nạp dữ liệu ca làm việc:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Tính tổng sản lượng & tiền công hôm nay
  const todayStr = new Date().toISOString().split('T')[0];
  const todayShifts = shifts.filter((s) => s.checkinTime.startsWith(todayStr));
  const todayVolume = todayShifts.reduce((acc, s) => acc + (s.outputVolumeKg || 0), 0);
  const todayWage = todayShifts.reduce((acc, s) => acc + (s.calculatedWage || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 max-w-md mx-auto relative font-sans">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <Link href="/profile" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            {user?.fullName?.charAt(0) || 'N'}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{user?.fullName}</h2>
            <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
              Hồ sơ & Đổi mật khẩu
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
          title="Đăng xuất"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="p-4 space-y-5">
        {/* Status Card & Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Trạng Thái Hôm Nay</span>
            {activeShift ? (
              <span className="badge-purple font-bold px-2.5 py-1 rounded-full text-xs">ĐANG TRONG CA</span>
            ) : (
              <span className="badge-emerald font-bold px-2.5 py-1 rounded-full text-xs">SẴN SÀNG VÀO CA</span>
            )}
          </div>

          {activeShift ? (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-medium">Thời gian Check-in</p>
                <p className="text-xl font-mono font-black text-indigo-600">
                  {new Date(activeShift.checkinTime).toLocaleTimeString('vi-VN')}
                </p>
              </div>

              <Link
                href="/worker/checkout"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2 text-base font-extrabold rounded-xl shadow-md shadow-amber-500/20 transition-all"
              >
                CHECK-OUT & BÁO SẢN LƯỢNG ➔
              </Link>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn chưa bắt đầu ca làm việc. Vui lòng bấm bên dưới để định vị và chụp ảnh Check-in.
              </p>
              <Link
                href="/worker/checkin"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 text-base font-extrabold rounded-xl shadow-md shadow-indigo-500/20 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                BẮT ĐẦU CHECK-IN CA MỚI
              </Link>
            </div>
          )}
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Sản lượng hôm nay</span>
            <p className="text-2xl font-black text-indigo-600">
              {todayVolume.toLocaleString('vi-VN')} <span className="text-xs text-slate-400 font-normal">kg</span>
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Tiền công tạm tính</span>
            <p className="text-2xl font-black text-emerald-600">
              {todayWage.toLocaleString('vi-VN')} <span className="text-xs text-slate-400 font-normal">đ</span>
            </p>
          </div>
        </div>

        {/* Shift History List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Lịch Sử Ca Gần Đây</h3>

          <div className="space-y-3">
            {shifts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Chưa có ca làm việc nào</p>
            ) : (
              shifts.slice(0, 5).map((shift) => (
                <div key={shift.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-extrabold text-slate-900">
                      {new Date(shift.checkinTime).toLocaleDateString('vi-VN')} ({new Date(shift.checkinTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                      {shift.outputVolumeKg ? `${shift.outputVolumeKg} kg` : 'Chưa nhập kg'}
                    </p>
                  </div>

                  <div className="text-right">
                    {shift.status === 'COMPLETED' && (
                      <span className="badge-emerald px-2 py-0.5 rounded text-[10px] font-bold">Hoàn thành</span>
                    )}
                    {shift.status === 'PENDING_REVIEW' && (
                      <span className="badge-amber px-2 py-0.5 rounded text-[10px] font-bold">Đợi duyệt</span>
                    )}
                    {shift.status === 'WORKING' && (
                      <span className="badge-purple px-2 py-0.5 rounded text-[10px] font-bold">Đang làm</span>
                    )}

                    {shift.calculatedWage && (
                      <p className="text-emerald-600 font-extrabold font-mono mt-1 text-sm">
                        +{shift.calculatedWage.toLocaleString('vi-VN')} đ
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
