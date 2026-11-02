import React, { useState } from 'react';
import { CurrentRound, Member } from '../types';

interface NewRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRound: CurrentRound;
  allMembers: Member[];
  onConfirmNewRound: (keptCandidateMemberIds: string[]) => void;
}

export const NewRoundModal: React.FC<NewRoundModalProps> = ({
  isOpen,
  onClose,
  currentRound,
  allMembers,
  onConfirmNewRound,
}) => {
  const winnerMemberId = currentRound.selectedBook?.memberId || currentRound.selectedByMemberId;
  const nonWinnerCandidates = currentRound.candidates.filter(
    (c) => c.memberId !== winnerMemberId
  );

  const [keptMemberIds, setKeptMemberIds] = useState<string[]>(
    nonWinnerCandidates.map((c) => c.memberId)
  );

  if (!isOpen) return null;

  const handleToggleKeep = (memberId: string) => {
    setKeptMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleProceed = () => {
    onConfirmNewRound(keptMemberIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-orange-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-black text-stone-900">
              다음 제 {currentRound.roundNumber + 1}회차 모임 시작하기
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              현재 {currentRound.roundNumber}회차 모임 결과를 아카이브에 보관하고 새 라운드를 시작합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Rule Explanation */}
        <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2 text-xs text-stone-700">
          <span className="font-bold text-orange-900 block text-xs">
            📋 다음 책 선정 방식 규칙 적용:
          </span>
          <div className="space-y-1 pl-1">
            <p>
              • <strong>선정된 사람 ({currentRound.selectedBook?.memberName}):</strong>{' '}
              이번 당첨 책은 완독 처리되며, 다음 모임을 위해 <strong>새로운 책 1권을 등록</strong>해야 합니다.
            </p>
            <p>
              • <strong>선정되지 않은 사람들:</strong>{' '}
              기존 책을 <strong>그대로 후보로 유지</strong>하거나 <strong>새 책으로 교체</strong>할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Non-Winner Candidates Retention Checklist */}
        <div>
          <span className="text-xs font-bold text-stone-800 block mb-2">
            미선정 멤버 기존 책 유지 여부 설정:
          </span>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {nonWinnerCandidates.map((cand) => {
              const isKept = keptMemberIds.includes(cand.memberId);
              return (
                <div
                  key={cand.id}
                  onClick={() => handleToggleKeep(cand.memberId)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    isKept
                      ? 'bg-orange-50/40 border-orange-200'
                      : 'bg-white border-stone-200 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-900">
                        {cand.memberName}
                      </span>
                      <span className="text-[11px] text-stone-600">
                        『{cand.title}』 ({cand.author})
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400">
                      {isKept ? '기존 책 그대로 유지하여 다음 룰렛 참가' : '책 초기화 (새로운 책 입력 예정)'}
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={isKept}
                    onChange={() => handleToggleKeep(cand.memberId)}
                    className="accent-orange-500 w-4 h-4 rounded cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
          >
            취소
          </button>
          <button
            onClick={handleProceed}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {currentRound.roundNumber + 1}회차 시작 및 보관
          </button>
        </div>
      </div>
    </div>
  );
};
