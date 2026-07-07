import { useState, useCallback, useRef, useEffect } from 'react';
import { AIService } from '../services/aiService';

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

const GREETINGS: Record<string, string> = {
  en: "👋 Hello! I am **ArenaMind**, your GenAI Concierge for the FIFA World Cup 2026. I can assist you with multilingual translations, wheelchair-accessible routing, sustainable transit, and live wait times. What can I help you find today?",
  es: "👋 ¡Hola! Soy **ArenaMind**, tu Asistente de IA para la Copa Mundial de la FIFA 2026. Te puedo ayudar con traducciones, rutas accesibles, transporte ecológico y tiempos de espera. ¿En qué te puedo ayudar hoy?",
  fr: "👋 Bonjour! Je suis **ArenaMind**, votre assistant IA pour la Coupe du Monde de la FIFA 2026. Je peux vous aider avec les traductions, les itinéraires accessibles, les transports durables et les temps d'attente. Que puis-je faire pour vous aujourd'hui?",
  pt: "👋 Olá! Sou o **ArenaMind**, seu assistente GenAI para a Copa do Mundo FIFA 2026. Posso ajudar com rotas acessíveis, transporte sustentável e tempos de espera. Como posso te ajudar hoje?"
};

export const useChat = (initialLang: string = 'en', onTriggerAccessibilityRoute?: () => void) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLang);
  const streamingTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize with greeting
  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: GREETINGS[selectedLanguage] || GREETINGS['en'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [selectedLanguage]);

  // Set language wrapper
  const changeLanguage = useCallback((lang: string) => {
    if (streamingTimer.current) clearInterval(streamingTimer.current);
    setSelectedLanguage(lang);
  }, []);

  // Audio Playback Translation Simulation
  const playVoiceOutput = useCallback((text: string) => {
    const cleanText = text.replace(/[*#_]/g, "");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (selectedLanguage === "es") utterance.lang = "es-MX";
      else if (selectedLanguage === "fr") utterance.lang = "fr-FR";
      else if (selectedLanguage === "pt") utterance.lang = "pt-BR";
      else utterance.lang = "en-US";
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`🔊 Audio Playback:\n"${cleanText}"`);
    }
  }, [selectedLanguage]);

  // Stream bot text char by char (Typewriter streaming effect)
  const streamBotResponse = useCallback((fullText: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add an empty bot message that we will stream into
    setMessages(prev => [...prev, { sender: 'bot', text: '', timestamp, isStreaming: true }]);

    let index = 0;
    streamingTimer.current = setInterval(() => {
      if (index < fullText.length) {
        const nextChar = fullText.charAt(index);
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.sender === 'bot') {
            lastMsg.text = fullText.substring(0, index + 1);
          }
          return updated;
        });
        index++;
      } else {
        if (streamingTimer.current) clearInterval(streamingTimer.current);
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg) {
            lastMsg.isStreaming = false;
          }
          return updated;
        });
      }
    }, 12);
  }, []);

  // Send message
  const sendMessage = useCallback((text: string) => {
    if (isTyping) return;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text, timestamp }]);
    
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const answer = AIService.resolveConciergeQuery(text, selectedLanguage);
      
      // Check if accessibility path is queried, trigger callback to redraw map
      const cleaned = text.toLowerCase();
      if ((cleaned.includes("105") || cleaned.includes("accessibility") || cleaned.includes("wheelchair")) && onTriggerAccessibilityRoute) {
        onTriggerAccessibilityRoute();
      }

      streamBotResponse(answer);
    }, 900);
  }, [isTyping, selectedLanguage, streamBotResponse, onTriggerAccessibilityRoute]);

  // Voice dictation prompt suggestions
  const simulateVoiceInput = useCallback((inputCallback: (val: string) => void) => {
    const voicePrompts = [
      "Find wheelchair access to my seat in Section 105.",
      "How do I get to Restrooms A from Gate B?",
      "Translate 'I need a bottle of water' to Spanish.",
      "What is the most eco-friendly transport option available?",
      "Which concession stand has the shortest line right now?"
    ];
    const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
    inputCallback(randomPrompt);
  }, []);

  return {
    messages,
    isTyping,
    selectedLanguage,
    sendMessage,
    changeLanguage,
    playVoiceOutput,
    simulateVoiceInput
  };
};
