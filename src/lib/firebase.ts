import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Member, CurrentRound, ArchivedRound } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection Validation Test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently offline or connecting...');
      return false;
    }
    // Expected if doc doesn't exist, as long as server responded
    return true;
  }
}

// Auth Helpers
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign In Error:', err);
    throw err;
  }
}

export async function logOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error('Sign Out Error:', err);
    throw err;
  }
}

// Real-Time Subscriptions

// 1. Members Subscription
export function subscribeToMembers(
  callback: (members: Member[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const colRef = collection(db, 'members');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Member[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          name: data.name || '',
          avatarColor: data.avatarColor || '#EA580C',
          bio: data.bio || undefined,
          isAdmin: !!data.isAdmin,
        });
      });
      callback(list);
    },
    (error) => {
      console.error('Members subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'members');
    }
  );
}

// 2. Current Round Subscription
export function subscribeToCurrentRound(
  callback: (round: CurrentRound | null) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const docRef = doc(db, 'rounds', 'current');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as CurrentRound);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Current round subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'rounds/current');
    }
  );
}

// 3. Past Archive Subscription
export function subscribeToArchive(
  callback: (archive: ArchivedRound[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(collection(db, 'archive'), orderBy('roundNumber', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: ArchivedRound[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ArchivedRound);
      });
      callback(list);
    },
    (error) => {
      console.error('Archive subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'archive');
    }
  );
}

// Mutators

export async function saveCurrentRoundToFirestore(round: CurrentRound): Promise<void> {
  const path = 'rounds/current';
  try {
    await setDoc(doc(db, 'rounds', 'current'), {
      ...round,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveMemberToFirestore(member: Member): Promise<void> {
  const path = `members/${member.id}`;
  try {
    await setDoc(
      doc(db, 'members', member.id),
      {
        id: member.id,
        name: member.name,
        avatarColor: member.avatarColor,
        bio: member.bio || '',
        isAdmin: !!member.isAdmin,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMemberFromFirestore(memberId: string): Promise<void> {
  const path = `members/${memberId}`;
  try {
    await deleteDoc(doc(db, 'members', memberId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveArchiveToFirestore(round: ArchivedRound): Promise<void> {
  const path = `archive/round_${round.roundNumber}`;
  try {
    await setDoc(doc(db, 'archive', `round_${round.roundNumber}`), round, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteArchiveFromFirestore(roundNumber: number): Promise<void> {
  const path = `archive/round_${roundNumber}`;
  try {
    await deleteDoc(doc(db, 'archive', `round_${roundNumber}`));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Initialize default data if Firestore collections are empty
export async function initializeFirestoreIfEmpty(
  initialMembers: Member[],
  initialRound: CurrentRound
): Promise<void> {
  try {
    const roundSnap = await getDoc(doc(db, 'rounds', 'current'));
    if (!roundSnap.exists()) {
      await setDoc(doc(db, 'rounds', 'current'), initialRound);
    }

    for (const mem of initialMembers) {
      const memDoc = await getDoc(doc(db, 'members', mem.id));
      if (!memDoc.exists()) {
        await setDoc(doc(db, 'members', mem.id), mem);
      }
    }
  } catch (e) {
    console.warn('Initial seeding check skipped or permission waiting:', e);
  }
}
