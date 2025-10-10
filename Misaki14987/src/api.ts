// src/api.ts

const API_KEY = import.meta.env.PUBLIC_DOUABO_API_KEY; // 建议用环境变量

export const fetchAiReply = async (
  message: string,
  onChunk: (chunk: string) => void
) => {
  const response = await fetch(
    'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.PUBLIC_DOUABO_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'doubao-seed-1-6-250615',
        messages: [{ role: 'user', content: message }],
        stream: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');

  let buffer = '';
  while (true) {
    const { done, value } = (await reader?.read()) || {};
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.replace('data: ', '').trim();
        if (jsonStr === '[DONE]') {
          reader?.cancel();
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            onChunk(delta);
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          continue;
        }
      }
    }
  }
};
