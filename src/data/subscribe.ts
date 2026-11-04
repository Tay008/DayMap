import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import { showErrorToast } from '../ui/components/Toast';

export function reportError(error: unknown): void {
  showErrorToast(error instanceof Error ? error.message : String(error));
}

export type Unsubscribe = () => void;
export type OnData<T> = (data: T) => void;
export type OnError = (error: Error) => void;

// Firestore hands back DocumentData; narrowing it to the document's type is the one
// unavoidable cast at the data boundary (it is not silencing a type error).
export function subscribeDocument<T>(
  uid: string,
  path: string,
  onData: (data: T | null) => void,
  onError: OnError,
): Unsubscribe {
  return onSnapshot(
    doc(db, `users/${uid}/${path}`),
    (snapshot) => onData(snapshot.exists() ? (snapshot.data() as T) : null),
    onError,
  );
}

export function subscribeCollection<T>(
  uid: string,
  name: string,
  onData: OnData<T[]>,
  onError: OnError,
  orderField?: string,
): Unsubscribe {
  const base = collection(db, `users/${uid}/${name}`);
  const target = orderField ? query(base, orderBy(orderField)) : base;
  return onSnapshot(
    target,
    (snapshot) => onData(snapshot.docs.map((entry) => entry.data() as T)),
    onError,
  );
}
