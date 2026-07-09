import React from 'react';
import { ChatMessage } from '../hooks/useChat';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isTyping: boolean;
  formatMarkdown: (text: string) => { __html: string };
  playVoiceOutput: (text: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  messages,
  isTyping,
  formatMarkdown,
  playVoiceOutput,
}) => {
  return (
    <div className="chat-messages" aria-live="polite">
      {messages.map((msg, idx) => (
        <div key={idx} className={`chat-msg ${msg.sender}`}>
          <div className="msg-content" dangerouslySetInnerHTML={formatMarkdown(msg.text)} />
          <span className="msg-time">{msg.timestamp}</span>
          {msg.sender === 'bot' && !msg.isStreaming && (
            <button
              onClick={() => playVoiceOutput(msg.text)}
              className="msg-audio-btn"
              title="Speak message aloud"
              aria-label="Speak message aloud"
              style={{ 
                position: 'absolute', 
                right: '10px', 
                top: '10px', 
                background: 'none', 
                border: 'none', 
                color: 'var(--text-muted)', 
                cursor: 'pointer' 
              }}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2}>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
          )}
        </div>
      ))}
      
      {isTyping && (
        <div className="chat-msg bot chat-loading" aria-label="ArenaMind is typing">
          <span></span><span></span><span></span>
        </div>
      )}
    </div>
  );
};
