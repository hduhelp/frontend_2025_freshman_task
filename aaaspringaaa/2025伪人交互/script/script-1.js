// 1. JS加载验证：确认文件正常加载（控制台可查看）
console.log("JS文件加载成功！当前交互功能初始化中...");

// 2. DOM 元素获取（确保所有元素正确关联）
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const chatRecords = document.getElementById('chatRecords');
const typingTip = document.getElementById('typingTip');
const themeSwitch = document.getElementById('themeSwitch');
const initTime = document.getElementById('initTime');

// 3. 基础配置（统一管理常量，避免硬编码）
const CONFIG = {
    // API 配置（若密钥过期，需替换为有效密钥）
    api: {
        url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        key: '23038354-5b81-446a-9fcc-da1412dc328e',
        model: 'doubao-seed-1-6-250615'
    },
    // 本地存储键名（避免拼写错误）
    storageKey: 'pseudoHumanChatHistory',
    // 时间格式化配置
    timeFormat: {
        dateSep: '-',
        timeSep: ':',
        includeSec: true
    }
};

// 4. 页面加载初始化（执行必要的初始化操作）
window.addEventListener('DOMContentLoaded', () => {
    console.log("页面DOM加载完成，开始初始化核心功能...");
    
    // 初始化欢迎消息时间戳
    initTime.textContent = getFormattedTime();
    // 加载本地存储的历史对话
    loadChatHistory();
    // 初始化主题（记忆上次选择的主题）
    initTheme();
    // 初始化输入框自适应高度
    initAutoResizeInput();

    console.log("核心功能初始化完成！当前可正常交互。");
});

// 5. 工具函数（通用功能封装，提高复用性）
/**
 * 格式化当前时间（示例：2025-10-09 15:30:45）
 */
function getFormattedTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，补0到2位
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = CONFIG.timeFormat.includeSec ? String(now.getSeconds()).padStart(2, '0') : '';

    const dateStr = `${year}${CONFIG.timeFormat.dateSep}${month}${CONFIG.timeFormat.dateSep}${day}`;
    const timeStr = CONFIG.timeFormat.includeSec 
        ? `${hour}${CONFIG.timeFormat.timeSep}${minute}${CONFIG.timeFormat.timeSep}${second}`
        : `${hour}${CONFIG.timeFormat.timeSep}${minute}`;
    
    return `${dateStr} ${timeStr}`;
}

/**
 * 滚动聊天区域到底部（确保最新消息可见）
 */
function scrollToBottom() {
    chatRecords.scrollTop = chatRecords.scrollHeight;
}

/**
 * 本地存储聊天历史
 * @param {Array} history - 聊天历史数组（每个元素含 role: 'user'/'bot', content: '消息内容', time: '时间戳'）
 */
function saveChatHistory(history) {
    try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(history));
        console.log("聊天历史已保存到本地存储，共", history.length, "条消息");
    } catch (error) {
        console.error('存储聊天历史失败：', error);
        alert('本地存储不可用，聊天历史无法保存');
    }
}

/**
 * 读取本地存储的聊天历史
 * @returns {Array} - 聊天历史数组（默认空数组）
 */
function getChatHistory() {
    try {
        const historyStr = localStorage.getItem(CONFIG.storageKey);
        const history = historyStr ? JSON.parse(historyStr) : [];
        console.log("从本地存储读取聊天历史，共", history.length, "条消息");
        return history;
    } catch (error) {
        console.error('读取聊天历史失败：', error);
        return [];
    }
}

// 6. 聊天核心功能（消息添加、历史加载、API 请求）
/**
 * 添加消息到聊天区域
 * @param {string} role - 角色（'user' 用户 / 'bot' 机器人）
 * @param {string} content - 消息内容
 * @param {string} time - 时间戳（默认当前时间）
 */
function addMessage(role, content, time = getFormattedTime()) {
    if (!content.trim()) return; // 过滤空消息

    // 创建消息容器
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}-message`;

    // 图标选择（用户/机器人）
    const icon = role === 'user' ? 'fa-user' : 'fa-robot';

    // 消息内容 HTML（与 CSS 样式对应）
    messageEl.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${icon}"></i>
        </div>
        <div class="message-content">
            ${content.replace(/\n/g, '<br>')} <!-- 处理换行符 -->
            <div class="message-time">${time}</div>
        </div>
    `;

    // 添加到聊天区域并滚动到底部
    chatRecords.appendChild(messageEl);
    scrollToBottom();
    console.log(`已添加${role}消息：`, content.slice(0, 20), "...");

    // 更新本地存储（追加新消息）
    const history = getChatHistory();
    history.push({ role, content, time });
    saveChatHistory(history);
}

/**
 * 加载本地存储的聊天历史到页面
 */
function loadChatHistory() {
    const history = getChatHistory();
    if (history.length === 0) {
        console.log("无本地聊天历史，无需加载");
        return; // 无历史记录则跳过
    }

    // 清空当前聊天区域（保留初始欢迎消息）
    const initMsg = chatRecords.querySelector('.bot-message');
    chatRecords.innerHTML = '';
    chatRecords.appendChild(initMsg);

    // 批量添加历史消息
    history.forEach(msg => {
        addMessage(msg.role, msg.content, msg.time);
    });
    console.log("本地聊天历史加载完成");
}

