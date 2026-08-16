import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const standardFontDataUrl =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/standard_fonts/';

export const extractFileText = async (file: Uint8Array): Promise<string> => {
  if (!file?.byteLength) {
    throw new Error('extractFileText: file data is empty');
  }

  const data = new Uint8Array(file);
  const loadingTask = getDocument({ data, standardFontDataUrl });
  const doc = await loadingTask.promise;
  const pages: string[] = [];

  try {
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);

      try {
        const content = await page.getTextContent();
        const text = content.items
          .map((item) =>
            'str' in item ? item.str + (item.hasEOL ? '\n' : '') : '',
          )
          .join('');

        pages.push(text.trim());
      } finally {
        page.cleanup();
      }
    }
  } finally {
    await loadingTask.destroy();
  }

  return pages.join('\n\n').trim();
};
