import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { summarizeDocument } from '@/integrations/ai/gemini';
import { Document } from '@/types/study';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download,
  Check,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NoteSummarizerProps {
  document?: Document;
  onSummaryGenerated?: (summary: string) => void;
}

export function NoteSummarizer(props: NoteSummarizerProps) {
  const { document: documentProp, onSummaryGenerated } = props;
  const [inputText, setInputText] = useState(documentProp?.content || '');
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No Content",
        description: "Please enter some text to summarize",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      // If we have a document, use the document summarization
      if (documentProp) {
        const result = await summarizeDocument(documentProp, summaryLength);
        setSummary(result);
        if (onSummaryGenerated) onSummaryGenerated(result);
      } else {
        // Fallback: create a mock document for summarization
        const mockDocument: Document = {
          id: 'temp',
          name: 'Notes',
          type: 'txt',
          content: inputText,
          summary: '',
          uploadDate: new Date().toISOString(),
          fileSize: inputText.length,
          status: 'ready'
        };
        
        const result = await summarizeDocument(mockDocument, summaryLength);
        setSummary(result);
        if (onSummaryGenerated) onSummaryGenerated(result);
      }
      
      toast({
        title: "Summary Generated",
        description: "Your notes have been successfully summarized!"
      });
      
    } catch (error) {
      toast({
        title: "Summarization Failed",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const downloadSummary = () => {
    const element = window.document.createElement('a');
    const fileName = documentProp?.name ? `${documentProp.name}_summary.txt` : 'summary.txt';
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
    
    toast({
      title: "Download Started",
      description: "Summary downloaded successfully"
    });
  };

  const getLengthDescription = () => {
    switch (summaryLength) {
      case 'short': return '5 key points';
      case 'medium': return '3-4 paragraphs';
      case 'long': return 'Detailed summary';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Note Summarizer
          </CardTitle>
          <CardDescription>
            Transform your lengthy notes into concise, actionable summaries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes-input">Your Notes</Label>
              <Textarea
                id="notes-input"
                placeholder="Paste your study notes, lecture content, or any text you want to summarize..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] glass-input mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {inputText.length} characters
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <Label>Summary Length</Label>
                <Select value={summaryLength} onValueChange={(value: any) => setSummaryLength(value)}>
                  <SelectTrigger className="glass-input mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short ({getLengthDescription()})</SelectItem>
                    <SelectItem value="medium">Medium ({getLengthDescription()})</SelectItem>
                    <SelectItem value="long">Long ({getLengthDescription()})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={generateSummary}
                disabled={isGenerating || !inputText.trim()}
                className="gradient-primary text-white whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Output Section */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Summary
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {summaryLength} format
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadSummary}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none bg-muted/30 rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {summary}
                </pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tips Section */}
      {!summary && (
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Best for:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Lecture notes and transcripts
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Research papers and articles
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Chapter summaries
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Tips for better results:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Paste complete, coherent text
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Remove unnecessary formatting
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Longer input = better context
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}