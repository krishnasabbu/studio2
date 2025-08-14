import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, MicOff, Plus, X, Code, Camera, MapPin, Calendar, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileAttachment, VoiceRecognitionState } from './types';

interface Intent {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  endpoint: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[], intent?: Intent) => void;
  disabled?: boolean;
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const AVAILABLE_INTENTS: Intent[] = [
  {
    id: 'voice-recording',
    name: 'Voice Recording',
    icon: Mic,
    description: 'Record voice messages',
    color: 'text-red-600',
    endpoint: '/api/voice-chat'
  },
  {
    id: 'code-snippet',
    name: 'Code Assistant',
    icon: Code,
    description: 'Get coding help and snippets',
    color: 'text-purple-600',
    endpoint: '/api/code-chat'
  },
  {
    id: 'camera',
    name: 'Visual Analysis',
    icon: Camera,
    description: 'Analyze images and visuals',
    color: 'text-orange-600',
    endpoint: '/api/vision-chat'
  },
  {
    id: 'location',
    name: 'Location Services',
    icon: MapPin,
    description: 'Location-based assistance',
    color: 'text-pink-600',
    endpoint: '/api/location-chat'
  },
  {
    id: 'schedule',
    name: 'Schedule Assistant',
    icon: Calendar,
    description: 'Schedule and calendar help',
    color: 'text-indigo-600',
    endpoint: '/api/schedule-chat'
  }
];

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [showIntentPopup, setShowIntentPopup] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    error: null
  });
  
  const recognitionRef = useRef<any>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setVoiceState(prev => ({ ...prev, isSupported: true }));
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        setVoiceState(prev => ({ ...prev, transcript }));
        setMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        setVoiceState(prev => ({ 
          ...prev, 
          isListening: false, 
          error: `Speech recognition error: ${event.error}` 
        }));
      };

      recognition.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        plusButtonRef.current &&
        !plusButtonRef.current.contains(event.target as Node)
      ) {
        setShowIntentPopup(false);
      }
    };

    if (showIntentPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showIntentPopup]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [message]);

  const handleSend = useCallback(() => {
    if (message.trim()) {
      onSendMessage(message.trim(), attachments, selectedIntent || undefined);
      setMessage('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [message, attachments, selectedIntent, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const toggleIntentPopup = useCallback(() => {
    setShowIntentPopup(prev => !prev);
  }, []);

  const handleIntentSelect = useCallback((intent: Intent) => {
    // Handle voice recording intent specially
    if (intent.id === 'voice-recording') {
      toggleVoiceRecognition();
    }
    
    setSelectedIntent(intent);
    setShowIntentPopup(false);
    
    // Focus back to textarea
    textareaRef.current?.focus();
  }, []);

  const handleIntentDeselect = useCallback(() => {
    // Stop voice recording if active
    if (voiceState.isListening) {
      recognitionRef.current?.stop();
    }
    
    setSelectedIntent(null);
    textareaRef.current?.focus();
  }, [voiceState.isListening]);

  const toggleVoiceRecognition = useCallback(() => {
    if (!voiceState.isSupported) {
      setVoiceState(prev => ({ 
        ...prev, 
        error: 'Speech recognition is not supported in this browser' 
      }));
      return;
    }

    if (voiceState.isListening) {
      recognitionRef.current?.stop();
    } else {
      setMessage('');
      setVoiceState(prev => ({ ...prev, error: null, transcript: '' }));
      recognitionRef.current?.start();
    }
  }, [voiceState.isListening, voiceState.isSupported]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = Array.from(files).map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  }, []);

  const removeAttachment = useCallback((attachmentId: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === attachmentId);
      if (attachment?.url) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== attachmentId);
    });
  }, []);

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isExpanded = selectedIntent !== null;

  return (
    <div className="relative">
      {/* Intent Popup */}
      <AnimatePresence>
        {showIntentPopup && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 p-2 min-w-[320px] z-50"
          >
            <div className="space-y-1">
              {AVAILABLE_INTENTS.map((intent) => {
                const Icon = intent.icon;
                const isSelected = selectedIntent?.id === intent.id;
                
                return (
                  <button
                    key={intent.id}
                    onClick={() => handleIntentSelect(intent)}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left w-full ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500'
                    }`}
                    aria-label={`Select ${intent.name} intent`}
                  >
                    <Icon className={`w-5 h-5 ${intent.color} ${isSelected ? 'opacity-100' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm text-gray-900 dark:text-gray-100`}>
                        {intent.name}
                      </div>
                      <div className={`text-xs text-gray-500 dark:text-gray-400 truncate`}>
                        {intent.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 bg-white dark:bg-gray-800">
        {/* Voice Recognition Error */}
        {voiceState.error && (
          <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-600 dark:text-red-300">
            {voiceState.error}
          </div>
        )}

        {/* File Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-32">
                  {attachment.name}
                </span>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  aria-label={`Remove ${attachment.name}`}
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Container */}
        <motion.div
          animate={{
            minHeight: isExpanded ? '64px' : '48px'
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="relative border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all duration-200"
        >
          {/* Selected Intent Tag */}
          <AnimatePresence>
            {selectedIntent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between p-2 pb-0"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg px-3 py-1.5 text-sm"
                >
                  <selectedIntent.icon className={`w-4 h-4 ${selectedIntent.color}`} />
                  <span className="text-primary-700 dark:text-primary-300 font-medium">
                    {selectedIntent.name}
                  </span>
                  <button
                    onClick={handleIntentDeselect}
                    className="p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800 rounded transition-colors"
                    aria-label={`Remove ${selectedIntent.name} intent`}
                  >
                    <X className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                  </button>
                </motion.div>
                
                {/* Voice Recording Indicator */}
                {selectedIntent.id === 'voice-recording' && voiceState.isListening && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">Recording</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="flex items-end p-3 space-x-2">
            {/* Plus Button */}
            <button
              ref={plusButtonRef}
              onClick={toggleIntentPopup}
              disabled={disabled}
              className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                showIntentPopup
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Select intent"
              aria-expanded={showIntentPopup}
            >
              <motion.div
                animate={{ rotate: showIntentPopup ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-4 h-4" />
              </motion.div>
            </button>

            {/* Voice Recording Button */}
            <button
              onClick={toggleVoiceRecognition}
              disabled={disabled}
              className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                voiceState.isListening
                  ? 'bg-red-500 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={voiceState.isListening ? 'Stop recording' : 'Start voice recording'}
              title={voiceState.isListening ? 'Stop recording' : 'Start voice recording'}
            >
              {voiceState.isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* File Attachment Button */}
            <button
              onClick={triggerFileSelect}
              disabled={disabled}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Attach file"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
              aria-label="File input"
            />

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={voiceState.isListening ? 'Listening...' : 'Type your message...'}
                disabled={disabled || voiceState.isListening}
                className={`w-full px-3 py-2 border-0 rounded-lg resize-none focus:outline-none transition-all duration-200 disabled:cursor-not-allowed text-base bg-transparent ${
                  voiceState.isListening ? 'bg-red-50 dark:bg-red-900/20' : ''
                } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 leading-normal whitespace-pre-wrap`}
                rows={1}
                style={{ 
                  minHeight: '32px',
                  maxHeight: '100px',
                  height: 'auto',
                  lineHeight: '1.5',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={disabled || !message.trim()}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
      </motion.div>
      </div>
    </div>
  );
};

export default ChatInput;