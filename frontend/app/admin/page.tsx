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
          <h1 className="text-2xl font-extrabold text-slate-900">Tổng Quan Hệ Thống</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi thời gian thực nhân công, sản lượng kg và tiền công
          </p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới dữ liệu
        </button>
      </div>

      {/* Metric Cards Grid - Light Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Tổng Nhân Công */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tổng Nhân Công</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalWorkers}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs items-center">
            <span className="text-slate-500 font-medium">Đang hoạt động:</span>
            <Link href="/admin/users" className="font-bold text-emerald-600 hover:underline bg-emerald-50 px-2 py-0.5 rounded-full">
              {stats.activeShiftsCount} đang ca ➔
            </Link>
          </div>
        </div>

        {/* Card 2: Tổng Sản Lượng (Clickable Link Xem Báo Cáo) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tổng Sản Lượng</span>
              <h3 className="text-3xl font-extrabold text-indigo-600 mt-2">
                {stats.totalVolumeKg.toLocaleString('vi-VN')} <span className="text-sm font-normal text-slate-500">kg</span>
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs items-center">
            <span className="text-slate-500 font-medium">Tính theo kg hợp lệ</span>
            <Link href="/admin/reports" className="font-bold text-indigo-600 hover:underline bg-indigo-50 px-2.5 py-1 rounded-lg">
              Xem báo cáo ➔
            </Link>
          </div>
        </div>

        {/* Card 3: Tổng Tiền Công (Clickable Link Chi Tiết) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tổng Tiền Công</span>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">
                {stats.totalWageVnd.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">VNĐ</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs items-center">
            <span className="text-slate-500 font-medium">Đã chốt kỳ / Hợp lệ</span>
            <Link href="/admin/shifts" className="font-bold text-emerald-600 hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg">
              Chi tiết ➔
            </Link>
          </div>
        </div>

        {/* Card 4: Cảnh Báo Bất Thường (Clickable Link Xử Lý Ngay) */}
        <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Cảnh Báo Bất Thường</span>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-2">{stats.anomaliesCount}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs items-center">
            <span className="text-slate-500 font-medium">Cần Admin kiểm tra</span>
            <Link href="/admin/anomalies" className="font-extrabold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded-lg shadow-sm transition-colors">
              Xử lý ngay ➔
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Cards - Light Theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/admin/users" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
            Quản Lý Tài Khoản Nhân Công
          </h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Thêm nhân công mới, reset mật khẩu, kích hoạt hoặc vô hiệu hóa tài khoản.
          </p>
        </Link>

        <Link href="/admin/shifts" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
            Giám Sát Chấm Công & Bằng Chứng
          </h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Xem ảnh Check-in/out, ảnh sản lượng kg và mở vị trí trên Google Maps.
          </p>
        </Link>

        <Link href="/admin/wage-rates" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
            Thiết Lập Đơn Giá / kg
          </h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Cập nhật đơn giá tiền công mới và tra cứu lịch sử áp dụng đơn giá.
          </p>
        </Link>
      </div>
    </div>
  );
}
