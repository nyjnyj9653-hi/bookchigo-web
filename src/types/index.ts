export type ReadingState = 'not_started' | 'reading' | 'completed';

export interface Member {
  id: string;
  name: string;
  avatarColor: string;
  bio?: string;
  isAdmin?: boolean; // 관리자 (모임장) 여부
}

export interface BookCandidate {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  author: string;
  publisher?: string;
  coverColor: string;
  reason: string; // 추천 이유
  category: string;
  pageCount?: number;
  isKeptFromPrevious?: boolean; // 이전 라운드에서 유지된 책인지 여부
}

export interface MemberReadingProgress {
  memberId: string;
  memberName: string;
  state: ReadingState; // 독서 시작(not_started) / 읽는 중(reading) / 완독(completed)
  currentPage?: number;
  totalPage?: number;
  percentage: number;
  updatedAt: string;
  completionNotes?: string;
}

export interface BookReview {
  id: string;
  memberId: string;
  memberName: string;
  rating: number; // 0.5 to 5.0
  oneLiner: string; // 책 한줄 평
  favoriteQuote?: string; // 인상 깊었던 구절
  detailedReview?: string;
  createdAt: string;
}

export interface MeetingComment {
  id: string;
  memberId: string;
  memberName: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface CurrentRound {
  roundNumber: number;
  status: 'selection' | 'reading' | 'wrapup'; // 책선정 -> 2주독서 -> 모임후기
  selectedBook?: BookCandidate;
  selectedByMemberId?: string;
  selectedByMemberName?: string;
  selectedAt?: string; // 책 선정일
  readingStartDate?: string; // 선정일 다음날
  readingEndDate?: string; // 시작일로부터 2주 후
  candidates: BookCandidate[];
  progresses: Record<string, MemberReadingProgress>;
  reviews: BookReview[];
  comments: MeetingComment[];
  coffeePenaltyWinners?: string[]; // 커피요정 당첨자 멤버 이름 목록
  coffeePenaltyDetermined?: boolean;
}

export interface ArchivedRound {
  id?: string;
  roundNumber: number;
  selectedBook: BookCandidate;
  selectedByMemberName: string;
  readingStartDate: string;
  readingEndDate: string;
  averageRating: number;
  reviews: BookReview[];
  coffeePenaltyWinners: string[];
  commentsCount: number;
  completedMembersCount: number;
  totalMembersCount: number;
  archivedAt: string;
  notes?: string; // 관리자 직접 등록 메모
}
