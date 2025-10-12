import InputField from './components/InputField';
import Header from './components/Header';
import MessageList from './components/MessageList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMessages } from './hooks/useMessages';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
      },
    },
  });

  const { messages, setMessages } = useMessages();
  const noMessage =
    messages.filter((msg) => msg.role !== 'system').length === 0;

  return (
    <QueryClientProvider client={queryClient}>
      <div
        id='container'
        className='bg-bg-light text-text-light dark:bg-bg-dark dark:text-text-dark relative min-h-screen min-w-screen'
      >
        <Header noMessage={noMessage} setMessages={setMessages} />

        <main className='relative'>
          <MessageList messages={messages} />
          <InputField
            messages={messages}
            setMessages={setMessages}
            noMessage={noMessage}
          />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
