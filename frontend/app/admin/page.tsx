'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    activeShiftsCount: 0,
    totalVolumeKg: 0,
    totalWageVnd: 0,
    anomaliesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [users, shifts, summary] = await Promise.all([
        apiFetch<any[]>('/users'),
        apiFetch<any[]>('/shifts/admin/all'),
        apiFetch<any>('/reports/summary'),
      ]);

      const activeCount = shifts.filter((s) => s.status === 'WORKING').length;
      const anomalyCount = shifts.filter((s) => s.status === 'PENDING_REVIEW' || s.isAnomaly).length;

      setStats({
        totalWorkers: users.filter((u) => u.role === 'WORKER').length,
        activeShiftsCount: activeCount,
        totalVolumeKg: summary.summary?.totalVolumeKg || 0,
        totalWageVnd: summary.summary?.totalWage || 0,
        anomaliesCount: anomalyCount,
      });
    } catch (err) {
      console.error('Lỗi tải dữ liệu Dashboard Admin:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Tổng Quan Hệ Thống</h1>
          <p className="text-sm text-slate-400 mt-1">
            Theo dõi thời gian thực nhân công, sản lượng kg và tiền công
          </p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 border border-slate-700 transition-colors"
        >
          Làm mới dữ liệu
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Nhân Công</span>
              <h3 className="text-3xl font-extrabold text-white mt-2">{stats.totalWorkers}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-500">Đang hoạt động:</span>
            <span className="font-semibold text-emerald-400">{stats.activeShiftsCount} đang ca</span>
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Sản Lượng</span>
              <h3 className="text-3xl font-extrabold text-blue-400 mt-2">
                {stats.totalVolumeKg.toLocaleString('vi-VN')} <span className="text-sm font-normal">kg</span>
              </h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-500">Tính theo kg hợp lệ</span>
            <span className="font-semibold text-purple-400">Xem báo cáo ➔</span>
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Tiền Công</span>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
                {stats.totalWageVnd.toLocaleString('vi-VN')} <span className="text-xs font-normal">VNĐ</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-500">Đã chốt kỳ hoặc hợp lệ</span>
            <span className="font-semibold text-emerald-400">Chi tiết ➔</span>
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden border-amber-500/30">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cảnh Báo Bất Thường</span>
              <h3 className="text-3xl font-extrabold text-amber-400 mt-2">{stats.anomaliesCount}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-500">Cần Admin kiểm tra</span>
            <Link href="/admin/anomalies" className="font-bold text-amber-400 hover:underline">
              Xử lý ngay ➔
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/admin/users" className="glass-card p-5 hover:border-purple-500/50 transition-colors group">
          <h4 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
            Quản Lý Tài Khoản Nhân Công
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Thêm nhân công mới, reset mật khẩu, kích hoạt hoặc vô hiệu hóa tài khoản.
          </p>
        </Link>

        <Link href="/admin/shifts" className="glass-card p-5 hover:border-blue-500/50 transition-colors group">
          <h4 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">
            Giám Sát Chấm Công & Bằng Chứng
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Xem ảnh Check-in/out, ảnh sản lượng kg và mở vị trí trên Google Maps.
          </p>
        </Link>

        <Link href="/admin/wage-rates" className="glass-card p-5 hover:border-emerald-500/50 transition-colors group">
          <h4 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
            Thiết Lập Đơn Giá / kg
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Cập nhật đơn giá tiền công mới và tra cứu lịch sử áp dụng đơn giá.
          </p>
        </Link>
      </div>
    </div>
  );
}
