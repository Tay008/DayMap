import { describe, expect, it } from 'vitest';
import type { Counter, CounterEvent, Settings, Task } from './types';
import type { ProgressTask } from '../lib/progress';
import type { StreakCounter, StreakEvent } from '../lib/streaks';
import type { TemplateSettings } from '../lib/templates';

// Compile-time guard (see PROGRESS.md, Step 3 notes): the full domain types must stay
// assignable to the structural types the pure logic in src/lib was written against.
// If they ever drift, `Fits<...>` becomes false and this file fails `tsc -b`.
type Fits<A, B> = A extends B ? true : false;

const check: [
  Fits<Settings, TemplateSettings>,
  Fits<Task, ProgressTask>,
  Fits<Counter, StreakCounter>,
  Fits<CounterEvent, StreakEvent>,
] = [true, true, true, true];

describe('domain types satisfy the lib structural types', () => {
  it('all four fit', () => {
    expect(check).toEqual([true, true, true, true]);
  });
});
