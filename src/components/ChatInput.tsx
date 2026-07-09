import React, { useState } from 'react';

interface ChatInputProps {
  sendMessage: (text: string) => void;
  selectedLanguage: string;
  simulateVoiceInput: (inputCallback: (val: string) => void) => void;
  isTyping: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  sendMessage,
  selectedLanguage,
  simulateVoiceInput,
  isTyping,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);

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

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechFeedback("Web Speech API not supported. Simulating voice input...");
      setTimeout(() => setSpeechFeedback(null), 3000);
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
    <>
      {speechFeedback && (
        <div className="speech-feedback-banner" style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', padding: '4px 12px', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '4px', margin: '4px 12px' }}>
          🎙️ {speechFeedback}
        </div>
      )}

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
    </>
  );
};
