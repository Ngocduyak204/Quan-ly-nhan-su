'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [supportContact, setSupportContact] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await apiFetch<{ message: string; supportContact?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ username, phone }),
      });

      setSuccessMsg(res.message);
      if (res.supportContact) {
        setSupportContact(res.supportContact);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Yêu cầu thất bại. Vui lòng kiểm tra lại tên đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-card w-full max-w-md p-8 z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">Quên Mật Khẩu?</h1>
          <p className="text-xs text-slate-400">
            Nhập tên đăng nhập để gửi yêu cầu đặt lại mật khẩu đến Quản trị viên
          </p>
        </div>

        {successMsg ? (
          <div className="space-y-4 text-center">
            <div className="badge-emerald p-4 rounded-xl text-xs space-y-2 leading-relaxed">
              <p className="font-bold">{successMsg}</p>
              {supportContact && (
                <p className="text-sm font-mono font-extrabold text-emerald-300">
                  Hotline Admin: {supportContact}
                </p>
              )}
            </div>
            <Link
              href="/login"
              className="inline-block w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all"
            >
               Quay Về Đăng Nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 badge-red rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tên đăng nhập</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: worker1"
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Số điện thoại đăng ký (Không bắt buộc)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 gradient-button font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                'GỬI YÊU CẦU ĐẶT LẠI MẬT KHẨU'
              )}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-purple-400 hover:underline font-semibold">
                 Quay lại trang đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
