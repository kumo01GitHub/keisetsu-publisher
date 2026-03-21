import Papa from 'papaparse';
import i18n from '../i18n';

/**
 * Editable card shape used by the publisher deck editor before export.
 */
export type CardDraft = {
  /** Stable card id stored in the exported database. */
  id: string;
  /** Front-side text shown to the learner. */
  term: string;
  /** Short answer or definition shown in study and test modes. */
  summary: string;
  /** Optional long-form explanation or example sentence. */
  detail: string;
  /** Optional grouping label used for filtering and display. */
  category: string;
};

type CsvRow = Record<string, string>;

/**
 * Creates a blank card row for the editor UI.
 */
export function makeEmptyCard(): CardDraft {
  return {
    id: '',
    term: '',
    summary: '',
    detail: '',
    category: '',
  };
}

/**
 * Converts user-provided deck ids into filesystem-safe slugs.
 */
export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'new-deck';
}

/**
 * Builds the canonical `.kdb` file name used by the database and mobile apps.
 */
export function makeDeckFileName(deckId: string): string {
  return `${slugify(deckId)}.kdb`;
}

/**
 * Normalizes editor rows into exportable cards by trimming fields,
 * backfilling missing ids, and dropping incomplete records.
 */
export function normalizeCards(cards: CardDraft[]): CardDraft[] {
  return cards
    .map((card, index) => ({
      id: card.id.trim() || `${index + 1}`,
      term: card.term.trim(),
      summary: card.summary.trim(),
      detail: card.detail.trim(),
      category: card.category.trim(),
    }))
    .filter((card) => card.term.length > 0 && card.summary.length > 0);
}

/**
 * Parses CSV input from spreadsheets and maps common column aliases
 * onto the publisher editor's card model.
 */
export function parseCsvRows(csvText: string): CardDraft[] {
  const parsed = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
  });

  if (parsed.errors.length > 0) {
    const first = parsed.errors[0];
    throw new Error(i18n.t('error.csvParseFailed', { message: first.message }));
  }

  return parsed.data.map((row, index) => ({
    id: String(row.id ?? row.ID ?? '').trim() || `${index + 1}`,
    term: String(row.term ?? row.word ?? row.front ?? '').trim(),
    summary: String(row.summary ?? row.meaning ?? row.back ?? '').trim(),
    detail: String(row.detail ?? row.example ?? row.note ?? '').trim(),
    category: String(row.category ?? row.tag ?? '').trim(),
  }));
}
