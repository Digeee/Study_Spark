import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { documentUtils } from '@/services/pdfProcessor';
import { Document } from '@/types/study';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PDFUploaderProps {
  onUploadComplete: (document: Document) => void;
  onCancel?: () => void;
  maxFileSize?: number; // in bytes
}

export function PDFUploader({ onUploadComplete, onCancel, maxFileSize = 5 * 1024 * 1024 }: PDFUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File Too Large",
        description: `File exceeds ${documentUtils.formatFileSize(maxFileSize)} limit`,
        variant: "destructive"
      });
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setProgress(10);

    try {
      // Read file as text directly (No complex PDF parsing)
      const text = await file.text();

      if (text.length < 50) {
        throw new Error("File content is too short. Please add more text.");
      }

      setProgress(50);
      setPreview(text.substring(0, 500) + "...");

      // Simulate processing delay for UX
      setTimeout(() => {
        const document: Document = {
          id: documentUtils.generateDocumentId(),
          name: file.name.replace(/\.(txt|md|pdf)$/i, ''),
          type: 'txt',
          content: text,
          summary: '',
          fileSize: file.size,
          pageCount: Math.ceil(text.length / 3000), // Approximate pages
          uploadDate: new Date().toISOString(),
          status: 'ready' // Ready immediately
        };

        setProgress(100);

        setTimeout(() => {
          onUploadComplete(document);
          toast({
            title: "Upload Successful",
            description: "Text content loaded successfully!"
          });
        }, 500);
      }, 1000);

    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Could not read file.",
        variant: "destructive"
      });
      setIsProcessing(false);
      setProgress(0);
      setFileName(null);
    }
  }, [onUploadComplete, maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt', '.md', '.json', '.js', '.ts'], // Prioritize text
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const cancelUpload = () => {
    setIsProcessing(false);
    setProgress(0);
    setFileName(null);
    setPreview(null);
    if (onCancel) onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Study Text
          </CardTitle>
          <CardDescription>
            Drop a <strong>.txt</strong> file here. Simple and reliable.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-muted-foreground/25 hover:border-primary/50'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />

            <AnimatePresence mode="wait">
              {!isProcessing ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {isDragActive ? 'Drop text file here' : 'Drag & drop a .txt file'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Works best with Notes, Summaries, or Articles
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                  <div>
                    <p className="font-medium">Reading text content...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {fileName}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Preview */}
          <AnimatePresence>
            {preview && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <h3 className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Text Preview
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 max-h-32 overflow-y-auto text-sm font-mono">
                  <pre className="whitespace-pre-wrap">{preview}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center gap-3"
              >
                <Button
                  variant="outline"
                  onClick={cancelUpload}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
