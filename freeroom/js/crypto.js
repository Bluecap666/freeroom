// 加密解密功能模块

// 使用密钥加密消息
function encryptMessageWithKey(text, key) {
    if (!key) {
        return text; // 如果没有密钥，直接返回原文本
    }
    
    // 使用简单的异或(XOR)加密算法
    let result = '[KEY_ENCRYPTED] ';
    for (let i = 0; i < text.length; i++) {
        // 获取文本字符和密钥字符的ASCII值，然后进行异或运算
        const textChar = text.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        const encryptedChar = textChar ^ keyChar;
        result += String.fromCharCode(encryptedChar);
    }
    return result;
}

// 使用密钥解密消息
function decryptMessageWithKey(text, key) {
    if (!key || !text.startsWith('[KEY_ENCRYPTED] ')) {
        return text; // 如果不是加密消息或没有密钥，直接返回原文本
    }
    
    // 移除加密标记
    text = text.substring(14); // '[KEY_ENCRYPTED] '.length = 14
    
    // 使用简单的异或(XOR)解密算法
    let result = '';
    for (let i = 0; i < text.length; i++) {
        // 获取加密字符和密钥字符的ASCII值，然后进行异或运算
        const encryptedChar = text.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        const decryptedChar = encryptedChar ^ keyChar;
        result += String.fromCharCode(decryptedChar);
    }
    return result;
}

// 模拟加密函数（实际应用中应该使用真正的加密算法）
function encryptMessage(text, method, currentEncryptionKey) {
    // 如果选择了使用密钥加密且存在密钥，则使用密钥加密
    if (method === 'key' && currentEncryptionKey) {
        return encryptMessageWithKey(text, currentEncryptionKey);
    }
    
    switch(method) {
        case 'simple':
            // 简单移位加密
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(text.charCodeAt(i) + 3);
            }
            return '[SIMPLE] ' + result;
        case 'aes256':
            // 模拟AES-256加密
            let aesResult = '';
            for (let i = 0; i < text.length; i++) {
                aesResult += String.fromCharCode(text.charCodeAt(i) + 5);
            }
            return '[AES256] ' + aesResult;
        case 'rsa':
            // 模拟RSA加密
            let rsaResult = '';
            for (let i = 0; i < text.length; i++) {
                rsaResult += String.fromCharCode(text.charCodeAt(i) + 7);
            }
            return '[RSA] ' + rsaResult;
        default:
            return text;
    }
}

// 模拟解密函数
function decryptMessage(text, currentEncryptionKey) {
    // 检查是否是使用密钥加密的消息
    if (text.startsWith('[KEY_ENCRYPTED] ') && currentEncryptionKey) {
        return decryptMessageWithKey(text, currentEncryptionKey);
    }
    
    if (text.startsWith('[SIMPLE] ')) {
        text = text.substring(9);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) - 3);
        }
        return result;
    } else if (text.startsWith('[AES256] ')) {
        text = text.substring(9);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) - 5);
        }
        return result;
    } else if (text.startsWith('[RSA] ')) {
        text = text.substring(6);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) - 7);
        }
        return result;
    }
    return text;
}

// Base64编码
function base64Encode(text) {
    try {
        return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    } catch (e) {
        console.error('Base64编码失败:', e);
        return text;
    }
}

// Base64解码
function base64Decode(text) {
    try {
        return decodeURIComponent(atob(text).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        console.error('Base64解码失败:', e);
        return text;
    }
}

// MD5哈希（简化模拟实现）
function md5Hash(text) {
    // 实际项目中应使用真正的MD5库
    const md5Chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 32; i++) {
        hash += md5Chars[Math.floor(Math.random() * 16)];
    }
    return hash;
}

// SHA-256哈希（简化模拟实现）
function sha256Hash(text) {
    // 实际项目中应使用真正的SHA-256库
    const shaChars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) {
        hash += shaChars[Math.floor(Math.random() * 16)];
    }
    return hash;
}

// 反转字符串加密
function reverseEncrypt(text) {
    return '[REVERSED] ' + text.split('').reverse().join('');
}

// 反转字符串解密
function reverseDecrypt(text) {
    if (text.startsWith('[REVERSED] ')) {
        return text.substring(11).split('').reverse().join('');
    }
    return text;
}

// 清除敏感数据
function clearEncryptionKeys() {
    localStorage.removeItem('chat_contacts');
}

// 检查浏览器加密支持
function getEncryptionCapabilities() {
    return {
        cryptoAvailable: !!window.crypto,
        subtleCryptoAvailable: !!(window.crypto && window.crypto.subtle),
        secureRandomAvailable: !!(window.crypto && window.crypto.getRandomValues)
    };
}

// 生成加密密钥
function generateEncryptionKey(length = 32) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/';
    let key = '';
    const bytes = new Uint8Array(length);
    
    // 使用更安全的随机数生成方法
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(bytes);
        for (let i = 0; i < length; i++) {
            key += charset[bytes[i] % charset.length];
        }
    } else {
        // 降级方案：使用Math.random()
        for (let i = 0; i < length; i++) {
            key += charset[Math.floor(Math.random() * charset.length)];
        }
    }
    
    return key;
}

// 存储联系人密钥
function storeContactKey(username, key) {
    const storedContacts = JSON.parse(localStorage.getItem('chat_contacts') || '{}');
    storedContacts[username] = {
        key: key,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('chat_contacts', JSON.stringify(storedContacts));
}

// 获取联系人密钥
function getContactKey(username) {
    const storedContacts = JSON.parse(localStorage.getItem('chat_contacts') || '{}');
    return storedContacts[username] ? storedContacts[username].key : null;
}

// 获取所有联系人密钥信息
function getAllContactKeys() {
    const storedContacts = JSON.parse(localStorage.getItem('chat_contacts') || '{}');
    return Object.keys(storedContacts).map(username => ({
        username,
        timestamp: storedContacts[username].timestamp
    }));
}