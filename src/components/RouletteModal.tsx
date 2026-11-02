import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { BookCandidate } from '../types';

interface RouletteModalProps {
  candidates: BookCandidate[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmSelection: (selectedBook: BookCandidate) => void;
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  candidates,
  isOpen,
  onClose,
  onConfirmSelection,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<BookCandidate | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const animFrameId = useRef<number | null>(null);

  // Warm, lively colors for roulette slices
  const sliceColors = [
    '#EA580C', // Orange
    '#059669', // Emerald
    '#D97706', // Amber
    '#2563EB', // Blue
    '#9333EA', // Purple
    '#E11D48', // Rose
    '#0891B2', // Cyan
    '#CA8A04', // Yellow-amber
  ];

  // Draw wheel whenever angle or candidates change
  useEffect(() => {
    if (!isOpen || !canvasRef.current || candidates.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 16;
    const count = candidates.length;
    const sliceAngle = (2 * Math.PI) / count;

    ctx.clearRect(0, 0, size, size);

    // Save context for rotation
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotationAngle);

    // Draw slices
    candidates.forEach((candidate, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const color = sliceColors[i % sliceColors.length];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Draw slice text
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px Pretendard, sans-serif';

      const title = candidate.title.length > 10 ? candidate.title.slice(0, 9) + '…' : candidate.title;
      ctx.fillText(title, radius - 28, 5);

      ctx.font = '12px Pretendard, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(`(${candidate.memberName})`, radius - 28, 22);

      ctx.restore();
    });

    // Outer rim
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#EA580C';
    ctx.stroke();

    // Center Hub (Drum motif in warm orange/gold)
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFF7ED';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#EA580C';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#EA580C';
    ctx.fill();

    ctx.restore(); // Restore wheel rotation

    // Fixed Top Pointer (Marker Arrow)
    ctx.save();
    ctx.translate(center, 12);
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(14, 0);
    ctx.lineTo(0, 28);
    ctx.closePath();
    ctx.fillStyle = '#EA580C';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    ctx.restore();
  }, [rotationAngle, candidates, isOpen]);

  // Handle spin execution (no sound)
  const spinWheel = () => {
    if (isSpinning || candidates.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    const count = candidates.length;
    const sliceAngle = (2 * Math.PI) / count;

    const winningIndex = Math.floor(Math.random() * count);
    const targetOffset = (1.5 * Math.PI) - ((winningIndex + 0.5) * sliceAngle);
    
    const extraRotations = (6 + Math.floor(Math.random() * 3)) * (2 * Math.PI);
    const targetAngle = rotationAngle + extraRotations + ((targetOffset - (rotationAngle % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI));

    const startTime = performance.now();
    const duration = 4800;
    const startAngle = rotationAngle;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentAngle = startAngle + (targetAngle - startAngle) * easedProgress;
      setRotationAngle(currentAngle);

      if (progress < 1) {
        animFrameId.current = requestAnimationFrame(step);
      } else {
        setIsSpinning(false);
        const selected = candidates[winningIndex];
        setWinner(selected);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EA580C', '#F59E0B', '#10B981', '#2563EB', '#8B5CF6'],
        });
      }
    };

    animFrameId.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-orange-100 bg-orange-50/50">
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-1.5 sm:gap-2">
              <span>🥁</span>
              <span>북치고 룰렛 돌리기</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">후보 {candidates.length}권 중 이번 2주를 함께할 책을 선정합니다</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSpinning}
            className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-700 rounded-lg hover:bg-orange-100/50 transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Roulette Body */}
        <div className="p-4 sm:p-6 flex flex-col items-center">
          {/* Wheel Canvas or Empty Notice */}
          {candidates.length === 0 ? (
            <div className="w-full py-12 px-6 text-center space-y-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-4xl block">📚</span>
              <h4 className="text-sm font-bold text-stone-800">등록된 후보 도서가 없습니다</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                룰렛을 돌리기 위해 각 참여자가 책 1권씩을 추천 등록해주세요.
              </p>
            </div>
          ) : (
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={340}
                height={340}
                className="w-full h-full drop-shadow-md"
              />
            </div>
          )}

          {/* Winner Celebration Callout */}
          {winner && !isSpinning && (
            <div className="w-full mt-5 p-4 bg-orange-50 border border-orange-200 rounded-2xl text-center animate-in zoom-in-95 duration-200">
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                🎉 당첨 축하합니다!
              </span>
              <h4 className="text-lg font-black text-stone-900 mt-1">
                『{winner.title}』
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                저자 {winner.author} · 추천인 <span className="font-bold text-stone-900">{winner.memberName}</span>
              </p>
              <p className="text-xs text-stone-600 italic mt-2 px-3 bg-white py-1.5 rounded-xl border border-orange-100">
                "{winner.reason}"
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full mt-6 flex items-center gap-3">
            {!winner || isSpinning ? (
              <button
                onClick={spinWheel}
                disabled={isSpinning || candidates.length === 0}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-base font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {isSpinning ? (
                  <>
                    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>룰렛 회전 중...</span>
                  </>
                ) : (
                  <>
                    <span>🥁</span>
                    <span>북치고 룰렛 돌리기!</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={spinWheel}
                  className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  다시 돌리기
                </button>
                <button
                  onClick={() => {
                    onConfirmSelection(winner);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  이 책으로 2주 독서 확정하기
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
