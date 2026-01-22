/**
 * API请求模块
 * 依赖: 
 * - DOM元素: targetUsernameInput, usernameInput, requestList, chatContainer, 
 *   usernameInput, chatContainer, messageInput, sendButton等
 * - 全局变量: currentChannel, currentEncryptionKey, encryptionRequests等
 * - 其他模块: crypto.js (decryptMessage函数), styling.js (addSystemMessage函数)
 */

// 生成随机用户名
function generateRandomUsername() {
    const adjectives = ['敏捷', '勇敢', '智慧', '冷静', '坚韧', '忠诚', '神秘', '机智', '强大', '优雅'];
    const nouns = ['忍者', '黑客', '武士', '龙', '鹰', '狼', '豹', '虎', '蛇', '熊'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 9000) + 1000; // 生成4位数字
    
    return `${adj}${noun}${number}`;
}

// 获取当前频道
function getCurrentChannel() {
    const channelSelect = document.getElementById('channelSelect');
    return channelSelect ? channelSelect.value : 'public';
}

// 发送消息到后端API
async function sendToApi(username, message, encrypted, method, messageType = 'public', toUser = null) {
    try {
        // 将ISO格式转换为MySQL DATETIME格式
        const now = new Date();
        const mysqlDatetime = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');
        
        const payload = {
            username: username,
            message: message,
            encrypted: encrypted,
            method: method,
            timestamp: mysqlDatetime,  // 使用MySQL DATETIME格式
            channel: getCurrentChannel(),  // 使用函数获取当前频道
            messageType: messageType  // 'public' 或 'private'
        };

        // 如果是私聊，添加目标用户
        if (toUser && messageType === 'private') {
            payload.to_user = toUser;
        }

        // 修正API端点路径 - 使用绝对路径确保正确访问后端API
        const response = await fetch('/freeroom/api/send_message.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // 检查HTTP状态码
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 检查响应类型
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('非JSON响应:', textResponse.substring(0, 200) + '...');
            addSystemMessage('服务器返回无效响应，请检查服务器配置', 'error');
            return;
        }

        const data = await response.json();

        if (data.success) {
            console.log('消息发送成功');
        } else {
            console.error('消息发送失败:', data.error);
            addSystemMessage(`消息发送失败: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('发送消息时出错:', error);
        // 检查是否是网络错误
        if (error instanceof TypeError && error.message.includes('fetch')) {
            addSystemMessage('网络连接失败，请检查服务器是否正常运行', 'error');
        } else {
            addSystemMessage(`发送消息时发生错误: ${error.message}`, 'error');
        }
    }
}

// 检查是否设置了临时密码
function checkTempPassword() {
    const savedTempPassword = localStorage.getItem('chat_temp_password');
    
    if (!savedTempPassword || savedTempPassword === '') {
        // 如果没有设置临时密码，显示提示信息
        addSystemMessage('请先设置临时密码以启用加密功能！', 'warning');
        return false;
    }
    
    return true;
}

// 发送加密请求
async function sendEncryptionRequest(fromUser, toUser) {
    try {
        // 将ISO格式转换为MySQL DATETIME格式
        const now = new Date();
        const mysqlDatetime = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');

        const payload = {
            from_user: fromUser,
            to_user: toUser,
            timestamp: mysqlDatetime
        };

        const response = await fetch('/freeroom/api/send_encryption_request.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // 检查HTTP状态码
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 检查响应类型
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('非JSON响应:', textResponse.substring(0, 200) + '...');
            addSystemMessage('服务器返回无效响应，请检查服务器配置', 'error');
            return { success: false };
        }

        const data = await response.json();

        if (data.success) {
            console.log('加密请求发送成功:', data.message);
            addSystemMessage(data.message, 'success');
        } else {
            console.error('加密请求发送失败:', data.error);
            addSystemMessage(`加密请求发送失败: ${data.error}`, 'error');
        }
        
        return data;
    } catch (error) {
        console.error('发送加密请求时出错:', error);
        // 检查是否是网络错误
        if (error instanceof TypeError && error.message.includes('fetch')) {
            addSystemMessage('网络连接失败，请检查服务器是否正常运行', 'error');
        } else {
            addSystemMessage(`发送加密请求时发生错误: ${error.message}`, 'error');
        }
        return { success: false, error: error.message };
    }
}

// 获取待处理的加密请求
async function getPendingRequests(username) {
    try {
        // 确定API的基础路径
        const basePath = window.location.pathname.startsWith('/freeroom/') ? '/freeroom' : '';
        const apiUrl = `${basePath}/api/get_pending_requests.php?username=${encodeURIComponent(username)}`;
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('非JSON响应:', textResponse.substring(0, 200) + '...');
            console.error('服务器返回无效响应，请检查服务器配置');
            return { success: false, requests: [] };
        }

        const data = await response.json();

        if (data.success) {
            console.log(`获取到 ${data.count} 条待处理请求`);
            return { success: true, requests: data.requests };
        } else {
            console.error('获取待处理请求失败:', data.error);
            console.error(`获取待处理请求失败: ${data.error}`);
            return { success: false, requests: [] };
        }
    } catch (error) {
        console.error('获取待处理请求时出错:', error);
        console.error(`获取待处理请求时发生错误: ${error.message}`);
        return { success: false, requests: [] };
    }
}

// 处理加密请求（接受或拒绝）
async function handleEncryptionRequest(requestId, action, handledByUsername) {
    try {
        const payload = {
            request_id: requestId,
            action: action,
            handled_by: handledByUsername
        };

        const response = await fetch('/freeroom/api/handle_encryption_request.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('非JSON响应:', textResponse.substring(0, 200) + '...');
            addSystemMessage('服务器返回无效响应，请检查服务器配置', 'error');
            return { success: false };
        }

        const data = await response.json();

        if (data.success) {
            console.log(`请求 ${action} 成功`);
            addSystemMessage(`请求已${action === 'accept' ? '接受' : '拒绝'}`, 'success');
            return { success: true };
        } else {
            console.error('处理加密请求失败:', data.error);
            addSystemMessage(`处理加密请求失败: ${data.error}`, 'error');
            return { success: false };
        }
    } catch (error) {
        console.error('处理加密请求时出错:', error);
        addSystemMessage(`处理加密请求时发生错误: ${error.message}`, 'error');
        return { success: false };
    }
}

// 从后端获取消息
async function fetchMessagesAPI() {
    try {
        // 修正API端点路径 - 使用绝对路径
        const response = await fetch(`/freeroom/api/get_messages.php?channel=${getCurrentChannel()}`);

        // 检查HTTP状态码
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 检查响应类型
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('非JSON响应:', textResponse.substring(0, 200) + '...');
            addSystemMessage('服务器返回无效响应，请检查服务器配置', 'error');
            return;
        }

        const data = await response.json();

        if (data.success && data.data && data.data.messages && Array.isArray(data.data.messages)) {
            // 获取聊天容器
            const chatContainer = document.getElementById('chatContainer');
            
            if (chatContainer) {
                chatContainer.innerHTML = '';
            }

            data.data.messages.forEach(msg => {
                // 解密消息（暂时不解密，因为可能有些消息不是加密的）
                let decryptedMessage = msg.message;

                // 创建消息元素
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.encrypted ? 'encrypted' : ''} ${msg.username === (document.getElementById('usernameInput') ? document.getElementById('usernameInput').value : '') ? 'sent' : 'received'}`;

                messageDiv.innerHTML = `
                    <div class="message-info">
                        <span class="sender">${msg.username}</span>
                        <span class="timestamp">${new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="message-content">${decryptedMessage}</div>
                `;

                if (chatContainer) {
                    chatContainer.appendChild(messageDiv);
                }

                // 更新最后消息时间戳
                const msgTimestamp = new Date(msg.timestamp).getTime();
                const lastTimestamp = localStorage.getItem('last_message_timestamp');
                if (!lastTimestamp || new Date(lastTimestamp).getTime() < msgTimestamp) {
                    localStorage.setItem('last_message_timestamp', msg.timestamp);
                }
            });

            // 滚动到底部
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        } else if (!data.success) {
            console.error('获取消息失败:', data.error);
            addSystemMessage(`获取消息失败: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('获取消息时出错:', error);
        // 检查是否是网络错误
        if (!(error instanceof TypeError && error.message.includes('fetch'))) {
            addSystemMessage(`获取消息时发生错误: ${error.message}`, 'error');
        }
    }
}

// 发送消息功能
async function sendMessageAPI() {
    const messageInput = document.getElementById('messageInput');
    const usernameInput = document.getElementById('usernameInput');
    const chatContainer = document.getElementById('chatContainer');
    
    const message = messageInput ? messageInput.value.trim() : '';
    let username;
    
    const currentChannel = getCurrentChannel(); // 使用函数获取当前频道
    
    if (currentChannel === 'public') {
        // 公共频道：使用存储的用户名或生成新用户名
        username = localStorage.getItem('public_chat_username') || generateRandomUsername();
        if (!localStorage.getItem('public_chat_username')) {
            localStorage.setItem('public_chat_username', username);
            addSystemMessage(`系统为您分配了用户名: ${username}`, 'info');
        }
    } else {
        // 加密频道：使用输入的用户名
        username = usernameInput ? usernameInput.value.trim() : '';
        if (!username) {
            // 如果加密频道没有输入用户名，提示用户输入
            addSystemMessage('请先输入用户名！', 'error');
            return;
        }
    }
    
    if (!message) return;
    
    // 检查是否设置了临时密码
    if (!checkTempPassword()) {
        addSystemMessage('请先设置临时密码才能发送消息！', 'error');
        return;
    }
    
    // 保存用户名到本地存储（仅公共频道）
    if (currentChannel === 'public' && usernameInput) {
        localStorage.setItem('public_chat_username', username);
    }
    
    // 使用加密密钥进行加密（如果存在）
    const encryptionMethod = document.getElementById('encryptionMethod');
    let encryptionMethodValue = 'simple';
    if (encryptionMethod) {
        encryptionMethodValue = encryptionMethod.value === 'key' ? 'key' : encryptionMethod.value;
    }
    
    // 获取当前加密密钥
    const encryptionKeyInput = document.getElementById('encryptionKey');
    let currentEncryptionKey = encryptionKeyInput ? encryptionKeyInput.value : '';
    
    // 定义currentChatContact，对于公共频道，它是null
    let currentChatContact = null;
    
    // 检查当前频道，如果是加密频道，尝试获取当前聊天联系人
    if (currentChannel === 'private') {
        // 从全局作用域获取当前聊天联系人
        currentChatContact = typeof window.currentChatContact !== 'undefined' ? window.currentChatContact : null;
    }
    
    let targetUser = username; // 默认目标用户是自己（如果是群聊）
    
    // 如果当前有私聊对象，则向该对象发送消息
    if (currentChatContact && currentChannel === 'private') {
        targetUser = currentChatContact;
        // 获取与该联系人的专用密钥
        const contactKey = getContactKey && typeof getContactKey === 'function' ? getContactKey(currentChatContact) : currentEncryptionKey;
        if (contactKey) {
            currentEncryptionKey = contactKey;
        }
    }
    
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `message encrypted sent`;
    
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    // 加密消息
    let encryptedMessage = message;
    if (encryptionMethodValue !== 'none') {
        encryptedMessage = encryptMessageWithKey ? encryptMessageWithKey(message, currentEncryptionKey) : message;
    }
    
    messageDiv.innerHTML = `
        <div class="message-info">
            <span class="sender">${currentChannel === 'public' ? username : 'me'}</span>
            <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-content">${encryptedMessage}</div>
    `;
    
    if (chatContainer) {
        chatContainer.appendChild(messageDiv);
        
        // 滚动到底部
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // 发送到后端API，指定目标用户
    // 对于公共频道，不需要指定特定目标用户
    await sendToApi(username, message, true, encryptionMethodValue, currentChannel, currentChatContact);
    
    // 清空输入框
    if (messageInput) {
        messageInput.value = '';
    }
    
    // 更新消息计数 - 修复变量未定义问题
    if (typeof messagesSentCount === 'undefined') {
        window.messagesSentCount = parseInt(localStorage.getItem('messagesSentCount') || '0');
    }
    window.messagesSentCount++;
    localStorage.setItem('messagesSentCount', window.messagesSentCount.toString());
    const messagesSentEl = document.getElementById('messagesSent');
    if (messagesSentEl) {
        messagesSentEl.textContent = window.messagesSentCount.toString();
    }
}

// 注意：加密/解密函数现在在crypto.js中，不需要在此处重复定义

// 获取公网IP和位置信息
async function getPublicIPAndLocation() {
    try {
        // 尝试使用多个API获取公网IP
        console.log('开始获取公网IP...');
        let publicData;
        
        // 首先尝试使用httpbin.org获取IP
        try {
            console.log('尝试使用httpbin.org...');
            const response = await fetch('https://httpbin.org/ip');
            
            // 检查HTTP状态码
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // 检查响应类型
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('非JSON响应:', textResponse.substring(0, 200) + '...');
                throw new Error('Invalid response format');
            }
            
            const data = await response.json();
            console.log('解析到的IP数据:', data);
            const publicIP = data.origin;
            
            // 获取位置信息
            console.log('开始获取位置信息...');
            const locationResponse = await fetch(`https://ipapi.co/${publicIP}/json/`);
            if (!locationResponse.ok) {
                throw new Error(`Location API error! status: ${locationResponse.status}`);
            }
            
            const locationData = await locationResponse.json();
            console.log('位置数据:', locationData);
            
            return {
                ip: publicIP,
                country: locationData.country_name || '未知',
                country_code: locationData.country_code || 'UN',
                city: locationData.city || '未知'
            };
        } catch (error) {
            console.error('获取公网IP和位置信息失败:', error);
            // 如果上面的方法失败，尝试使用其他服务
            try {
                console.log('尝试使用api.ipify.org...');
                const response = await fetch('https://api.ipify.org/?format=json');
                
                // 检查HTTP状态码
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                // 检查响应类型
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const textResponse = await response.text();
                    console.error('非JSON响应:', textResponse.substring(0, 200) + '...');
                    throw new Error('Invalid response format');
                }
                
                const ipData = await response.json();
                console.log('从ipify获取的IP数据:', ipData);
                
                // 再次尝试获取位置信息
                const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
                if (!locationResponse.ok) {
                    throw new Error(`Location API error! status: ${locationResponse.status}`);
                }
                
                const locationData = await locationResponse.json();
                
                return {
                    ip: ipData.ip,
                    country: locationData.country_name || '未知',
                    country_code: locationData.country_code || 'UN',
                    city: locationData.city || '未知'
                };
            } catch (err) {
                console.error('备选API获取公网IP也失败:', err);
                return {
                    ip: '无法获取',
                    country: '未知',
                    country_code: 'UN',
                    city: '未知'
                };
            }
        }
    } catch (error) {
        console.error('获取公网IP和位置信息时发生错误:', error);
        // 返回默认值
        return {
            ip: '获取失败',
            country: '未知',
            country_code: 'UN',
            city: '未知'
        };
    }
}

// 将关键函数暴露到全局，便于其他模块调用
window.fetchMessagesAPI = fetchMessagesAPI;
window.getCurrentSessionInfo = getCurrentSessionInfo;
window.sendSessionInfoToBackendAPI = sendSessionInfoToBackendAPI;
window.sendMessageAPI = sendMessageAPI;
window.sendEncryptionRequest = sendEncryptionRequest;
window.fetchPendingRequests = fetchPendingRequests;
window.getPublicIPAndLocation = getPublicIPAndLocation;
