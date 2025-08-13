export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'action-buttons';
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface ChatbotProps {
  className?: string;
  onTemplateOnboard?: () => void;
  onAlertOnboard?: () => void;
}

export interface ActionButtonsProps {
  onTemplateOnboard: () => void;
  onAlertOnboard: () => void;
}

export type ChatPanelState = 'closed' | 'opening' | 'open' | 'closing';

export interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}