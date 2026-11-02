import React, { useState } from 'react';
import { Member } from '../types';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onSelectMember: (id: string) => void;
  currentMemberId: string;
}

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onSelectMember,
  currentMemberId,
}) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [color, setColor] = useState('#EA580C');
  const [isAdmin, setIsAdmin] = useState(false);

  // Edit State
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editColor, setEditColor] = useState('#EA580C');
  const [editIsAdmin, setEditIsAdmin] = useState(false);

  if (!isOpen) return null;

  const colorOptions = [
    '#EA580C', '#D97706', '#16A34A', '#2563EB', '#7C3AED', '#DB2777', '#0D9488', '#57534E'
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMem: Member = {
      id: `m_${Date.now()}`,
      name: name.trim(),
      avatarColor: color,
      bio: bio.trim() || '독서모임 참여자',
      isAdmin,
    };

    onAddMember(newMem);
    setName('');
    setBio('');
    setIsAdmin(false);
  };

  const startEdit = (m: Member) => {
    setEditingMemberId(m.id);
    setEditName(m.name);
    setEditBio(m.bio || '');
    setEditColor(m.avatarColor);
    setEditIsAdmin(!!m.isAdmin);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemberId || !editName.trim()) return;

    const target = members.find((m) => m.id === editingMemberId);
    if (!target) return;

    const updated: Member = {
      ...target,
      name: editName.trim(),
      bio: editBio.trim() || undefined,
      avatarColor: editColor,
      isAdmin: editIsAdmin,
    };

    onUpdateMember(updated);
    setEditingMemberId(null);
  };

  const handleDelete = (memberId: string, memberName: string) => {
    if (members.length <= 1) {
      alert('최소 1명의 참여자가 있어야 합니다.');
      return;
    }
    if (window.confirm(`'${memberName}' 님을 독서모임에서 삭제하시겠습니까?`)) {
      onDeleteMember(memberId);
    }
  };

  const toggleAdmin = (m: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: Member = {
      ...m,
      isAdmin: !m.isAdmin,
    };
    onUpdateMember(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-orange-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-orange-50/60">
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
              <span>👥</span>
              <span>참여자 및 관리자 관리</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
              참여자를 등록하고, 모임 관리자(👑) 권한을 설정할 수 있습니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-700 rounded-xl hover:bg-orange-100/50 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Members List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-700">
                참여 멤버 목록 ({members.length}명)
              </span>
              <span className="text-[11px] text-stone-400">
                선택 시 해당 계정으로 전환됩니다
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {members.map((m) => {
                const isSelected = m.id === currentMemberId;
                const isEditingThis = editingMemberId === m.id;

                if (isEditingThis) {
                  return (
                    <form
                      key={m.id}
                      onSubmit={handleSaveEdit}
                      className="p-3 rounded-xl border border-orange-300 bg-orange-50/40 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-900">멤버 정보 수정</span>
                        <button
                          type="button"
                          onClick={() => setEditingMemberId(null)}
                          className="text-xs text-stone-400 hover:text-stone-700"
                        >
                          취소
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="이름"
                          className="px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                        <input
                          type="text"
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          placeholder="한줄 소개"
                          className="px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIsAdmin}
                            onChange={(e) => setEditIsAdmin(e.target.checked)}
                            className="accent-orange-500 w-4 h-4 rounded cursor-pointer"
                          />
                          <span>👑 관리자(모임장)</span>
                        </label>

                        <div className="flex items-center gap-1.5">
                          {colorOptions.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditColor(c)}
                              className={`w-4 h-4 rounded-full border transition-transform ${
                                editColor === c ? 'scale-125 border-stone-800' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg"
                        >
                          수정 저장
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectMember(m.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-orange-50/80 border-orange-300 shadow-xs ring-1 ring-orange-300/60'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: m.avatarColor }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                            {m.name}
                          </span>
                          {m.isAdmin && (
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[10px] font-black rounded-md flex items-center gap-0.5 shrink-0">
                              <span>👑</span>
                              <span>관리자</span>
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-100/80 px-1.5 py-0.2 rounded shrink-0">
                              접속 중
                            </span>
                          )}
                        </div>
                        {m.bio && (
                          <span className="text-[11px] text-stone-500 truncate block">
                            {m.bio}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={(e) => toggleAdmin(m, e)}
                        title={m.isAdmin ? '관리자 해제' : '관리자 지정'}
                        className={`p-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                          m.isAdmin
                            ? 'text-amber-700 hover:bg-amber-100'
                            : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        👑
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(m);
                        }}
                        className="px-2 py-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(m.id, m.name);
                        }}
                        className="p-1 text-stone-300 hover:text-rose-600 transition-colors"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Member Section */}
          <form onSubmit={handleAdd} className="pt-4 border-t border-stone-100 space-y-3">
            <span className="text-xs font-bold text-stone-800 block">
              + 신규 참여자 추가
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="이름 (예: 홍길동)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="한줄 소개 (선택)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="accent-orange-500 w-4 h-4 rounded cursor-pointer"
                />
                <span>👑 관리자(모임장) 권한 부여</span>
              </label>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-stone-400 mr-1">컬러:</span>
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                      color === c ? 'scale-125 border-stone-800' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer mt-1"
            >
              참여자 등록하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
