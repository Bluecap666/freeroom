// 加密解密功能管理模块

// 声明全局变量（这些应在chat.js中定义，但需要在此处使用）
// 检查是否已声明，避免重复声明
if (typeof window.currentEncryptionKey === 'undefined') {
    window.currentEncryptionKey = '';
}
if (typeof window.encryptionMethod === 'undefined') {
    window.encryptionMethod = 'simple';
}

// 生成随机密钥
function generateRandomKey() {
    const keyLength = 16; // 128 bits
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let key = '';
    
    for (let i = 0; i < keyLength; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return key;
}

// 生成随机用户名
function generateRandomUsername() {
    const prefixes = ['Shadow', 'Ninja', 'Hacker', 'Ghost', 'Phantom', 'Cyber', 'Zero', 'Alpha', 'Beta'];
    const suffixes = ['Warrior', 'Ninja', 'Master', 'Spy', 'Agent', 'Coder', 'Geek', 'Pro', 'Elite'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const number = Math.floor(Math.random() * 1000);
    
    return `${prefix}${suffix}${number}`;
}

// 简单替换加密
function simpleEncrypt(text, key) {
    if (!key) {
        console.error('加密失败：未提供密钥');
        return text;
    }
    
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        const encryptedCharCode = charCode ^ keyChar;
        result += String.fromCharCode(encryptedCharCode);
    }
    return result;
}

// 简单替换解密（与加密使用相同算法）
function simpleDecrypt(text, key) {
    return simpleEncrypt(text, key); // XOR加密解密是同一算法
}

// AES-256加密（简化版实现，实际项目中应使用专业库）
function aes256Encrypt(text, key) {
    // 使用简单的异或加密作为示例，实际AES-256需要使用专业的加密库
    return simpleEncrypt(text, key);
}

// AES-256解密（简化版实现，实际项目中应使用专业库）
function aes256Decrypt(text, key) {
    // 使用简单的异或解密作为示例，实际AES-256需要使用专业的加密库
    return simpleDecrypt(text, key);
}

// RSA加密（简化版实现，实际项目中应使用专业库）
function rsaEncrypt(text, key) {
    // 这里只是一个占位符，实际RSA加密需要使用专业库
    return simpleEncrypt(text, key);
}

// RSA解密（简化版实现，实际项目中应使用专业库）
function rsaDecrypt(text, key) {
    // 这里只是一个占位符，实际RSA解密需要使用专业库
    return simpleDecrypt(text, key);
}

// 根据选择的加密方法加密文本
function encryptText(text, key, method = null) {
    if (!key) {
        console.error('加密失败：未提供密钥');
        return text;
    }
    
    const actualMethod = method || encryptionMethod;
    
    switch (actualMethod) {
        case 'simple':
            return simpleEncrypt(text, key);
        case 'aes256':
            return aes256Encrypt(text, key);
        case 'rsa':
            return rsaEncrypt(text, key);
        default:
            console.warn(`未知的加密方法: ${actualMethod}，使用默认加密方法`);
            return simpleEncrypt(text, key);
    }
}

// 根据选择的加密方法解密文本
function decryptText(text, key, method = null) {
    if (!key) {
        console.error('解密失败：未提供密钥');
        return text;
    }
    
    const actualMethod = method || encryptionMethod;
    
    switch (actualMethod) {
        case 'simple':
            return simpleDecrypt(text, key);
        case 'aes256':
            return aes256Decrypt(text, key);
        case 'rsa':
            return rsaDecrypt(text, key);
        default:
            console.warn(`未知的解密方法: ${actualMethod}，使用默认解密方法`);
            return simpleDecrypt(text, key);
    }
}

// 更新加密状态显示
function updateEncryptionStatus(encryptionEnabled, encStatus, encIndicator) {
    if (encStatus) {
        encStatus.textContent = encryptionEnabled ? '激活' : '未激活';
    }
    
    if (encIndicator) {
        encIndicator.style.backgroundColor = encryptionEnabled ? '#0f0' : '#f00';
    }
}

// 处理加密请求
function handleEncryptionRequest(requestId, action, addSystemMessage, sendResponse) {
    // 查找请求
    const requestIndex = encryptionRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
        console.error('找不到请求:', requestId);
        return;
    }
    
    const request = encryptionRequests[requestIndex];
    
    if (action === 'accept') {
        // 接受请求
        addSystemMessage(`${request.from_user} 的加密请求已被接受`, 'success');
        
        // 发送响应给请求方
        sendResponse(request.from_user, 'accept');
        
        // 将对方添加到联系人列表
        if (typeof window.addContactToChatList === 'function') {
            window.addContactToChatList({
                username: request.from_user,
                status: 'online'
            });
        } else {
            console.error('addContactToChatList function is not available');
        }
        
        // 从请求列表中移除
        encryptionRequests.splice(requestIndex, 1);
        removeRequestFromList(requestId);
    } else if (action === 'reject') {
        // 拒绝请求
        addSystemMessage(`已拒绝 ${request.from_user} 的加密请求`, 'info');
        
        // 发送响应给请求方
        sendResponse(request.from_user, 'reject');
        
        // 从请求列表中移除
        encryptionRequests.splice(requestIndex, 1);
        removeRequestFromList(requestId);
    }
}

