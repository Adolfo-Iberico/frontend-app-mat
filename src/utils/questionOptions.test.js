import { describe, expect, it } from 'vitest';
import { normalizeQuestionOptions } from './questionOptions';

describe('normalizeQuestionOptions', () => {
  it('normalizes arrays of text options', () => {
    expect(normalizeQuestionOptions(['first', 'second'])).toEqual([
      { label: '', value: 'first' },
      { label: '', value: 'second' },
    ]);
  });

  it('normalizes labelled options', () => {
    expect(normalizeQuestionOptions([{ label: 'A', value: 'first' }])).toEqual([
      { label: 'A', value: 'first' },
    ]);
  });

  it('parses nested JSON-encoded option arrays', () => {
    expect(normalizeQuestionOptions(JSON.stringify(JSON.stringify(['first'])))).toEqual([
      { label: '', value: 'first' },
    ]);
  });
});
