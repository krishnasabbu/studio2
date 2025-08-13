import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, MicOff, Paperclip, X, FileText, Image, File, Plus, Code, Camera, Music, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileAttachment, VoiceRecognitionState } from './types';

interface Feature {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

interface SelectedFeature extends Feature {
  data?: any;
}

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void;
  disabled?: boolean;
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const AVAILABLE_FEATURES: Feature[] = [
  {
    id: 'file-upload',
    name: 'File Upload',
    icon: Paperclip,
    description: 'Upload documents and files',
    color: 'text-blue-600'
  },
  {
    id: 'image-upload',
    name: 'Image Upload',
    icon: Image,
    description: 'Upload images and photos',
    color: 'text-green-600'
  },
  {
    id: 'voice-recording',
    name: 'Voice Recording',
    icon: Mic,
    description: 'Record voice messages',
    color: 'text-red-600'
  },
  {
    id: 'code-snippet',
    name: 'Code Snippet',
    icon: Code,
    description: 'Insert code blocks',
    color: 'text-purple-600'
  },
  {
    id: 'camera',
    name: 'Camera',
    icon: Camera,
    description: 'Take photos with camera',
    color: 'text-orange-600'
  },
  {
    id: 'location',
    name: 'Location',
    icon: MapPin,
    description: 'Share location',
    color: 'text-pink-600'
  },
  {
    id: 'schedule',
    name: 'Schedule',
    icon: Calendar,
    description: 'Schedule meetings',
    color: 'text-indigo-600'
  },
  {
    id: 'audio',
    name: 'Audio File',
    icon: Music,
    description: 'Upload audio files',
    color: 'text-yellow-600'
  }
];

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([]);
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    error: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);

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
        setShowFeaturePopup(false);
      }
    };

    if (showFeaturePopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFeaturePopup]);

  const handleSend = useCallback(() => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
      setSelectedFeatures([]);
    }
  }, [message, attachments, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const toggleFeaturePopup = useCallback(() => {
    setShowFeaturePopup(prev => !prev);
  }, []);

  const handleFeatureSelect = useCallback((feature: Feature) => {
    // Check if feature is already selected
    if (selectedFeatures.some(f => f.id === feature.id)) {
      setShowFeaturePopup(false);
      return;
    }

    const newFeature: SelectedFeature = { ...feature };

    // Handle specific feature logic
    switch (feature.id) {
      case 'file-upload':
        fileInputRef.current?.click();
        break;
      case 'image-upload':
        imageInputRef.current?.click();
        break;
      case 'voice-recording':
        toggleVoiceRecognition();
        break;
      case 'code-snippet':
        setMessage(prev => prev + '\n```\n// Your code here\n```\n');
        break;
      case 'camera':
        // In a real app, this would open camera
        console.log('Camera feature selected');
        break;
      case 'location':
        // In a real app, this would get user location
        console.log('Location feature selected');
        break;
      case 'schedule':
        // In a real app, this would open calendar
        console.log('Schedule feature selected');
        break;
      case 'audio':
        // In a real app, this would open audio file picker
        console.log('Audio feature selected');
        break;
    }

    setSelectedFeatures(prev => [...prev, newFeature]);
    setShowFeaturePopup(false);
  }, [selectedFeatures]);

  const removeFeature = useCallback((featureId: string) => {
    setSelectedFeatures(prev => prev.filter(f => f.id !== featureId));
    
    // Clean up feature-specific state
    if (featureId === 'voice-recording' && voiceState.isListening) {
      recognitionRef.current?.stop();
    }
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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`File type "${file.type}" is not supported.`);
        return false;
      }
      return true;
    });

    const newAttachments: FileAttachment[] = validFiles.map(file => ({
      id: Date.now() + Math.random().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => {
      const updated = prev.filter(att => att.id !== id);
      // Clean up object URLs
      const removed = prev.find(att => att.id === id);
      if (removed?.url) {
        URL.revokeObjectURL(removed.url);
      }
      return updated;
    });
  }, []);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type === 'application/pdf' || type.includes('document')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isExpanded = selectedFeatures.length > 0 || attachments.length > 0;

  return (
    <div className="relative">
      {/* Feature Popup */}
      <AnimatePresence>
        {showFeaturePopup && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 p-2 min-w-[320px] z-50"
          >
            <div className="grid grid-cols-2 gap-1">
              {AVAILABLE_FEATURES.map((feature) => {
                const Icon = feature.icon;
                const isSelected = selectedFeatures.some(f => f.id === feature.id);
                
                return (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureSelect(feature)}
                    disabled={isSelected}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left ${
                      isSelected
                        ? 'bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500'
                    }`}
                    aria-label={`Add ${feature.name}`}
                  >
                    <Icon className={`w-5 h-5 ${feature.color} ${isSelected ? 'opacity-50' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm text-gray-900 dark:text-gray-100 ${isSelected ? 'opacity-50' : ''}`}>
                        {feature.name}
                      </div>
                      <div className={`text-xs text-gray-500 dark:text-gray-400 truncate ${isSelected ? 'opacity-50' : ''}`}>
                        {feature.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
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
          <div className="mb-3 space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-sm"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getFileIcon(attachment.type)}
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {attachment.name}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatFileSize(attachment.size)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  aria-label={`Remove ${attachment.name}`}
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Container */}
        <motion.div
          animate={{
            minHeight: isExpanded ? '80px' : '56px'
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="relative border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all duration-200"
        >
          {/* Feature Tags */}
          <AnimatePresence>
            {selectedFeatures.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap gap-2 p-3 pb-0"
              >
                {selectedFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-1.5 text-sm"
                    >
                      <Icon className={`w-4 h-4 ${feature.color}`} />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {feature.name}
                      </span>
                      <button
                        onClick={() => removeFeature(feature.id)}
                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-500 rounded transition-colors"
                        aria-label={`Remove ${feature.name}`}
                      >
                        <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="flex items-end p-3 space-x-2">
            {/* File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.txt,.doc,.docx"
            />
            <input
              ref={imageInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*"
            />
            
            {/* Plus Button */}
            <button
              ref={plusButtonRef}
              onClick={toggleFeaturePopup}
              disabled={disabled}
              className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                showFeaturePopup
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Add features"
              aria-expanded={showFeaturePopup}
            >
              <motion.div
                animate={{ rotate: showFeaturePopup ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-5 h-5" />
              </motion.div>
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={voiceState.isListening ? 'Listening...' : 'Type your message...'}
                disabled={disabled || voiceState.isListening}
                className={`w-full px-3 py-2 border-0 rounded-lg resize-none focus:outline-none transition-all duration-200 disabled:cursor-not-allowed text-base bg-transparent ${
                  voiceState.isListening ? 'bg-red-50 dark:bg-red-900/20' : ''
                } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                rows={1}
                style={{ 
                  minHeight: '40px', 
                  maxHeight: isExpanded ? '80px' : '120px',
                  height: 'auto'
                }}
              />
              
              {/* Voice Recording Indicator */}
              {voiceState.isListening && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">Recording</span>
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={disabled || (!message.trim() && attachments.length === 0)}
              className="flex-shrink-0 p-2 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInput;