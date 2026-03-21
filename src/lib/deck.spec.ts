import { describe, expect, test } from 'vitest';

import {
  makeDeckFileName,
  normalizeCards,
  parseCsvRows,
  slugify,
} from './deck';

describe('deck helpers', () => {
  test('slugify creates safe id', () => {
    expect(slugify(' Starter Basic Deck ')).toBe('starter-basic-deck');
    expect(slugify('***')).toBe('new-deck');
  });

  test('makeDeckFileName appends .kdb', () => {
    expect(makeDeckFileName('starter-basic')).toBe('starter-basic.kdb');
  });

  test('normalizeCards trims and filters incomplete cards', () => {
    const cards = normalizeCards([
      {
        id: '  ',
        term: '  keep ',
        summary: ' going  ',
        detail: ' note ',
        category: ' tag ',
      },
      {
        id: '2',
        term: ' ',
        summary: 'missing term',
        detail: '',
        category: '',
      },
    ]);

    expect(cards).toEqual([
      {
        id: '1',
        term: 'keep',
        summary: 'going',
        detail: 'note',
        category: 'tag',
      },
    ]);
  });

  test('normalizeCards assigns id fallback when id is missing', () => {
    const cards = normalizeCards([
      {
        id: '',
        term: 'alpha',
        summary: 'first',
        detail: '',
        category: '',
      },
      {
        id: '',
        term: 'beta',
        summary: 'second',
        detail: '',
        category: '',
      },
    ]);

    expect(cards).toEqual([
      {
        id: '1',
        term: 'alpha',
        summary: 'first',
        detail: '',
        category: '',
      },
      {
        id: '2',
        term: 'beta',
        summary: 'second',
        detail: '',
        category: '',
      },
    ]);
  });

  test('parseCsvRows maps aliases', () => {
    const rows = parseCsvRows('word,meaning,example,tag\nhello,こんにちは,greet,basic\n');

    expect(rows).toEqual([
      {
        id: '1',
        term: 'hello',
        summary: 'こんにちは',
        detail: 'greet',
        category: 'basic',
      },
    ]);
  });

  test('parseCsvRows maps explicit id and canonical headers', () => {
    const rows = parseCsvRows('id,term,summary,detail,category\n42,term A,summary A,detail A,cat A\n');

    expect(rows).toEqual([
      {
        id: '42',
        term: 'term A',
        summary: 'summary A',
        detail: 'detail A',
        category: 'cat A',
      },
    ]);
  });

  test('parseCsvRows throws when csv is malformed', () => {
    expect(() => parseCsvRows('id,term,summary\n"1,hello,world\n')).toThrow(/CSV/);
  });
});
