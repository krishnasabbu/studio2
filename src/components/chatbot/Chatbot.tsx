import React, { useState, useCallback, useEffect } from 'react';
import ChatbotLauncher from './ChatbotLauncher';
import ChatPanel from './ChatPanel';
import { Message, ChatbotProps, ChatPanelState, FileAttachment } from './types';

const Chatbot: React.FC<ChatbotProps> = ({
  className = '',
  onTemplateOnboard,
  onAlertOnboard
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [panelState, setPanelState] = useState<ChatPanelState>('closed');

  // Initialize greeting message on first visit
  useEffect(() => {
    if (isOpen && isFirstVisit && messages.length === 0) {
      const greetingMessage: Message = {
        id: 'greeting-' + Date.now(),
        content: '👋 Hi! How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages([greetingMessage]);
      setIsFirstVisit(false);
    }
  }, [isOpen, isFirstVisit, messages.length]);

  // Handle panel state transitions
  useEffect(() => {
    if (isOpen) {
      setPanelState('opening');
      const timer = setTimeout(() => setPanelState('open'), 300);
      return () => clearTimeout(timer);
    } else {
      setPanelState('closing');
      const timer = setTimeout(() => setPanelState('closed'), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSendMessage = useCallback((content: string, attachments?: FileAttachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    // Add user message
    const userMessage: Message = {
      id: 'user-' + Date.now(),
      content: content || '📎 File attachment',
      sender: 'user',
      timestamp: new Date(),
      attachments: attachments
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse: Message = {
        id: 'bot-' + Date.now(),
        content: `Thanks for your message! ${attachments && attachments.length > 0 ? `I can see you've shared ${attachments.length} file(s). ` : ''}How can I help you further?`,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  }, []);

  const handleTemplateOnboard = useCallback(() => {
    console.log('Template Onboard clicked');
    
    // Add user message
    const userMessage: Message = {
      id: 'user-template-' + Date.now(),
      content: 'I want to start template onboarding',
      sender: 'user',
      timestamp: new Date()
    };

    // Add bot response
    const botResponse: Message = {
      id: 'bot-template-' + Date.now() + 1,
      content: `Great! I'll help you with **template onboarding**. Here's what we'll cover:

## Template Onboarding Process

1. **Template Selection** - Choose from our pre-built templates
2. **Customization** - Personalize your template with your content
3. **Testing** - Preview and test your template
4. **Deployment** - Launch your template

Let me know which type of template you'd like to create:
- Email templates
- Push notification templates  
- SMS templates

*This is a demo response. In production, this would connect to your actual onboarding flow.*`,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    
    // Call the optional callback
    onTemplateOnboard?.();
  }, [onTemplateOnboard]);

  const handleAlertOnboard = useCallback(() => {
    console.log('Alert Onboard clicked');
    
    // Add user message
    const userMessage: Message = {
      id: 'user-alert-' + Date.now(),
      content: 'I want to start alert onboarding',
      sender: 'user',
      timestamp: new Date()
    };

    // Add bot response
    const botResponse: Message = {
      id: 'bot-alert-' + Date.now() + 1,
      content: `Perfect! Let's get you set up with **alert onboarding**. Here's our step-by-step process:

## Alert Configuration Steps

### 1. Alert Type Selection
Choose from:
- \`System alerts\` - Infrastructure monitoring
- \`Business alerts\` - KPI and metric tracking  
- \`Security alerts\` - Security event monitoring

### 2. Trigger Configuration
- Define alert conditions
- Set thresholds and rules
- Configure escalation policies

### 3. Notification Setup
- Select notification channels
- Configure recipient groups
- Set delivery preferences

### 4. Testing & Validation
- Test alert triggers
- Validate notification delivery
- Fine-tune settings

> **Note:** This demo shows the onboarding flow structure. In production, this would integrate with your JIRA system and actual alert management platform.

Which type of alert would you like to configure first?`,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    
    // Call the optional callback
    onAlertOnboard?.();
  }, [onAlertOnboard]);

  return (
    <div className={`chatbot-container ${className}`}>
      <ChatbotLauncher
        isOpen={isOpen}
        onClick={toggleChat}
        hasUnreadMessages={false}
      />
      
      <ChatPanel
        isOpen={isOpen}
        onClose={closeChat}
        messages={messages}
        onSendMessage={handleSendMessage}
        onTemplateOnboard={handleTemplateOnboard}
        onAlertOnboard={handleAlertOnboard}
        panelState={panelState}
      />
    </div>
  );
};

export default Chatbot;