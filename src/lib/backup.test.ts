import { describe, expect, it } from 'vitest';
import { parseBackup, summarizeBackup } from './backup';

const MINIMAL = JSON.stringify({
  version: 1,
  exportedAt: 123,
  settings: null,
  domains: [],
  habits: [],
  tasks: [],
  logs: [],
  holidays: [],
  dayOverrides: [],
  counters: [],
  counterEvents: [],
});

describe('parseBackup', () => {
  it('accepts version 1 and fills missing arrays', () => {
    const data = parseBackup(JSON.stringify({ version: 1 }));
    expect(data).not.toBeNull();
    if (data === null) return;
    expect(data.tasks).toEqual([]);
    expect(data.settings).toBeNull();
    expect(data.exportedAt).toBe(0);
  });

  it('rejects other versions and invalid JSON', () => {
    expect(parseBackup('{"version":2}')).toBeNull();
    expect(parseBackup('not json')).toBeNull();
    expect(parseBackup('null')).toBeNull();
  });

  it('drops malformed entries but keeps valid ones', () => {
    const data = parseBackup(
      JSON.stringify({
        version: 1,
        domains: [{ id: 'study', name: 'Study' }, null, 5, { name: 'No id' }],
        dayOverrides: [{ dateKey: '2026-11-04', templateKey: 'normal-off' }, {}],
      }),
    );
    expect(data).not.toBeNull();
    if (data === null) return;
    expect(data.domains).toHaveLength(1);
    expect(data.dayOverrides).toHaveLength(1);
  });
});

describe('summarizeBackup', () => {
  it('counts each section and the total', () => {
    const data = parseBackup(
      JSON.stringify({
        version: 1,
        settings: {},
        tasks: [{ id: 't1' }, { id: 't2' }],
        logs: [{ id: 'l1' }],
      }),
    );
    expect(data).not.toBeNull();
    if (data === null) return;
    const summary = summarizeBackup(data);
    expect(summary.settings).toBe(1);
    expect(summary.tasks).toBe(2);
    expect(summary.logs).toBe(1);
    expect(summary.total).toBe(4);
  });

  it('is zero for an empty backup', () => {
    const data = parseBackup(MINIMAL);
    expect(data).not.toBeNull();
    if (data === null) return;
    expect(summarizeBackup(data).total).toBe(0);
  });
});
