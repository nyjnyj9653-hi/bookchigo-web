import React, { useState } from 'react';
import { CurrentRound, MeetingComment, Member } from '../types';

interface Part2MeetingWrapupProps {
  currentRound: CurrentRound;
  currentMember: Member;
  allMembers: Member[];
  onAddComment: (comment: MeetingComment) => void;
  onLikeComment: (commentId: string) => void;
  onSetCoffeeWinners: (winners: string[]) => void;
  onStartNextRound: () => void;
  onGoToReading: () => void;
}

export const Part2MeetingWrapup: React.FC<Part2MeetingWrapupProps> = ({
  currentRound,
  currentMember,
  allMembers,
  onAddComment,
  onLikeComment,
  onSetCoffeeWinners,
  onStartNextRound,
  onGoToReading,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [isDrawingCoffee, setIsDrawingCoffee] = useState(false);

  // Identify who has NOT completed the book
  const incompleteProgresses = Object.values(currentRound.progresses).filter(
    (p) => p.state !== 'completed'
  );
  const incompleteMembers = incompleteProgresses.map((p) => p.memberName);

  // Check coffee winners
  const coffeeWinners = currentRound.coffeePenaltyWinners || [];

  const handleDrawCoffeeLottery = () => {
    if (incompleteMembers.length === 0) return;
    setIsDrawingCoffee(true);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count > 15) {
        clearInterval(interval);
        const randomWinner = incompleteMembers[Math.floor(Math.random() * incompleteMembers.length)];
        onSetCoffeeWinners([randomWinner]);
        setIsDrawingCoffee(false);
      }
    }, 100);
  };

  const handleSelectAllIncomplete = () => {
    onSetCoffeeWinners(incompleteMembers);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: MeetingComment = {
      id: `cm_${Date.now()}`,
      memberId: currentMember.id,
      memberName: currentMember.name,
      content: commentInput.trim(),
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
    };

    onAddComment(newComment);
    setCommentInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Meeting Overview & Book Nominator Attribution */}
      <div className="bg-white border border-orange-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-orange-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
              <span>🪘 Part 2. 장구치고</span>
              <span aria-hidden="true">·</span>
              <span>모임후기</span>
            </div>
            <h2 className="text-xl font-black text-stone-900 mt-1">
              제 {currentRound.roundNumber}회차 모임 결산
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              책 선정자 감사와 커피 쏘기 당첨, 모임 대화 후기입니다.
            </p>
          </div>

          <button
            onClick={onStartNextRound}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>다음 회차({currentRound.roundNumber + 1}회) 책 선정 시작 →</span>
          </button>
        </div>

        {/* Nominator Highlight Banner */}
        <div className="mt-5 p-4 bg-orange-50/60 border border-orange-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <span className="text-xs text-orange-700 font-bold block">
                이번 책 선정자
              </span>
              <div className="text-base font-extrabold text-stone-900">
                {currentRound.selectedBook?.memberName || currentRound.selectedByMemberName || '도서 미선정'}
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-600 hidden sm:block text-right">
            {currentRound.selectedBook
              ? `『${currentRound.selectedBook.title}』을 추천해주셨습니다.\n함께 읽어 더욱 즐거웠습니다!`
              : '현재 회차의 책 선정을 진행해주세요.'}
          </p>
        </div>
      </div>

      {/* Coffee Penalty Section: 이번 회차 커피요정 */}
      <div className="bg-white border border-orange-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-orange-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-stone-900">
                ☕ 이번 회차 커피요정
              </span>
              <span className="text-xs text-orange-700 font-bold bg-orange-100 px-2.5 py-0.5 rounded-full">
                커피요정 추첨
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              이번 회차 미완독자 멤버들 중 오늘의 커피요정을 추첨합니다.
            </p>
          </div>

          <button
            onClick={onGoToReading}
            className="text-xs text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
          >
            독서 상태 수정
          </button>
        </div>

        <div className="mt-5">
          {incompleteMembers.length === 0 ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <span className="text-3xl block mb-2">🎉 🏆 🎉</span>
              <h4 className="text-base font-black text-emerald-900">
                전원 완독 대성공! 커피 쏘기 없음!
              </h4>
              <p className="text-xs text-emerald-700 mt-1">
                모든 멤버가 2주 안에 책을 완독했습니다! 모두가 승자입니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-stone-600 mb-2">
                  이번 회차 미완독자 ({incompleteMembers.length}명):
                </div>
                <div className="flex flex-wrap gap-2">
                  {incompleteMembers.map((name) => (
                    <span
                      key={name}
                      className="px-3 py-1 bg-orange-50 text-orange-900 text-xs font-bold rounded-xl border border-orange-200"
                    >
                      {name} (미완독자)
                    </span>
                  ))}
                </div>
              </div>

              {/* Winner Status Banner */}
              {coffeeWinners.length > 0 ? (
                <div className="p-5 bg-orange-50 border-2 border-orange-300 rounded-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">☕</span>
                    <div>
                      <span className="text-xs font-bold text-orange-700 uppercase">
                        오늘의 커피요정 당첨!
                      </span>
                      <div className="text-xl font-black text-orange-900 mt-0.5">
                        {coffeeWinners.join(', ')} 님
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600">
                  아직 커피 당첨자가 확정되지 않았습니다. 아래 버튼을 눌러 추첨해보세요!
                </div>
              )}

              {/* Draw Buttons (Responsive wrap & full width on small mobile) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 pt-1">
                <button
                  onClick={handleDrawCoffeeLottery}
                  disabled={isDrawingCoffee}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>☕</span>
                  <span>{isDrawingCoffee ? '추첨 진행 중...' : '미완독자 중 1명 추첨하기'}</span>
                </button>

                <button
                  onClick={handleSelectAllIncomplete}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer text-center"
                >
                  미완독자 전원 커피 쏘기
                </button>

                {coffeeWinners.length > 0 && (
                  <button
                    onClick={() => onSetCoffeeWinners([])}
                    className="text-xs text-stone-400 hover:text-stone-700 underline sm:ml-auto text-center py-1 cursor-pointer"
                  >
                    다시 추첨
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participant Comments Section */}
      <div className="bg-white border border-orange-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-orange-100">
          <div>
            <h3 className="text-base font-extrabold text-stone-900">
              참여자 모임 토론 &amp; 댓글 ({currentRound.comments.length})
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              오프라인 모임 일정이나 토론 소감을 자유롭게 남겨보세요.
            </p>
          </div>
        </div>

        {/* Comment Input Box */}
        <form onSubmit={handlePostComment} className="mt-3.5 sm:mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            placeholder={`${currentMember.name} 님의 이름으로 댓글 작성...`}
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="flex-1 min-h-[44px] px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            댓글 등록
          </button>
        </form>

        {/* Comments Feed */}
        <div className="mt-4 space-y-2.5">
          {currentRound.comments.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-400">
              아직 남겨진 댓글이 없습니다. 첫 댓글을 남겨보세요!
            </div>
          ) : (
            currentRound.comments.map((cm) => (
              <div
                key={cm.id}
                className="p-3.5 bg-orange-50/30 rounded-xl border border-orange-100 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-stone-900">
                      {cm.memberName}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {cm.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {cm.content}
                  </p>
                </div>

                <button
                  onClick={() => onLikeComment(cm.id)}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-rose-600 transition-colors p-1 rounded cursor-pointer"
                  title="공감"
                >
                  <span>❤️</span>
                  <span className="font-mono tabular-nums text-[11px] font-bold">
                    {cm.likes}
                  </span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
