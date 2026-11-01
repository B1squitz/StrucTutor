import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Ensure worker is configured for browser runtime
if (typeof window !== 'undefined' && 'GlobalWorkerOptions' in pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

export interface TextChunk {
  id: string;
  sourceDoc: string;
  chunkIndex: number;
  text: string;
  embedding: number[];
  createdAt: string;
}

export interface ChunkSimilarityResult {
  chunk: TextChunk;
  similarity: number;
}

export interface IngestionProgress {
  stage: 'reading' | 'extracting' | 'chunking' | 'embedding' | 'storing' | 'done';
  current?: number;
  total?: number;
  message: string;
}

const DB_NAME = 'structtutor_rag_db';
const DB_VERSION = 1;
const STORE_NAME = 'chunks';

function openRagDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open RAG IndexedDB'));
  });
}

export async function storeChunks(chunks: TextChunk[]): Promise<void> {
  const db = await openRagDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const chunk of chunks) {
      store.put(chunk);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Failed to store chunks'));
  });
}

export async function getAllChunks(): Promise<TextChunk[]> {
  const db = await openRagDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error('Failed to get chunks'));
  });
}

export async function getStoredChunksCount(): Promise<number> {
  const db = await openRagDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.count();
    request.onsuccess = () => resolve(request.result || 0);
    request.onerror = () => reject(request.error || new Error('Failed to count chunks'));
  });
}

export async function clearRagIndex(): Promise<void> {
  const db = await openRagDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error('Failed to clear chunks'));
  });
}

export async function extractTextFromPdf(fileOrBuffer: ArrayBuffer | Uint8Array): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({
    data: fileOrBuffer instanceof Uint8Array ? fileOrBuffer : new Uint8Array(fileOrBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageString = textContent.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageString) {
      pageTexts.push(`[Page ${pageNum}]\n${pageString}`);
    }
  }

  return pageTexts.join('\n\n');
}

export function chunkText(
  text: string,
  chunkSize: number = 800,
  overlap: number = 100
): string[] {
  const clean = text.trim();
  if (!clean) return [];
  if (clean.length <= chunkSize) return [clean];

  const chunks: string[] = [];
  let startIndex = 0;
  const step = Math.max(1, chunkSize - overlap);

  while (startIndex < clean.length) {
    const endIndex = Math.min(startIndex + chunkSize, clean.length);
    const chunk = clean.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    if (endIndex >= clean.length) break;
    startIndex += step;
  }

  return chunks;
}

export async function generateEmbedding(
  text: string,
  model: string = 'nomic-embed-text'
): Promise<number[]> {
  const response = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.embedding)) {
    throw new Error('Invalid embedding response from Ollama');
  }

  return data.embedding as number[];
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

export async function findSimilarChunks(
  queryEmbedding: number[],
  topK: number = 3
): Promise<ChunkSimilarityResult[]> {
  const allChunks = await getAllChunks();
  if (allChunks.length === 0) return [];

  const scored: ChunkSimilarityResult[] = allChunks.map((chunk) => ({
    chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

export async function ingestPdfTextbook(
  file: File,
  onProgress?: (p: IngestionProgress) => void
): Promise<number> {
  onProgress?.({ stage: 'reading', message: `Reading "${file.name}"...` });
  const buffer = await file.arrayBuffer();

  onProgress?.({ stage: 'extracting', message: 'Extracting text from PDF pages...' });
  const fullText = await extractTextFromPdf(buffer);

  if (!fullText.trim()) {
    throw new Error('No readable text could be extracted from this PDF.');
  }

  onProgress?.({ stage: 'chunking', message: 'Chunking text into passages...' });
  const textChunks = chunkText(fullText, 800, 100);

  onProgress?.({
    stage: 'embedding',
    current: 0,
    total: textChunks.length,
    message: `Generating embeddings with nomic-embed-text (0/${textChunks.length})...`,
  });

  const chunksToStore: TextChunk[] = [];
  const baseId = `doc-${Date.now()}`;

  for (let i = 0; i < textChunks.length; i++) {
    const chunkStr = textChunks[i];
    const embedding = await generateEmbedding(chunkStr);
    chunksToStore.push({
      id: `${baseId}-chk-${i}`,
      sourceDoc: file.name,
      chunkIndex: i,
      text: chunkStr,
      embedding,
      createdAt: new Date().toISOString(),
    });

    onProgress?.({
      stage: 'embedding',
      current: i + 1,
      total: textChunks.length,
      message: `Generating embeddings with nomic-embed-text (${i + 1}/${textChunks.length})...`,
    });
  }

  onProgress?.({ stage: 'storing', message: 'Storing index in IndexedDB...' });
  await storeChunks(chunksToStore);

  onProgress?.({
    stage: 'done',
    message: `Successfully indexed ${chunksToStore.length} chunks from "${file.name}".`,
  });
  return chunksToStore.length;
}
