import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useDocuments } from '@/hooks/useDocuments';
import {
  BookOpen,
  Plus,
  RotateCw,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Flashcards() {
  const {
    flashcards,
    currentCardIndex,
    showAnswer,
    addFlashcard,
    removeFlashcard,
    flipCard,
    nextCard,
    rateCard,
    getCurrentCard,
    getStats
  } = useFlashcards();

  const { documents, generateFlashcards: generateFromDoc } = useDocuments();
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    front: '',
    back: '',
    subject: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const currentCard = getCurrentCard();
  const stats = getStats();

  const handleCreateFlashcard = () => {
    if (!createForm.front.trim() || !createForm.back.trim()) {
      toast({
        title: "Missing Information",
        description: "Both front and back of the card are required",
        variant: "destructive"
      });
      return;
    }

    addFlashcard({
      front: createForm.front.trim(),
      back: createForm.back.trim(),
      subject: createForm.subject.trim() || 'General',
      difficulty: createForm.difficulty
    });

    setCreateForm({
      front: '',
      back: '',
      subject: '',
      difficulty: 'medium'
    });

    toast({
      title: "Flashcard Created",
      description: "Your flashcard has been added to the deck"
    });
  };

  const generateFromDocument = async () => {
    if (!selectedDocument) {
      toast({
        title: "No Document Selected",
        description: "Please select a document first",
        variant: "destructive"
      });
      return;
    }

    const document = documents.find(d => d.id === selectedDocument);
    if (!document) return;

    try {
      setIsGenerating(true);

      const generatedCards = await generateFromDoc(document.id, 5);

      generatedCards.forEach((card: any) => {
        addFlashcard({
          front: card.front,
          back: card.back,
          subject: document.name,
          difficulty: card.difficulty || 'medium'
        });
      });

      toast({
        title: "Flashcards Generated",
        description: `Created ${generatedCards.length} flashcards from ${document.name}`
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate flashcards from document",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-700 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  return (
    <div className="w-full">
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
              Flashcards
            </h1>
            <p className="text-muted-foreground mt-2">
              Study smarter with AI-powered spaced repetition
            </p>
          </div>

          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="gradient-primary text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? 'Cancel' : 'Create Card'}
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Cards</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.due}</p>
              <p className="text-sm text-muted-foreground">Due Today</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.new}</p>
              <p className="text-sm text-muted-foreground">New Cards</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.mastered}</p>
              <p className="text-sm text-muted-foreground">Mastered</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Create Form */}
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Create New Flashcard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Front (Question/Term)</Label>
                    <Textarea
                      placeholder="Enter the term, question, or concept"
                      value={createForm.front}
                      onChange={(e) => setCreateForm({ ...createForm, front: e.target.value })}
                      className="glass-input mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Back (Answer/Definition)</Label>
                    <Textarea
                      placeholder="Enter the definition, answer, or explanation"
                      value={createForm.back}
                      onChange={(e) => setCreateForm({ ...createForm, back: e.target.value })}
                      className="glass-input mt-1"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Subject</Label>
                    <Input
                      placeholder="e.g., Biology, History, Mathematics"
                      value={createForm.subject}
                      onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                      className="glass-input mt-1"
                    />
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select
                      value={createForm.difficulty}
                      onValueChange={(value: any) => setCreateForm({ ...createForm, difficulty: value })}
                    >
                      <SelectTrigger className="glass-input mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleCreateFlashcard}
                    className="gradient-primary text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Flashcard
                  </Button>

                  <div className="flex-1">
                    <Label>Or generate from document</Label>
                    <div className="flex gap-2 mt-1">
                      <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                        <SelectTrigger className="glass-input flex-1">
                          <SelectValue placeholder="Select a document" />
                        </SelectTrigger>
                        <SelectContent>
                          {documents.filter(d => d.status === 'ready').map(doc => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={generateFromDocument}
                        disabled={isGenerating || !selectedDocument}
                        variant="outline"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Flashcard Study Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Flashcard */}
          <div className="lg:col-span-2">
            {flashcards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Flashcards Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first flashcard or generate some from your documents
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Flashcard
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={currentCardIndex}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass-card h-96 flex flex-col">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        Card {currentCardIndex + 1} of {flashcards.length}
                      </CardTitle>
                      <Badge className={getDifficultyColor(currentCard?.difficulty || 'medium')}>
                        {currentCard?.difficulty}
                      </Badge>
                    </div>
                    {currentCard?.subject && (
                      <CardDescription>{currentCard.subject}</CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
                    <div
                      className="w-full max-w-md h-64 flex items-center justify-center cursor-pointer group"
                      onClick={flipCard}
                    >
                      <div className="text-center p-6 bg-muted/30 rounded-xl border-2 border-dashed border-muted w-full h-full flex items-center justify-center hover:bg-muted/50 transition-colors">
                        {showAnswer ? (
                          <div>
                            <p className="text-lg font-medium mb-4">Answer:</p>
                            <p className="text-xl">{currentCard?.back}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg font-medium mb-4">Question:</p>
                            <p className="text-xl">{currentCard?.front}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      Click card to flip
                    </div>
                  </CardContent>

                  {/* Rating Buttons */}
                  {showAnswer && (
                    <div className="p-4 border-t flex justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rateCard('again')}
                        className="flex items-center gap-1"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Again
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rateCard('hard')}
                        className="flex items-center gap-1"
                      >
                        Hard
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rateCard('good')}
                        className="flex items-center gap-1"
                      >
                        Good
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rateCard('easy')}
                        className="flex items-center gap-1"
                      >
                        Easy
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Study Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={flipCard}
                  disabled={!currentCard}
                  className="w-full"
                  variant="outline"
                >
                  {showAnswer ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Answer
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Answer
                    </>
                  )}
                </Button>

                <Button
                  onClick={nextCard}
                  disabled={!currentCard}
                  className="w-full gradient-primary text-white"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Next Card
                </Button>
              </CardContent>
            </Card>

            {flashcards.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completed</span>
                      <span>{currentCardIndex + 1}/{flashcards.length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}