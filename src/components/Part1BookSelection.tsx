import React, { useState } from 'react';
import { BookCandidate, CurrentRound, Member } from '../types';

interface Part1BookSelectionProps {
  currentRound: CurrentRound;
  currentMember: Member;
  onOpenRoulette: () => void;
  onUpdateCandidate: (candidate: BookCandidate) => void;
  onGoToReading: () => void;
}

export const Part1BookSelection: React.FC<Part1BookSelectionProps> = ({
  currentRound,
  currentMember,
  onOpenRoulette,
  onUpdateCandidate,
  onGoToReading,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [category, setCategory] = useState('한국소설');
  const [pageCount, setPageCount] = useState<number>(300);
  const [reason, setReason] = useState('');
  const [coverColor, setCoverColor] = useState('#F97316');

  // Find if current user already nominated a book
  const myCandidate = currentRound.candidates.find(
    (c) => c.memberId === currentMember.id
  );

  const handleOpenFormForEdit = (candidate?: BookCandidate) => {
    if (candidate) {
      setTitle(candidate.title);
      setAuthor(candidate.author);
      setPublisher(candidate.publisher || '');
      setCategory(candidate.category);
      setPageCount(candidate.pageCount || 300);
      setReason(candidate.reason);
      setCoverColor(candidate.coverColor);
    } else {
      setTitle('');
      setAuthor('');
      setPublisher('');
      setCategory('한국소설');
      setPageCount(300);
      setReason('');
      setCoverColor('#F97316');
    }
    setIsFormOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !reason.trim()) return;

    const newCandidate: BookCandidate = {
      id: myCandidate ? myCandidate.id : `c_${Date.now()}`,
      memberId: currentMember.id,
      memberName: currentMember.name,
      title: title.trim(),
      author: author.trim(),
      publisher: publisher.trim() || undefined,
      category,
      pageCount: Number(pageCount) || 300,
      reason: reason.trim(),
      coverColor,
      isKeptFromPrevious: false,
    };

    onUpdateCandidate(newCandidate);
    setIsFormOpen(false);
  };

  const paletteColors = [
    '#EA580C', // Orange
    '#D97706', // Amber
    '#16A34A', // Green
    '#2563EB', // Blue
    '#7C3AED', // Purple
    '#DB2777', // Pink
    '#0D9488', // Teal
    '#57534E', // Stone
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Shortened Guide & Super Enlarge Roulette Selection Button */}
      <div className="bg-orange-50/70 border border-orange-200/90 rounded-2xl p-4 sm:p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-orange-600">
              <span>🥁 Part 1. 북치고</span>
              <span aria-hidden="true">·</span>
              <span>도서 선정</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-stone-900">
              이번 회차 도서 결정!
            </h2>
            <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed max-w-lg">
              선정된 사람은 다음번에 새 책을 추천하고, 미선정자는 기존 책을 유지하거나 바꿀 수 있습니다.
            </p>
          </div>

          {/* Greatly Enlarged Roulette Launch Button */}
          <button
            onClick={() => {
              if (currentRound.candidates.length === 0) {
                alert('룰렛을 돌리기 전에 먼저 후보 도서를 1권 이상 등록해주세요!');
                handleOpenFormForEdit();
                return;
              }
              onOpenRoulette();
            }}
            className="w-full md:w-auto min-h-[48px] py-3.5 sm:py-4 px-5 sm:px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:from-orange-700 active:to-amber-700 text-white text-sm sm:text-base font-black rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 sm:gap-3 cursor-pointer group active:scale-98 shrink-0"
          >
            <span className="text-xl sm:text-2xl group-hover:rotate-12 transition-transform">🥁</span>
            <span>북치고 룰렛 돌려서 책 선정하기</span>
            <span className="text-orange-200 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* Currently Selected Book Spotlight (if selected) */}
      {currentRound.selectedBook && (
        <div className="bg-white border border-orange-200 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-orange-100">
            <div>
              <span className="text-[10px] sm:text-xs text-orange-600 font-bold tracking-wide">
                이번 {currentRound.roundNumber}회차 확정 도서
              </span>
              <h3 className="text-base sm:text-lg font-black text-stone-900 mt-0.5">
                『{currentRound.selectedBook.title}』
              </h3>
            </div>
            <button
              onClick={onGoToReading}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 underline underline-offset-4 cursor-pointer"
            >
              독서현황 보러가기 →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5 items-center">
            {/* Book Spine / Cover Preview */}
            <div
              className="h-32 sm:h-40 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between text-white shadow-xs"
              style={{ backgroundColor: currentRound.selectedBook.coverColor || '#EA580C' }}
            >
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-80">
                {currentRound.selectedBook.category}
              </span>
              <div>
                <h4 className="text-base font-bold leading-tight drop-shadow-xs">
                  {currentRound.selectedBook.title}
                </h4>
                <p className="text-xs opacity-90 mt-1">
                  {currentRound.selectedBook.author}
                </p>
              </div>
              <span className="text-[10px] opacity-80 font-mono">
                {currentRound.selectedBook.pageCount || 280}p
              </span>
            </div>

            {/* Details & Recommender Info */}
            <div className="md:col-span-3 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>추천: <strong className="text-stone-900">{currentRound.selectedBook.memberName}</strong></span>
                <span aria-hidden="true">·</span>
                <span>출판사: {currentRound.selectedBook.publisher || '미입력'}</span>
                <span aria-hidden="true">·</span>
                <span>선정일: {currentRound.selectedAt ? currentRound.selectedAt.split('T')[0] : '최근'}</span>
              </div>

              <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 text-xs text-stone-700 leading-relaxed">
                <span className="font-bold text-orange-900 block mb-0.5">추천 이유:</span>
                "{currentRound.selectedBook.reason}"
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-stone-600 pt-1">
                <div>
                  📅 독서 기간: <strong>{currentRound.readingStartDate?.split('T')[0]}</strong> ~ <strong>{currentRound.readingEndDate?.split('T')[0]}</strong> (2주간)
                </div>
                <button
                  onClick={onOpenRoulette}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline cursor-pointer"
                >
                  다른 책으로 다시 룰렛 돌리기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Member's Nomination Action Box */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900">
                {currentMember.name} 님의 추천 책
              </span>
              {myCandidate?.isKeptFromPrevious && (
                <span className="text-[11px] text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded-full font-medium">
                  이전 회차 유지 도서
                </span>
              )}
            </div>
            {myCandidate ? (
              <p className="text-sm text-stone-800 mt-1">
                등록 도서: <strong>『{myCandidate.title}』</strong> ({myCandidate.author})
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-1">
                아직 이번 회차에 추천할 책 1권을 등록하지 않았습니다. 원하는 책을 등록해주세요!
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {myCandidate ? (
              <button
                onClick={() => handleOpenFormForEdit(myCandidate)}
                className="px-4 py-2 bg-stone-50 hover:bg-orange-50 text-orange-800 text-xs font-bold border border-orange-200 rounded-xl transition-colors cursor-pointer"
              >
                추천 책 수정하기
              </button>
            ) : (
              <button
                onClick={() => handleOpenFormForEdit()}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                + 내 추천 책 1권 등록
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Books Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-stone-900">
            등록된 후보 도서 ({currentRound.candidates.length}권)
          </h3>
          <span className="text-xs text-stone-500">각 멤버 1권</span>
        </div>

        {currentRound.candidates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-3">
            <div className="text-3xl sm:text-4xl">📚</div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-stone-800">
                아직 등록된 후보 도서가 없습니다
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                각자 이번 회차에 함께 읽고 싶은 책 1권을 추천해주세요. 추천 도서가 등록되면 이곳에 목록이 채워집니다.
              </p>
            </div>
            <button
              onClick={() => handleOpenFormForEdit()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>+ 내 추천 책 1권 등록하기</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRound.candidates.map((candidate) => {
              const isWinner = currentRound.selectedBook?.id === candidate.id;
              const isMine = candidate.memberId === currentMember.id;

              return (
                <div
                  key={candidate.id}
                  className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-xs ${
                    isWinner
                      ? 'border-orange-400 ring-2 ring-orange-400/40 bg-orange-50/20'
                      : 'border-stone-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                      <span className="font-bold text-stone-800 flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: candidate.coverColor }}
                        />
                        {candidate.memberName}
                      </span>
                      <div className="flex items-center gap-1">
                        {isWinner && (
                          <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                            당첨 도서 🎯
                          </span>
                        )}
                        {candidate.isKeptFromPrevious && (
                          <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                            유지중
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-stone-900 leading-snug">
                      {candidate.title}
                    </h4>
                    <p className="text-xs text-stone-600 mt-1">
                      {candidate.author} {candidate.publisher && `· ${candidate.publisher}`}
                    </p>

                    <div className="mt-3 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 line-clamp-3">
                      "{candidate.reason}"
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span>{candidate.category} · {candidate.pageCount || 280}p</span>
                    {isMine && (
                      <button
                        onClick={() => handleOpenFormForEdit(candidate)}
                        className="text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
                      >
                        수정하기
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Book Registration / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-orange-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {myCandidate ? '추천 책 정보 수정' : '원하는 책 1권 추천하기'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  책 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 불편한 편의점"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    저자 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 김호연"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    출판사
                  </label>
                  <input
                    type="text"
                    placeholder="예: 나무옆의자"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    분야 / 장르
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                  >
                    <option value="한국소설">한국소설</option>
                    <option value="해외문학">해외문학</option>
                    <option value="인문/철학">인문/철학</option>
                    <option value="사회/심리">사회/심리</option>
                    <option value="과학/SF">과학/SF</option>
                    <option value="에세이">에세이</option>
                    <option value="자기계발">자기계발</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    총 페이지 수
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="280"
                    value={pageCount}
                    onChange={(e) => setPageCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  추천 이유 *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="모임원들과 이 책을 함께 읽고 싶은 이유를 남겨주세요."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  표지 테마 색상
                </label>
                <div className="flex items-center gap-2">
                  {paletteColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCoverColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        coverColor === color ? 'scale-110 border-orange-600' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  추천 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
