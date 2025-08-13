import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Menu } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ActionButtons from './ActionButtons';
import ThemeToggle from './ThemeToggle';
import NavigationPanel from './NavigationPanel';
import { Message, ChatPanelState, FileAttachment } from './types';

interface ChatPanelProps {
  isOpen: boolean;
  isMaximized: boolean;
  onClose: () => void;
  onToggleMaximize: () => void;
  messages: Message[];
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void;
  onTemplateOnboard: () => void;
  onAlertOnboard: () => void;
  panelState: ChatPanelState;
  isNavOpen: boolean;
  toggleNavigation: () => void;
  onNewChat: () => void;
  chatSessions: any[];
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  isMaximized,
  onClose,
  onToggleMaximize,
  messages,
  onSendMessage,
  onTemplateOnboard,
  onAlertOnboard,
  panelState,
  isNavOpen,
  toggleNavigation,
  onNewChat,
  chatSessions,
  currentChatId,
  onSelectChat
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  const panelVariants = {
    closed: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  // Message action handlers
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Message copied to clipboard');
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleDownload = (content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleThumbsUp = (messageId: string) => {
    console.log('Thumbs up for message:', messageId);
  };

  const handleThumbsDown = (messageId: string) => {
    console.log('Thumbs down for message:', messageId);
  };

  const handleSpeak = (content: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      console.log('Text-to-speech not supported');
    }
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  const showActionButtons = messages.length === 1 && messages[0].sender === 'bot';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Chat panel */}
          <motion.div
            ref={panelRef}
            className={`fixed bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden ${
              isMaximized
                ? 'inset-0 rounded-none'
                : 'bottom-4 right-4 w-full max-w-md md:w-[520px] h-[780px] max-h-[85vh] lg:max-w-lg xl:w-[580px]'
            }`}
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            tabIndex={-1}
            role="dialog"
            aria-label="Chat assistant"
            aria-modal="true"
          >
            {/* ChatGPT-like Layout when Maximized */}
            {isMaximized ? (
              <div className="flex h-full bg-white dark:bg-[#212121]">
                {/* Left Navigation Panel - Always Visible when Maximized */}
                <div className="w-80 flex-shrink-0 bg-white dark:bg-[#212121] border-r border-gray-200 dark:border-gray-600">
                  <NavigationPanel
                    isOpen={true}
                    onToggle={() => {}}
                    onNewChat={onNewChat}
                    chatSessions={chatSessions}
                    currentChatId={currentChatId}
                    onSelectChat={onSelectChat}
                  />
                </div>
                
                {/* Center Chat Area */}
                <div className="flex-1 flex flex-col max-w-4xl mx-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#212121] w-full">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-500 dark:bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">AI</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Assistant</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Always here to help</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-auto">
                      <ThemeToggle />
                      <button
                        onClick={onToggleMaximize}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Restore chat size"
                      >
                        <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Close chat"
                      >
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Messages area */}
                  <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#212121] relative">
                    {/* Error Message Container */}
                    <div id="chat-error-container" className="hidden absolute top-4 left-4 right-4 z-10">
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-sm text-red-600 dark:text-red-300">
                        <span id="chat-error-message"></span>
                      </div>
                    </div>
                    
                    {messages.map((message) => (
                      <ChatMessage 
                        key={message.id} 
                        message={message}
                        onCopy={handleCopy}
                        onDownload={handleDownload}
                        onThumbsUp={handleThumbsUp}
                        onThumbsDown={handleThumbsDown}
                        onSpeak={handleSpeak}
                      />
                    ))}
                    
                    {/* Action buttons after greeting */}
                    {showActionButtons && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        <ActionButtons
                          onTemplateOnboard={onTemplateOnboard}
                          onAlertOnboard={onAlertOnboard}
                        />
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="bg-white dark:bg-[#212121]">
                    <ChatInput onSendMessage={onSendMessage} />
                  </div>
                </div>
                
                {/* Right Empty Space for Balance */}
                <div className="w-80 flex-shrink-0 bg-white dark:bg-[#212121]">
                  {/* Intentionally empty for visual balance */}
                </div>
              </div>
            ) : (
              <>
                {/* Navigation Panel - Inside Chat Container for Non-Maximized */}
                <NavigationPanel
                  isOpen={isNavOpen}
                  onToggle={toggleNavigation}
                  onNewChat={onNewChat}
                  chatSessions={chatSessions}
                  currentChatId={currentChatId}
                  onSelectChat={onSelectChat}
                />

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-800">
                  <div className="flex items-center space-x-3">
                    {/* Navigation Toggle Button */}
                    <button
                      onClick={toggleNavigation}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Toggle navigation panel"
                    >
                      <Menu className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div className="w-10 h-10 bg-primary-500 dark:bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">AI</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Assistant</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Always here to help</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <button
                      onClick={onToggleMaximize}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Maximize chat"
                    >
                      <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Close chat"
                    >
                      <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-[#212121] relative">
                  {/* Error Message Container */}
                  <div id="chat-error-container" className="hidden absolute top-4 left-4 right-4 z-10">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-sm text-red-600 dark:text-red-300">
                      <span id="chat-error-message"></span>
                    </div>
                  </div>
                  
                  {messages.map((message) => (
                    <ChatMessage 
                      key={message.id} 
                      message={message}
                      onCopy={handleCopy}
                      onDownload={handleDownload}
                      onThumbsUp={handleThumbsUp}
                      onThumbsDown={handleThumbsDown}
                      onSpeak={handleSpeak}
                    />
                  ))}
                  
                  {/* Action buttons after greeting */}
                  {showActionButtons && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                    >
                      <ActionButtons
                        onTemplateOnboard={onTemplateOnboard}
                        onAlertOnboard={onAlertOnboard}
                      />
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="bg-white dark:bg-[#212121]">
                  <ChatInput onSendMessage={onSendMessage} />
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatPanel;