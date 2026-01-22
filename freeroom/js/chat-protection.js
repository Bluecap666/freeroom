// 聊天保护功能管理模块

// 全局变量 - 检查是否已声明，避免重复声明
if (typeof window.lastActivityTime === 'undefined') {
    window.lastActivityTime = new Date();
}
if (typeof window.lockTimer === 'undefined') {
    window.lockTimer = null;
}

// 从本地存储获取屏幕锁定超时时间
if (typeof window.screenLockTimeoutMs === 'undefined') {
    window.screenLockTimeoutMs = (parseInt(localStorage.getItem('chat_screen_lock_timeout')) || 5) * 60 * 1000; // 默认5分钟
}

// 从本地存储获取聊天保护状态
function getChatProtectionStatus() {
    const storedStatus = localStorage.getItem('chat_protection_enabled');
    return storedStatus === 'true';
}

// 从本地存储获取屏幕锁定超时时间
function getScreenLockTimeout() {
    const storedTimeout = localStorage.getItem('chat_screen_lock_timeout');
    return (storedTimeout ? parseInt(storedTimeout) : 5) * 60 * 1000; // 默认5分钟，转为毫秒
}

// 更新屏幕锁定超时时间
function updateScreenLockTimeout(newTimeoutMinutes) {
    const timeoutMinutes = parseInt(newTimeoutMinutes) || 5;
    window.screenLockTimeoutMs = timeoutMinutes * 60 * 1000;
    localStorage.setItem('chat_screen_lock_timeout', timeoutMinutes);
}

// 添加系统消息
function addSystemMessage(content, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `system-message ${type}`;
    
    // 根据消息类型添加图标
    let icon = 'fas fa-info-circle';
    if (type === 'warning') {
        icon = 'fas fa-exclamation-triangle';
    } else if (type === 'error') {
        icon = 'fas fa-times-circle';
    } else if (type === 'success') {
        icon = 'fas fa-check-circle';
    }
    
    messageDiv.innerHTML = `<i class="${icon}"></i> ${content}`;
    
    // 添加到容器顶部
    const systemMessagesContainer = document.getElementById('systemMessages');
    if (systemMessagesContainer) {
        systemMessagesContainer.insertBefore(messageDiv, systemMessagesContainer.firstChild);
        
        // 限制消息数量，最多显示5条
        if (systemMessagesContainer.children.length > 5) {
            systemMessagesContainer.removeChild(systemMessagesContainer.lastChild);
        }
        
        // 自动移除消息（10秒后）
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 10000);
    }
}

// 开始屏幕锁定计时器
function startScreenLockTimer(checkScreenLockStatus) {
    if (window.lockTimer) {
        clearInterval(window.lockTimer);
    }
    
    window.lockTimer = setInterval(checkScreenLockStatus, 1000); // 改为每秒检查一次，以便显示倒计时
}

// 停止屏幕锁定计时器
function stopScreenLockTimer() {
    if (window.lockTimer) {
        clearInterval(window.lockTimer);
        window.lockTimer = null;
    }
}

// 重置屏幕锁定计时器
function resetScreenLockTimer() {
    window.lastActivityTime = new Date();
    
    // 如果当前屏幕被锁定，解锁它
    if (isScreenLocked()) {
        const unlockPassword = document.getElementById('unlockPassword');
        const screenLockModal = document.getElementById('screenLockModal');
        unlockScreenFunc(unlockPassword, screenLockModal, null, addSystemMessage);
    }
}

// 检查屏幕是否被锁定
function isScreenLocked() {
    const screenLockModal = document.getElementById('screenLockModal');
    if (!screenLockModal) {
        // 如果没有找到屏幕锁定模态框元素，认为屏幕未锁定
        return false;
    }
    return screenLockModal.classList.contains('show') || 
           screenLockModal.style.display === 'flex';
}

