import { describe, it, expect } from 'vitest';
import memwatch from './include';

describe('node-memwatch', () => {
  it('The library exports a couple functions', () => {
    expect(memwatch.gc).toBeDefined();
    expect(memwatch.on).toBeDefined();
    expect(memwatch.once).toBeDefined();
    expect(memwatch.removeAllListeners).toBeDefined();
    expect(memwatch.HeapDiff).toBeDefined();
  });

  describe('.gc()', () => {
    it('causes a stats() event to be emitted', () => {
      return new Promise((resolve) => {
        memwatch.once('stats', (s) => {
          expect(typeof s).toBe('object');
          resolve();
        });
        memwatch.gc();
      });
    });
  });

  describe('HeapDiff', () => {
    it('detects allocations', () => {
      function LeakingClass() {};
      const arr = [];
      const hd = new memwatch.HeapDiff();
      for (let i = 0; i < 100; i++) arr.push(new LeakingClass());
      const diff = hd.end();
      expect(Array.isArray(diff.change.details)).toBe(true);
      // find the LeakingClass elem
      let leakingReport;
      diff.change.details.forEach((d) => {
        if (d.what === 'LeakingClass')
          leakingReport = d;
      });
      expect(leakingReport).toBeDefined();
      expect(leakingReport['+'] - leakingReport['-']).toBeGreaterThan(0);
    });

    it('has the correct output format', () => {
      function LeakingClass() {};
      const arr = [];
      const hd = new memwatch.HeapDiff();
      for (let i = 0; i < 100; i++) arr.push(new LeakingClass());
      expect(hd.end()).toEqual(
        expect.objectContaining({
          after: expect.objectContaining({
            nodes: expect.any(Number),
            size: expect.any(String),
            size_bytes: expect.any(Number),
          }),
          before: expect.objectContaining({
            nodes: expect.any(Number),
            size: expect.any(String),
            size_bytes: expect.any(Number),
          }),
          change: expect.objectContaining({
            allocated_nodes: expect.any(Number),
            details: expect.arrayContaining([
              expect.objectContaining({
                '+': expect.any(Number),
                '-': expect.any(Number),
                size: expect.any(String),
                size_bytes: expect.any(Number),
                what: expect.any(String),
              }),
            ]),
            freed_nodes: expect.any(Number),
            size: expect.any(String),
            size_bytes: expect.any(Number),
          }),
        })
      )
    });

    it('double end should throw', () => {
      const hd = new memwatch.HeapDiff();
      expect(() => hd.end()).not.toThrow();
      expect(() => hd.end()).toThrow();
    });

    it('improper HeapDiff allocation should throw an exception', () => {
      // equivalent to "new require('memwatch').HeapDiff()"
      // see issue #30
      expect(() => new (memwatch.HeapDiff())).toThrow();
    });
  });
});

