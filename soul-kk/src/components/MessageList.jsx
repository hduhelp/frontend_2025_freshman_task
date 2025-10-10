import { useEffect, useRef } from 'react';

function MessageList({ messages }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className='mx-auto flex w-[100%] max-w-2xl flex-col gap-8 px-5 pt-24 pb-28'>
      {messages
        .filter((mes) => mes.role !== 'system')
        .map((msg, idx) =>
          msg.role === 'user' ? (
            <UserMessage key={`u-${idx}`} content={msg.content} />
          ) : (
            <AIMessage key={`a-${idx}`} content={msg.content} />
          )
        )}
      <div ref={messagesEndRef} />
    </div>
  );
}

function UserMessage({ content }) {
  return (
    <div className='text-md dark: self-end rounded-full bg-gray-100 px-4 py-1 shadow-2xs dark:bg-zinc-800'>
      {content}
    </div>
  );
}

function AIMessage({ content }) {
  return (
    <div
      className={`${content === '' ? 'animate-pulse' : ''} text-md max-w-[95%] self-start rounded-xl px-6 py-2 tracking-wide shadow-2xs`}
    >
      {content === '' ? '···' : content}
    </div>
  );
}

export default MessageList;
