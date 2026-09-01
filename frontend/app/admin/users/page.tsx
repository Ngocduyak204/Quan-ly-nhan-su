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
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState<UserItem | null>(null);

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
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<UserItem[]>('/users');
      setUsers(data);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Quản Lý Nhân Công & Tài Khoản</h1>
          <p className="text-sm text-slate-400 mt-1">Danh sách nhân công và phân quyền tài khoản</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="gradient-button px-5 py-2.5 flex items-center gap-2 text-sm shadow-lg shadow-purple-500/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm Nhân Công Mới
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Họ và Tên</th>
                <th className="px-6 py-4">Tài khoản</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{user.fullName}</td>
                  <td className="px-6 py-4 font-mono text-purple-300">{user.username}</td>
                  <td className="px-6 py-4">{user.phone || '---'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${user.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                      {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setShowResetModal(user)}
                      className="text-xs text-amber-400 hover:underline font-medium"
                    >
                      Reset mật khẩu
                    </button>
                    <button
                      onClick={() => toggleStatus(user)}
                      className={`text-xs font-medium hover:underline ${user.status === 'ACTIVE' ? 'text-red-400' : 'text-emerald-400'}`}
                    >
                      {user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 relative">
            <h3 className="text-lg font-bold text-white mb-4">Tạo Tài Khoản Mới</h3>
            {modalError && <div className="badge-red p-3 rounded-lg text-xs mb-4">{modalError}</div>}
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tài khoản (Username)</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Số điện thoại (Tùy chọn)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Vai trò (Role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                >
                  <option value="WORKER">WORKER (Nhân công)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg font-semibold"
                >
                  Hủy
                </button>
                <button type="submit" className="gradient-button px-4 py-2 text-xs font-bold rounded-lg">
                  Tạo Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 relative">
            <h3 className="text-lg font-bold text-white mb-2">Reset Mật Khẩu</h3>
            <p className="text-xs text-slate-400 mb-4">Nhân công: <span className="font-bold text-purple-300">{showResetModal.fullName}</span> ({showResetModal.username})</p>
            {modalError && <div className="badge-red p-3 rounded-lg text-xs mb-4">{modalError}</div>}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg font-semibold"
                >
                  Hủy
                </button>
                <button type="submit" className="gradient-button px-4 py-2 text-xs font-bold rounded-lg">
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
