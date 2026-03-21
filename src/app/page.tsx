'use client';

import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import JSZip from 'jszip';
import initSqlJs, { type SqlJsStatic } from 'sql.js';

import '../i18n';
import i18n from '../i18n';
import styles from './page.module.css';
import {
  makeDeckFileName,
  makeEmptyCard,
  normalizeCards,
  parseCsvRows,
  slugify,
  type CardDraft,
} from '../lib/deck';

const CARD_HEADERS = ['id', 'term', 'summary', 'detail', 'category'] as const;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS deck_metadata (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  display_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  term TEXT NOT NULL,
  summary TEXT NOT NULL,
  detail TEXT DEFAULT '',
  category TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cards_term ON cards(term);
CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category);
`;

let sqlEnginePromise: Promise<SqlJsStatic> | null = null;

/**
 * Lazily loads and caches the sql.js runtime used to read and write `.kdb` files in the browser.
 */
function getSqlEngine() {
  if (!sqlEnginePromise) {
    sqlEnginePromise = initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }

  return sqlEnginePromise;
}

/**
 * Triggers a browser download for generated deck artifacts.
 */
function downloadBlob(fileName: string, payload: Blob) {
  const url = URL.createObjectURL(payload);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Builds a SQLite-backed `.kdb` file in memory from the current deck metadata and cards.
 */
async function buildKdbFileBytes(
  deckTitle: string,
  deckFileName: string,
  cards: CardDraft[]
): Promise<Uint8Array> {
  const SQL = await getSqlEngine();
  const db = new SQL.Database();

  db.run(SCHEMA_SQL);
  db.run(
    `INSERT INTO deck_metadata (id, display_name, file_name)
     VALUES (1, ?, ?)
     ON CONFLICT(id)
     DO UPDATE SET display_name = excluded.display_name, file_name = excluded.file_name, updated_at = CURRENT_TIMESTAMP`,
    [deckTitle, deckFileName]
  );

  const statement = db.prepare(
    `INSERT INTO cards (id, term, summary, detail, category)
     VALUES (?, ?, ?, ?, ?)`
  );

  for (const card of cards) {
    statement.run([card.id, card.term, card.summary, card.detail, card.category]);
  }

  statement.free();
  const bytes = db.export();
  db.close();

  return bytes;
}

/**
 * Reads an existing `.kdb` file and converts it into editable publisher state.
 */
async function parseKdbFile(file: File): Promise<{
  displayName: string;
  fileName: string;
  cards: CardDraft[];
}> {
  const SQL = await getSqlEngine();
  const buffer = await file.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buffer));

  const cardsTable = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='cards' LIMIT 1"
  );

  if (cardsTable.length === 0) {
    db.close();
    throw new Error(i18n.t('error.cardsTableNotFound'));
  }

  const metadataResult = db.exec(
    'SELECT display_name, file_name FROM deck_metadata ORDER BY id ASC LIMIT 1'
  );
  const cardsResult = db.exec(
    'SELECT id, term, summary, COALESCE(detail, ""), COALESCE(category, "") FROM cards ORDER BY term COLLATE NOCASE'
  );

  const metadataRow = metadataResult[0]?.values?.[0] ?? [];
  const displayName = String(metadataRow[0] ?? '').trim();
  const fileName = String(metadataRow[1] ?? file.name ?? 'imported.kdb').trim();

  const cards = (cardsResult[0]?.values ?? []).map((row: unknown[]) => ({
    id: String(row[0] ?? '').trim(),
    term: String(row[1] ?? '').trim(),
    summary: String(row[2] ?? '').trim(),
    detail: String(row[3] ?? '').trim(),
    category: String(row[4] ?? '').trim(),
  }));

  db.close();

  return {
    displayName: displayName || 'Imported Deck',
    fileName,
    cards,
  };
}

/**
 * Main publisher screen for creating, importing, editing, and exporting deck files.
 */
export default function Home() {
  const { t } = useTranslation();
  const [deckId, setDeckId] = useState('starter-basic');
  const [deckTitle, setDeckTitle] = useState(() => t('defaults.starterDeckTitle'));
  const [deckDescription, setDeckDescription] = useState(() => t('defaults.starterDeckDescription'));
  const [deckLanguage, setDeckLanguage] = useState(() => t('defaults.starterDeckLanguage'));
  const [cards, setCards] = useState<CardDraft[]>([makeEmptyCard()]);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const normalizedCards = useMemo(() => normalizeCards(cards), [cards]);
  const deckFileName = useMemo(() => makeDeckFileName(deckId), [deckId]);

  function clearNotice() {
    setStatusMessage('');
    setErrorMessage('');
  }

  /**
   * Applies a field change to a single card row in the editor table.
   */
  function updateCard(index: number, key: keyof CardDraft, value: string) {
    setCards((current) =>
      current.map((card, currentIndex) =>
        currentIndex === index ? { ...card, [key]: value } : card
      )
    );
  }

  /**
   * Appends a new blank row to the current deck.
   */
  function appendCard() {
    setCards((current) => [...current, makeEmptyCard()]);
  }

  /**
   * Removes a card row while keeping at least one editable row visible.
   */
  function removeCard(index: number) {
    setCards((current) => {
      if (current.length <= 1) {
        return [makeEmptyCard()];
      }

      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  /**
   * Resets the editor to a fresh deck template.
   */
  function createNewDeck() {
    setDeckId('new-deck');
    setDeckTitle(t('defaults.newDeckTitle'));
    setDeckDescription(t('defaults.newDeckDescription'));
    setDeckLanguage(t('defaults.newDeckLanguage'));
    setCards([makeEmptyCard()]);
    setStatusMessage(t('status.newDeckStarted'));
    setErrorMessage('');
  }

  /**
   * Imports card rows from a CSV file into the editor.
   */
  async function onImportCsv(event: ChangeEvent<HTMLInputElement>) {
    clearNotice();
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const csvText = await file.text();
      const importedCards = parseCsvRows(csvText);
      setCards(importedCards.length > 0 ? importedCards : [makeEmptyCard()]);
      setStatusMessage(t('status.csvImported', { count: importedCards.length }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('error.csvFailed'));
    } finally {
      event.target.value = '';
    }
  }

  /**
   * Imports an existing `.kdb` deck and hydrates the editor form.
   */
  async function onImportKdb(event: ChangeEvent<HTMLInputElement>) {
    clearNotice();
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const imported = await parseKdbFile(file);
      setDeckId(imported.fileName.replace(/\.kdb$/i, ''));
      setDeckTitle(imported.displayName);
      setCards(imported.cards.length > 0 ? imported.cards : [makeEmptyCard()]);
      setStatusMessage(t('status.kdbImported', { count: imported.cards.length }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('error.kdbFailed'));
    } finally {
      event.target.value = '';
    }
  }

  /**
   * Creates the catalog manifest consumed by the database repository and mobile app.
   */
  function makeDeckManifest() {
    return {
      id: slugify(deckId),
      title: deckTitle.trim(),
      description: deckDescription.trim(),
      path: `databases/${deckFileName}`,
      language: deckLanguage.trim() || 'ja',
      cardCount: normalizedCards.length,
    };
  }

  /**
   * Exports only the SQLite deck file.
   */
  async function downloadKdbOnly() {
    clearNotice();

    if (!deckTitle.trim()) {
      setErrorMessage(t('error.titleRequired'));
      return;
    }

    if (normalizedCards.length === 0) {
      setErrorMessage(t('error.noCards'));
      return;
    }

    const kdbBytes = await buildKdbFileBytes(deckTitle.trim(), deckFileName, normalizedCards);
    const payload = Uint8Array.from(kdbBytes);
    downloadBlob(deckFileName, new Blob([payload], { type: 'application/octet-stream' }));
    setStatusMessage(t('status.kdbDownloaded', { fileName: deckFileName }));
  }

  /**
   * Exports only the JSON manifest for catalog publication.
   */
  function downloadManifestOnly() {
    clearNotice();

    if (!deckTitle.trim()) {
      setErrorMessage(t('error.titleRequired'));
      return;
    }

    const manifest = makeDeckManifest();
    const manifestName = `${manifest.id}.json`;
    downloadBlob(
      manifestName,
      new Blob([`${JSON.stringify(manifest, null, 2)}\n`], { type: 'application/json' })
    );
    setStatusMessage(t('status.manifestDownloaded', { fileName: manifestName }));
  }

  /**
   * Exports a publishable bundle containing both the manifest and database file.
   */
  async function downloadBundle() {
    clearNotice();

    if (!deckTitle.trim()) {
      setErrorMessage(t('error.titleRequired'));
      return;
    }

    if (normalizedCards.length === 0) {
      setErrorMessage(t('error.noCards'));
      return;
    }

    const manifest = makeDeckManifest();
    const manifestName = `${manifest.id}.json`;

    const [kdbBytes, zip] = await Promise.all([
      buildKdbFileBytes(deckTitle.trim(), deckFileName, normalizedCards),
      Promise.resolve(new JSZip()),
    ]);

    zip.file(deckFileName, kdbBytes);
    zip.file(manifestName, `${JSON.stringify(manifest, null, 2)}\n`);

    const archiveBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(`${manifest.id}-bundle.zip`, archiveBlob);
    setStatusMessage(t('status.bundleDownloaded'));
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>keisetsu publisher</p>
          <h1>kdb Builder / Deck Editor</h1>
          <p className={styles.lead}>
            {t('hero.lead')}
          </p>
        </div>
        <div className={styles.heroActions}>
          <button className={styles.primaryAction} onClick={createNewDeck} type="button">
            {t('hero.newDeck')}
          </button>
          <label className={styles.secondaryAction}>
            {t('hero.importCsv')}
            <input type="file" accept=".csv,text/csv" onChange={onImportCsv} />
          </label>
          <label className={styles.secondaryAction}>
            {t('hero.importKdb')}
            <input type="file" accept=".kdb,.db,.sqlite,.sqlite3" onChange={onImportKdb} />
          </label>
        </div>
      </section>

      <section className={styles.deckMetaPanel}>
        <h2>{t('deckMeta.heading')}</h2>
        <div className={styles.metaGrid}>
          <label>
            {t('deckMeta.deckId')}
            <input value={deckId} onChange={(event) => setDeckId(event.target.value)} />
          </label>
          <label>
            {t('deckMeta.title')}
            <input value={deckTitle} onChange={(event) => setDeckTitle(event.target.value)} />
          </label>
          <label>
            {t('deckMeta.description')}
            <input
              value={deckDescription}
              onChange={(event) => setDeckDescription(event.target.value)}
            />
          </label>
          <label>
            {t('deckMeta.language')}
            <input value={deckLanguage} onChange={(event) => setDeckLanguage(event.target.value)} />
          </label>
        </div>
        <div className={styles.metaHint}>
          <span>{t('deckMeta.outputFile')}</span>
          <strong>{deckFileName}</strong>
          <span>{t('deckMeta.validCards')}</span>
          <strong>{normalizedCards.length}</strong>
        </div>
      </section>

      <section className={styles.editorPanel}>
        <div className={styles.editorHead}>
          <h2>{t('editor.heading')}</h2>
          <button className={styles.smallAction} onClick={appendCard} type="button">
            {t('editor.addRow')}
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {CARD_HEADERS.map((header) => (
                  <th key={header}>{header}</th>
                ))}
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card, index) => (
                <tr key={`card-${index}`}>
                  <td>
                    <input
                      value={card.id}
                      onChange={(event) => updateCard(index, 'id', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={card.term}
                      onChange={(event) => updateCard(index, 'term', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={card.summary}
                      onChange={(event) => updateCard(index, 'summary', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={card.detail}
                      onChange={(event) => updateCard(index, 'detail', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={card.category}
                      onChange={(event) => updateCard(index, 'category', event.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      className={styles.deleteAction}
                      onClick={() => removeCard(index)}
                      type="button"
                    >
                        {t('editor.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.downloadPanel}>
        <h2>{t('download.heading')}</h2>
        <p>{t('download.lead')}</p>
        <div className={styles.downloadActions}>
          <button className={styles.secondarySolid} onClick={() => void downloadKdbOnly()} type="button">
            {t('download.kdbOnly')}
          </button>
          <button className={styles.secondarySolid} onClick={downloadManifestOnly} type="button">
            {t('download.manifestOnly')}
          </button>
          <button className={styles.primaryAction} onClick={() => void downloadBundle()} type="button">
            {t('download.bundle')}
          </button>
        </div>
        {statusMessage ? <p className={styles.statusOk}>{statusMessage}</p> : null}
        {errorMessage ? <p className={styles.statusError}>{errorMessage}</p> : null}
      </section>
    </main>
  );
}
