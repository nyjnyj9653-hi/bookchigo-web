import React, { useState, useEffect } from 'react';
import { ArchivedRound, BookReview } from '../types';

interface PastRoundsArchiveProps {
  archive: ArchivedRound[];
  isAdmin?: boolean;
  currentRoundNumber: number;
  onSetCurrentRoundNumber?: (newRoundNumber: number) => void;
  onAddArchivedRound?: (round: ArchivedRound) => void;
  onUpdateArchivedRound?: (round: ArchivedRound) => void;
  onDeleteArchivedRound?: (roundNumber: number) => void;
  onGoToCurrentRound: () => void;
}

export const PastRoundsArchive: React.FC<PastRoundsArchiveProps> = ({
  archive,
  isAdmin = false,
  currentRoundNumber,
  onSetCurrentRoundNumber,
  onAddArchivedRound,
  onUpdateArchivedRound,
  onDeleteArchivedRound,
  onGoToCurrentRound,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoundNumber, setEditingRoundNumber] = useState<number | null>(null);

  // Manual round adjustment state
  const [targetRoundNumber, setTargetRoundNumber] = useState<number>(currentRoundNumber);

  useEffect(() => {
    setTargetRoundNumber(currentRoundNumber);
  }, [currentRoundNumber]);

  // Form State
  const [formRoundNumber, setFormRoundNumber] = useState<number>(1);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookCategory, setBookCategory] = useState('한국소설');
  const [recommenderName, setRecommenderName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rating, setRating] = useState<number>(4.5);
  const [completedCount, setCompletedCount] = useState<number>(4);
  const [totalCount, setTotalCount] = useState<number>(4);
  const [coffeeWinners, setCoffeeWinners] = useState('');
  const [notes, setNotes] = useState('');
  const [sampleReview, setSampleReview] = useState('');

  const openAddModal = () => {
    // Next round number suggestion
    const highestRound = archive.reduce((max, r) => Math.max(max, r.roundNumber), 0);
    setEditingRoundNumber(null);
    setFormRoundNumber(highestRound > 0 ? highestRound + 1 : 1);
    setBookTitle('');
    setBookAuthor('');
    setBookPublisher('');
    setBookCategory('한국소설');
    setRecommenderName('');
    const today = new Date();
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    setStartDate(twoWeeksAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setRating(4.5);
    setCompletedCount(3);
    setTotalCount(4);
    setCoffeeWinners('전원완독');
    setNotes('');
    setSampleReview('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: ArchivedRound) => {
    setEditingRoundNumber(item.roundNumber);
    setFormRoundNumber(item.roundNumber);
    setBookTitle(item.selectedBook.title);
    setBookAuthor(item.selectedBook.author);
    setBookPublisher(item.selectedBook.publisher || '');
    setBookCategory(item.selectedBook.category || '기타');
    setRecommenderName(item.selectedByMemberName);
    setStartDate(item.readingStartDate);
    setEndDate(item.readingEndDate);
    setRating(item.averageRating);
    setCompletedCount(item.completedMembersCount);
    setTotalCount(item.totalMembersCount);
    setCoffeeWinners(item.coffeePenaltyWinners.length > 0 ? item.coffeePenaltyWinners.join(', ') : '전원완독');
    setNotes(item.notes || '');
    setSampleReview(item.reviews?.[0]?.oneLiner || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !bookAuthor.trim()) return;

    const winnersList = coffeeWinners
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s !== '전원완독' && s !== '없음');

    const reviewsList: BookReview[] = [];
    if (sampleReview.trim()) {
      reviewsList.push({
        id: `rev_${Date.now()}`,
        memberId: 'admin_note',
        memberName: recommenderName || '참여자',
        rating: rating,
        oneLiner: sampleReview.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    const roundData: ArchivedRound = {
      roundNumber: Number(formRoundNumber),
      selectedBook: {
        id: `arch_book_${formRoundNumber}`,
        memberId: 'unknown',
        memberName: recommenderName.trim() || '추천자',
        title: bookTitle.trim(),
        author: bookAuthor.trim(),
        publisher: bookPublisher.trim() || undefined,
        category: bookCategory,
        coverColor: '#EA580C',
        reason: '지난 회차 기록',
      },
      selectedByMemberName: recommenderName.trim() || '추천자',
      readingStartDate: startDate || new Date().toISOString().split('T')[0],
      readingEndDate: endDate || new Date().toISOString().split('T')[0],
      averageRating: Number(rating),
      reviews: reviewsList,
      coffeePenaltyWinners: winnersList,
      commentsCount: 0,
      completedMembersCount: Number(completedCount),
      totalMembersCount: Number(totalCount),
      archivedAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
    };

    if (editingRoundNumber !== null) {
      if (onUpdateArchivedRound) {
        onUpdateArchivedRound(roundData);
      }
    } else {
      if (onAddArchivedRound) {
        onAddArchivedRound(roundData);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (roundNumber: number, title: string) => {
    if (window.confirm(`제 ${roundNumber}회차 『${title}』 기록을 삭제하시겠습니까?`)) {
      if (onDeleteArchivedRound) {
        onDeleteArchivedRound(roundNumber);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-orange-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
            <span>📜 북치고 장구치고</span>
            <span aria-hidden="true">·</span>
            <span>히스토리 보관함</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
            지난 독서모임 기록
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            지금까지 함께 읽고 나눈 책들과 별점, 커피 당첨의 순간들입니다.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="min-h-[40px] px-3.5 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>👑</span>
              <span>+ 지난 회차 직접 등록</span>
            </button>
          )}

          <button
            onClick={onGoToCurrentRound}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 underline underline-offset-4 cursor-pointer self-center"
          >
            현재 모임으로 이동 →
          </button>
        </div>
      </div>

      {/* Current Ongoing Round Info & Admin Round Setting Card */}
      <div className="bg-white border border-orange-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-lg font-black shrink-0 border border-orange-200">
            {currentRoundNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-600">현재 진행 중인 모임</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-orange-100 text-orange-800">
                제 {currentRoundNumber}회차 진행 중
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              지난 회차를 등록하면 현재 회차 번호가 자동으로 이어지며, 관리자는 직접 원하는 회차 번호로 설정할 수도 있습니다.
            </p>
          </div>
        </div>

        {isAdmin && onSetCurrentRoundNumber && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl shrink-0">
            <span className="text-xs font-semibold text-stone-600 whitespace-nowrap">회차 번호 변경:</span>
            <input
              type="number"
              min="1"
              value={targetRoundNumber}
              onChange={(e) => setTargetRoundNumber(Math.max(1, Number(e.target.value)))}
              className="w-16 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-orange-500"
              aria-label="회차 번호 직접 입력"
            />
            <button
              onClick={() => {
                if (targetRoundNumber > 0 && targetRoundNumber !== currentRoundNumber) {
                  onSetCurrentRoundNumber(targetRoundNumber);
                }
              }}
              disabled={targetRoundNumber === currentRoundNumber}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                targetRoundNumber !== currentRoundNumber
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              적용
            </button>
          </div>
        )}
      </div>

      {/* Admin Notice Banner */}
      {isAdmin && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="text-base">👑</span>
            <span>
              <strong>관리자 모드 활성화:</strong> 웹사이트 이전 모임 기록이나 놓친 회차를 <strong>[+ 지난 회차 직접 등록]</strong> 버튼으로 언제든지 추가하고 수정할 수 있습니다.
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {archive.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 sm:p-14 text-center space-y-4">
          <div className="text-4xl">📜</div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-800">아직 보관된 지난 모임 기록이 없습니다</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              현재 회차를 완료하고 다음 회차로 넘어가면 자동으로 이곳에 쌓입니다.
              {isAdmin && ' 또한 관리자는 이전 모임 기록을 직접 등록할 수 있습니다.'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              <span>👑</span>
              <span>첫 번째 지난 회차 기록 등록하기</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {archive.map((item) => (
            <div
              key={item.roundNumber}
              className="bg-white rounded-2xl border border-orange-200/90 p-5 sm:p-6 shadow-xs space-y-4 transition-all hover:border-orange-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-orange-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-orange-500 text-white text-xs font-black rounded-lg">
                    제 {item.roundNumber}회차
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    『{item.selectedBook.title}』
                  </h3>
                  <span className="text-xs text-stone-500">
                    ({item.selectedBook.author})
                  </span>
                  {item.notes && (
                    <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-bold">
                      관리자 등록
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-stone-500 font-mono">
                    독서 기간: <strong>{item.readingStartDate}</strong> ~ <strong>{item.readingEndDate}</strong>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        className="px-2 py-1 text-[11px] font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(item.roundNumber, item.selectedBook.title)}
                        className="p-1 text-stone-300 hover:text-rose-600 transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-orange-50/40 p-3.5 rounded-xl border border-orange-100 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px]">책 추천자</span>
                  <strong className="text-stone-900 text-sm font-bold">{item.selectedByMemberName}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">평균 별점</span>
                  <strong className="text-orange-600 text-sm font-mono font-bold">{item.averageRating} / 5.0</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">완독 달성</span>
                  <strong className="text-emerald-700 text-sm font-mono font-bold">
                    {item.completedMembersCount}명 / {item.totalMembersCount}명
                  </strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">☕ 이번 회차 커피요정</span>
                  <strong className="text-rose-700 text-sm font-bold">
                    {item.coffeePenaltyWinners.length > 0 ? item.coffeePenaltyWinners.join(', ') : '전원완독'}
                  </strong>
                </div>
              </div>

              {/* Notes if present */}
              {item.notes && (
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-stone-700">
                  <span className="font-bold text-amber-900 block mb-0.5">📌 모임 기록 메모:</span>
                  {item.notes}
                </div>
              )}

              {/* Past Reviews Preview */}
              {item.reviews && item.reviews.length > 0 && (
                <div className="pt-1">
                  <span className="text-xs font-bold text-stone-700 block mb-2">
                    남겨진 한줄평 ({item.reviews.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3 bg-stone-50/70 border border-stone-200 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{rev.memberName}</span>
                          <span className="text-amber-500 font-mono">
                            ★ {rev.rating}점
                          </span>
                        </div>
                        <p className="text-stone-700 font-medium italic">
                          "{rev.oneLiner}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Direct Entry / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-orange-100 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-orange-50/60">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-1.5">
                  <span>👑</span>
                  <span>{editingRoundNumber !== null ? `제 ${editingRoundNumber}회차 기록 수정` : '지난 회차 기록 직접 입력'}</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                  놓치거나 이전 오프라인에서 진행했던 회차 정보를 직접 등록합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-700 rounded-xl hover:bg-orange-100/50"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">회차 번호 *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formRoundNumber}
                    onChange={(e) => setFormRoundNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold"
                    placeholder="예: 1"
                  />
                  {editingRoundNumber === null && formRoundNumber >= currentRoundNumber && (
                    <span className="text-[10px] text-orange-600 block mt-1 font-semibold">
                      💡 등록 후 현재 진행 회차가 자동으로 <strong>제 {formRoundNumber + 1}회차</strong>로 갱신됩니다.
                    </span>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">책 추천자 *</label>
                  <input
                    type="text"
                    required
                    value={recommenderName}
                    onChange={(e) => setRecommenderName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="예: 홍길동"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">선정 도서 제목 *</label>
                <input
                  type="text"
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm font-bold"
                  placeholder="예: 불편한 편의점"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">저자 *</label>
                  <input
                    type="text"
                    required
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="예: 김호연"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">분야 / 장르</label>
                  <select
                    value={bookCategory}
                    onChange={(e) => setBookCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                  >
                    <option value="한국소설">한국소설</option>
                    <option value="해외문학">해외문학</option>
                    <option value="인문/철학">인문/철학</option>
                    <option value="사회/심리">사회/심리</option>
                    <option value="과학/SF">과학/SF</option>
                    <option value="에세이">에세이</option>
                    <option value="자기계발">자기계발</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">독서 시작일</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">독서 종료일</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">평균 별점 (0.5~5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">완독 인원</label>
                  <input
                    type="number"
                    min="0"
                    value={completedCount}
                    onChange={(e) => setCompletedCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">총 참여 인원</label>
                  <input
                    type="number"
                    min="1"
                    value={totalCount}
                    onChange={(e) => setTotalCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  ☕ 커피요정 당첨자 (미완독자)
                </label>
                <input
                  type="text"
                  value={coffeeWinners}
                  onChange={(e) => setCoffeeWinners(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="예: 홍길동, 김영희 (없을 경우 '전원완독')"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">대표 한줄평 (선택)</label>
                <input
                  type="text"
                  value={sampleReview}
                  onChange={(e) => setSampleReview(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="예: 잔잔한 감동과 함께 일상의 온기를 되찾아준 책."
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">회차 메모 / 기록 (선택)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                  placeholder="모임 장소, 특이사항, 후기 메모 등을 남겨주세요."
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-800 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingRoundNumber !== null ? '수정 내용 저장' : '지난 회차 기록 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
