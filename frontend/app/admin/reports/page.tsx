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
          <h1 className="text-2xl font-black text-slate-900">Báo Cáo Sản Lượng & Tiền Công</h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Tổng hợp dữ liệu theo ngày, tuần, tháng, năm dạng bảng Excel
          </p>
        </div>
      </div>

      {/* Filter Form Light Theme */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl h-[40px] shadow-sm transition-all"
          >
            LỌC BÁO CÁO
          </button>
        </form>
      </div>

      {/* Summary Cards Light Theme */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số nhân công</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{report.summary.totalWorkers}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số ca</span>
            <p className="text-2xl font-black text-indigo-600 mt-1">{report.summary.totalShifts}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng sản lượng</span>
            <p className="text-2xl font-black text-blue-600 mt-1">
              {report.summary.totalVolumeKg.toLocaleString('vi-VN')} kg
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng tiền công</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {report.summary.totalWage.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        </div>
      )}

      {/* Excel-like Report Table Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 font-extrabold text-slate-900 text-base">
          Bảng Tổng Hợp Chi Tiết Theo Nhân Công
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="bg-slate-100 text-xs font-extrabold text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Nhân công</th>
                <th className="px-6 py-3.5">Số ca làm</th>
                <th className="px-6 py-3.5">Tổng sản lượng (kg)</th>
                <th className="px-6 py-3.5 text-right">Tổng tiền công (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {report?.workers.map((worker) => (
                <tr key={worker.userId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-base text-slate-700">{worker.fullName}</p>
                    <p className="text-sm text-slate-500 font-bold">@{worker.username}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 text-sm">{worker.shiftCount} ca</td>
                  <td className="px-6 py-4 font-black text-indigo-600 text-base">
                    {worker.totalVolumeKg.toLocaleString('vi-VN')} kg
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-600 text-base text-right">
                    {worker.totalWage.toLocaleString('vi-VN')} VNĐ
                  </td>
                </tr>
              ))}
            </tbody>
            {report && (
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                <tr>
                  <td className="px-6 py-4 font-black uppercase text-base">Tổng cộng</td>
                  <td className="px-6 py-4 text-sm font-bold">{report.summary.totalShifts} ca</td>
                  <td className="px-6 py-4 text-indigo-600 font-black text-base">{report.summary.totalVolumeKg.toLocaleString('vi-VN')} kg</td>
                  <td className="px-6 py-4 text-emerald-600 font-black text-base text-right">{report.summary.totalWage.toLocaleString('vi-VN')} VNĐ</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
