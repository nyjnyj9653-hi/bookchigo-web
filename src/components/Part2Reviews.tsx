import React, { useState } from 'react';
import { BookReview, CurrentRound, Member } from '../types';

interface Part2ReviewsProps {
  currentRound: CurrentRound;
  currentMember: Member;
  onAddReview: (review: BookReview) => void;
  onGoToWrapup: () => void;
}

// Helper to render stars including half-stars
export const renderStarIcons = (score: number, starSize = 'text-base') => {
  return (
    <div className={`inline-flex items-center gap-0.5 ${starSize}`}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFull = score >= starIndex;
        const isHalf = !isFull && score >= starIndex - 0.5;

        return (
          <span key={starIndex} className="relative inline-block leading-none select-none text-stone-200">
            ★
            {isFull && (
              <span className="absolute inset-0 overflow-hidden text-amber-400">
                ★
              </span>
            )}
            {isHalf && (
              <span className="absolute inset-0 overflow-hidden w-[50%] text-amber-400">
                ★
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

export const Part2Reviews: React.FC<Part2ReviewsProps> = ({
  currentRound,
  currentMember,
  onAddReview,
  onGoToWrapup,
}) => {
  const selectedBook = currentRound.selectedBook;
  const myReview = currentRound.reviews.find((r) => r.memberId === currentMember.id);

  const [rating, setRating] = useState<number>(myReview?.rating || 4.5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [oneLiner, setOneLiner] = useState<string>(myReview?.oneLiner || '');
  const [favoriteQuote, setFavoriteQuote] = useState<string>(myReview?.favoriteQuote || '');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(!myReview);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oneLiner.trim()) return;

    const review: BookReview = {
      id: myReview ? myReview.id : `rev_${Date.now()}`,
      memberId: currentMember.id,
      memberName: currentMember.name,
      rating,
      oneLiner: oneLiner.trim(),
      favoriteQuote: favoriteQuote.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddReview(review);
    setIsFormOpen(false);
  };

  // Calculate Average Rating
  const totalReviews = currentRound.reviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          currentRound.reviews.reduce((acc, r) => acc + r.rating, 0) /
          totalReviews
        ).toFixed(1)
      : '0.0';

  if (!selectedBook) {
    return (
      <div className="bg-white border border-orange-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
        <span className="text-4xl block mb-3">🪘</span>
        <h3 className="text-base font-bold text-stone-900">선정된 독서 책이 없습니다</h3>
        <p className="text-xs text-stone-500 mt-1">
          먼저 [책선정]에서 책을 선정한 후 후기를 남겨주세요.
        </p>
      </div>
    );
  }

  const activeDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-orange-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-orange-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
              <span>🪘 Part 2. 장구치고</span>
              <span aria-hidden="true">·</span>
              <span>별점 &amp; 한줄평</span>
            </div>
            <h2 className="text-xl font-black text-stone-900 mt-1">
              『{selectedBook.title}』 독서 후기
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              별 반개(0.5점) 단위 별점과 한줄평을 남겨주세요!
            </p>
          </div>

          <div className="flex items-center gap-4 bg-orange-50/60 px-4 py-3 rounded-2xl border border-orange-200/80">
            <div className="text-center">
              <span className="text-[10px] text-stone-500 block font-bold">
                클럽 평균 별점
              </span>
              <div className="text-2xl font-black text-orange-600 font-mono tabular-nums">
                {avgRating} <span className="text-xs text-stone-400 font-normal">/ 5.0</span>
              </div>
            </div>
            <div className="h-8 w-px bg-orange-200" />
            <div className="text-xs text-stone-600">
              총 <strong>{totalReviews}</strong>명 작성 완료
            </div>
          </div>
        </div>

        {/* My Review Action or Display */}
        <div className="mt-5">
          {!isFormOpen && myReview ? (
            <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-stone-900">
                    내가 남긴 한줄평 ({myReview.memberName})
                  </span>
                  <div className="flex items-center gap-1.5">
                    {renderStarIcons(myReview.rating, 'text-sm')}
                    <span className="text-xs font-black text-orange-600 font-mono">
                      {myReview.rating.toFixed(1)}점
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-stone-900 mt-1.5">
                  "{myReview.oneLiner}"
                </p>
                {myReview.favoriteQuote && (
                  <p className="text-xs text-stone-600 italic mt-1">
                    인상 깊은 구절: "{myReview.favoriteQuote}"
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-orange-800 bg-white border border-orange-300 rounded-xl hover:bg-orange-50 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                후기 수정
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 bg-orange-50/30 rounded-xl border border-orange-100 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-orange-100">
                <span className="text-xs font-bold text-stone-900">
                  {currentMember.name} 님의 별점 및 한줄평 작성
                </span>
                {myReview && (
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-xs text-stone-500 hover:text-stone-800"
                  >
                    접기
                  </button>
                )}
              </div>

              {/* Interactive Star Rating with Half-Star (0.5) Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    1) 별점 매기기 (별 반개 0.5점 단위)
                  </label>
                  <span className="text-xs text-stone-500">
                    별의 왼쪽/오른쪽을 누르면 0.5점씩 조절됩니다
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl border border-orange-200/80">
                  {/* Star Elements with Left/Right half interactive hitboxes */}
                  <div
                    className="flex items-center gap-1 select-none"
                    onMouseLeave={() => setHoverRating(null)}
                  >
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                      const isFull = activeDisplayRating >= starIndex;
                      const isHalf = !isFull && activeDisplayRating >= starIndex - 0.5;

                      return (
                        <div
                          key={starIndex}
                          className="relative w-8 h-8 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                        >
                          {/* Left Half Hitbox (0.5 step) */}
                          <button
                            type="button"
                            aria-label={`${starIndex - 0.5}점`}
                            onMouseEnter={() => setHoverRating(starIndex - 0.5)}
                            onClick={() => setRating(starIndex - 0.5)}
                            className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer focus:outline-none"
                          />
                          {/* Right Half Hitbox (1.0 step) */}
                          <button
                            type="button"
                            aria-label={`${starIndex}점`}
                            onMouseEnter={() => setHoverRating(starIndex)}
                            onClick={() => setRating(starIndex)}
                            className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer focus:outline-none"
                          />

                          {/* Base Empty Star */}
                          <span className="relative text-3xl leading-none text-stone-200 pointer-events-none">
                            ★
                            {isFull && (
                              <span className="absolute inset-0 overflow-hidden text-amber-400">
                                ★
                              </span>
                            )}
                            {isHalf && (
                              <span className="absolute inset-0 overflow-hidden w-[50%] text-amber-400">
                                ★
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Rating Numeric Score Badge */}
                  <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                    <span className="text-xl font-black text-orange-600 font-mono tabular-nums">
                      {activeDisplayRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-stone-400 font-normal">/ 5.0</span>
                  </div>

                  {/* Preset Quick Buttons for convenience */}
                  <div className="flex items-center gap-1 ml-auto">
                    {[1.0, 2.0, 3.0, 3.5, 4.0, 4.5, 5.0].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setRating(val);
                          setHoverRating(null);
                        }}
                        className={`px-2 py-1 text-[11px] rounded-lg font-mono font-bold transition-colors cursor-pointer ${
                          rating === val
                            ? 'bg-orange-500 text-white'
                            : 'bg-stone-100 hover:bg-orange-100 text-stone-700'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* One-Liner Review */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  2) 책 한줄평 남기기 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 지친 마음을 어루만져 주는 따스한 골목길 이야기"
                  value={oneLiner}
                  onChange={(e) => setOneLiner(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Favorite Quote */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  3) 마음에 남은 구절 (선택)
                </label>
                <input
                  type="text"
                  placeholder="예: 결국 삶은 관계였고 관계는 소통이었다."
                  value={favoriteQuote}
                  onChange={(e) => setFavoriteQuote(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                {myReview && (
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-lg"
                  >
                    취소
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  한줄평 등록하기
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Member Reviews Feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-stone-900">
            모임원들의 한줄평 &amp; 별점 ({currentRound.reviews.length})
          </h3>
          <button
            onClick={onGoToWrapup}
            className="text-xs text-orange-600 font-bold underline cursor-pointer"
          >
            모임후기 보러가기 →
          </button>
        </div>

        {currentRound.reviews.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-500 text-xs">
            아직 등록된 한줄평이 없습니다. 첫 후기를 남겨보세요!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {currentRound.reviews.map((rev) => {
              const isMine = rev.memberId === currentMember.id;

              return (
                <div
                  key={rev.id}
                  className={`bg-white rounded-2xl border p-5 transition-all ${
                    isMine ? 'border-orange-300 bg-orange-50/10 shadow-xs' : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-xs font-bold">
                        {rev.memberName.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-stone-900">{rev.memberName}</span>
                          {isMine && <span className="text-[10px] text-orange-600 font-bold">(나)</span>}
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {rev.createdAt ? rev.createdAt.split('T')[0] : '최근'}
                        </span>
                      </div>
                    </div>

                    {/* Stars with half-star support */}
                    <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-100">
                      {renderStarIcons(rev.rating, 'text-xs')}
                      <span className="text-xs font-black text-stone-800 font-mono ml-0.5">
                        {rev.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-stone-900 leading-snug">
                    "{rev.oneLiner}"
                  </p>

                  {rev.favoriteQuote && (
                    <div className="mt-3 p-2.5 bg-orange-50/40 rounded-xl border border-orange-100 text-xs text-stone-600 italic">
                      <span className="text-orange-900/60 block not-italic text-[10px] font-bold mb-0.5">
                        인상 깊었던 구절:
                      </span>
                      "{rev.favoriteQuote}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
