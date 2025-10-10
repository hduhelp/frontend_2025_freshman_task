import type { FunctionalComponent } from 'preact';
import '../styles/global.css';
import Markdown from 'react-markdown';

type Message = {
  role: 'user' | 'ai';
  text: string;
};

interface MessageShowProps {
  messages: Message[];
}

const MessageShow: FunctionalComponent<MessageShowProps> = ({ messages }) => {
  if (!messages.length) {
    return (
      <div className='flex h-80 items-center justify-center rounded-2xl bg-rose-50/60 text-center text-rose-400 shadow-inner'>
        <p className='px-6 text-sm leading-relaxed'>SUNFADAD</p>
      </div>
    );
  }

  return (
    <div className='h-80 space-y-4 overflow-y-auto rounded-2xl bg-rose-50/60 p-4 shadow-inner'>
      {messages.map((msg, index) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={index}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow ${
                isUser
                  ? 'rounded-br-none bg-gradient-to-r from-rose-400 to-pink-500 text-white'
                  : 'rounded-bl-none bg-white text-rose-500 border border-rose-100'
              }`}
            >
              <span className='block text-xs font-semibold uppercase tracking-wide opacity-80'>
                {isUser ? 'You' : 'AI'}
              </span>
              <Markdown>{msg.text}</Markdown>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageShow;
