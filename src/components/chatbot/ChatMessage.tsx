import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import MessageActions from './MessageActions';
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

  useEffect(() => {
    if (elementRef.current) {
      const renderChart = async () => {
        try {
          mermaid.initialize({ 
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
          });
          
          const { svg } = await mermaid.render(`mermaid-${Date.now()}`, chart);
          if (elementRef.current) {
            elementRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          if (elementRef.current) {
            elementRef.current.innerHTML = `<pre class="text-red-500 text-sm">Error rendering diagram: ${error}</pre>`;
          }
        }
      };

      renderChart();
    }
  }, [chart]);

  return <div ref={elementRef} className="my-4 flex justify-center" />;
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
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`w-full mb-6 ${isBot ? '' : 'flex justify-end'}`}>
      <div className={`max-w-4xl w-full ${isBot ? 'group' : ''}`}>
        {/* Message content */}
        <div className={`${
          isBot 
            ? 'bg-transparent text-gray-800 dark:text-gray-200' 
            : 'bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 ml-auto max-w-2xl'
        }`}>
          <div className="prose prose-sm max-w-none dark:prose-invert">
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
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={language}
                      PreTag="div"
                      className="rounded-md text-sm !mt-2 !mb-2"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={`${className} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded text-xs`} {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic mb-3 text-gray-600 dark:text-gray-400">
                    {children}
                  </blockquote>
                ),
                h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-gray-100">{children}</h3>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                a: ({ children, href }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
          {/* File Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment) => (
                <FilePreview key={attachment.id} attachment={attachment} />
              ))}
            </div>
          )}
        </div>
        
        {/* Message Actions for Bot Messages */}
        {isBot && (
          <MessageActions
            message={message}
            onCopy={onCopy}
            onDownload={onDownload}
            onThumbsUp={onThumbsUp}
            onThumbsDown={onThumbsDown}
            onSpeak={onSpeak}
          />
        )}
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-400 mt-2 ${isBot ? 'text-left' : 'text-right'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;