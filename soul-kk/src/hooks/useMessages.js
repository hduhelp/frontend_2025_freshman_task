import { useEffect, useState } from 'react';

const systemMessage = {
  role: 'system',
  content: import.meta.env.VITE_SYSTEM_MESSAGE,
};

export function useMessages() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('messages');
    return savedMessages ? JSON.parse(savedMessages) : [systemMessage];
  });

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  return { messages, setMessages };
}
