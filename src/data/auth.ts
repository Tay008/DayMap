import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';

// Re-exported so screens/hooks never import from firebase/* directly (Part 3 rule 6).
export type { User };

export function signUp(email: string, password: string): Promise<void> {
  return createUserWithEmailAndPassword(auth, email, password).then(() => undefined);
}

export function signIn(email: string, password: string): Promise<void> {
  return signInWithEmailAndPassword(auth, email, password).then(() => undefined);
}

export function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
