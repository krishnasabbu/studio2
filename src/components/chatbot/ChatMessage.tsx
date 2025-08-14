import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import MessageActions from './MessageActions';
import CodeBlock from './CodeBlock';
import { useTheme } from '../../hooks/useTheme';
import { Message, FileAttachment } from './types';

interface ChatMessageProps {
  message: Message;
  onCopy: (content: string) => void;
  onDownload: (content: string) => void;
  onThumbsUp: (messageId: string) => void;
  onThumbsDown: (messageId: string) => void;
  onSpeak: (content: string) => void;
}

const FilePreview: React.FC<{ attachment: FileAttachment }> = ({ attachment }) => {
  const isImage = attachment.type.startsWith('image/');
  
  if (isImage && attachment.url) {
    return (
      <div className="mt-2">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-w-xs rounded-lg shadow-sm border border-gray-200"
          style={{ maxHeight: '200px' }}
        />
      </div>
    );
  }
  
  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
      <div className="font-medium text-gray-900">{attachment.name}</div>
      <div className="text-gray-500 text-xs">
        {(attachment.size / 1024).toFixed(1)} KB
      </div>
    </div>
  );
};

const MermaidDiagram: React.FC<{ chart: string }> = ({ chart }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (elementRef.current) {
      const renderChart = async () => {
        try {
          // Clear previous content
          elementRef.current.innerHTML = '';
          
          // Configure Mermaid with theme-aware settings
          const config = {
            startOnLoad: false,
            theme: theme === 'dark' ? 'dark' : 'neutral',
            securityLevel: 'loose',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            fontSize: 16,
            darkMode: theme === 'dark',
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis'
            },
            themeVariables: theme === 'dark' ? {
              primaryColor: '#4f46e5',
              primaryTextColor: '#ffffff',
              primaryBorderColor: '#6366f1',
              lineColor: '#9ca3af',
              sectionBkgColor: '#374151',
              altSectionBkgColor: '#4b5563',
              gridColor: '#6b7280',
              secondaryColor: '#1f2937',
              tertiaryColor: '#111827'
            } : {
              primaryColor: '#4f46e5',
              primaryTextColor: '#1f2937',
              primaryBorderColor: '#6366f1',
              lineColor: '#374151',
              sectionBkgColor: '#f3f4f6',
              altSectionBkgColor: '#e5e7eb',
              gridColor: '#9ca3af',
              secondaryColor: '#ffffff',
              tertiaryColor: '#f9fafb'
            }
          };
          
          // Initialize Mermaid with configuration
          mermaid.initialize(config);
          
          // Generate unique ID for each diagram
          const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Validate and clean the chart syntax
          const cleanChart = chart.trim();
          if (!cleanChart) {
            throw new Error('Empty chart content');
          }
          
          // Render the diagram with error handling
          const { svg } = await mermaid.render(diagramId, cleanChart);
          
          if (elementRef.current) {
            elementRef.current.innerHTML = svg;
            
            // Apply responsive and theme-aware styling
            const svgElement = elementRef.current.querySelector('svg');
            if (svgElement) {
              svgElement.style.maxWidth = '100%';
              svgElement.style.height = 'auto';
              svgElement.style.display = 'block';
              svgElement.style.margin = '0 auto';
              
              // Apply theme-specific styling
              if (theme === 'dark') {
                svgElement.style.filter = 'brightness(0.9)';
              }
            }
          }
        } catch (error) {
          console.warn('Mermaid rendering failed:', error);
          if (elementRef.current) {
            // Show a fallback message for debugging
            elementRef.current.innerHTML = `
              <div class="text-sm text-gray-500 dark:text-gray-400 italic p-4 text-center">
                Diagram could not be rendered
              </div>
            `;
          }
        }
      };

      renderChart();
    }
  }, [chart, theme]);

  return (
    <div 
      ref={elementRef} 
      className="my-4 flex justify-center overflow-x-auto bg-white dark:bg-[#212121] rounded-lg p-4 border border-gray-200 dark:border-gray-600" 
    />
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onCopy, 
  onDownload, 
  onThumbsUp, 
  onThumbsDown, 
  onSpeak 
}) => {
  const isBot = message.sender === 'bot';

  return (
    <div className={`w-full mb-4 ${isBot ? '' : 'flex justify-end'}`}>
      <div className={`${isBot ? 'max-w-none' : 'max-w-2xl ml-auto'}`}>
        {/* Message content */}
        <div className={`${
          isBot 
            ? 'bg-transparent text-gray-800 dark:text-gray-200 py-2 w-full' 
            : 'bg-[#f4f4f4] dark:bg-[#303030] rounded-2xl px-4 py-3 text-gray-900 dark:text-gray-100'
        }`}>
          <div className={`${isBot ? 'prose prose-sm max-w-none dark:prose-invert prose-gray' : ''}`}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  
                  // Handle Mermaid diagrams
                  if (language === 'mermaid') {
                    return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
                  }
                  
                  return !inline && match ? (
                    <CodeBlock language={language} {...props}>{String(children)}</CodeBlock>
                  ) : (
                    <code className={`${className} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded text-xs`} {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className={`${isBot ? 'mb-3 last:mb-0' : 'mb-2 last:mb-0'} leading-relaxed chat-text-base`}>{children}</p>,
                ul: ({ children }) => <ul className={`list-disc list-inside ${isBot ? 'mb-3' : 'mb-2'} space-y-1 chat-text-base`}>{children}</ul>,
                ol: ({ children }) => <ol className={`list-decimal list-inside ${isBot ? 'mb-3' : 'mb-2'} space-y-1 chat-text-base`}>{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed chat-text-base">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className={`border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic ${isBot ? 'mb-3' : 'mb-2'} text-gray-600 dark:text-gray-400 chat-text-base`}>
                    {children}
                  </blockquote>
                ),
                h1: ({ children }) => <h1 className={`text-xl font-bold ${isBot ? 'mb-2 mt-4' : 'mb-1 mt-2'} first:mt-0 text-gray-900 dark:text-gray-100 chat-heading`}>{children}</h1>,
                h2: ({ children }) => <h2 className={`text-lg font-bold ${isBot ? 'mb-2 mt-3' : 'mb-1 mt-2'} first:mt-0 text-gray-900 dark:text-gray-100 chat-heading`}>{children}</h2>,
                h3: ({ children }) => <h3 className={`text-base font-bold ${isBot ? 'mb-2 mt-3' : 'mb-1 mt-2'} first:mt-0 text-gray-900 dark:text-gray-100 chat-heading`}>{children}</h3>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100 chat-text-base">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                a: ({ children, href }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline hover:no-underline chat-text-base"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {String(message.content || '')}
            </ReactMarkdown>
          </div>
          
          {/* File Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <FilePreview key={attachment.id} attachment={attachment} />
              ))}
            </div>
          )}
        </div>
        
        {/* Message Actions for Bot Messages */}
        {isBot && message.content.length > 20 && (
          <MessageActions
            message={message}
            onCopy={onCopy}
            onDownload={onDownload}
            onThumbsUp={onThumbsUp}
            onThumbsDown={onThumbsDown}
            onSpeak={onSpeak}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;