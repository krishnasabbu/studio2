export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'action-buttons';
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