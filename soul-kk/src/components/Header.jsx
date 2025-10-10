const systemMessage = {
  role: 'system',
  content: import.meta.env.VITE_SYSTEM_MESSAGE,
};

function Header({ noMessage, setMessages }) {
  function handleClick() {
    setMessages([systemMessage]);
  }

  return (
    <div
      className={`${noMessage ? '' : 'border-b'} bg-bg-light dark:bg-bg-dark fixed top-0 z-10 flex w-full items-center justify-between border-zinc-200 px-6 pt-2 pb-1 dark:border-zinc-700`}
    >
      <span className='text-xl font-normal tracking-wide'>ChatKK</span>

      {noMessage ? (
        <button className='flex items-center justify-center text-[22px]'>
          <ion-icon name='chatbubble-outline'></ion-icon>
        </button>
      ) : (
        <button
          onClick={handleClick}
          className='relative flex cursor-pointer items-center justify-center rounded-md px-2 py-2 text-2xl transition hover:bg-stone-200 hover:*:block'
        >
          <ion-icon name='create-outline'></ion-icon>
          <span className='absolute top-11 hidden w-[50px] rounded-md bg-stone-900 px-1 py-0.5 text-xs text-zinc-50 transition'>
            新聊天
          </span>
        </button>
      )}
    </div>
  );
}

export default Header;
