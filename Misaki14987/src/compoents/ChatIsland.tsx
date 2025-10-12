import { useState } from 'preact/hooks';
import '../styles/global.css';
import type { JSX } from 'preact';
import MessageShow from './MessageShow';
import { fetchAiReply } from '../api';
import { LoadingSpinning } from './Loading';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

const ChatIsland = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleInputChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    setInputMessage(e.currentTarget.value);
  };

  const submitMessage = async (trimmed: string) => {
    setErrorMessage(null);
    setIsStreaming(true);

    let aiIndex: number;

    setMessages((prev) => {
      const next: ChatMessage[] = [
        ...prev,
        { role: 'user', text: trimmed },
        { role: 'ai', text: '' },
      ];
      aiIndex = next.length - 1;
      return next;
    });
    setInputMessage('');

    try {
      await fetchAiReply(trimmed, (delta) => {
        setMessages((prev) => {
          const next = [...prev];
          const current = next[aiIndex];
          if (current) {
            next[aiIndex] = { ...current, text: current.text + delta };
          }
          return next;
        });
      });
      setIsStreaming(false);
    } catch (error) {
      setMessages((prev) => {
        const next = [...prev];
        if (aiIndex < next.length) {
          next[aiIndex] = {
            role: 'ai',
            text: 'I see the issue now, You’re absolutely right,Your code is now production ready!',
          };
        }
        return next;
      });
      setIsStreaming(false);
    }
  };

  const handleSendMessage = async () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || isStreaming) return;
    await submitMessage(trimmed);
  };

  const handleKeyDown = (
    event: JSX.TargetedKeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const isSubmitDisabled = !inputMessage.trim() || isStreaming;

  return (
    <div className='w-full max-w-3xl rounded-3xl border border-rose-100 bg-white/90 p-8 shadow-2xl backdrop-blur'>
      <div className='text-center'>
        <span className='inline-flex items-center rounded-full bg-rose-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500'>
          M1saK1 AI Lounge
        </span>
        <h1 className='mt-4 text-3xl font-bold text-rose-500'>Chat</h1>
        <p className='mt-2 text-sm text-rose-300'>SUNFADED</p>
      </div>

      <div className='mt-6'>
        <MessageShow messages={messages} />
      </div>

      {isStreaming && (
        <div className='mt-3 flex items-center justify-center gap-2 text-sm text-rose-400'>
          <LoadingSpinning size={24} />
          <span>少女思考中...</span>
        </div>
      )}

      {errorMessage && (
        <p className='mt-3 text-center text-sm text-rose-500'>{errorMessage}</p>
      )}

      <div className='mt-6 flex gap-3'>
        <input
          id='userInput'
          type='text'
          className='flex-1 rounded-2xl border border-rose-200 bg-white/80 px-4 py-3 text-sm text-rose-500 placeholder:text-rose-200 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
          placeholder='Type your message here...'
          onInput={handleInputChange}
          value={inputMessage}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
        />
        <button
          className={`rounded-2xl px-6 py-3 text-sm font-semibold text-white transition-all ${
            isSubmitDisabled
              ? 'cursor-not-allowed bg-rose-200'
              : 'bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 shadow-lg shadow-rose-200/50 hover:from-rose-500 hover:via-pink-500 hover:to-rose-600'
          }`}
          onClick={handleSendMessage}
          disabled={isSubmitDisabled}
        >
          {isStreaming ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatIsland;
