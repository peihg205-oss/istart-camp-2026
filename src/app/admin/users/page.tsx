'use client';

import React, { useState } from 'react';
import { useScoringSystem } from '@/lib/store/scoringStore';
import { UserCheck, ShieldAlert, Plus, CheckCircle2, User } from 'lucide-react';
import { INITIAL_PROFILES } from '@/lib/data/seedData';
import { Profile, Role } from '@/types';

export default function AdminUsersPage() {
  const { currentProfile } = useScoringSystem();
  const isAdmin = currentProfile?.role === 'ADMIN';

  const [users, setUsers] = useState<Profile[]>(INITIAL_PROFILES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('SCORER');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAdmin) {
    return (
      <div className="bg-white border border-[#E2DDD2] rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto my-12 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-black text-[#1E293B]">Yêu Cầu Quyền Quản Trị (ADMIN)</h2>
        <p className="text-xs text-[#64748B]">
          Chỉ có ADMIN mới có quyền phân quyền và quản lý tài khoản trọng tài chấm điểm.
        </p>
      </div>
    );
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: Profile = {
      id: `user-${Date.now()}`,
      email: newEmail,
      full_name: newName,
      role: newRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    setSuccessMsg(`Đã tạo tài khoản ${newRole} cho ${newName}.`);
    setShowAddModal(false);
    setNewEmail('');
    setNewName('');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="space-y-6 pb-12 text-[#2D2A26]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#DFD8CA]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 text-xs font-black uppercase tracking-wider mb-2 border border-amber-500/30">
            <UserCheck className="w-3.5 h-3.5" /> Quản Trị Người Dùng & Phân Quyền
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
            DANH SÁCH TRỌNG TÀI & BAN TỔ CHỨC
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium">
            Quản lý vai trò ADMIN (Toàn quyền hệ thống) và SCORER (Chấm điểm thử thách).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#1A55E3] hover:bg-[#1547bf] text-white font-black text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Trọng Tài Mới</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#00D284]/15 border border-[#00D284]/40 text-[#00a86b] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00D284]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-[#E2DDD2] rounded-3xl p-6 overflow-x-auto shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#EAE5D9] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              <th className="py-3 px-3">Họ và tên</th>
              <th className="py-3 px-3">Email</th>
              <th className="py-3 px-3">Vai trò (Role)</th>
              <th className="py-3 px-3">Ngày kích hoạt</th>
              <th className="py-3 px-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE5D9]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#FAF8F5] transition-colors">
                <td className="py-3.5 px-3 font-bold text-[#1E293B] flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EAE5DB] text-[#1A55E3] flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  {u.full_name}
                </td>
                <td className="py-3.5 px-3 text-[#64748B] font-mono text-[11px]">
                  {u.email}
                </td>
                <td className="py-3.5 px-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                      u.role === 'ADMIN'
                        ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-300'
                        : 'bg-[#1A55E3]/15 text-[#1A55E3] border border-[#1A55E3]/30'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-[#64748B]">
                  {new Date(u.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="py-3.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-[#00D284]/15 text-[#00a86b] text-[10px] font-bold">
                    Hoạt động
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddUser}
            className="bg-[#FAF8F5] border border-[#DFD8CA] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-[#2D2A26]"
          >
            <h3 className="text-lg font-black text-[#1E293B]">Thêm Tài Khoản Mới</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A5248]">Họ và Tên:</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="VD: Nguyễn Văn A (Trọng tài Hero)"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-xs text-[#1E293B] outline-none focus:border-[#1A55E3]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A5248]">Email:</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="scorer2@istartcamp.vn"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-xs text-[#1E293B] outline-none focus:border-[#1A55E3]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A5248]">Vai Trò:</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-xs text-[#1E293B] outline-none focus:border-[#1A55E3]"
              >
                <option value="SCORER">SCORER (Trọng tài chấm điểm)</option>
                <option value="ADMIN">ADMIN (Quản trị viên toàn quyền)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#5A5248] font-bold text-xs transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#1A55E3] text-white font-black text-xs hover:bg-[#1547bf] transition-colors"
              >
                Tạo Tài Khoản
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
