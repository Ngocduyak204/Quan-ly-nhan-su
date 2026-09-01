'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export interface UserItem {
  id: string;
  username: string;
  fullName: string;
  phone?: string;
  address?: string;
  role: 'ADMIN' | 'WORKER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  currentRate?: number;
  isCustomRate?: boolean;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState<UserItem | null>(null);
  const [showCustomRateModal, setShowCustomRateModal] = useState<UserItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    role: 'WORKER',
  });
  const [resetPassword, setResetPassword] = useState('');
  const [customPrice, setCustomPrice] = useState('18000');
  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<UserItem[]>('/users');

      // Nạp đơn giá hiện tại cho từng worker
      const usersWithRates = await Promise.all(
        data.map(async (u) => {
          if (u.role === 'WORKER') {
            try {
              const rateData = await apiFetch<any>(`/wage-rates/current?userId=${u.id}`);
              return {
                ...u,
                currentRate: rateData?.pricePerKg,
                isCustomRate: !!rateData?.userId,
              };
            } catch {
              return u;
            }
          }
          return u;
        }),
      );

      setUsers(usersWithRates);
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setShowCreateModal(false);
      setFormData({ username: '', password: '', fullName: '', phone: '', address: '', role: 'WORKER' });
      fetchUsers();
    } catch (err: any) {
      setModalError(err.message || 'Tạo người dùng thất bại');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResetModal) return;
    setModalError(null);

    try {
      await apiFetch(`/users/${showResetModal.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword: resetPassword }),
      });

      setShowResetModal(null);
      setResetPassword('');
      alert('Đặt lại mật khẩu thành công');
    } catch (err: any) {
      setModalError(err.message || 'Reset mật khẩu thất bại');
    }
  };

  const handleSetCustomRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCustomRateModal) return;
    setModalError(null);

    try {
      await apiFetch('/wage-rates', {
        method: 'POST',
        body: JSON.stringify({
          pricePerKg: parseFloat(customPrice),
          userId: showCustomRateModal.id,
          effectiveFrom: new Date(effectiveFrom).toISOString(),
        }),
      });

      setShowCustomRateModal(null);
      fetchUsers();
      alert(`Đã gán đơn giá riêng ${parseFloat(customPrice).toLocaleString('vi-VN')} VNĐ/kg cho nhân công ${showCustomRateModal.fullName} thành công!`);
    } catch (err: any) {
      setModalError(err.message || 'Thiết lập đơn giá riêng thất bại');
    }
  };

  const toggleStatus = async (user: UserItem) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiFetch(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchUsers();
    } catch (err) {
      alert('Thay đổi trạng thái thất bại');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản Lý Nhân Công & Đơn Giá Riêng</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Danh sách nhân công, phân quyền & gán đơn giá riêng cho từng cá nhân</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm Nhân Công Mới
        </button>
      </div>

      {/* Users Table Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="bg-slate-100 text-xs font-extrabold text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Họ và Tên</th>
                <th className="px-6 py-3.5">Tài khoản</th>
                <th className="px-6 py-3.5">Số điện thoại</th>
                <th className="px-6 py-3.5">Đơn giá / kg</th>
                <th className="px-6 py-3.5">Vai trò</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{user.fullName}</td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">@{user.username}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{user.phone || '---'}</td>
                  <td className="px-6 py-4 font-extrabold">
                    {user.role === 'WORKER' ? (
                      user.currentRate ? (
                        <span className={user.isCustomRate ? 'text-indigo-600 font-black' : 'text-emerald-600 font-bold'}>
                          {user.currentRate.toLocaleString('vi-VN')} đ {user.isCustomRate ? '(Riêng)' : '(Chung)'}
                        </span>
                      ) : (
                        <span className="text-slate-400">---</span>
                      )
                    ) : (
                      <span className="text-slate-400">---</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${user.status === 'ACTIVE' ? 'badge-emerald' : 'badge-red'}`}>
                      {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {user.role === 'WORKER' && (
                      <button
                        onClick={() => {
                          setShowCustomRateModal(user);
                          setCustomPrice(user.currentRate?.toString() || '18000');
                        }}
                        className="text-xs text-indigo-600 hover:underline font-extrabold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200"
                      >
                        💰 Đơn giá riêng
                      </button>
                    )}
                    <button
                      onClick={() => setShowResetModal(user)}
                      className="text-xs text-amber-700 hover:underline font-bold"
                    >
                      Reset mật khẩu
                    </button>
                    <button
                      onClick={() => toggleStatus(user)}
                      className={`text-xs font-bold hover:underline ${user.status === 'ACTIVE' ? 'text-red-600' : 'text-emerald-600'}`}
                    >
                      {user.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create User */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl relative">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Tạo Tài Khoản Mới</h3>
            {modalError && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs mb-4">{modalError}</div>}
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tài khoản (Username)</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại (Tùy chọn)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vai trò (Role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600"
                >
                  <option value="WORKER">WORKER (Nhân công)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-bold"
                >
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm">
                  Tạo Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Custom Rate */}
      {showCustomRateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl relative space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Thiết Lập Đơn Giá Riêng</h3>
            <p className="text-xs text-slate-500">
              Nhân công: <span className="font-extrabold text-indigo-600">{showCustomRateModal.fullName}</span> (@{showCustomRateModal.username})
            </p>
            {modalError && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold">{modalError}</div>}
            <form onSubmit={handleSetCustomRate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đơn giá riêng mới (VNĐ / kg)</label>
                <input
                  type="number"
                  required
                  step="100"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="18000"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-extrabold text-lg focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bắt đầu áp dụng từ ngày</label>
                <input
                  type="date"
                  required
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomRateModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-bold"
                >
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm">
                  Lưu Đơn Giá Riêng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl relative">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset Mật Khẩu</h3>
            <p className="text-xs text-slate-500 mb-4">Nhân công: <span className="font-bold text-indigo-600">{showResetModal.fullName}</span> ({showResetModal.username})</p>
            {modalError && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs mb-4">{modalError}</div>}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-bold"
                >
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm">
                  Xác Nhận Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
