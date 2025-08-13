import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User } from 'lucide-react';
import { Message, FileAttachment } from './types';

interface ChatMessageProps {
  message: Message;
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

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === 'bot';
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-start space-x-3 mb-4 ${isBot ? 'justify-start' : 'justify-end flex-row-reverse space-x-reverse'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isBot 
          ? 'bg-primary-100 text-primary-600' 
          : 'bg-blue-500 text-white'
      }`}>
        {isBot ? (
          <Bot className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>

      {/* Message bubble */}
      <div className={`max-w-xs lg:max-w-sm xl:max-w-md ${isBot ? 'mr-auto' : 'ml-auto'}`}>
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
          isBot 
            ? 'bg-white border border-gray-200 text-gray-800' 
            : 'bg-blue-500 text-white'
        }`}>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md text-sm"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={`${className} bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs`} {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2">
                    {children}
                  </blockquote>
                ),
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                a: ({ children, href }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`underline hover:no-underline ${
                      isBot ? 'text-blue-600' : 'text-blue-200'
                    }`}
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
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <FilePreview key={attachment.id} attachment={attachment} />
              ))}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;