// 从列表中移除请求
function removeRequestFromList(requestId) {
    const requestElement = document.querySelector(`.request-item[data-id="${requestId}"]`);
    if (requestElement) {
        requestElement.remove();
    }
}

// 添加加密请求到列表
function addRequestToList(request, addSystemMessage) {
    const requestList = document.getElementById('requestList');
    if (!requestList) return;
    
    const requestItem = document.createElement('div');
    requestItem.className = 'request-item';
    requestItem.dataset.id = request.id;
    
    requestItem.innerHTML = `
        <div class="request-info">
            <strong>${request.from_user}</strong> 请求与您建立加密连接
        </div>
        <div class="request-actions">
            <button class="accept-btn" onclick="handleRequest('${request.id}', 'accept')">接受</button>
            <button class="reject-btn" onclick="handleRequest('${request.id}', 'reject')">拒绝</button>
        </div>
    `;
    
    requestList.appendChild(requestItem);
    
    // 添加系统消息
    addSystemMessage(`来自 ${request.from_user} 的加密申请`, 'info');
}

// 发送加密请求
function sendEncryptionRequest(targetUsername, currentUser, addSystemMessage) {
    if (!targetUsername) {
        addSystemMessage('请输入目标用户名', 'error');
        return;
    }
    
    if (targetUsername === currentUser) {
        addSystemMessage('不能向自己发送加密请求', 'error');
        return;
    }
    
    // 模拟发送请求（实际应用中这里会通过API发送请求）
    console.log(`发送加密请求到: ${targetUsername}, 来自: ${currentUser}`);
    
    addSystemMessage(`已向 ${targetUsername} 发送加密请求`, 'info');
}

// 生成密钥并更新UI
function generateAndSetKey(encryptionKeyInput, addSystemMessage) {
    const newKey = generateRandomKey();
    if (encryptionKeyInput) {
        encryptionKeyInput.value = newKey;
        currentEncryptionKey = newKey;
        addSystemMessage('新密钥已生成', 'success');
    }
}

// 将函数附加到window对象，以便全局访问
window.generateRandomKey = generateRandomKey;
window.generateRandomUsername = generateRandomUsername;
window.simpleEncrypt = simpleEncrypt;
window.simpleDecrypt = simpleDecrypt;
window.aes256Encrypt = aes256Encrypt;
window.aes256Decrypt = aes256Decrypt;
window.rsaEncrypt = rsaEncrypt;
window.rsaDecrypt = rsaDecrypt;
window.encryptText = encryptText;
window.decryptText = decryptText;
window.updateEncryptionStatus = updateEncryptionStatus;
window.handleEncryptionRequest = handleEncryptionRequest;
window.sendEncryptionRequest = sendEncryptionRequest;
window.generateAndSetKey = generateAndSetKey;