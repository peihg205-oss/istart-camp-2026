'use client';

import React, { useState, useMemo } from 'react';
import { useScoringSystem } from '@/lib/store/scoringStore';
import {
  History,
  Search,
  Edit2,
  Undo2,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';
import { ScoreTransaction } from '@/types';
import { useToast } from '@/components/ui/ToastProvider';

export default function AdminHistoryPage() {
  const toast = useToast();
  const {
    transactions,
    auditLogs,
    currentProfile,
    editTransaction,
    undoTransaction,
  } = useScoringSystem();

  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'AUDIT_LOGS'>('TRANSACTIONS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'MODIFIED' | 'UNDONE'>('ALL');

  // Edit modal state
  const [editingTx, setEditingTx] = useState<ScoreTransaction | null>(null);
  const [editPoints, setEditPoints] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>('');

  // Undo modal state
  const [undoingTx, setUndoingTx] = useState<ScoreTransaction | null>(null);
  const [undoReason, setUndoReason] = useState<string>('');

  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  const isAdmin = currentProfile?.role === 'ADMIN';

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.team?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.activity?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;
      return true;
    });
  }, [transactions, searchQuery, statusFilter]);

  // Open Edit Modal
  const handleOpenEdit = (tx: ScoreTransaction) => {
    setEditingTx(tx);
    setEditPoints(Number(tx.points_awarded));
    setEditReason('');
    setActionError('');
  };

  // Submit Edit
  const handleSaveEdit = async () => {
    if (!editingTx) return;
    if (!editReason.trim()) {
      setActionError('Bắt buộc phải nhập lý do điều chỉnh điểm để lưu vào hồ sơ kiểm toán.');
      toast.warning('Bắt buộc phải nhập lý do điều chỉnh điểm để lưu vào hồ sơ kiểm toán.');
      return;
    }

    const res = await editTransaction({
      id: editingTx.id,
      points: editPoints,
      reason: editReason,
    });

    if (res.success) {
      const msg = `Đã chỉnh sửa giao dịch ${editingTx.id} thành ${editPoints}đ.`;
      setActionSuccess(msg);
      toast.success(msg);
      setEditingTx(null);
      setTimeout(() => setActionSuccess(''), 4000);
    } else {
      const err = res.error || 'Lỗi khi cập nhật giao dịch';
      setActionError(err);
      toast.error(err);
    }
  };

  // Open Undo Modal
  const handleOpenUndo = (tx: ScoreTransaction) => {
    setUndoingTx(tx);
    setUndoReason('');
    setActionError('');
  };

  // Submit Undo
  const handleSaveUndo = async () => {
    if (!undoingTx) return;
    if (!undoReason.trim()) {
      setActionError('Bắt buộc phải nhập lý do hủy bỏ giao dịch.');
      toast.warning('Bắt buộc phải nhập lý do hủy bỏ giao dịch.');
      return;
    }

    const res = await undoTransaction({
      id: undoingTx.id,
      reason: undoReason,
    });

    if (res.success) {
      const msg = `Đã hoàn tác (Undo) giao dịch ${undoingTx.id}. Điểm số đã bị trừ tương ứng.`;
      setActionSuccess(msg);
      toast.success(msg);
      setUndoingTx(null);
      setTimeout(() => setActionSuccess(''), 4000);
    } else {
      const err = res.error || 'Lỗi khi hoàn tác giao dịch';
      setActionError(err);
      toast.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-[#2D2A26]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#DFD8CA]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A55E3]/10 text-[#1A55E3] border border-[#1A55E3]/25 text-xs font-black uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" /> Sổ Cái Điểm Số & Kiểm Toán
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
            LỊCH SỬ GIAO DỊCH & AUDIT LOG
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium">
            Toàn bộ lịch sử thêm, sửa, hoàn tác giao dịch điểm đều được lưu lại và công khai minh bạch.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#EAE5DB] p-1.5 rounded-2xl border border-[#D5CDC0]">
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'TRANSACTIONS'
                ? 'bg-[#1A55E3] text-white shadow-xs'
                : 'text-[#5A5248] hover:text-[#1E293B]'
            }`}
          >
            Giao Dịch Điểm ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                : 'text-[#5A5248] hover:text-[#1E293B]'
            }`}
          >
            Nhật Ký Audit ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-[#00D284]/15 border border-[#00D284]/40 text-[#00a86b] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00D284]" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* TAB 1: TRANSACTIONS LIST */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-white border border-[#E2DDD2] rounded-3xl p-6 space-y-6 shadow-xs">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo đội, bài thi, ghi chú..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#D5CDC0] text-xs text-[#1E293B] placeholder-[#94A3B8] focus:border-[#1A55E3] outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E2DDD2] text-xs font-bold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-[#1E293B] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-[#00D284] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                Hợp lệ
              </button>
              <button
                onClick={() => setStatusFilter('MODIFIED')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === 'MODIFIED'
                    ? 'bg-[#1A55E3] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                Đã sửa
              </button>
              <button
                onClick={() => setStatusFilter('UNDONE')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === 'UNDONE'
                    ? 'bg-[#FF0854] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                Đã hủy
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAE5D9] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-3">Thời gian</th>
                  <th className="py-3 px-3">Đội</th>
                  <th className="py-3 px-3">Hoạt động</th>
                  <th className="py-3 px-3">Lý do / Ghi chú</th>
                  <th className="py-3 px-3 text-right">Điểm số</th>
                  <th className="py-3 px-3 text-center">Trạng thái</th>
                  <th className="py-3 px-3 text-right">Hành động (Admin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5D9] text-xs">
                {filteredTransactions.map((tx) => {
                  const isPositive = tx.points_awarded >= 0;
                  return (
                    <tr key={tx.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-3 text-[#64748B] whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 font-black text-[#1E293B]">
                        {tx.team?.code || '---'}
                      </td>
                      <td className="py-3 px-3 text-[#1E293B] font-semibold">
                        {tx.activity?.name || '---'}
                      </td>
                      <td className="py-3 px-3 text-[#5A5248] max-w-xs truncate">
                        {tx.notes || '---'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded-md ${
                            isPositive
                              ? 'bg-[#00D284]/15 text-[#00a86b]'
                              : 'bg-[#FF0854]/15 text-[#FF0854]'
                          }`}
                        >
                          {isPositive ? `+${tx.points_awarded}` : tx.points_awarded}đ
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'ACTIVE'
                              ? 'bg-[#00D284]/15 text-[#00a86b]'
                              : tx.status === 'MODIFIED'
                              ? 'bg-[#1A55E3]/15 text-[#1A55E3]'
                              : 'bg-slate-100 text-slate-400 line-through'
                          }`}
                        >
                          {tx.status === 'ACTIVE'
                            ? 'ACTIVE'
                            : tx.status === 'MODIFIED'
                            ? 'MODIFIED'
                            : 'UNDONE'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {tx.status !== 'UNDONE' && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(tx)}
                                  className="p-1.5 rounded-lg bg-[#F4F0E6] hover:bg-[#1A55E3] text-[#5A5248] hover:text-white transition-colors"
                                  title="Chỉnh sửa số điểm"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenUndo(tx)}
                                  className="p-1.5 rounded-lg bg-[#F4F0E6] hover:bg-[#FF0854] text-[#5A5248] hover:text-white transition-colors"
                                  title="Hủy giao dịch (Undo)"
                                >
                                  <Undo2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#94A3B8] italic">
                            Chỉ xem
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#64748B]">
                      <History className="w-8 h-8 mx-auto text-[#94A3B8] mb-2 opacity-50" />
                      <p className="font-semibold text-[#1E293B]">Không tìm thấy giao dịch nào</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc trạng thái.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white border border-[#E2DDD2] rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="text-lg font-black text-[#1E293B] mb-2">
            Nhật Ký Ghi Nhận Thay Đổi (Audit Trail)
          </h3>
          <p className="text-xs text-[#64748B] mb-4">
            Bảo đảm tính chính trực: Mọi lượt thêm, sửa, hủy đều ghi nhận người thao tác, dữ liệu cũ và mới, cùng lý do.
          </p>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD2] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        log.action === 'CREATE'
                          ? 'bg-[#00D284]/15 text-[#00a86b]'
                          : log.action === 'EDIT'
                          ? 'bg-[#1A55E3]/15 text-[#1A55E3]'
                          : 'bg-[#FF0854]/15 text-[#FF0854]'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-[#64748B]">
                      Giao dịch ID: <strong className="text-[#1E293B]">{log.transaction_id}</strong>
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#5A5248]">
                  <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>Người thực hiện: <strong className="text-[#1E293B]">{log.performed_by_name}</strong></span>
                </div>

                {log.reason && (
                  <div className="p-2.5 rounded-xl bg-white text-[#1E293B] text-[11px] italic border border-[#E2DDD2]">
                    Lý do ghi nhận: &ldquo;{log.reason}&rdquo;
                  </div>
                )}
              </div>
            ))}

            {auditLogs.length === 0 && (
              <div className="text-center py-10 text-[#64748B] text-xs">
                Chưa có thao tác kiểm toán nào được lưu.
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#DFD8CA] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-[#2D2A26]">
            <h3 className="text-lg font-black text-[#1E293B] flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-[#1A55E3]" />
              Chỉnh Sửa Điểm Giao Dịch
            </h3>
            <p className="text-xs text-[#64748B]">
              Đội: <strong className="text-[#1E293B]">{editingTx.team?.code}</strong> • Hoạt động: <strong className="text-[#1E293B]">{editingTx.activity?.name}</strong>
            </p>

            {actionError && (
              <div className="p-3 rounded-xl bg-[#FF0854]/15 border border-[#FF0854]/30 text-[#FF0854] text-xs">
                {actionError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A5248]">Số điểm mới:</label>
              <input
                type="number"
                value={editPoints}
                onChange={(e) => setEditPoints(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-white border border-[#D5CDC0] text-[#1E293B] font-black text-base outline-none focus:border-[#1A55E3]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A5248]">
                Lý do chỉnh sửa (Bắt buộc cho Audit Log):
              </label>
              <textarea
                required
                rows={3}
                placeholder="VD: Chấm sót điểm bổ sung, nhập nhầm số lượng..."
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#1A55E3]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#5A5248] font-bold text-xs transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl bg-[#1A55E3] text-white font-black text-xs hover:bg-[#1547bf] transition-colors"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNDO MODAL */}
      {undoingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#DFD8CA] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-[#2D2A26]">
            <h3 className="text-lg font-black text-[#FF0854] flex items-center gap-2">
              <Undo2 className="w-5 h-5 text-[#FF0854]" />
              Hoàn Tác (Undo) Giao Dịch
            </h3>
            <p className="text-xs text-[#64748B]">
              Bạn có chắc chắn muốn hủy giao dịch <strong className="text-[#1E293B]">{undoingTx.points_awarded > 0 ? `+${undoingTx.points_awarded}` : undoingTx.points_awarded}đ</strong> của đội <strong className="text-[#1E293B]">{undoingTx.team?.code}</strong>? Giao dịch sẽ không còn được tính vào tổng điểm.
            </p>

            {actionError && (
              <div className="p-3 rounded-xl bg-[#FF0854]/15 border border-[#FF0854]/30 text-[#FF0854] text-xs">
                {actionError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A5248]">
                Lý do hủy giao dịch (Bắt buộc):
              </label>
              <textarea
                required
                rows={3}
                placeholder="VD: Trọng tài bấm nhầm đội, thi đấu lại vòng knock-out..."
                value={undoReason}
                onChange={(e) => setUndoReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-xs text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#FF0854]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUndoingTx(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#5A5248] font-bold text-xs transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSaveUndo}
                className="flex-1 py-2.5 rounded-xl bg-[#FF0854] text-white font-black text-xs hover:bg-[#d90444] transition-colors"
              >
                Xác Nhận Hủy Giao Dịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
