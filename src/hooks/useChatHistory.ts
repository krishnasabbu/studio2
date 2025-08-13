import { useState, useEffect, useCallback } from 'react';
import { Message, ChatSession } from '../components/chatbot/types';

const STORAGE_KEY = 'chat-history';
const CURRENT_CHAT_KEY = 'current-chat-id';

export const useChatHistory = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('default');
  const [messages, setMessages] = useState<Message[]>([]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(STORAGE_KEY);
      const savedCurrentId = localStorage.getItem(CURRENT_CHAT_KEY);
      
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        // Convert timestamp strings back to Date objects
        const sessionsWithDates = parsedSessions.map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatSessions(sessionsWithDates);
      }
      
      if (savedCurrentId) {
        setCurrentChatId(savedCurrentId);
      }
    } catch (error) {
      console.warn('Failed to load chat history:', error);
    }
  }, []);

  // Save chat sessions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions));
    } catch (error) {
      console.warn('Failed to save chat history:', error);
    }
  }, [chatSessions]);

  // Save current chat ID to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_CHAT_KEY, currentChatId);
    } catch (error) {
      console.warn('Failed to save current chat ID:', error);
    }
  }, [currentChatId]);

  // Load messages for current chat
  useEffect(() => {
    const currentSession = chatSessions.find(session => session.id === currentChatId);
    if (currentSession) {
      setMessages(currentSession.messages);
    } else {
      setMessages([]);
    }
  }, [currentChatId, chatSessions]);

  const saveCurrentChat = useCallback((chatMessages: Message[]) => {
    // Runtime check to ensure chatMessages is an array
    if (!Array.isArray(chatMessages)) {
      console.error('saveCurrentChat: chatMessages is not an array:', chatMessages);
      return;
    }
    
    if (chatMessages.length === 0) return;

    const title = chatMessages.find(msg => msg.sender === 'user')?.content.slice(0, 50) + '...' || 'New Chat';
    const preview = chatMessages.find(msg => msg.sender === 'user')?.content.slice(0, 100) + '...' || '';

    setChatSessions(prev => {
      const existingIndex = prev.findIndex(session => session.id === currentChatId);
      const updatedSession: ChatSession = {
        id: currentChatId,
        title,
        timestamp: new Date(),
        preview,
        messages: chatMessages
      };

      if (existingIndex >= 0) {
        // Update existing session
        const updated = [...prev];
        updated[existingIndex] = updatedSession;
        return updated;
      } else {
        // Add new session
        return [updatedSession, ...prev];
      }
    });
  }, [currentChatId]);

  const createNewChat = useCallback(() => {
    const newChatId = 'chat-' + Date.now();
    setCurrentChatId(newChatId);
    setMessages([]);
    return newChatId;
  }, []);

  const selectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== chatId));
    if (currentChatId === chatId) {
      createNewChat();
    }
  }, [currentChatId, createNewChat]);

  const updateMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
    // Auto-save after a delay to avoid too frequent saves
    const timeoutId = setTimeout(() => {
      saveCurrentChat(newMessages);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [saveCurrentChat]);

  return {
    chatSessions,
    currentChatId,
    messages,
    createNewChat,
    selectChat,
    deleteChat,
    updateMessages,
    saveCurrentChat
  };
};