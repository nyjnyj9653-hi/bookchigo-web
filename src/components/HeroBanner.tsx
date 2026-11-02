import React from 'react';
import { CurrentRound } from '../types';

interface HeroBannerProps {
  currentRound: CurrentRound;
  onGoToPart1: () => void;
  onGoToPart2: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  currentRound,
  onGoToPart1,
  onGoToPart2,
}) => {
  const selectedBook = currentRound.selectedBook;

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-2xl border border-orange-200/90 p-4 sm:p-6 md:p-8 shadow-xs">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Title Section */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-[11px] sm:text-xs font-bold font-mono">
            <span>제 {currentRound.roundNumber}회차</span>
            <span aria-hidden="true">·</span>
            <span>
              {currentRound.status === 'selection'
                ? '책선정 단계'
                : currentRound.status === 'reading'
                ? '2주 독서 중'
                : '모임후기 작성'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 tracking-tight flex items-center justify-center gap-2">
            <span>🥁</span>
            <span className="text-orange-600">북치고 장구치고</span>
            <span>🪘</span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto font-medium">
            우리들의 독서 모임
          </p>
        </div>

        {/* Two Big Action Cards: [북치고] -> Part 1 / [장구치고] -> Part 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
          {/* Part 1. 북치고 Button */}
          <button
            onClick={onGoToPart1}
            className="p-4 sm:p-5 bg-white hover:bg-orange-50/60 active:bg-orange-100/70 rounded-2xl border-2 border-orange-200 hover:border-orange-400 text-left transition-all shadow-xs hover:shadow-md cursor-pointer group flex items-start gap-3 sm:gap-4"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-100 flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform">
              🥁
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-orange-600 uppercase tracking-wide">
                  Part 1
                </span>
                <span className="text-xs text-orange-400 group-hover:translate-x-0.5 transition-transform">
                  이동 →
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 group-hover:text-orange-600 transition-colors mt-0.5">
                북치고
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-1 font-medium leading-relaxed">
                책 추천 / 도서 선정 / 독서 현황
              </p>
            </div>
          </button>

          {/* Part 2. 장구치고 Button */}
          <button
            onClick={onGoToPart2}
            className="p-4 sm:p-5 bg-white hover:bg-amber-50/60 active:bg-amber-100/70 rounded-2xl border-2 border-amber-200 hover:border-amber-400 text-left transition-all shadow-xs hover:shadow-md cursor-pointer group flex items-start gap-3 sm:gap-4"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform">
              🪘
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-amber-700 uppercase tracking-wide">
                  Part 2
                </span>
                <span className="text-xs text-amber-500 group-hover:translate-x-0.5 transition-transform">
                  이동 →
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 group-hover:text-amber-700 transition-colors mt-0.5">
                장구치고
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-1 font-medium leading-relaxed">
                별점 &amp; 한줄평 / 모임 현황
              </p>
            </div>
          </button>
        </div>

        {/* Current Round Selected Book Spotlight */}
        <div className="bg-white rounded-xl border border-orange-200/90 p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-base sm:text-lg shrink-0 mt-0.5 sm:mt-0">
              📖
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-orange-600 block">
                이번 {currentRound.roundNumber}회차 선정 도서
              </span>
              {selectedBook ? (
                <div className="text-sm sm:text-base font-extrabold text-stone-900 leading-snug">
                  『{selectedBook.title}』
                  <span className="text-xs font-normal text-stone-500 ml-1.5 inline-block">
                    {selectedBook.author} · 추천: {selectedBook.memberName}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-stone-500">
                  아직 도서가 선정되지 않았습니다. [북치고]에서 룰렛을 돌려주세요!
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-orange-100">
            {selectedBook && (
              <span className="text-[11px] sm:text-xs text-stone-500 font-mono bg-stone-50 sm:bg-transparent px-2 py-1 sm:p-0 rounded-md">
                기간: {currentRound.readingStartDate?.split('T')[0]} ~ {currentRound.readingEndDate?.split('T')[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
