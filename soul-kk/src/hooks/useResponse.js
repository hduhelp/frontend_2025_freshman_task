import { useMutation } from '@tanstack/react-query';
import { fetchChatResponse } from '../services/api';

export function useResponse() {
  const { isPending, mutate: getResponse } = useMutation({
    mutationFn: fetchChatResponse,
    onError: (error) => {
      console.error('Error fetching chat response:', error);
    },
  });

  return { isPending, getResponse };
}
