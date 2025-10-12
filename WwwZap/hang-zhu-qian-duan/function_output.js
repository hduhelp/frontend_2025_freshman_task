const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'; // api地址
const API_KEY = '1a443f32-ebe1-4ac4-a7e8-d877146d729d'; // api key
let conversationHistory = [{"role": "system","content": "You are a helpful AI."}];
/*点击发送按钮*/
async function send_text() {
    const input_text = document.getElementById("input");
    const input_value = input_text.value.trim()
    if (!input_value) return;
    reveal(input_value,"user")
    input_text.value = ""
    try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "doubao-seed-1-6-250615", // 模型名
                        messages: conversationHistory,
                        max_tokens: 2000,
                    })
                });
                const data = await response.json();
                reveal(data.choices[0].message.content,"assistant");
            }
            catch (error) {
                console.error("请求出错:", error);
                reveal(`出错: ${error.message}`, "assistant");
            }
}
function reveal(text, role) {
            const textElement = document.getElementById("chat_area");
            const newtext = document.createElement("div");
            newtext.className = `message ${role}_text`;
            newtext.textContent = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
            textElement.appendChild(newtext);
            conversationHistory.push({ role, content: text.toString()});
}
document.getElementById("input").addEventListener("keydown",(e) =>{
    if (e.key === "Enter") {
        send_text();
        e.preventDefault();
    }
})