/**
 * 调用 AI API 获取机器人回复
 * @param {string} userInput - 用户输入内容
 * @returns {string} - 机器人回复内容（失败时返回错误信息）
 */
async function callAIAPI(userInput) {
    try {
        console.log("开始调用AI API，用户输入：", userInput.slice(0, 20), "...");
        const response = await fetch(CONFIG.api.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.api.key}`,
                'X-Content-Type-Options': 'nosniff' // 安全头，防止 MIME 类型嗅探
            },
            body: JSON.stringify({
                model: CONFIG.api.model,
                messages: [{ role: 'user', content: userInput }],
                temperature: 0.7 // 控制回复随机性（0-1，值越高越随机）
            })
        });

        // 处理 HTTP 错误（如 401 未授权、404 接口不存在）
        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`API 请求失败（${response.status}）：${errorDetails.slice(0, 100)}...`);
        }

        const data = await response.json();
        console.log("AI API 调用成功，返回数据：", data);

        // 检查 API 返回结构是否正确
        if (!data.choices || data.choices.length === 0) {
            throw new Error('API 返回无效数据，未找到回复内容');
        }

        return data.choices[0].message.content;

    } catch (error) {
        console.error('AI API 调用失败：', error);
        // 友好提示：若API密钥过期，引导替换
        if (error.message.includes('401')) {
            return `抱歉，API密钥无效或已过期，请更换有效密钥后重试：${error.message}`;
        }
        return `抱歉，获取回复失败：${error.message}`;
    }
}

/**
 * 发送消息逻辑（整合用户输入、API 请求、添加消息）
 */
async function sendMessage() {
    const userInput = msgInput.value.trim();
    if (!userInput) {
        alert('请输入您的问题后再发送！');
        return;
    }

    // 1. 添加用户消息到聊天区域
    addMessage('user', userInput);
    // 2. 清空输入框并禁用（防止重复发送）
    msgInput.value = '';
    msgInput.disabled = true;
    sendBtn.disabled = true;
    // 3. 显示"正在输入"提示
    typingTip.style.display = 'flex';
    console.log("用户消息已发送，等待AI回复...");

    try {
        // 4. 调用 API 获取机器人回复
        const botReply = await callAIAPI(userInput);
        // 5. 添加机器人回复到聊天区域
        addMessage('bot', botReply);
    } finally {
        // 6. 恢复输入框和按钮状态，隐藏"正在输入"提示
        msgInput.disabled = false;
        sendBtn.disabled = false;
        typingTip.style.display = 'none';
        // 7. 聚焦输入框（方便用户继续输入）
        msgInput.focus();
        console.log("消息发送流程结束，恢复输入状态");
    }
}

// 7. 主题切换功能（记忆用户选择，刷新页面不丢失）
/**
 * 初始化主题（读取本地存储，默认亮模式）
 */
function initTheme() {
    const savedTheme = localStorage.getItem('pseudoHumanTheme');
    const isDark = savedTheme === 'dark' || 
        (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // 应用主题到页面
    if (isDark) {
        document.body.classList.add('dark');
        themeSwitch.innerHTML = '<i class="fas fa-sun"></i>'; // 切换为"太阳"图标（表示当前是暗模式）
        console.log("初始化主题：暗模式（读取本地存储或系统偏好）");
    } else {
        document.body.classList.remove('dark');
        themeSwitch.innerHTML = '<i class="fas fa-moon"></i>'; // 切换为"月亮"图标（表示当前是亮模式）
        console.log("初始化主题：亮模式（读取本地存储或系统偏好）");
    }
}

/**
 * 切换主题（亮/暗模式切换）
 */
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    // 更新图标
    themeSwitch.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    // 保存主题到本地存储
    localStorage.setItem('pseudoHumanTheme', isDark ? 'dark' : 'light');
    console.log("主题切换完成：", isDark ? "暗模式" : "亮模式");
}

// 8. 输入框自适应高度（根据内容自动调整高度，避免滚动条）
function initAutoResizeInput() {
    // 监听输入事件，动态调整高度
    msgInput.addEventListener('input', () => {
        // 重置高度为初始值（避免高度无限增长）
        msgInput.style.height = 'auto';
        // 设置新高度（内容高度 + 上下内边距，与CSS max-height保持一致）
        msgInput.style.height = `${Math.min(msgInput.scrollHeight, 220)}px`; // 已同步CSS最大高度220px
    });

    // 初始化高度（处理页面加载时可能存在的默认值）
    msgInput.style.height = `${Math.min(msgInput.scrollHeight, 220)}px`;
    console.log("输入框自适应高度初始化完成");
}

// 9. 事件绑定（按钮点击、回车键发送、主题切换）
// 发送按钮点击事件
sendBtn.addEventListener('click', sendMessage);
console.log("发送按钮点击事件绑定完成");

// 回车键发送消息（支持 Shift+Enter 换行）
msgInput.addEventListener('keydown', (e) => {
    // 按下 Enter 且未按 Shift → 发送消息
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // 阻止默认换行行为
        sendMessage();
    }
});
console.log("输入框回车键事件绑定完成");

// 主题切换按钮点击事件
themeSwitch.addEventListener('click', toggleTheme);
console.log("主题切换按钮点击事件绑定完成");