// 锁定屏幕
function lockScreen() {
    // 从本地存储获取聊天保护状态
    const chatProtectionEnabled = localStorage.getItem('chat_protection_enabled') === 'true';
    if (!chatProtectionEnabled) return;
    
    const screenLockModal = document.getElementById('screenLockModal');
    const container = document.querySelector('.container');

    screenLockModal.style.display = 'flex';
    screenLockModal.classList.add('show');
    
    // 对主要内容区域应用模糊效果，而不是整个body
    if (container) {
        container.classList.add('blurred');
    }
}

// 检查屏幕锁定状态
function checkScreenLockStatus() {
    // 从本地存储获取聊天保护状态
    const chatProtectionEnabled = localStorage.getItem('chat_protection_enabled') === 'true';
    if (!chatProtectionEnabled) return;
    
    const now = new Date();
    const timeElapsed = now - window.lastActivityTime;
    
    // 使用本地存储中的超时时间，而不是全局变量
    const timeoutMinutes = parseInt(localStorage.getItem('chat_screen_lock_timeout')) || 5;
    const currentScreenLockTimeoutMs = timeoutMinutes * 60 * 1000;
    
    // 计算剩余时间（秒）
    const remainingTimeMs = currentScreenLockTimeoutMs - timeElapsed;
    const remainingSeconds = Math.ceil(remainingTimeMs / 1000);
    
    // 如果屏幕已经被锁定，则不再进行倒计时
    if (isScreenLocked()) {
        return;
    }
    
    // 控制台输出倒计时
    if (remainingSeconds > 0) {
        console.log(`屏幕将在 ${remainingSeconds} 秒后锁定`);
    } else {
        console.log("正在锁定屏幕...");
        lockScreen();  // 执行锁定操作
    }
}

// 解锁屏幕
function unlockScreenFunc(unlockPassword, screenLockModal, screenLockModalInstance, addSystemMessage) {
    const password = unlockPassword ? unlockPassword.value.trim() : '';
    const savedTempPassword = localStorage.getItem('chat_temp_password');
    
    if (!sha256HashForStorage) {
        console.error('sha256HashForStorage函数未定义');
        return;
    }
    
    sha256HashForStorage(password)
        .then(inputHash => {
            if (inputHash === savedTempPassword) {
                if (screenLockModalInstance) {
                    try {
                        screenLockModalInstance.hide();
                    } catch (e) {
                        console.error('Bootstrap模态框关闭失败:', e);
                        screenLockModal.style.display = 'none';
                        screenLockModal.classList.remove('show');
                    }
                } else {
                    screenLockModal.style.display = 'none';
                    screenLockModal.classList.remove('show');
                }
                
                // 移除主要内容区域的模糊效果
                const container = document.querySelector('.container');
                if (container) {
                    container.classList.remove('blurred');
                }
                
                // 清空密码输入框
                if (unlockPassword) {
                    unlockPassword.value = '';
                }
                
                // 重置计时器
                resetScreenLockTimer();
                
                if (addSystemMessage) {
                    addSystemMessage('屏幕已解锁', 'success');
                }
            } else {
                if (addSystemMessage) {
                    addSystemMessage('密码错误，请重试', 'error');
                }
            }
        })
        .catch(error => {
            console.error('密码验证失败:', error);
            if (addSystemMessage) {
                addSystemMessage('密码验证失败，请重试', 'error');
            }
        });
}

// 使用Web Crypto API计算SHA-256哈希
async function sha256HashForStorage(text) {
    if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
        // 如果浏览器不支持Web Crypto API
        const shaChars = '0123456789abcdef';
        let hash = '';
        for (let i = 0; i < 64; i++) {
            hash += shaChars[Math.floor(Math.random() * 16)];
        }
        return Promise.resolve(hash);
    }
}

// 跟踪用户活动
function trackUserActivity(resetScreenLockTimer) {
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(eventType => {
        document.addEventListener(eventType, resetScreenLockTimer, { passive: true });
    });
}

// 更新保护状态显示文本
function updateProtectionStatusDisplay(enabled) {
    const protectionStatusState = document.getElementById('protectionStatusText');
    const chatProtectionToggle = document.getElementById('chatProtectionToggle');
    
    if (chatProtectionToggle) {
        // 更新开关状态
        chatProtectionToggle.checked = enabled;
    }
    
    if (protectionStatusState) {
        protectionStatusState.innerHTML = `<i class="fas fa-shield-alt" style="margin-right: 4px;"></i>${enabled ? '聊天保护(开)' : '聊天保护(关)'}`;
    }
    
    // 保存状态到本地存储
    localStorage.setItem('chat_protection_enabled', enabled.toString());
}

