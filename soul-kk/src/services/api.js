const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const MODEL_NAME = import.meta.env.VITE_MODEL_NAME;

console.log(API_URL, API_KEY, MODEL_NAME);

// 传入messages消息列表
//返回respnse.body
export async function fetchChatResponse(messages) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages,
      // temperature: 0.7,
      // top_p: 0.9,
      // frequency_penalty: 0,
      // presence_penalty: 0,
      max_tokens: 2000,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.body;
}
