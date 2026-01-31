import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PDFUploader } from '@/components/PDFUploader';
import { useDocuments } from '@/hooks/useDocuments';
import { Document } from '@/types/study';
import { documentUtils } from '@/services/pdfProcessor';
import {
  BookOpen,
  Search,
  Upload,
  FileText,
  Brain,
  Trash2,
  RefreshCw,
  Star,
  Filter,
  Grid,
  List,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Documents() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const {
    documents,
    isLoading,
    addDocument,
    deleteDocument,
    getDocumentAnalysis,
    getDocumentFlashcards,
    refreshAnalysis,
    generateSummary
  } = useDocuments();

  const [searchTerm, setSearchTerm] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter documents based on search
  const filteredDocuments = useMemo(() => {
    if (!searchTerm) return documents;

    const term = searchTerm.toLowerCase();
    return documents.filter(doc =>
      doc.name.toLowerCase().includes(term) ||
      doc.summary.toLowerCase().includes(term) ||
      (getDocumentAnalysis(doc.id)?.topics.some(topic =>
        topic.toLowerCase().includes(term)
      )) ||
      doc.content.toLowerCase().includes(term)
    );
  }, [documents, searchTerm, getDocumentAnalysis]);

  const handleDocumentUpload = (document: Document) => {
    addDocument(document);
    setShowUploader(false);
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'ready': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'error': return 'bg-red-500/20 text-red-700 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-700';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700';
      case 'hard': return 'bg-red-500/20 text-red-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  if (showUploader) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gradient">Upload Documents</h1>
              <p className="text-muted-foreground mt-2">
                Add your study materials to unlock AI-powered features
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowUploader(false)}
            >
              Back to Library
            </Button>
          </div>

          <PDFUploader
            onUploadComplete={handleDocumentUpload}
            onCancel={() => setShowUploader(false)}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              Document Library
            </h1>
            <p className="text-muted-foreground mt-2">
              Your AI-enhanced study materials collection
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={() => setShowUploader(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Text
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ready to Study</p>
                  <p className="text-2xl font-bold">
                    {documents.filter(d => d.status === 'ready').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">
                    {documents.filter(d => d.status === 'processing').length}
                  </p>
                </div>
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Insights</p>
                  <p className="text-2xl font-bold">
                    {documents.filter(d => d.summary).length}
                  </p>
                </div>
                <Brain className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents by name, content, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 glass-input"
            />
          </div>
        </motion.div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? 'No matching documents' : 'No documents yet'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Upload your first text file to start building your AI-powered study library'
              }
            </p>
            <Button onClick={() => setShowUploader(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Text File
            </Button>
          </motion.div>
        )}

        {/* Documents Grid/List */}
        {filteredDocuments.length > 0 && (
          <motion.div
            layout
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }
          >
            {filteredDocuments.map((document) => {
              const analysis = getDocumentAnalysis(document.id);
              const flashcards = getDocumentFlashcards(document.id);

              return (
                <motion.div
                  key={document.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <Card className="glass-card h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {documentUtils.getDocumentIcon(document.type)}
                          <span className="truncate">{document.name}</span>
                        </CardTitle>
                        <Badge className={getStatusColor(document.status)}>
                          {getStatusIcon(document.status)}
                          <span className="ml-1 capitalize">{document.status}</span>
                        </Badge>
                      </div>

                      <CardDescription className="flex items-center gap-4 text-xs">
                        <span>{documentUtils.formatFileSize(document.fileSize)}</span>
                        <span>{documentUtils.formatDate(document.uploadDate)}</span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-grow space-y-4">
                      {/* Summary */}
                      {document.summary && (
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {document.summary}
                          </p>
                        </div>
                      )}

                      {/* Analysis Info */}
                      {analysis && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {analysis.topics.slice(0, 3).map((topic, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {flashcards.length} Cards
                              </Badge>
                            </span>
                            <span>
                              {Math.ceil(analysis.estimatedStudyTime || 10)} min
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {flashcards.length > 0 ? (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedDocId(document.id)}
                          >
                            <Brain className="h-3 w-3 mr-1" />
                            Study Cards
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            disabled={document.status !== 'ready' || isLoading}
                            onClick={() => refreshAnalysis(document.id)}
                          >
                            <Brain className="h-3 w-3 mr-1" />
                            Generate
                          </Button>
                        )}


                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteDocument(document.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Flashcard Viewer Modal */}
        {selectedDocId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedDocId(null)}
          >
            <div
              className="bg-background rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-border animate-in fade-in zoom-in duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-bold">Study Flashcards</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDocId(null)}>Close</Button>
              </div>
              <div className="p-6 h-[400px] overflow-y-auto space-y-4 bg-muted/10">
                {getDocumentFlashcards(selectedDocId).map((card: any, idx: number) => (
                  <div key={idx} className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">Card {idx + 1}</p>
                    <p className="font-medium mb-3 text-lg">{card.front}</p>
                    <div className="h-px bg-border my-3 border-dashed" />
                    <p className="text-sm text-foreground/80">{card.back}</p>
                  </div>
                ))}
                {getDocumentFlashcards(selectedDocId).length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    No cards found. Try refreshing the analysis.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}