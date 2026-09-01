'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';

export interface WorkShift {
  id: string;
  checkinTime: string;
  checkoutTime?: string;
  outputVolumeKg?: number;
  calculatedWage?: number;
  status: 'WORKING' | 'COMPLETED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  isAnomaly?: boolean;
}

export default function WorkerDashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeShift, setActiveShift] = useState<WorkShift | null>(null);
  const [recentShifts, setRecentShifts] = useState<WorkShift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchWorkerData();
    }
  }, [user, authLoading]);

  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      const [active, history] = await Promise.all([
        apiFetch<WorkShift | null>('/shifts/active'),
        apiFetch<WorkShift[]>('/shifts/my-shifts'),
      ]);
      setActiveShift(active);
      setRecentShifts(history || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu ca làm việc:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tính tổng sản lượng kg và tiền công trong ngày hôm nay
  const todayStr = new Date().toISOString().split('T')[0];
  const todayShifts = recentShifts.filter((s) => s.checkinTime.startsWith(todayStr));
  const todayVolume = todayShifts.reduce((acc, curr) => acc + (curr.outputVolumeKg || 0), 0);
  const todayWage = todayShifts.reduce((acc, curr) => acc + (curr.calculatedWage || 0), 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 max-w-md mx-auto relative">
      {/* Header */}
      <header className="p-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-md shadow-purple-500/20">
            {user?.fullName?.charAt(0) || 'N'}
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">{user?.fullName}</h2>
            {/* <span className="text-xs text-slate-400">Nhân công làm việc</span> */}
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
          title="Đăng xuất"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="p-5 space-y-6">
        {/* Status & Check-in / Check-out Main Card */}
        <div className="glass-card p-6 border-purple-500/20 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái hiện tại</span>
            {activeShift ? (
              <span className="badge-amber text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Đang làm việc
              </span>
            ) : (
              <span className="badge-green text-xs px-3 py-1 rounded-full font-medium">
                Sẵn sàng ca mới
              </span>
            )}
          </div>

          {activeShift ? (
            <div className="space-y-4">
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Thời gian Check-in</p>
                <p className="text-xl font-bold text-purple-300">
                  {new Date(activeShift.checkinTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(activeShift.checkinTime).toLocaleDateString('vi-VN')}
                </p>
              </div>

              <Link
                href="/worker/checkout"
                className="w-full py-4 px-6 gradient-button bg-gradient-to-r from-amber-500 to-purple-600 flex items-center justify-center gap-2 text-lg font-bold shadow-lg shadow-purple-500/25 block text-center"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                CHECK-OUT KẾT THÚC CA
              </Link>
            </div>
          ) : (
            <div className="space-y-4 text-center py-2">
              <p className="text-sm text-slate-300">Bạn chưa bắt đầu ca làm việc nào hôm nay.</p>
              <Link
                href="/worker/checkin"
                className="w-full py-4 px-6 gradient-button flex items-center justify-center gap-2 text-lg font-bold shadow-lg shadow-blue-500/25 block text-center"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                CHECK-IN BẮT ĐẦU CA
              </Link>
            </div>
          )}
        </div>

        {/* Daily Performance Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Sản lượng hôm nay</span>
            <p className="text-2xl font-extrabold text-blue-400 mt-1">
              {todayVolume.toLocaleString('vi-VN')} <span className="text-sm font-normal text-slate-300">kg</span>
            </p>
          </div>

          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Tiền công tạm tính</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">
              {todayWage.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-300">VNĐ</span>
            </p>
          </div>
        </div>

        {/* Recent Work History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Lịch sử ca làm việc</h3>
            <span className="text-xs text-slate-400">{recentShifts.length} phiên</span>
          </div>

          <div className="space-y-3">
            {recentShifts.length === 0 ? (
              <div className="glass-card p-6 text-center text-xs text-slate-500">
                Chưa có lịch sử phiên làm việc
              </div>
            ) : (
              recentShifts.slice(0, 5).map((shift) => (
                <div key={shift.id} className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {new Date(shift.checkinTime).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Check-in: {new Date(shift.checkinTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      {shift.checkoutTime && ` - Check-out: ${new Date(shift.checkoutTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>

                  <div className="text-right">
                    {shift.outputVolumeKg ? (
                      <p className="text-sm font-bold text-blue-400">{shift.outputVolumeKg} kg</p>
                    ) : (
                      <p className="text-xs text-slate-500">Đang chạy</p>
                    )}

                    {shift.status === 'COMPLETED' && (
                      <span className="text-[10px] badge-green px-2 py-0.5 rounded">Hợp lệ</span>
                    )}
                    {shift.status === 'PENDING_REVIEW' && (
                      <span className="text-[10px] badge-amber px-2 py-0.5 rounded">Chờ duyệt</span>
                    )}
                    {shift.status === 'WORKING' && (
                      <span className="text-[10px] badge-amber px-2 py-0.5 rounded">Đang làm</span>
                    )}
                    {shift.status === 'REJECTED' && (
                      <span className="text-[10px] badge-red px-2 py-0.5 rounded">Từ chối</span>
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
