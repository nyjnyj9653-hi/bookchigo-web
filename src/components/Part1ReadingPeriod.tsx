import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CurrentRound, Member, MemberReadingProgress, ReadingState } from '../types';

interface Part1ReadingPeriodProps {
  currentRound: CurrentRound;
  currentMember: Member;
  members: Member[];
  onUpdateMyProgress: (progress: MemberReadingProgress) => void;
  onGoToReviews: () => void;
  onGoToCoffee: () => void;
}

export const Part1ReadingPeriod: React.FC<Part1ReadingPeriodProps> = ({
  currentRound,
  currentMember,
  members,
  onUpdateMyProgress,
  onGoToReviews,
  onGoToCoffee,
}) => {
  const selectedBook = currentRound.selectedBook;
  const totalPages = selectedBook?.pageCount || 280;

  const myProgress = currentRound.progresses[currentMember.id] || {
    memberId: currentMember.id,
    memberName: currentMember.name,
    state: 'not_started' as ReadingState,
    currentPage: 0,
    totalPage: totalPages,
    percentage: 0,
    updatedAt: new Date().toISOString(),
  };

  const [inputPage, setInputPage] = useState<number>(myProgress.currentPage || 0);
  const [completionNotes, setCompletionNotes] = useState<string>(myProgress.completionNotes || '');

  // Calculate Dates & D-Day
  const startDate = currentRound.readingStartDate ? new Date(currentRound.readingStartDate) : new Date();
  const endDate = currentRound.readingEndDate ? new Date(currentRound.readingEndDate) : new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  const now = new Date();

  const totalDurationMs = endDate.getTime() - startDate.getTime();
  const elapsedMs = Math.max(0, now.getTime() - startDate.getTime());
  const dayProgressPct = Math.min(100, Math.round((elapsedMs / totalDurationMs) * 100));

  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let dDayText = '';
  if (diffDays > 0) {
    dDayText = `D-${diffDays}`;
  } else if (diffDays === 0) {
    dDayText = 'D-Day (오늘 마감)';
  } else {
    dDayText = `기간 종료 (${Math.abs(diffDays)}일 지남)`;
  }

  // Calculate Group Statistics across ALL members (including those added mid-round)
  const progressesList: MemberReadingProgress[] = members.map((m) => {
    const existing = currentRound.progresses[m.id];
    if (existing) {
      return {
        ...existing,
        memberName: m.name, // Ensure latest name
      };
    }
    return {
      memberId: m.id,
      memberName: m.name,
      state: 'not_started' as ReadingState,
      currentPage: 0,
      totalPage: totalPages,
      percentage: 0,
      updatedAt: currentRound.selectedAt || new Date().toISOString(),
    };
  });

  const totalCount = progressesList.length;
  const completedCount = progressesList.filter((p) => p.state === 'completed').length;
  const readingCount = progressesList.filter((p) => p.state === 'reading').length;
  const notStartedCount = progressesList.filter((p) => p.state === 'not_started').length;

  // Handle Quick State Change
  const handleStateChange = (newState: ReadingState) => {
    let updatedPage = inputPage;
    let updatedPct = 0;

    if (newState === 'completed') {
      updatedPage = totalPages;
      updatedPct = 100;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else if (newState === 'not_started') {
      updatedPage = 0;
      updatedPct = 0;
    } else if (newState === 'reading') {
      updatedPage = inputPage > 0 && inputPage < totalPages ? inputPage : Math.round(totalPages * 0.2);
      updatedPct = Math.round((updatedPage / totalPages) * 100);
    }

    setInputPage(updatedPage);

    onUpdateMyProgress({
      ...myProgress,
      state: newState,
      currentPage: updatedPage,
      totalPage: totalPages,
      percentage: updatedPct,
      completionNotes: newState === 'completed' ? completionNotes : undefined,
      updatedAt: new Date().toISOString(),
    });
  };

  const handlePageChange = (page: number) => {
    const validPage = Math.max(0, Math.min(totalPages, page));
    setInputPage(validPage);
    const pct = Math.round((validPage / totalPages) * 100);
    const state: ReadingState = validPage >= totalPages ? 'completed' : validPage > 0 ? 'reading' : 'not_started';

    if (validPage >= totalPages && myProgress.state !== 'completed') {
      confetti({ particleCount: 40, spread: 50 });
    }

    onUpdateMyProgress({
      ...myProgress,
      state,
      currentPage: validPage,
      totalPage: totalPages,
      percentage: pct,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveNotes = () => {
    onUpdateMyProgress({
      ...myProgress,
      completionNotes,
      updatedAt: new Date().toISOString(),
    });
  };

  const formatDateDisplay = (dateObj: Date) => {
    return `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;
  };

  if (!selectedBook) {
    return (
      <div className="bg-white border border-orange-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
        <span className="text-4xl block mb-3">🥁</span>
        <h3 className="text-base font-bold text-stone-900">아직 이번 회차 독서 도서가 선정되지 않았습니다</h3>
        <p className="text-xs text-stone-500 mt-1 mb-5">
          [책선정] 탭에서 후보 도서를 확인하고 룰렛을 돌려 책을 먼저 선정해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 2-Week Reading Period & Countdown Card */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-2xl p-4 sm:p-6 sm:p-7 border border-orange-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-orange-100">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-orange-600 font-bold mb-1">
              <span>📖 Part 1. 북치고</span>
              <span aria-hidden="true">·</span>
              <span>2주 독서 현황 (선정일 다음날부터 14일)</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-stone-900 flex flex-wrap items-center gap-1.5 sm:gap-2 leading-snug">
              『{selectedBook.title}』
              <span className="text-xs sm:text-sm font-normal text-stone-500">({selectedBook.author})</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-stone-600 mt-1">
              선정일: {currentRound.selectedAt ? formatDateDisplay(new Date(currentRound.selectedAt)) : '최근'}
              {' · '}
              추천인: <span className="font-bold text-orange-900">{selectedBook.memberName}</span>
            </p>
          </div>

          {/* D-Day Badge & Target Dates (Responsive flex on mobile) */}
          <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 bg-white px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl border border-orange-200 shadow-xs">
            <div className="text-left sm:text-right">
              <span className="text-[10px] sm:text-[11px] text-stone-500 block font-bold">
                독서 마감
              </span>
              <div className="text-xl sm:text-2xl font-black text-orange-600 font-mono tabular-nums leading-tight">
                {dDayText}
              </div>
            </div>
            <div className="h-8 sm:h-10 w-px bg-orange-100" />
            <div className="text-[11px] sm:text-xs space-y-0.5 text-stone-600">
              <div>시작: <span className="font-bold text-stone-900 font-mono">{formatDateDisplay(startDate)}</span></div>
              <div>종료: <span className="font-bold text-stone-900 font-mono">{formatDateDisplay(endDate)}</span></div>
            </div>
          </div>
        </div>

        {/* 14-Day Timeline Bar */}
        <div className="mt-5 sm:mt-6 pt-1">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-600 mb-2">
            <span>독서 기간 진행률: <strong className="text-orange-700 font-mono tabular-nums">{dayProgressPct}%</strong> 경과</span>
            <span>총 14일 중 <strong>{Math.min(14, Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24))))}</strong>일차</span>
          </div>

          <div className="w-full h-3 bg-orange-100/70 rounded-full overflow-hidden p-0.5 border border-orange-200">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${dayProgressPct}%` }}
            />
          </div>

          {/* 14 Days Visual Dots (Responsive 7 columns on mobile, 14 on tablet/desktop) */}
          <div className="grid grid-cols-7 sm:grid-cols-[repeat(14,minmax(0,1fr))] gap-1 mt-2.5 sm:mt-3">
            {Array.from({ length: 14 }).map((_, idx) => {
              const dayNum = idx + 1;
              const isPassed = dayNum <= Math.ceil(elapsedMs / (1000 * 60 * 60 * 24));
              const isToday = dayNum === Math.ceil(elapsedMs / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={dayNum}
                  className={`text-center py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-mono transition-colors ${
                    isToday
                      ? 'bg-orange-500 text-white font-black shadow-xs ring-2 ring-orange-300'
                      : isPassed
                      ? 'bg-orange-100 text-orange-900 font-semibold'
                      : 'bg-white text-stone-400 border border-stone-200/60'
                  }`}
                  title={`${dayNum}일차`}
                >
                  {dayNum}d
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Group Reading Overview KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white border border-stone-200 rounded-2xl p-3 sm:p-4 shadow-xs">
          <span className="text-[11px] sm:text-xs text-stone-500 block">전체 모임원</span>
          <div className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5 sm:mt-1 font-mono tabular-nums">
            {totalCount}<span className="text-xs font-normal text-stone-500 ml-1">명</span>
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-3 sm:p-4 shadow-xs">
          <span className="text-[11px] sm:text-xs text-emerald-700 font-bold block">완독 달성 🏆</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5 sm:mt-1 font-mono tabular-nums">
            {completedCount}<span className="text-xs font-normal text-stone-500 ml-1">명 ({totalCount > 0 ? Math.round((completedCount/totalCount)*100) : 0}%)</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-emerald-600 mt-0.5 block truncate">커피 면제 확정!</span>
        </div>

        <div className="bg-white border border-orange-200 rounded-2xl p-3 sm:p-4 shadow-xs">
          <span className="text-[11px] sm:text-xs text-orange-700 font-bold block">읽는 중 📖</span>
          <div className="text-xl sm:text-2xl font-black text-orange-700 mt-0.5 sm:mt-1 font-mono tabular-nums">
            {readingCount}<span className="text-xs font-normal text-stone-500 ml-1">명</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-orange-600 mt-0.5 block truncate">열독 중!</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-2xl p-3 sm:p-4 shadow-xs">
          <span className="text-[11px] sm:text-xs text-rose-700 font-bold block">독서 시작 대기 ⏳</span>
          <div className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5 sm:mt-1 font-mono tabular-nums">
            {notStartedCount}<span className="text-xs font-normal text-stone-500 ml-1">명</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-rose-600 mt-0.5 block truncate">예비 커피요정</span>
        </div>
      </div>

      {/* Current User's Status Controls (Interactive) */}
      <div className="bg-white border border-orange-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-orange-100">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: currentMember.avatarColor }}
              />
              <span className="text-sm sm:text-base font-extrabold text-stone-900">
                {currentMember.name} 님의 현재 상태
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
              원클릭으로 [독서 시작] → [읽는 중] → [완독] 상태를 변경하세요.
            </p>
          </div>

          {/* Interactive State Segmented Controls (Full-width grid on mobile) */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => handleStateChange('not_started')}
              className={`min-h-[40px] sm:min-h-0 px-3 py-2 sm:py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                myProgress.state === 'not_started'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              독서 시작
            </button>
            <button
              onClick={() => handleStateChange('reading')}
              className={`min-h-[40px] sm:min-h-0 px-3 py-2 sm:py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                myProgress.state === 'reading'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              읽는 중
            </button>
            <button
              onClick={() => handleStateChange('completed')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                myProgress.state === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              완독! 🎉
            </button>
          </div>
        </div>

        {/* Page / Progress Slider */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-600 font-medium">
              현재 읽은 페이지: <strong className="text-stone-900 font-mono tabular-nums text-sm">{inputPage}</strong> / {totalPages}p
            </span>
            <span className="font-mono font-black text-orange-600 tabular-nums">
              {Math.round((inputPage / totalPages) * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max={totalPages}
            value={inputPage}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            className="w-full accent-orange-500 h-2 bg-stone-200 rounded-lg cursor-pointer"
          />

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-stone-500">빠른 입력:</span>
            {[50, 100, 150, 200, totalPages].map((pg) => (
              <button
                key={pg}
                onClick={() => handlePageChange(pg)}
                className="px-2.5 py-1 text-[11px] bg-orange-50 hover:bg-orange-100 text-orange-900 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {pg === totalPages ? '완독 (끝)' : `${pg}p`}
              </button>
            ))}
          </div>

          {/* Completion Note input if completed */}
          {myProgress.state === 'completed' && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <span>🎉</span>
                  <span>완독 달성 완료! 커피 벌칙 안전지대 진입!</span>
                </span>
                <button
                  onClick={onGoToReviews}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  한줄평 남기러 가기 →
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="완독 소감 한마디 (예: 마지막 에필로그가 정말 찡했습니다)"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <button
                  onClick={handleSaveNotes}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap"
                >
                  소감 저장
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Members Status Dashboard */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-stone-900">
            참여자 전체 상태표시창
          </h3>
          <button
            onClick={onGoToCoffee}
            className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>☕ 커피 쏘기 현황 보기 →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {progressesList.map((prog) => {
            const isMe = prog.memberId === currentMember.id;
            const stateLabels = {
              not_started: { label: '독서 시작', bg: 'bg-stone-100 text-stone-600' },
              reading: { label: '읽는 중', bg: 'bg-orange-100 text-orange-800 font-bold' },
              completed: { label: '완독 완료 🏆', bg: 'bg-emerald-100 text-emerald-800 font-bold' },
            };

            const info = stateLabels[prog.state] || stateLabels.not_started;

            return (
              <div
                key={prog.memberId}
                className={`bg-white rounded-2xl border p-4.5 transition-all ${
                  isMe ? 'border-orange-400 ring-2 ring-orange-400/20 shadow-xs' : 'border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-xs font-bold">
                      {prog.memberName.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-stone-900">{prog.memberName}</span>
                        {isMe && <span className="text-[10px] text-orange-600 font-bold">(나)</span>}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {prog.updatedAt ? prog.updatedAt.split('T')[0] : '최근'}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${info.bg}`}>
                    {info.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>
                      {prog.currentPage || 0}p / {totalPages}p
                    </span>
                    <span className="font-mono font-bold text-stone-800 tabular-nums">
                      {prog.percentage}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        prog.state === 'completed'
                          ? 'bg-emerald-500'
                          : prog.state === 'reading'
                          ? 'bg-orange-500'
                          : 'bg-stone-300'
                      }`}
                      style={{ width: `${prog.percentage}%` }}
                    />
                  </div>
                </div>

                {prog.completionNotes && (
                  <p className="mt-3 text-xs text-stone-600 bg-orange-50/50 p-2 rounded-xl border border-orange-100 italic">
                    "{prog.completionNotes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
