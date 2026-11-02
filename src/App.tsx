import React, { useState, useEffect } from 'react';
import {
  Member,
  CurrentRound,
  ArchivedRound,
  BookCandidate,
  MemberReadingProgress,
  BookReview,
  MeetingComment,
} from './types';
import {
  getStoredMembers,
  saveMembers,
  getStoredCurrentRound,
  saveCurrentRound,
  getStoredArchive,
  saveArchive,
  getCurrentUserId,
  setCurrentUserId,
  calculateReadingDates,
  resetAllDataToDefault,
} from './utils/storage';
import { Header, TabType } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { Part1BookSelection } from './components/Part1BookSelection';
import { Part1ReadingPeriod } from './components/Part1ReadingPeriod';
import { Part2Reviews } from './components/Part2Reviews';
import { Part2MeetingWrapup } from './components/Part2MeetingWrapup';
import { PastRoundsArchive } from './components/PastRoundsArchive';
import { RouletteModal } from './components/RouletteModal';
import { NewRoundModal } from './components/NewRoundModal';
import { MemberManagementModal } from './components/MemberManagementModal';

export default function App() {
  const [members, setMembers] = useState<Member[]>(getStoredMembers);
  const [currentMemberId, setCurrentMemberIdState] = useState<string>(getCurrentUserId);
  const [currentRound, setCurrentRound] = useState<CurrentRound>(getStoredCurrentRound);
  const [archive, setArchive] = useState<ArchivedRound[]>(getStoredArchive);

  // Active Tab: 'selection' (책선정) | 'reading' (독서현황) | 'reviews' (한줄평) | 'wrapup' (모임후기) | 'archive' (지난모임)
  const [currentTab, setCurrentTab] = useState<TabType>('selection');

  // Modals
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isNewRoundModalOpen, setIsNewRoundModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    saveMembers(members);
  }, [members]);

  useEffect(() => {
    saveCurrentRound(currentRound);
  }, [currentRound]);

  useEffect(() => {
    saveArchive(archive);
  }, [archive]);

  const handleSelectMember = (id: string) => {
    setCurrentMemberIdState(id);
    setCurrentUserId(id);
  };

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0] || {
    id: 'm1',
    name: '김민수',
    avatarColor: '#EA580C',
  };

  // 1. Roulette Book Selection Confirmation
  const handleConfirmSelectedBook = (selected: BookCandidate) => {
    const dates = calculateReadingDates(new Date().toISOString());

    const initialProgresses: Record<string, MemberReadingProgress> = {};
    members.forEach((m) => {
      initialProgresses[m.id] = {
        memberId: m.id,
        memberName: m.name,
        state: 'not_started',
        currentPage: 0,
        totalPage: selected.pageCount || 280,
        percentage: 0,
        updatedAt: new Date().toISOString(),
      };
    });

    const updatedRound: CurrentRound = {
      ...currentRound,
      status: 'reading',
      selectedBook: selected,
      selectedByMemberId: selected.memberId,
      selectedByMemberName: selected.memberName,
      selectedAt: dates.selectionDate,
      readingStartDate: dates.startDate,
      readingEndDate: dates.endDate,
      progresses: initialProgresses,
      coffeePenaltyWinners: [],
      coffeePenaltyDetermined: false,
    };

    setCurrentRound(updatedRound);
    setCurrentTab('reading');
  };

  // 2. Candidate Update / Nomination
  const handleUpdateCandidate = (candidate: BookCandidate) => {
    const exists = currentRound.candidates.some((c) => c.memberId === candidate.memberId);
    let updatedCandidates: BookCandidate[];

    if (exists) {
      updatedCandidates = currentRound.candidates.map((c) =>
        c.memberId === candidate.memberId ? candidate : c
      );
    } else {
      updatedCandidates = [...currentRound.candidates, candidate];
    }

    setCurrentRound({
      ...currentRound,
      candidates: updatedCandidates,
    });
  };

  // 3. Update Current Member's Reading Progress
  const handleUpdateMyProgress = (prog: MemberReadingProgress) => {
    setCurrentRound({
      ...currentRound,
      progresses: {
        ...currentRound.progresses,
        [prog.memberId]: prog,
      },
    });
  };

  // 4. Add or Update Review
  const handleAddReview = (review: BookReview) => {
    const existingIndex = currentRound.reviews.findIndex((r) => r.memberId === review.memberId);
    let updatedReviews: BookReview[];

    if (existingIndex >= 0) {
      updatedReviews = [...currentRound.reviews];
      updatedReviews[existingIndex] = review;
    } else {
      updatedReviews = [review, ...currentRound.reviews];
    }

    setCurrentRound({
      ...currentRound,
      reviews: updatedReviews,
    });
  };

  // 5. Add Comment
  const handleAddComment = (comment: MeetingComment) => {
    setCurrentRound({
      ...currentRound,
      comments: [comment, ...currentRound.comments],
    });
  };

  const handleLikeComment = (commentId: string) => {
    setCurrentRound({
      ...currentRound,
      comments: currentRound.comments.map((cm) =>
        cm.id === commentId ? { ...cm, likes: cm.likes + 1 } : cm
      ),
    });
  };

  // 6. Set Coffee Winners
  const handleSetCoffeeWinners = (winners: string[]) => {
    setCurrentRound({
      ...currentRound,
      coffeePenaltyWinners: winners,
      coffeePenaltyDetermined: winners.length > 0,
    });
  };

  // 7. Transition to Next Round
  const handleConfirmNewRound = (keptCandidateMemberIds: string[]) => {
    if (!currentRound.selectedBook) return;

    const totalRev = currentRound.reviews.length;
    const avgRating =
      totalRev > 0
        ? Number(
            (currentRound.reviews.reduce((acc, r) => acc + r.rating, 0) / totalRev).toFixed(1)
          )
        : 0;

    const completedCount = Object.values(currentRound.progresses).filter(
      (p) => p.state === 'completed'
    ).length;

    const newArchivedItem: ArchivedRound = {
      roundNumber: currentRound.roundNumber,
      selectedBook: currentRound.selectedBook,
      selectedByMemberName: currentRound.selectedByMemberName || currentRound.selectedBook.memberName,
      readingStartDate: currentRound.readingStartDate?.split('T')[0] || '',
      readingEndDate: currentRound.readingEndDate?.split('T')[0] || '',
      averageRating: avgRating,
      reviews: currentRound.reviews,
      coffeePenaltyWinners: currentRound.coffeePenaltyWinners || [],
      commentsCount: currentRound.comments.length,
      completedMembersCount: completedCount,
      totalMembersCount: members.length,
      archivedAt: new Date().toISOString(),
    };

    setArchive([newArchivedItem, ...archive]);

    const nextCandidates: BookCandidate[] = currentRound.candidates
      .filter((c) => c.memberId !== currentRound.selectedBook?.memberId && keptCandidateMemberIds.includes(c.memberId))
      .map((c) => ({
        ...c,
        isKeptFromPrevious: true,
      }));

    const nextRound: CurrentRound = {
      roundNumber: currentRound.roundNumber + 1,
      status: 'selection',
      selectedBook: undefined,
      selectedByMemberId: undefined,
      selectedByMemberName: undefined,
      selectedAt: undefined,
      readingStartDate: undefined,
      readingEndDate: undefined,
      candidates: nextCandidates,
      progresses: {},
      reviews: [],
      comments: [],
      coffeePenaltyWinners: [],
      coffeePenaltyDetermined: false,
    };

    setCurrentRound(nextRound);
    setCurrentTab('selection');
  };

  // 8. Member Management (Add, Update, Delete)
  const handleAddMember = (newMem: Member) => {
    setMembers([...members, newMem]);
    handleSelectMember(newMem.id);
  };

  const handleUpdateMember = (updated: Member) => {
    setMembers(members.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleDeleteMember = (memberId: string) => {
    const remaining = members.filter((m) => m.id !== memberId);
    setMembers(remaining);
    if (currentMemberId === memberId && remaining.length > 0) {
      handleSelectMember(remaining[0].id);
    }
  };

  // 9. Past Archive Direct Management (Admin)
  const handleAddArchivedRound = (round: ArchivedRound) => {
    const exists = archive.some((r) => r.roundNumber === round.roundNumber);
    let updated: ArchivedRound[];
    if (exists) {
      updated = archive.map((r) => (r.roundNumber === round.roundNumber ? round : r));
    } else {
      updated = [round, ...archive].sort((a, b) => b.roundNumber - a.roundNumber);
    }
    setArchive(updated);
  };

  const handleUpdateArchivedRound = (round: ArchivedRound) => {
    setArchive(archive.map((r) => (r.roundNumber === round.roundNumber ? round : r)));
  };

  const handleDeleteArchivedRound = (roundNumber: number) => {
    setArchive(archive.filter((r) => r.roundNumber !== roundNumber));
  };

  const handleResetData = () => {
    if (window.confirm('모든 데이터를 초기 기본 샘플로 복원하시겠습니까?')) {
      resetAllDataToDefault();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      {/* Header with Title and Menu button (목록 표시) */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        members={members}
        currentMemberId={currentMember.id}
        onSelectMember={handleSelectMember}
        onOpenMemberModal={() => setIsMemberModalOpen(true)}
        currentRoundNum={currentRound.roundNumber}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-8 pb-24 md:pb-8">
        {/* Hero Section: 북치고 장구치고 with Drum & Janggu Icons and Part 1/2 Nav */}
        <HeroBanner
          currentRound={currentRound}
          onGoToPart1={() => setCurrentTab('selection')}
          onGoToPart2={() => setCurrentTab('reviews')}
        />

        {/* Tab Content: 책선정 / 독서현황 / 한줄평 / 모임후기 / 지난모임 */}
        {currentTab === 'selection' && (
          <Part1BookSelection
            currentRound={currentRound}
            currentMember={currentMember}
            onOpenRoulette={() => setIsRouletteOpen(true)}
            onUpdateCandidate={handleUpdateCandidate}
            onGoToReading={() => setCurrentTab('reading')}
          />
        )}

        {currentTab === 'reading' && (
          <Part1ReadingPeriod
            currentRound={currentRound}
            currentMember={currentMember}
            onUpdateMyProgress={handleUpdateMyProgress}
            onGoToReviews={() => setCurrentTab('reviews')}
            onGoToCoffee={() => setCurrentTab('wrapup')}
          />
        )}

        {currentTab === 'reviews' && (
          <Part2Reviews
            currentRound={currentRound}
            currentMember={currentMember}
            onAddReview={handleAddReview}
            onGoToWrapup={() => setCurrentTab('wrapup')}
          />
        )}

        {currentTab === 'wrapup' && (
          <Part2MeetingWrapup
            currentRound={currentRound}
            currentMember={currentMember}
            allMembers={members}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
            onSetCoffeeWinners={handleSetCoffeeWinners}
            onStartNextRound={() => setIsNewRoundModalOpen(true)}
            onGoToReading={() => setCurrentTab('reading')}
          />
        )}

        {currentTab === 'archive' && (
          <PastRoundsArchive
            archive={archive}
            isAdmin={!!currentMember.isAdmin}
            onAddArchivedRound={handleAddArchivedRound}
            onUpdateArchivedRound={handleUpdateArchivedRound}
            onDeleteArchivedRound={handleDeleteArchivedRound}
            onGoToCurrentRound={() => setCurrentTab('reading')}
          />
        )}
      </main>

      {/* Footer in Warm Cream / Orange with safe mobile bottom margin */}
      <footer className="mt-auto border-t border-orange-100 bg-white pt-5 pb-24 md:py-6 text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-orange-600">북치고 장구치고</span>
            <span aria-hidden="true">·</span>
            <span>우리들의 독서 모임</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              모임 멤버 ({members.length}명)
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetData}
              className="text-stone-400 hover:text-orange-600 transition-colors cursor-pointer"
              title="데이터를 최초 샘플 상태로 초기화"
            >
              초기 샘플 데이터 복원
            </button>
          </div>
        </div>
      </footer>

      {/* Roulette Modal */}
      <RouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        candidates={currentRound.candidates}
        onConfirmSelection={handleConfirmSelectedBook}
      />

      {/* Next Round Transition Modal */}
      <NewRoundModal
        isOpen={isNewRoundModalOpen}
        onClose={() => setIsNewRoundModalOpen(false)}
        currentRound={currentRound}
        allMembers={members}
        onConfirmNewRound={handleConfirmNewRound}
      />

      {/* Member Management Modal */}
      <MemberManagementModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        members={members}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
        onSelectMember={handleSelectMember}
        currentMemberId={currentMember.id}
      />
    </div>
  );
}
