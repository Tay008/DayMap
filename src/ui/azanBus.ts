type Listener = () => void;

let listener: Listener | null = null;

export function setAzanTestListener(next: Listener | null): void {
  listener = next;
}

export function fireAzanTest(): void {
  listener?.();
}
