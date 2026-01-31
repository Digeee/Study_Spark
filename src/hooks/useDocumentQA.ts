import { useState } from 'react';
import { Document, DocumentQAConversation, QAMessage } from '@/types/study';
import { answerDocumentQuestion } from '@/integrations/ai/gemini';

export function useDocumentQA(document: Document) {
  const [conversation, setConversation] = useState<DocumentQAConversation>({
    id: `conv_${document.id}`,
    documentId: document.id,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const askQuestion = async (question: string) => {
    if (!question.trim()) return;

    try {
      setIsLoading(true);
      
      // Add user message
      const userMessage: QAMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: question,
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        updatedAt: new Date().toISOString()
      }));
      
      // Get AI response
      const { answer, citations } = await answerDocumentQuestion(
        document,
        question,
        conversation.messages
      );
      
      // Add AI message
      const aiMessage: QAMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date().toISOString(),
        citations: citations
      };
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        updatedAt: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('QA failed:', error);
      
      // Add error message
      const errorMessage: QAMessage = {
        id: `msg_${Date.now() + 2}`,
        role: 'assistant',
        content: "Sorry, I couldn't process your question. Please try again.",
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        updatedAt: new Date().toISOString()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setConversation({
      id: `conv_${document.id}`,
      documentId: document.id,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const getRecentQuestions = (limit: number = 5) => {
    return conversation.messages
      .filter(msg => msg.role === 'user')
      .slice(-limit)
      .map(msg => msg.content);
  };

  return {
    conversation,
    isLoading,
    askQuestion,
    clearConversation,
    getRecentQuestions
  };
}