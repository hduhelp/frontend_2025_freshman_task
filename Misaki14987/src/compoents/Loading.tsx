export const LoadingSpinning = ({ size = 32 }: { size: number }) => {
  return (
    <div
      role='status'
      aria-live='polite'
      aria-label='loading'
      aria-hidden='true'
    >
      <div
        className='rounded-full border-2 border-indigo-600 border-r-transparent animate-[spin-slow_1s_linear_infinite]'
        style={{ width: size, height: size }}
      ></div>
    </div>
  );
};
