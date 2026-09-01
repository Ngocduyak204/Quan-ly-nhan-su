'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export interface ReportWorkerItem {
  userId: string;
  username: string;
  fullName: string;
  totalVolumeKg: number;
  totalWage: number;
  shiftCount: number;
}

export interface ReportSummaryData {
  summary: {
    totalWorkers: number;
    totalShifts: number;
    totalVolumeKg: number;
    totalWage: number;
  };
  workers: ReportWorkerItem[];
}

export default function AdminReportsPage() {
  const [report, setReport] = useState<ReportSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let query = '';
      if (startDate || endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        query = `?${params.toString()}`;
      }

      const data = await apiFetch<ReportSummaryData>(`/reports/summary${query}`);
      setReport(data);
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Báo Cáo Sản Lượng & Tiền Công</h1>
          <p className="text-sm text-slate-400 mt-1">
            Tổng hợp dữ liệu theo ngày, tuần, tháng, năm dạng bảng Excel
          </p>
        </div>
      </div>

      {/* Filter Form */}
      <div className="glass-card p-5">
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="gradient-button px-5 py-2 text-xs font-bold rounded-lg h-[38px]"
          >
            LỌC BÁO CÁO
          </button>
        </form>
      </div>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400">Số nhân công</span>
            <p className="text-2xl font-extrabold text-white mt-1">{report.summary.totalWorkers}</p>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400">Tổng số ca</span>
            <p className="text-2xl font-extrabold text-purple-400 mt-1">{report.summary.totalShifts}</p>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400">Tổng sản lượng</span>
            <p className="text-2xl font-extrabold text-blue-400 mt-1">
              {report.summary.totalVolumeKg.toLocaleString('vi-VN')} kg
            </p>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400">Tổng tiền công</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">
              {report.summary.totalWage.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        </div>
      )}

      {/* Excel-like Report Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 font-bold text-slate-200 text-sm">
          Bảng Tổng Hợp Chi Tiết Theo Nhân Công
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Nhân công</th>
                <th className="px-6 py-4">Số ca làm</th>
                <th className="px-6 py-4">Tổng sản lượng (kg)</th>
                <th className="px-6 py-4 text-right">Tổng tiền công (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report?.workers.map((worker) => (
                <tr key={worker.userId} className="hover:bg-slate-900/40">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{worker.fullName}</p>
                    <p className="text-xs text-slate-500">{worker.username}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{worker.shiftCount} ca</td>
                  <td className="px-6 py-4 font-bold text-blue-400 text-base">
                    {worker.totalVolumeKg.toLocaleString('vi-VN')} kg
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-400 text-base text-right">
                    {worker.totalWage.toLocaleString('vi-VN')} VNĐ
                  </td>
                </tr>
              ))}
            </tbody>
            {report && (
              <tfoot className="bg-slate-900/90 font-bold border-t border-slate-700">
                <tr>
                  <td className="px-6 py-4 text-white uppercase text-xs">Tổng cộng</td>
                  <td className="px-6 py-4 text-xs font-mono">{report.summary.totalShifts} ca</td>
                  <td className="px-6 py-4 text-blue-400 text-base">{report.summary.totalVolumeKg.toLocaleString('vi-VN')} kg</td>
                  <td className="px-6 py-4 text-emerald-400 text-base text-right">{report.summary.totalWage.toLocaleString('vi-VN')} VNĐ</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
