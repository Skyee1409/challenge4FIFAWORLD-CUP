import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { ChatMessage } from '../hooks/useChat';

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
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);

  const { messages, isTyping, selectedLanguage, sendMessage, playVoiceOutput, simulateVoiceInput } = chat;

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const formatMarkdown = (text: string) => {
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
    return { __html: DOMPurify.sanitize(formatted) };
  };

  // Browser Speech-to-Text SpeechRecognition API Integration
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechFeedback("Web Speech API not supported. Simulating voice input...");
      setTimeout(() => setSpeechFeedback(null), 3000);
      // Fallback
      simulateVoiceInput((val) => {
        setInputValue(val);
        sendMessage(val);
        setInputValue('');
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Map languages
      if (selectedLanguage === 'es') recognition.lang = 'es-MX';
      else if (selectedLanguage === 'fr') recognition.lang = 'fr-FR';
      else if (selectedLanguage === 'pt') recognition.lang = 'pt-BR';
      else recognition.lang = 'en-US';

      setIsListening(true);
      setSpeechFeedback("Listening... Speak now.");

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          sendMessage(transcript);
          setInputValue('');
          setSpeechFeedback(null);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setSpeechFeedback(`Speech error: ${event.error || 'unknown'}. Simulating fallback...`);
        setTimeout(() => setSpeechFeedback(null), 3000);
        // Fallback on error
        simulateVoiceInput((val) => {
          setInputValue(val);
          sendMessage(val);
          setInputValue('');
        });
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
      setSpeechFeedback("Failed to launch mic. Simulating fallback...");
      setTimeout(() => setSpeechFeedback(null), 3000);
      simulateVoiceInput((val) => {
        setInputValue(val);
        sendMessage(val);
        setInputValue('');
      });
    }
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

      {/* Message History list */}
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
        
        {/* Typing Loader Indicator */}
        {isTyping && (
          <div className="chat-msg bot chat-loading" aria-label="ArenaMind is typing">
            <span></span><span></span><span></span>
          </div>
        )}
      </div>

      {speechFeedback && (
        <div className="speech-feedback-banner" style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', padding: '4px 12px', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '4px', margin: '4px 12px' }}>
          🎙️ {speechFeedback}
        </div>
      )}

      {/* Chips suggestions */}
      <div className="prompt-chips">
        <button className="chip" onClick={() => sendMessage("Find accessible routes to my seat in Sec 105.")}>♿ Sec 105 Accessibility</button>
        <button className="chip" onClick={() => sendMessage("What's the eco-friendly transport option after the match?")}>🌱 Eco Transport</button>
        <button className="chip" onClick={() => sendMessage("How long is the line at Gate B concessions?")}>🌭 Concession B Line</button>
        <button className="chip" onClick={() => sendMessage("Translate 'Where is the medical station' to Spanish.")}>🗣️ Translate</button>
      </div>

      {/* Text Input Panel */}
      <div className="chat-input-bar">
        <input
          type="text"
          placeholder="Ask ArenaMind..."
          id="chat-field"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-label="Type your question for ArenaMind concierge"
        />
        <button
          onClick={startSpeechRecognition}
          className={`btn-icon ${isListening ? 'recording-active' : ''}`}
          title="Voice dictation input"
          aria-label="Record voice search query"
          style={isListening ? { color: 'var(--neon-magenta)' } : undefined}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>
        <button
          onClick={handleSend}
          className="btn-primary-glow"
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </section>
  );
};
