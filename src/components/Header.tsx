import React, { useState } from 'react';
import { Member } from '../types';

export type TabType = 'selection' | 'reading' | 'reviews' | 'wrapup' | 'archive';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  members: Member[];
  currentMemberId: string;
  onSelectMember: (id: string) => void;
  onOpenMemberModal: () => void;
  currentRoundNum: number;
  isLive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  members,
  currentMemberId,
  onSelectMember,
  onOpenMemberModal,
  currentRoundNum,
  isLive = true,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];

  const menuItems: { id: TabType; label: string; icon: string; part: string }[] = [
    { id: 'selection', label: '책선정', icon: '🥁', part: 'Part 1. 북치고' },
    { id: 'reading', label: '독서현황', icon: '📖', part: 'Part 1. 북치고' },
    { id: 'reviews', label: '한줄평', icon: '🪘', part: 'Part 2. 장구치고' },
    { id: 'wrapup', label: '모임후기', icon: '☕', part: 'Part 2. 장구치고' },
    { id: 'archive', label: '지난모임', icon: '📜', part: '아카이브' },
  ];

  const handleItemClick = (tab: TabType) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'selection':
        return '책선정';
      case 'reading':
        return '독서현황';
      case 'reviews':
        return '한줄평';
      case 'wrapup':
        return '모임후기';
      case 'archive':
        return '지난모임';
    }
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Round Badge */}
          <button
            onClick={() => handleItemClick('selection')}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer focus:outline-none text-left shrink-0"
          >
            <span className="text-base sm:text-xl font-extrabold tracking-tight text-orange-600 whitespace-nowrap">
              북치고 장구치고
            </span>
            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold font-mono whitespace-nowrap">
              제{currentRoundNum}회
            </span>
          </button>

          {/* Right Section: Real-time Indicator, Member Selector, and Menu Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Real-time Cloud Sync Badge */}
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">실시간 연동</span>
                <span className="sm:hidden text-[10px]">연동됨</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-500 border border-stone-200">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                <span>오프라인</span>
              </span>
            )}

            {/* Current Member Dropdown */}
            <div className="flex items-center gap-1 bg-orange-50/80 border border-orange-200/80 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs">
              <span
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: currentMember?.avatarColor || '#F97316' }}
              />
              <span className="text-stone-500 hidden md:inline text-[11px]">멤버:</span>
              {currentMember?.isAdmin && (
                <span className="text-[10px] text-amber-600" title="관리자">👑</span>
              )}
              <select
                value={currentMemberId}
                onChange={(e) => onSelectMember(e.target.value)}
                className="font-bold text-stone-800 bg-transparent focus:outline-none cursor-pointer text-xs max-w-[70px] sm:max-w-none truncate"
                aria-label="사용자 선택"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.isAdmin ? `👑 ${m.name}` : m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Menu Button ("목록 표시") */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="min-h-[36px] sm:min-h-[40px] flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              aria-label="메뉴 목록 열기"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>목록</span>
              <span className="text-[11px] opacity-85 hidden sm:inline">({getTabLabel(currentTab)})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over / Modal Menu List ("선택하면 목록창으로") */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setIsMenuOpen(false)} />

          <div
            className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between border-l border-orange-100 animate-in slide-in-from-right duration-200 z-10"
          >
            {/* Menu Header */}
            <div>
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-orange-100 bg-orange-50/60">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                    북치고 장구치고
                  </h3>
                  <p className="text-xs text-orange-700 mt-0.5">이동할 메뉴를 선택해주세요</p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-800 rounded-xl hover:bg-orange-100/50 transition-colors cursor-pointer"
                  aria-label="닫기"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu List with generous touch hitboxes */}
              <div className="p-3 sm:p-4 space-y-2">
                {menuItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full min-h-[50px] flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-orange-500 text-white font-bold shadow-xs'
                          : 'bg-stone-50 hover:bg-orange-50 active:bg-orange-100 text-stone-800 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl sm:text-2xl">{item.icon}</span>
                        <div>
                          <div className="text-sm font-bold">{item.label}</div>
                          <div className={`text-[11px] ${isActive ? 'text-orange-100' : 'text-stone-400'}`}>
                            {item.part}
                          </div>
                        </div>
                      </div>
                      <span className={`text-sm ${isActive ? 'text-white' : 'text-stone-400'}`}>→</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Footer */}
            <div className="p-4 sm:p-5 border-t border-orange-100 bg-orange-50/30 space-y-2.5">
              {/* Real-time sync badge card */}
              <div className="flex items-center gap-2.5 p-2.5 bg-white border border-emerald-100 rounded-xl text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-stone-800 text-xs">
                    {isLive ? '실시간 동기화 켜짐' : '오프라인 모드'}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    로그인 없이 모든 기기에서 즉시 공유됩니다
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenMemberModal();
                }}
                className="w-full min-h-[44px] py-2.5 px-3 bg-white hover:bg-orange-50 border border-orange-200 text-stone-800 font-bold text-xs rounded-xl transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>👥</span>
                <span>모임 멤버 관리 ({members.length}명)</span>
              </button>
              <div className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1">
                <span>현재 선택된 멤버:</span>
                <strong className="text-stone-800">{currentMember.name}</strong>
                {currentMember.isAdmin && (
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-bold">
                    👑 관리자
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Tab Bar for Mobile Ergonomics (Hidden on md: and larger screens) */}
      <nav
        aria-label="모바일 하단 메뉴"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-orange-100 shadow-md"
      >
        <div className="grid grid-cols-5 h-15 max-w-lg mx-auto px-1">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer select-none ${
                  isActive ? 'text-orange-600 font-black' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <span className="text-lg leading-tight mb-0.5">{item.icon}</span>
                <span className="text-[10px] tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-orange-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
