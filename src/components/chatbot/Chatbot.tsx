import React, { useState, useCallback, useEffect } from 'react';
import ChatbotLauncher from './ChatbotLauncher';
import ChatPanel from './ChatPanel';
import NavigationPanel from './NavigationPanel';
import { useChatHistory } from '../../hooks/useChatHistory';
import { Message, ChatbotProps, ChatPanelState, FileAttachment, ChatSession } from './types';

const Chatbot: React.FC<ChatbotProps> = ({
  className = '',
  onTemplateOnboard,
  onAlertOnboard,
  isMaximized: externalMaximized,
  onToggleMaximize: externalToggleMaximize
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [panelState, setPanelState] = useState<ChatPanelState>('closed');
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  // Use chat history hook
  const {
    chatSessions,
    currentChatId,
    messages,
    createNewChat,
    selectChat,
    updateMessages,
    saveCurrentChat
  } = useChatHistory();

  // Initialize greeting message on first visit
  useEffect(() => {
    if (isOpen && isFirstVisit && messages.length === 0) {
      try {
      const greetingMessage: Message = {
        id: 'greeting-' + Date.now(),
        content: '👋 Hi! How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };

      // Add sample message with Mermaid and Python code
      const sampleMessage: Message = {
        id: 'sample-' + Date.now(),
        content: `Here's a sample response demonstrating code rendering and diagrams:

## Python Fibonacci Function

\`\`\`python
# Sample Python function
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
    
# Example usage
for i in range(10):
    print(f"fibonacci({i}) = {fibonacci(i)}")
\`\`\`

## Process Flow Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B[Input n]
    B --> C{n <= 1?}
    C -->|Yes| D[Return n]
    C -->|No| E[Calculate fibonacci(n-1) + fibonacci(n-2)]
    E --> F[Return result]
    F --> G[End]
\`\`\`

This demonstrates **code syntax highlighting** and **Mermaid diagram rendering** within the chat interface. The copy button appears when you hover over code blocks.`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      
      updateMessages([greetingMessage, sampleMessage]);
      setIsFirstVisit(false);
      } catch (error) {
        // Silently handle any initialization errors
      }
    }
  }, [isOpen, isFirstVisit, messages.length, updateMessages]);

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
    if (!isOpen) {
      setIsNavOpen(false); // Close nav when opening chat
    }
  }, [isOpen]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMaximized(false);
    setIsNavOpen(false);
  }, []);

  const toggleMaximize = useCallback(() => {
    if (externalToggleMaximize) {
      externalToggleMaximize();
    } else {
      setIsMaximized(prev => !prev);
    }
  }, [externalToggleMaximize]);

  const toggleNavigation = useCallback(() => {
    setIsNavOpen(prev => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    try {
      // Save current chat and create new one
      saveCurrentChat(messages);
      createNewChat();
      setIsFirstVisit(true);
      setIsNavOpen(false);
    } catch (error) {
      // Silently handle new chat errors
    }
  }, [messages, saveCurrentChat, createNewChat]);

  const handleSelectChat = useCallback((chatId: string) => {
    try {
      const session = chatSessions.find(s => s.id === chatId);
      if (session) {
        selectChat(chatId);
        setIsFirstVisit(false);
        setIsNavOpen(false);
      }
    } catch (error) {
      // Silently handle chat selection errors
    }
  }, [chatSessions, selectChat]);

  const handleSendMessage = useCallback((content: string, attachments?: FileAttachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    try {
      // Add user message
      const userMessage: Message = {
        id: 'user-' + Date.now(),
        content: content || '📎 File attachment',
        sender: 'user',
        timestamp: new Date(),
        attachments: attachments
      };

      updateMessages([...messages, userMessage]);

      // Simulate bot response after a delay
      setTimeout(() => {
        try {
          const botResponse: Message = {
            id: 'bot-' + Date.now(),
            content: `Thanks for your message! ${attachments && attachments.length > 0 ? `I can see you've shared ${attachments.length} file(s). ` : ''}How can I help you further?`,
            sender: 'bot',
            timestamp: new Date()
          };
          
          updateMessages([...messages, userMessage, botResponse]);
        } catch (error) {
          // Silently handle bot response errors
        }
      }, 1000);
    } catch (error) {
      // Silently handle message sending errors
    }
  }, [messages, updateMessages]);

  const handleTemplateOnboard = useCallback(() => {
    try {
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

      updateMessages([...messages, userMessage, botResponse]);
      
      // Call the optional callback
      onTemplateOnboard?.();
    } catch (error) {
      // Silently handle template onboard errors
    }
  }, [messages, updateMessages, onTemplateOnboard]);

  const handleAlertOnboard = useCallback(() => {
    try {
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

      updateMessages([...messages, userMessage, botResponse]);
      
      // Call the optional callback
      onAlertOnboard?.();
    } catch (error) {
      // Silently handle alert onboard errors
    }
  }, [messages, updateMessages, onAlertOnboard]);

  return (
    <div className={`chatbot-container ${className}`}>
      <ChatbotLauncher
        isOpen={isOpen}
        onClick={toggleChat}
        hasUnreadMessages={false}
      />
      
      <ChatPanel
        isOpen={isOpen}
        isMaximized={externalMaximized ?? isMaximized}
        onClose={closeChat}
        onToggleMaximize={toggleMaximize}
        messages={messages}
        onSendMessage={handleSendMessage}
        onTemplateOnboard={handleTemplateOnboard}
        onAlertOnboard={handleAlertOnboard}
        panelState={panelState}
        isNavOpen={isNavOpen}
        toggleNavigation={toggleNavigation}
        onNewChat={handleNewChat}
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
      />
    </div>
  );
};

export default Chatbot;