import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDocuments } from '@/hooks/useDocuments';
import { useDocumentQA } from '@/hooks/useDocumentQA';
import { documentUtils } from '@/services/pdfProcessor';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  Lightbulb, 
  RotateCcw,
  MessageSquare,
  FileText
} from 'lucide-react';

export default function DocumentQA() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { documents, getDocumentAnalysis } = useDocuments();
  const [input, setInput] = useState('');
  
  const document = documents.find(d => d.id === documentId);
  
  // Redirect if document not found
  if (!document) {
    navigate('/documents');
    return null;
  }
  
  const { conversation, isLoading, askQuestion, clearConversation, getRecentQuestions } = useDocumentQA(document);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const analysis = getDocumentAnalysis(document.id);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      askQuestion(input);
      setInput('');
    }
  };
  
  const suggestedQuestions = [
    "What are the main concepts covered?",
    "Can you explain the key points?",
    "What should I focus on for studying?",
    "Summarize this material",
    "What are the most important topics?"
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-8 h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/documents')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Documents
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Q&A with {document.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                Ask questions about this document and get AI-powered answers
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {documentUtils.getDocumentIcon(document.type)}
              {document.type.toUpperCase()}
            </Badge>
            {analysis && (
              <Badge variant="outline">
                ⭐ {analysis.difficulty} difficulty
              </Badge>
            )}
          </div>
        </motion.div>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Main Chat Area */}
          <Card className="flex-1 flex flex-col glass-card">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Tutor
                </CardTitle>
                {conversation.messages.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearConversation}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear Chat
                  </Button>
                )}
              </div>
              <CardDescription>
                Ask anything about "{document.name}" and I'll help you understand it better
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 p-0 flex flex-col">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversation.messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Ask me anything!</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      I'm here to help you understand your study materials. 
                      Ask questions about concepts, get explanations, or request summaries.
                    </p>
                    
                    {/* Suggested Questions */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Try asking:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {suggestedQuestions.map((question, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setInput(question);
                              setTimeout(() => inputRef.current?.focus(), 100);
                            }}
                            className="text-xs"
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {conversation.messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted/50 border'
                        }`}>
                          <div className="flex items-start gap-2 mb-2">
                            {message.role === 'assistant' && (
                              <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            )}
                            {message.role === 'user' && (
                              <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            )}
                            <span className="text-xs opacity-70">
                              {message.role === 'user' ? 'You' : 'AI Tutor'} •{' '}
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                          
                          {/* Citations */}
                          {message.citations && message.citations.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <p className="text-xs font-medium mb-2 flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Relevant Excerpts:
                              </p>
                              {message.citations.map((citation, idx) => (
                                <div key={idx} className="text-xs bg-background/50 rounded p-2 mt-1">
                                  <p className="opacity-90">{citation.text}</p>
                                  {citation.pageNumber && (
                                    <p className="opacity-70 mt-1">Page {citation.pageNumber}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </AnimatePresence>
                )}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted/50 rounded-lg p-4 border flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input Area */}
              <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Ask a question about this document..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 glass-input"
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar with Document Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 hidden lg:block"
          >
            <Card className="glass-card sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Document Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">About this document</h4>
                  <p className="text-sm text-muted-foreground">
                    {document.name}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{documentUtils.formatFileSize(document.fileSize)}</span>
                    {document.pageCount && <span>{document.pageCount} pages</span>}
                  </div>
                </div>
                
                {document.summary && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      AI Summary
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {document.summary}
                    </p>
                  </div>
                )}
                
                {analysis && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Key Topics</h4>
                      <div className="flex flex-wrap gap-1">
                        {analysis.topics.map((topic, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Difficulty</p>
                        <p className="font-medium capitalize">{analysis.difficulty}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Study Time</p>
                        <p className="font-medium">
                          {Math.ceil(analysis.estimatedStudyTime / 60)} hours
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {conversation.messages.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recent Questions</h4>
                    <div className="space-y-2">
                      {getRecentQuestions(3).map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(question)}
                          className="text-left text-xs text-muted-foreground hover:text-foreground p-2 rounded bg-muted/30 w-full text-ellipsis overflow-hidden"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}