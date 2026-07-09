import React from 'react';
import DOMPurify from 'dompurify';
import { ChatMessage } from '../hooks/useChat';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';

interface ChatPanelProps {
  chat: {
    messages: ChatMessage[];
    isTyping: boolean;
    selectedLanguage: string;
    sendMessage: (text: string) => void;
    playVoiceOutput: (text: string) => void;
    simulateVoiceInput: (inputCallback: (val: string) => void) => void;
  };
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ chat }) => {
  const { messages, isTyping, selectedLanguage, sendMessage, playVoiceOutput, simulateVoiceInput } = chat;

  const formatMarkdown = (text: string) => {
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
    return { __html: DOMPurify.sanitize(formatted) };
  };

  return (
    <section className="card glass-panel chat-container" aria-label="AI Chat Assistant">
      <div className="card-header">
        <div className="title-with-subtitle">
          <h2>GenAI Assistant</h2>
          <p>Your multilingual event guide</p>
        </div>
        <span className="badge badge-success-glow">Active AI</span>
      </div>

      {/* Message History list subcomponent */}
      <ChatHistory
        messages={messages}
        isTyping={isTyping}
        formatMarkdown={formatMarkdown}
        playVoiceOutput={playVoiceOutput}
      />

      {/* Chips suggestions */}
      <div className="prompt-chips">
        <button className="chip" onClick={() => sendMessage("Find accessible routes to my seat in Sec 105.")}>♿ Sec 105 Accessibility</button>
        <button className="chip" onClick={() => sendMessage("What's the eco-friendly transport option after the match?")}>🌱 Eco Transport</button>
        <button className="chip" onClick={() => sendMessage("How long is the line at Gate B concessions?")}>🌭 Concession B Line</button>
        <button className="chip" onClick={() => sendMessage("Translate 'Where is the medical station' to Spanish.")}>🗣️ Translate</button>
      </div>

      {/* Text Input Panel subcomponent */}
      <ChatInput
        sendMessage={sendMessage}
        selectedLanguage={selectedLanguage}
        simulateVoiceInput={simulateVoiceInput}
        isTyping={isTyping}
      />
    </section>
  );
};
