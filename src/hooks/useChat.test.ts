import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as React from 'react';
import { useChat } from './useChat';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; }
  };
})();

global.window = {
  localStorage: localStorageMock
} as any;

// Helper to run react hooks in standard JS env
function runHook<T>(hookFn: () => T) {
  const states: any[] = [];
  let stateIndex = 0;
  
  const mockUseState = (initial: any) => {
    const idx = stateIndex++;
    if (states[idx] === undefined) {
      states[idx] = typeof initial === 'function' ? initial() : initial;
    }
    const setter = (update: any) => {
      states[idx] = typeof update === 'function' ? update(states[idx]) : update;
      triggerReRun();
    };
    return [states[idx], setter];
  };

  let result: T;
  const triggerReRun = () => {
    stateIndex = 0;
    const origUseState = React.useState;
    React.useState = mockUseState as any;
    result = hookFn();
    React.useState = origUseState;
  };

  triggerReRun();
  return {
    get result() { return result; },
    triggerReRun
  };
}

describe('useChat Hook Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should initialize with greeting message in English by default', () => {
    const { result } = runHook(() => useChat('en'));
    expect(result.messages.length).toBe(1);
    expect(result.messages[0].sender).toBe('bot');
    expect(result.messages[0].text).toContain('Hello! I am');
    expect(result.selectedLanguage).toBe('en');
  });

  it('should restore language and history from localStorage', () => {
    localStorageMock.setItem('arenamind_chat_lang', JSON.stringify('es'));
    localStorageMock.setItem('arenamind_chat_messages', JSON.stringify([
      { sender: 'user', text: 'Hola', timestamp: '10:00 AM' }
    ]));

    const { result } = runHook(() => useChat('en'));
    expect(result.selectedLanguage).toBe('es');
    expect(result.messages.length).toBe(1);
    expect(result.messages[0].text).toBe('Hola');
  });

  it('should change language and update greeting if history is empty', () => {
    const { result } = runHook(() => useChat('en'));
    
    result.changeLanguage('es');
    
    expect(result.selectedLanguage).toBe('es');
    expect(result.messages[0].text).toContain('¡Hola! Soy');
  });

  it('should simulate speech dictation input suggestions', () => {
    const { result } = runHook(() => useChat('en'));
    const cb = vi.fn();
    
    result.simulateVoiceInput(cb);
    
    expect(cb).toHaveBeenCalled();
    expect(typeof cb.mock.calls[0][0]).toBe('string');
  });

  it('should append a bot message directly using appendBotMessage', () => {
    const { result } = runHook(() => useChat('en'));
    result.appendBotMessage('Test System Message');
    expect(result.messages.length).toBe(2);
    expect(result.messages[1].sender).toBe('bot');
    expect(result.messages[1].text).toBe('Test System Message');
  });
});
