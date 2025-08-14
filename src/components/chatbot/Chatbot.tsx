import React, { useState, useCallback, useEffect } from 'react';
import ChatbotLauncher from './ChatbotLauncher';
import ChatPanel from './ChatPanel';
import NavigationPanel from './NavigationPanel';
import { useChatHistory } from '../../hooks/useChatHistory';
import { Message, ChatbotProps, ChatPanelState, FileAttachment, ChatSession, SessionContext } from './types';

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
  const [currentSessionContext, setCurrentSessionContext] = useState<SessionContext | null>(null);
  
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
      
      const initialMessages = [greetingMessage, sampleMessage];
      if (Array.isArray(initialMessages)) {
        updateMessages(initialMessages);
      }
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
      // Save current chat session if it has messages
      if (messages.length > 1) { // More than just greeting
        const newSession: ChatSession = {
          id: currentChatId,
          title: messages[1]?.content.slice(0, 50) + '...' || 'New Chat',
          timestamp: new Date(),
          preview: messages[1]?.content.slice(0, 100) + '...' || '',
          messages: [...messages]
        };
        
        saveCurrentChat(newSession.messages);
      }

      // Start new chat
      const newChatId = 'chat-' + Date.now();
      createNewChat(newChatId);
      updateMessages([]);
      setIsFirstVisit(true);
      setIsNavOpen(false);
    } catch (error) {
      // Silently handle new chat errors
    }
  }, [messages, currentChatId, saveCurrentChat, createNewChat, updateMessages]);

  const handleSelectChat = useCallback((chatId: string) => {
    try {
      const session = chatSessions.find(s => s.id === chatId);
      if (session) {
        selectChat(chatId);
        updateMessages(session.messages);
        setIsFirstVisit(false);
        setIsNavOpen(false);
      }
    } catch (error) {
      // Silently handle chat selection errors
    }
  }, [chatSessions, selectChat, updateMessages]);

  const handleSendMessage = useCallback((content: string, attachments?: FileAttachment[], intent?: any) => {
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
          // Determine response based on session context and intent
          let responseContent = '';
          
          if (currentSessionContext?.isNewSession) {
            // New session - feature-specific response
            responseContent = getFeatureSpecificResponse(currentSessionContext.featureName, content);
            // Mark session as no longer new
            setCurrentSessionContext(prev => prev ? { ...prev, isNewSession: false } : null);
          } else {
            // Continue session - contextual response
            responseContent = `Thanks for your message! ${attachments && attachments.length > 0 ? `I can see you've shared ${attachments.length} file(s). ` : ''}`;
            
            if (intent) {
              responseContent += `I see you're using the **${intent.name}** feature. `;
              console.log(`Would call API endpoint: ${intent.endpoint}`);
            }
            
            responseContent += 'How can I help you further?';
          }
          
          const botResponse: Message = {
            id: 'bot-' + Date.now(),
            content: responseContent,
            sender: 'bot',
            timestamp: new Date()
          };
          
          updateMessages(prev => [...prev, botResponse]);
        } catch (error) {
          // Silently handle bot response errors
        }
      }, 1000);
    } catch (error) {
      // Silently handle message sending errors
    }
  }, [messages, updateMessages, currentSessionContext]);

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
  }, [onTemplateOnboard, updateMessages]);

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
  }, [onAlertOnboard, updateMessages]);

  const handleFeatureSelect = useCallback((intent: any) => {
    try {
      // Start new session with feature context
      const newSessionContext: SessionContext = {
        sessionId: 'session-' + Date.now(),
        featureId: intent.id,
        featureName: intent.name,
        isNewSession: true,
        startedAt: new Date()
      };
      
      setCurrentSessionContext(newSessionContext);
      
      // Clear previous messages for new session
      updateMessages([]);
      
      // Add feature selection message
      const featureMessage: Message = {
        id: 'feature-' + Date.now(),
        content: `I want to use ${intent.name}`,
        sender: 'user',
        timestamp: new Date()
      };
      
      // Add feature-specific welcome message
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        content: getFeatureWelcomeMessage(intent.name),
        sender: 'bot',
        timestamp: new Date()
      };
      
      updateMessages([featureMessage, welcomeMessage]);
      setIsFirstVisit(false);
      
    } catch (error) {
      console.error('Error handling feature selection:', error);
    }
  }, [updateMessages]);

  // Helper function to get feature-specific welcome messages
  const getFeatureWelcomeMessage = (featureName: string): string => {
    switch (featureName) {
      case 'Alerts Studio':
        return `Welcome to **Alerts Studio**! 🚨

I'll help you configure and manage alerts for your system. Here's what I can assist you with:

## 🎯 **Alert Configuration**
- Set up new alert rules and thresholds
- Configure notification channels (email, SMS, Slack)
- Define escalation policies

## 📊 **Alert Management**
- Monitor active alerts and their status
- Review alert history and patterns
- Fine-tune alert sensitivity

## 🔧 **Integration Setup**
- Connect with monitoring tools
- Configure JIRA integration
- Set up custom webhooks

What type of alert would you like to configure first?`;

      case 'Email Builder':
        return `Welcome to **Email Builder**! 📧

I'll help you create professional email templates with ease. Here's what we can do together:

## 🎨 **Template Creation**
- Design responsive email layouts
- Add dynamic content and personalization
- Use pre-built components and blocks

## ✨ **Advanced Features**
- A/B testing setup
- Multi-language support
- Brand consistency tools

## 🚀 **Testing & Deployment**
- Preview across email clients
- Send test emails
- Deploy to production

Would you like to start with a new template or modify an existing one?`;

      case 'Chatbot Builder':
        return `Welcome to **Chatbot Builder**! 🤖

I'll guide you through creating intelligent chatbots for your applications. Here's what we can build:

## 🧠 **Bot Intelligence**
- Natural language understanding
- Intent recognition and responses
- Context-aware conversations

## 🔧 **Configuration**
- Define conversation flows
- Set up custom responses
- Configure fallback behaviors

## 📈 **Analytics & Training**
- Monitor bot performance
- Improve responses based on usage
- Train with new data

What kind of chatbot functionality would you like to implement?`;

      default:
        return `Welcome to **${featureName}**! I'm here to help you get started with this feature. What would you like to do first?`;
    }
  };

  // Helper function to get feature-specific responses
  const getFeatureSpecificResponse = (featureName: string | null, userMessage: string): string => {
    if (!featureName) return "I'm here to help! What would you like to do?";
    
    const lowerMessage = userMessage.toLowerCase();
    
    switch (featureName) {
      case 'Alerts Studio':
        if (lowerMessage.includes('create') || lowerMessage.includes('new')) {
          return `Great! Let's create a new alert. I'll need some information:

1. **Alert Type**: What do you want to monitor? (CPU usage, memory, disk space, custom metric)
2. **Threshold**: At what point should the alert trigger?
3. **Notification**: How should you be notified? (email, SMS, Slack)

Which type of alert would you like to create?`;
        }
        return `I understand you want to work with alerts. I can help you:
- Create new alert rules
- Modify existing alerts  
- Set up notification channels
- Configure escalation policies

What specific alert task can I help you with?`;

      case 'Email Builder':
        if (lowerMessage.includes('template') || lowerMessage.includes('create')) {
          return `Perfect! Let's create an email template. I can help you with:

**Template Types:**
- Welcome emails
- Newsletter templates
- Transactional emails
- Marketing campaigns

**Design Options:**
- Drag-and-drop builder
- HTML code editor
- Pre-built templates

Which type of email template would you like to create?`;
        }
        return `I'm here to help with email building! I can assist you with:
- Creating new templates
- Editing existing designs
- Adding dynamic content
- Testing email compatibility

What email building task can I help you with?`;

      case 'Chatbot Builder':
        if (lowerMessage.includes('bot') || lowerMessage.includes('create')) {
          return `Excellent! Let's build your chatbot. Here's what we need to set up:

**Bot Configuration:**
- Bot personality and tone
- Primary use case (support, sales, FAQ)
- Integration channels (website, Slack, Teams)

**Conversation Design:**
- Welcome messages
- Common intents and responses
- Fallback behaviors

What's the main purpose of your chatbot?`;
        }
        return `I'm ready to help you build chatbots! I can assist with:
- Bot configuration and setup
- Conversation flow design
- Intent training and responses
- Integration and deployment

What aspect of chatbot building interests you most?`;

      default:
        return `Thanks for your message about ${featureName}. How can I help you with this feature?`;
    }
  };

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
        onFeatureSelect={handleFeatureSelect}
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