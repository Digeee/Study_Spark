import { useState, useEffect } from 'react';
import { Document, DocumentAnalysis } from '@/types/study';
import { analyzeDocument, summarizeDocument, generateFlashcardsFromDocument } from '@/integrations/ai/huggingface';
import { toast } from '@/hooks/use-toast';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('study-documents');
    return saved ? JSON.parse(saved) : [];
  });

  const [analyses, setAnalyses] = useState<DocumentAnalysis[]>(() => {
    const saved = localStorage.getItem('document-analyses');
    return saved ? JSON.parse(saved) : [];
  });


  // Store flashcards map: documentId -> Flashcard[]
  const [flashcardsMap, setFlashcardsMap] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem('document-flashcards');
    return saved ? JSON.parse(saved) : {};
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('study-documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('document-analyses', JSON.stringify(analyses));
  }, [analyses]);

  useEffect(() => {
    localStorage.setItem('document-flashcards', JSON.stringify(flashcardsMap));
  }, [flashcardsMap]);

  const addDocument = async (document: Document) => {
    try {
      setIsLoading(true);

      // Add document with processing status
      const newDoc = { ...document, status: 'processing' as const };
      setDocuments(prev => [...prev, newDoc]);

      // Analyze document with AI
      const analysis = await analyzeDocument(document);

      // Generate Flashcards automatically immediately
      const cards = await generateFlashcardsFromDocument(document, 5);
      setFlashcardsMap(prev => ({ ...prev, [document.id]: cards }));

      // Update document status and add analysis
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === document.id
            ? { ...doc, status: 'ready' as const, summary: analysis.keyPoints.join(', ') }
            : doc
        )
      );

      setAnalyses(prev => [...prev, analysis]);

      toast({
        title: "Document Processed",
        description: `${document.name} processed! ${cards.length} flashcards created.`
      });

    } catch (error) {
      console.error('Document processing failed:', error);

      // Update document status to error
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === document.id
            ? { ...doc, status: 'error' as const }
            : doc
        )
      );

      toast({
        title: "Processing Failed",
        description: "Document was uploaded but processing failed. You can try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    setAnalyses(prev => prev.filter(analysis => analysis.documentId !== id));
    setFlashcardsMap(prev => {
      const newMap = { ...prev };
      delete newMap[id];
      return newMap;
    });

    toast({
      title: "Document Removed",
      description: "Document has been deleted from your library"
    });
  };

  const getDocumentAnalysis = (documentId: string) => {
    return analyses.find(a => a.documentId === documentId);
  };

  const getDocumentFlashcards = (documentId: string) => {
    return flashcardsMap[documentId] || [];
  };

  const refreshAnalysis = async (documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    try {
      setIsLoading(true);
      const analysis = await analyzeDocument(document);
      const cards = await generateFlashcardsFromDocument(document, 5);

      setAnalyses(prev => [...prev.filter(a => a.documentId !== documentId), analysis]);
      setFlashcardsMap(prev => ({ ...prev, [documentId]: cards }));

      toast({
        title: "Analysis Updated",
        description: "Document analysis and flashcards have been refreshed"
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to refresh document analysis",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async (documentId: string, length: 'short' | 'medium' | 'long' = 'medium') => {
    const document = documents.find(d => d.id === documentId);
    if (!document) return null;

    try {
      setIsLoading(true);
      const summary = await summarizeDocument(document, length);

      // Update document with new summary
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, summary }
            : doc
        )
      );

      return summary;
    } catch (error) {
      toast({
        title: "Summary Failed",
        description: "Failed to generate document summary",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateFlashcards = async (documentId: string, count: number = 5) => {
    const document = documents.find(d => d.id === documentId);
    if (!document) return [];

    try {
      setIsLoading(true);
      const flashcards = await generateFlashcardsFromDocument(document, count);
      return flashcards;
    } catch (error) {
      toast({
        title: "Flashcards Failed",
        description: "Failed to generate flashcards from document",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id ? { ...doc, ...updates } : doc
      )
    );
  };

  const getDocumentsBySubject = (subject: string) => {
    return documents.filter(doc =>
      doc.summary.toLowerCase().includes(subject.toLowerCase()) ||
      doc.name.toLowerCase().includes(subject.toLowerCase())
    );
  };

  const getTotalDocuments = () => documents.length;

  const getReadyDocuments = () => documents.filter(doc => doc.status === 'ready').length;

  const getProcessingDocuments = () => documents.filter(doc => doc.status === 'processing').length;

  return {
    documents,
    analyses,
    isLoading,
    addDocument,
    deleteDocument,
    getDocumentAnalysis,
    getDocumentFlashcards,
    refreshAnalysis,
    generateSummary,
    generateFlashcards,
    updateDocument,
    getDocumentsBySubject,
    getTotalDocuments,
    getReadyDocuments,
    getProcessingDocuments
  };
}