const ja = {
  hero: {
    kicker: 'keisetsu publisher',
    heading: 'kdb Builder / Deck Editor',
    lead: '新規作成、CSV作成、既存kdb更新を1画面で行い、配布用のkdbとdeck jsonを生成します。',
    newDeck: '新規作成',
    importCsv: 'CSVから作成',
    importKdb: 'kdbを読み込んで更新',
  },
  deckMeta: {
    heading: '単語帳メタデータ',
    deckId: 'Deck ID',
    title: 'タイトル',
    description: '説明',
    language: '言語コード',
    outputFile: '生成ファイル',
    validCards: '有効カード件数',
  },
  editor: {
    heading: 'カード編集',
    addRow: '行を追加',
    delete: '削除',
  },
  download: {
    heading: '出力',
    lead: '配布向けのkdbとdeck jsonをボタンクリックでダウンロードできます。',
    kdbOnly: 'kdbのみダウンロード',
    manifestOnly: 'deck jsonのみダウンロード',
    bundle: 'kdb + deck json を同時ダウンロード',
  },
  defaults: {
    starterDeckTitle: 'スターター基本単語帳',
    starterDeckDescription: '管理画面から作成した単語帳です。',
    starterDeckLanguage: 'ja',
    newDeckTitle: '新しい単語帳',
    newDeckDescription: '新規作成した単語帳です。',
    newDeckLanguage: 'ja',
  },
  status: {
    newDeckStarted: '新規単語帳の編集を開始しました。',
    csvImported: 'CSVから {{count}} 件を読み込みました。',
    kdbImported: 'kdbを読み込みました。カード件数: {{count}}',
    kdbDownloaded: 'kdbを出力しました: {{fileName}}',
    manifestDownloaded: 'deck jsonを出力しました: {{fileName}}',
    bundleDownloaded: 'kdb + deck json の同梱ZIPを出力しました。',
  },
  error: {
    titleRequired: '単語帳タイトルを入力してください。',
    noCards: 'term と summary が入ったカードを1件以上作成してください。',
    csvFailed: 'CSVの取り込みに失敗しました。',
    kdbFailed: 'kdbの読み込みに失敗しました。',
    cardsTableNotFound: 'cards テーブルが見つかりません。',
    csvParseFailed: 'CSV解析に失敗しました: {{message}}',
  },
} as const;

export default ja;
