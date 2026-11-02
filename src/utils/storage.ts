import { Member, CurrentRound, ArchivedRound } from '../types';

// Updated storage key to version 3 to ensure clean slate without old sample data
const STORAGE_KEY_MEMBERS = 'bukjanggu_v3_members';
const STORAGE_KEY_ROUND = 'bukjanggu_v3_current_round';
const STORAGE_KEY_ARCHIVE = 'bukjanggu_v3_archive';
const STORAGE_KEY_CURRENT_USER = 'bukjanggu_v3_current_user_id';

// Clean initial members: 1 default Admin (모임장) for immediate use
export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: '모임장',
    avatarColor: '#EA580C',
    bio: '북치고 장구치고 모임 관리자',
    isAdmin: true,
  },
];

// Clean initial round: Round 1 starting at book selection stage
export const INITIAL_ROUND: CurrentRound = {
  roundNumber: 1,
  status: 'selection',
  selectedBook: undefined,
  selectedByMemberId: undefined,
  selectedByMemberName: undefined,
  selectedAt: undefined,
  readingStartDate: undefined,
  readingEndDate: undefined,
  candidates: [],
  progresses: {},
  reviews: [],
  comments: [],
  coffeePenaltyWinners: [],
  coffeePenaltyDetermined: false,
};

// Clean initial archive: empty history
export const INITIAL_ARCHIVE: ArchivedRound[] = [];

// Calculate reading period: starts day after selection, lasts 14 days
export function calculateReadingDates(selectionDateStr: string = new Date().toISOString()) {
  const sel = new Date(selectionDateStr);

  // Start date: next day at 00:00:00
  const start = new Date(sel);
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);

  // End date: start date + 13 days (total 14 days) at 23:59:59
  const end = new Date(start);
  end.setDate(end.getDate() + 13);
  end.setHours(23, 59, 59, 999);

  return {
    selectionDate: sel.toISOString(),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    formattedStartDate: `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(2, '0')}.${String(start.getDate()).padStart(2, '0')}`,
    formattedEndDate: `${end.getFullYear()}.${String(end.getMonth() + 1).padStart(2, '0')}.${String(end.getDate()).padStart(2, '0')}`,
  };
}

export function getStoredMembers(): Member[] {
  if (typeof window === 'undefined') return INITIAL_MEMBERS;
  try {
    const data = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (!data) return INITIAL_MEMBERS;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MEMBERS;
  } catch {
    return INITIAL_MEMBERS;
  }
}

export function saveMembers(members: Member[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  }
}

export function getStoredCurrentRound(): CurrentRound {
  if (typeof window === 'undefined') return INITIAL_ROUND;
  try {
    const data = localStorage.getItem(STORAGE_KEY_ROUND);
    return data ? JSON.parse(data) : INITIAL_ROUND;
  } catch {
    return INITIAL_ROUND;
  }
}

export function saveCurrentRound(round: CurrentRound) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ROUND, JSON.stringify(round));
  }
}

export function getStoredArchive(): ArchivedRound[] {
  if (typeof window === 'undefined') return INITIAL_ARCHIVE;
  try {
    const data = localStorage.getItem(STORAGE_KEY_ARCHIVE);
    return data ? JSON.parse(data) : INITIAL_ARCHIVE;
  } catch {
    return INITIAL_ARCHIVE;
  }
}

export function saveArchive(archive: ArchivedRound[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ARCHIVE, JSON.stringify(archive));
  }
}

export function getCurrentUserId(): string {
  if (typeof window === 'undefined') return 'm1';
  return localStorage.getItem(STORAGE_KEY_CURRENT_USER) || 'm1';
}

export function setCurrentUserId(id: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, id);
  }
}

export function resetAllDataToDefault() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_MEMBERS);
    localStorage.removeItem(STORAGE_KEY_ROUND);
    localStorage.removeItem(STORAGE_KEY_ARCHIVE);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    // Also clear old keys if present
    localStorage.removeItem('bukjanggu_members_v1');
    localStorage.removeItem('bukjanggu_current_round_v1');
    localStorage.removeItem('bukjanggu_archive_v1');
  }
}
