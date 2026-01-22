// 屏幕锁定功能模块

// 全局变量
let lastActivityTime = new Date();

// 检查屏幕是否被锁定
function isScreenLocked(screenLockModal) {
    if (!screenLockModal) {
        screenLockModal = document.getElementById('screenLockModal');
    }
    return screenLockModal.classList.contains('show') || 
           screenLockModal.style.display === 'flex';
}

// 锁定屏幕
function lockScreen(screenLockModal, screenLockModalInstance) {
    if (!screenLockModal) {
        screenLockModal = document.getElementById('screenLockModal');
    }
    
    if (screenLockModalInstance) {
        try {
            screenLockModalInstance.show();
        } catch (e) {
            console.error('Bootstrap模态框显示失败:', e);
            screenLockModal.style.display = 'flex';
            screenLockModal.classList.add('show');
        }
    } else {
        screenLockModal.style.display = 'flex';
        screenLockModal.classList.add('show');
    }
    
    // 模糊主内容
    document.body.classList.add('locked');
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
                
                // 移除模糊效果
                document.body.classList.remove('locked');
                
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


// 添加一个通用的计时器管理函数
let lockTimer = null;

// 开始屏幕锁定计时器
function startScreenLockTimer(checkScreenLockStatus) {
    if (lockTimer) {
        clearInterval(lockTimer);
    }
    
    lockTimer = setInterval(checkScreenLockStatus, 30000); // 每30秒检查一次
}

// 停止屏幕锁定计时器
function stopScreenLockTimer() {
    if (lockTimer) {
        clearInterval(lockTimer);
        lockTimer = null;
    }
}

// 重置屏幕锁定计时器
function resetScreenLockTimer() {
    lastActivityTime = new Date();
    
    const screenLockModal = document.getElementById('screenLockModal');
    const unlockPassword = document.getElementById('unlockPassword');
    // 从chat-protection.js获取实例（如果可用）
    const screenLockModalInstance = window.screenLockModalInstance; // 假设实例已存储在全局变量中
    
    // 如果当前屏幕被锁定，解锁它
    if (isScreenLocked(screenLockModal)) {
        unlockScreenFunc(unlockPassword, screenLockModal, screenLockModalInstance, addSystemMessage);
    }
}

// 检查屏幕锁定状态
function checkScreenLockStatus() {
    // 从本地存储获取聊天保护状态
    const chatProtectionEnabled = localStorage.getItem('chat_protection_enabled') === 'true';
    
    if (!chatProtectionEnabled) return;
    
    const now = new Date();
    const timeElapsed = now - lastActivityTime;
    // 从本地存储获取超时时间
    const timeoutMinutes = parseInt(localStorage.getItem('chat_screen_lock_timeout')) || 5;
    const screenLockTimeoutMs = timeoutMinutes * 60 * 1000;
    
    const screenLockModal = document.getElementById('screenLockModal');
    const screenLockModalInstance = window.screenLockModalInstance; // 假设实例已存储在全局变量中
    
    if (timeElapsed >= screenLockTimeoutMs) {
        lockScreen(screenLockModal, screenLockModalInstance);
    }
}

// 跟踪用户活动
function trackUserActivity(resetScreenLockTimer) {
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(eventType => {
        document.addEventListener(eventType, resetScreenLockTimer, { passive: true });
    });
}