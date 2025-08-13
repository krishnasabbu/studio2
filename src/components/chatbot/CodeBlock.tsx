import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface CodeBlockProps {
  language: string;
  children: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, children, className }) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative group my-4">
      {/* Code Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
          {language || 'code'}
        </span>
        
        {/* Copy Button - Shows on hover */}
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Copy code to clipboard"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="relative overflow-hidden rounded-b-lg">
        <SyntaxHighlighter
          style={theme === 'dark' ? tomorrow : prism}
          language={language}
          PreTag="div"
          className={`!mt-0 !mb-0 !rounded-t-none ${className || ''}`}
          customStyle={{
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            fontSize: '14px',
            lineHeight: '1.5',
            padding: '16px',
            background: theme === 'dark' ? '#171717 !important' : '#f8f8f8 !important',
            color: theme === 'dark' ? '#ffffff' : '#1f2937',
          }}
          codeTagProps={{
            style: {
              fontSize: '14px',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              color: theme === 'dark' ? '#ffffff !important' : '#1f2937 !important',
              background: 'transparent !important',
            }
          }}
          wrapLongLines={true}
        >
          {children.replace(/\n$/, '')}
        </SyntaxHighlighter>
        
        {/* Additional dark theme override */}
        {theme === 'dark' && (
          <style jsx>{`
            .token.comment,
            .token.prolog,
            .token.doctype,
            .token.cdata {
              color: #6a9955 !important;
            }
            .token.punctuation {
              color: #d4d4d4 !important;
            }
            .token.property,
            .token.tag,
            .token.boolean,
            .token.number,
            .token.constant,
            .token.symbol,
            .token.deleted {
              color: #b5cea8 !important;
            }
            .token.selector,
            .token.attr-name,
            .token.string,
            .token.char,
            .token.builtin,
            .token.inserted {
              color: #ce9178 !important;
            }
            .token.operator,
            .token.entity,
            .token.url,
            .language-css .token.string,
            .style .token.string {
              color: #d4d4d4 !important;
            }
            .token.atrule,
            .token.attr-value,
            .token.keyword {
              color: #569cd6 !important;
            }
            .token.function,
            .token.class-name {
              color: #dcdcaa !important;
            }
            .token.regex,
            .token.important,
            .token.variable {
              color: #d16969 !important;
            }
          `}</style>
        )}
      </div>
    </div>
  );
};

export default CodeBlock;