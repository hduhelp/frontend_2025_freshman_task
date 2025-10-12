import { useState } from 'react';
import 'animate.css';
import { message } from 'antd';
import { useResponse } from '../hooks/useResponse';

function InputField({ messages, setMessages, noMessage }) {
  const [value, setValue] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const { isPending, getResponse } = useResponse();
  const [isFetching, setIsFetching] = useState(false);

  function showError(msg) {
    messageApi.open({
      type: 'error',
      content: msg,
      duration: 3,
    });
  }

  // 处理流式响应
  async function handleStreamResponse(response) {
    if (!response) return;

    const decoder = new TextDecoder();
    let accumulatedContent = ''; // 用于累积内容

    try {
      // 创建初始的 assistant 消息
      setIsFetching(true);
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      for await (const value of response) {
        const lines = decoder
          .decode(value, { stream: true })
          .split('\n')
          .map((chunk) => chunk.trim())
          .filter(Boolean);

        for (const line of lines) {
          if (line === 'data: [DONE]') {
            setIsFetching(false);
            return;
          }
          try {
            const json = JSON.parse(line.slice('data: '.length));
            const chunk = json.choices?.[0]?.delta?.content || '';
            // 状态更新
            setMessages((messages) => {
              const lastMessage = messages[messages.length - 1];
              if (lastMessage?.role !== 'assistant') return messages;

              return [
                ...messages.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + chunk },
              ];
            });

            accumulatedContent += chunk;
          } catch (parseError) {
            console.error('解析响应数据失败:', parseError);
          }
        }
      }
    } catch (streamError) {
      console.error('流处理错误:', streamError);
      // 在流处理失败时，保留已经累积的内容
      setMessages((messages) => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role !== 'assistant') return messages;

        return [
          ...messages.slice(0, -1),
          { ...lastMessage, content: accumulatedContent + '\n[响应中断]' },
        ];
      });
      showError('响应中断，请重试');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setValue('');
    const updatedMessages = [...messages, { role: 'user', content: value }];
    setMessages(updatedMessages);
    getResponse(updatedMessages, {
      onSuccess: (response) => handleStreamResponse(response),
      onError: (error) => showError(error.message || '请求失败，请稍后再试'),
    });
  }

  return (
    <>
      {contextHolder}
      <div
        className={`bg-bg-light/50 fixed left-1/2 flex w-full -translate-x-1/2 flex-col items-center justify-center gap-8 backdrop-blur-2xl ${
          noMessage ? 'top-1/2 -translate-y-1/2' : 'bottom-0 pb-6'
        } dark:bg-bg-dark z-10`}
      >
        {noMessage && (
          <h1 className='text-[26px] font-normal tracking-wider'>
            今天有什么要忙的？
          </h1>
        )}
        <form
          className={`relative w-[600px] ${isPending || isFetching ? 'opacity-50' : ''}`}
          onSubmit={handleSubmit}
        >
          <input
            type='text'
            placeholder={
              isPending ? 'AI思考中' : isFetching ? 'AI回答中' : '询问任何问题'
            }
            value={value}
            disabled={isPending || isFetching}
            onChange={(e) => setValue(e.target.value)}
            className={`focus:shadow-2lg text-md dark:bg-text-secondary w-full rounded-full border border-solid border-zinc-300 px-8 py-3.5 pr-16 shadow-md transition placeholder:font-normal placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 ${
              isPending || isFetching ? 'cursor-not-allowed' : ''
            }`}
          />

          {(value || isPending || isFetching) && (
            <button
              type='submit'
              disabled={isPending || isFetching}
              className={`absolute top-1/2 right-2 flex aspect-square h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full ${
                isPending || isFetching
                  ? 'animate-spin cursor-not-allowed bg-stone-800 text-stone-50'
                  : 'cursor-pointer bg-stone-900 text-stone-200 hover:bg-stone-950'
              } text-lg transition dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200`}
            >
              {isPending || isFetching ? (
                <ion-icon name='reload-outline'></ion-icon>
              ) : (
                '↑'
              )}
            </button>
          )}
        </form>
      </div>
    </>
  );
}

export default InputField;
