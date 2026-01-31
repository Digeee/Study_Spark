import * as pdfjsLib from 'pdfjs-dist';
import { Document } from '@/types/study';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export class PDFProcessor {
  static async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Create loading task
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer
      });

      const pdf = await loadingTask.promise;

      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 10); // Reduced for better performance

      for (let i = 1; i <= maxPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .filter((str: string) => str.trim().length > 0)
            .join(' ');
          fullText += pageText + '\n\n';
        } catch (pageError) {
          console.warn(`Failed to process page ${i}:`, pageError);
          continue;
        }
      }

      return fullText.trim();
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getMetadata(file: File): Promise<{ title: string; pages: number; fileSize: number }> {
    try {
      const arrayBuffer = await file.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer
      });

      const pdf = await loadingTask.promise;

      return {
        title: file.name.replace('.pdf', ''),
        pages: pdf.numPages,
        fileSize: file.size
      };
    } catch (error) {
      console.error('PDF metadata extraction failed:', error);
      return {
        title: file.name.replace('.pdf', ''),
        pages: 1,
        fileSize: file.size
      };
    }
  }

  static async processPDF(file: File): Promise<Omit<Document, 'id' | 'uploadDate' | 'status'>> {
    try {
      const [text, metadata] = await Promise.all([
        this.extractText(file),
        this.getMetadata(file)
      ]);

      // Clean and optimize text
      const cleanedText = this.cleanText(text);

      return {
        name: metadata.title,
        type: 'pdf',
        content: cleanedText,
        summary: '',
        fileSize: metadata.fileSize,
        pageCount: metadata.pages
      };
    } catch (error) {
      console.error('PDF processing failed:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  static cleanText(text: string): string {
    // Remove excessive whitespace
    let cleaned = text.replace(/\s+/g, ' ');

    // Remove standalone page numbers
    cleaned = cleaned.replace(/\b\d+\s*\n/g, '');

    // Remove headers/footers (common patterns)
    cleaned = cleaned.replace(/^\s*\d+\s*$/gm, '');
    cleaned = cleaned.replace(/^\s*[^\n]{1,50}\s*\d+\s*$/gm, '');

    // Remove artifacts
    cleaned = cleaned.replace(/[●•▪▫■◆◇○●]/g, '');

    // Trim and normalize
    cleaned = cleaned.trim();

    // Limit length for AI processing (approximately 15,000 words)
    const words = cleaned.split(/\s+/);
    if (words.length > 15000) {
      cleaned = words.slice(0, 15000).join(' ') + '... [Content truncated for processing]';
    }

    return cleaned;
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    console.log('Validating file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return {
        isValid: false,
        error: `Invalid file type: ${file.type || 'unknown'}. Only PDF files are supported.`
      };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size (${documentUtils.formatFileSize(file.size)}) exceeds 10MB limit`
      };
    }

    // Check minimum size
    if (file.size < 1024) { // Less than 1KB
      return {
        isValid: false,
        error: 'File is too small to be a valid PDF'
      };
    }

    return { isValid: true };
  }

  static async getFilePreview(file: File, maxLines: number = 10): Promise<string> {
    try {
      console.log('Generating preview for:', file.name);
      const text = await this.extractText(file);
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const preview = lines.slice(0, maxLines).join('\n');
      console.log('Preview generated, length:', preview.length);
      return preview;
    } catch (error) {
      console.error('Preview generation failed:', error);
      return 'Preview unavailable';
    }
  }
}

// Utility functions for document management
export const documentUtils = {
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  getDocumentIcon(type: string): string {
    const icons: Record<string, string> = {
      pdf: '📄',
      txt: '📝',
      doc: '📑'
    };
    return icons[type] || '📄';
  }
};