// 启用/禁用聊天保护
function toggleChatProtection(targetState, updateDisplayFn) {
    // 直接使用传入的目标状态
    const enabled = targetState;
    
    updateDisplayFn(enabled);
    
    if (enabled) {
        // 重置屏幕锁定计时器
        resetScreenLockTimer();
        // 启动屏幕锁定计时器
        startScreenLockTimer(checkScreenLockStatus);
        addSystemMessage('聊天保护已启用', 'success');
        
        // 从本地存储读取配置并打印到控制台
        const configKeys = [
            'chat_protection_enabled',
            'chat_screen_lock_timeout',
            'chat_temp_password',
            'username',
            'encryption_method',
            'encryption_key'
        ];
        
        console.log('--- 读取的配置 ---');
        configKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value !== null) {
                console.log(`${key}: ${value}`);
            } else {
                console.log(`${key}: 未设置`);
            }
        });
        
        // 也可以打印所有本地存储项
        console.log('--- 所有本地存储项 ---');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(`${key}: ${value}`);
        }
        console.log('------------------');
    } else {
        // 停止屏幕锁定计时器
        stopScreenLockTimer();
        addSystemMessage('聊天保护已禁用', 'info');
    }
    
    return enabled;
}

// 初始化聊天保护功能
function initializeChatProtection() {
    // 获取当前聊天保护状态
    let chatProtectionEnabled = getChatProtectionStatus();
    
    // 设置开关初始状态
    const chatProtectionToggle = document.getElementById('chatProtectionToggle');
    const protectionStatusText = document.getElementById('protectionStatusText');
    
    if (chatProtectionToggle) {
        chatProtectionToggle.checked = chatProtectionEnabled;
        
        // 更新状态显示
        if (protectionStatusText) {
            protectionStatusText.innerHTML = `<i class="fas fa-shield-alt" style="margin-right: 4px;"></i>${chatProtectionEnabled ? '聊天保护(开)' : '聊天保护(关)'}`;
        }
    }
    
    // 聊天保护开关事件
    if (chatProtectionToggle) {
        chatProtectionToggle.addEventListener('change', function() {
            chatProtectionEnabled = toggleChatProtection(
                this.checked, 
                updateProtectionStatusDisplay
            );
            
            // 更新本地存储中的状态
            localStorage.setItem('chat_protection_enabled', chatProtectionEnabled.toString());
        });
    }
    
    // 启动用户活动跟踪
    trackUserActivity(resetScreenLockTimer);
    
    // 如果聊天保护之前是启用的，则启动它
    if (chatProtectionEnabled) {
        startScreenLockTimer(checkScreenLockStatus);
    }
    
    // 返回当前状态和控制函数
    return {
        chatProtectionEnabled,
        getChatProtectionStatus,
        updateProtectionStatusDisplay,
        toggleChatProtection
    };
}

// 将关键函数暴露到全局，便于其他模块调用
window.initializeChatProtection = initializeChatProtection;
window.startScreenLockTimer = startScreenLockTimer;
window.stopScreenLockTimer = stopScreenLockTimer;
window.resetScreenLockTimer = resetScreenLockTimer;
window.checkScreenLockStatus = checkScreenLockStatus;
window.lockScreen = lockScreen;
window.unlockScreenFunc = unlockScreenFunc;
window.trackUserActivity = trackUserActivity;
window.updateProtectionStatusDisplay = updateProtectionStatusDisplay;
window.toggleChatProtection = toggleChatProtection;
window.getChatProtectionStatus = getChatProtectionStatus;
window.isScreenLocked = isScreenLocked;
window.addSystemMessage = addSystemMessage;
window.updateScreenLockTimeout = updateScreenLockTimeout;
// window.screenLockTimeoutMs 已经在前面定义过了