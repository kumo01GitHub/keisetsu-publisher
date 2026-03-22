const en = {
  hero: {
    kicker: 'keisetsu publisher',
    heading: 'kdb Builder / Deck Editor',
    lead: 'Create, import from CSV, or update an existing kdb — all in one screen. Generate kdb and deck manifest for distribution.',
    newDeck: 'New deck',
    importCsv: 'Create from CSV',
    importKdb: 'Load kdb to update',
  },
  deckMeta: {
    heading: 'Deck metadata',
    deckId: 'Deck ID',
    title: 'Title',
    description: 'Description',
    language: 'Language code',
    outputFile: 'Output file',
    validCards: 'Valid cards',
  },
  editor: {
    heading: 'Card editor',
    addRow: 'Add row',
    delete: 'Delete',
  },
  download: {
    heading: 'Export',
    lead: 'Download kdb and deck manifest for distribution with a single click.',
    kdbOnly: 'Download kdb only',
    manifestOnly: 'Download deck manifest only',
    bundle: 'Download bundled ZIP',
  },
  defaults: {
    starterDeckTitle: 'Starter Basic Deck',
    starterDeckDescription: 'A deck created from the publisher panel.',
    starterDeckLanguage: 'en',
    newDeckTitle: 'New Deck',
    newDeckDescription: 'A newly created deck.',
    newDeckLanguage: 'en',
  },
  status: {
    newDeckStarted: 'Started editing a new deck.',
    csvImported: 'Imported {{count}} cards from CSV.',
    kdbImported: 'kdb loaded. Cards: {{count}}',
    kdbDownloaded: 'kdb exported: {{fileName}}',
    manifestDownloaded: 'deck manifest exported: {{fileName}}',
    bundleDownloaded: 'kdb + deck manifest bundle ZIP exported.',
  },
  error: {
    titleRequired: 'Please enter a deck title.',
    noCards: 'Please add at least one card with term and summary.',
    csvFailed: 'Failed to import CSV.',
    kdbFailed: 'Failed to load kdb.',
    cardsTableNotFound: 'cards table not found.',
    csvParseFailed: 'CSV parse error: {{message}}',
  },
} as const;

export default en;
