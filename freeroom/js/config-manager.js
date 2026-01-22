// 配置管理功能模块

// 声明全局变量（这些应在chat.js中定义，但需要在此处使用）
let currentEncryptionKey = '';
let globalTempPassword = '';
let screenLockTimeoutMs = 5 * 60 * 1000; // 默认5分钟
let globalPublicDestructTime = 1440; // 默认24小时
let globalPrivateDestructTime = 1440; // 默认24小时

// 确保全局函数在页面加载早期就定义，这样HTML中的onclick事件才能访问
// 使用空函数或基本实现作为占位符
window.showGlobalConfigModal = function() {
    console.warn("尝试打开配置模态框，但系统尚未初始化");
};

// 不在这里定义 hideGlobalConfigModal，它将在 initializeConfigManager 中被正确定义。

window.saveConfiguration = function() {
    console.warn("尝试保存配置，但系统尚未初始化");
};

// 初始化全局配置模态框
function initializeConfigManager(globalConfigModal, chatElements, addSystemMessage, startScreenLockTimer, stopScreenLockTimer) {
    // 不再初始化Bootstrap模态框实例，使用原生JS实现
    console.log('使用原生JS实现模态框功能');
    
    // 确保全局函数可用于HTML onclick事件
    window.showGlobalConfigModal = function() {
        // 填充当前配置值到表单
        loadCurrentConfigToForm(chatElements);
        
        // 初始化密码显示/隐藏功能
        initPasswordVisibilityToggle();
        
        // 使用原生JS显示模态框
        const modalElement = document.getElementById('globalConfigModal');
        if (modalElement) {
            modalElement.style.display = 'flex';
            modalElement.classList.add('show');
            
            // 添加modal-open类到body
            document.body.classList.add('modal-open');
        }
    };
    
    window.hideGlobalConfigModal = function() {
        // 使用原生JS隐藏模态框
        const modalElement = document.getElementById('globalConfigModal');
        if (modalElement) {
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            
            // 移除modal-open类
            document.body.classList.remove('modal-open');
        }
        
        // 移除所有背景遮罩层
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            backdrop.remove();
        });
    };
    
    // 初始化密码可见性切换功能
    function initPasswordVisibilityToggle() {
        const tempPasswordInput = document.getElementById('tempPassword');
        const toggleTempPassword = document.getElementById('toggleTempPassword');
        
        if (toggleTempPassword) {
            toggleTempPassword.addEventListener('click', function() {
                const type = tempPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                tempPasswordInput.setAttribute('type', type);
                
                // 切换眼睛图标
                const eyeIcon = toggleTempPassword.querySelector('i');
                if (eyeIcon) {
                    eyeIcon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
                }
            });
        }
    }
    
    
    // 加载当前配置到表单
    function loadCurrentConfigToForm(elements) {
        const savedPublicDestructTime = localStorage.getItem('chat_public_destruct_time');
        const savedPrivateDestructTime = localStorage.getItem('chat_private_destruct_time');
        const savedScreenLockTimeout = localStorage.getItem('chat_screen_lock_timeout');
        const savedTempPassword = localStorage.getItem('chat_temp_password');
        
        if (elements.tempPassword) {
            // 如果已有保存的密码哈希，则显示星号代替实际密码，提示用户已有密码
            if (savedTempPassword) {
                elements.tempPassword.value = '******'; // 显示星号代替实际密码
                elements.tempPassword.placeholder = '已有密码，输入新密码以更改';
            } else {
                elements.tempPassword.value = ''; // 留空
                elements.tempPassword.placeholder = '请输入新密码';
            }
        }
        
        if (elements.screenLockTimeout && savedScreenLockTimeout) {
            elements.screenLockTimeout.value = parseInt(savedScreenLockTimeout);
        } else {
            elements.screenLockTimeout.value = 5; // 默认5分钟
        }
        
        if (elements.publicDestructTime && savedPublicDestructTime) {
            elements.publicDestructTime.value = parseInt(savedPublicDestructTime);
        } else {
            elements.publicDestructTime.value = 1440; // 默认24小时
        }
        
        if (elements.privateDestructTime && savedPrivateDestructTime) {
            elements.privateDestructTime.value = parseInt(savedPrivateDestructTime);
        } else {
            elements.privateDestructTime.value = 1440; // 默认24小时
        }
    }
    
    // 使用Web Crypto API计算SHA-256哈希
    async function sha256HashForStorage(text) {
        if (window.crypto && window.crypto.subtle) {
            try {
                const encoder = new TextEncoder();
                const data = encoder.encode(text);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (error) {
                console.error('Web Crypto API SHA-256计算失败:', error);
                // 如果Web Crypto API失败，使用备用方案
                return fallbackSha256(text);
            }
        } else {
            // 如果浏览器不支持Web Crypto API，使用备用方案
            return fallbackSha256(text);
        }
    }
    
    // 备用的SHA-256实现（简单模拟）
    function fallbackSha256(text) {
        // 这是一个简化的SHA-256模拟实现
        // 在实际生产环境中，应该使用一个可靠的库如crypto-js
        let hash = 0xabc123ef;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // 转换为32位整数
        }
        
        // 转换为64个字符的十六进制字符串（模拟SHA-256格式）
        let result = Math.abs(hash).toString(16);
        while (result.length < 64) {
            result = '0' + result;
        }
        return result;
    }

    // 保存配置
    window.saveConfiguration = function() {
        // 从表单获取值
        const tempPasswordValue = chatElements.tempPassword ? chatElements.tempPassword.value.trim() : '';
        const screenLockTimeoutValue = chatElements.screenLockTimeout ? parseInt(chatElements.screenLockTimeout.value) : 5;
        const publicDestructTimeValue = chatElements.publicDestructTime ? parseInt(chatElements.publicDestructTime.value) : 1440;
        const privateDestructTimeValue = chatElements.privateDestructTime ? parseInt(chatElements.privateDestructTime.value) : 1440;

        // 验证时间值的有效性
        if (screenLockTimeoutValue < 1 || screenLockTimeoutValue > 43200) { // 最大30天（30*24*60分钟）
            addSystemMessage('屏幕锁定超时时间必须在1-43200分钟之间', 'error');
            return;
        }

        if (publicDestructTimeValue < 1 || publicDestructTimeValue > 43200) { // 最大30天
            addSystemMessage('公共频道消息销毁时间必须在1-43200分钟之间', 'error');
            return;
        }

        if (privateDestructTimeValue < 1 || privateDestructTimeValue > 43200) { // 最大30天
            addSystemMessage('私密频道消息销毁时间必须在1-43200分钟之间', 'error');
            return;
        }

        // 如果输入了新密码，则进行验证和保存
        if (tempPasswordValue) {
            // 检查密码长度
            if (tempPasswordValue.length < 6) {
                addSystemMessage('临时密码至少需要6个字符', 'error');
                return;
            }

            // 使用SHA-256加密密码
            sha256HashForStorage(tempPasswordValue)
                .then(hashedPassword => {
                    localStorage.setItem('chat_temp_password', hashedPassword);
                    addSystemMessage('配置已保存', 'success');
                    
                    // 更新屏幕锁定超时时间
                    localStorage.setItem('chat_screen_lock_timeout', screenLockTimeoutValue);
                    localStorage.setItem('chat_public_destruct_time', publicDestructTimeValue);
                    localStorage.setItem('chat_private_destruct_time', privateDestructTimeValue);
                    
                    // 如果聊天保护已启用，更新超时时间
                    if (window.getChatProtectionStatus && window.getChatProtectionStatus()) {
                        if (window.updateScreenLockTimeout) {
                            window.updateScreenLockTimeout(screenLockTimeoutValue);
                        }
                    }
                    
                    // 关闭模态框
                    window.hideGlobalConfigModal();
                })
                .catch(error => {
                    console.error('密码加密失败:', error);
                    addSystemMessage('密码加密失败，请重试', 'error');
                });
        } else {
            // 不更新密码，只更新其他配置
            localStorage.setItem('chat_screen_lock_timeout', screenLockTimeoutValue);
            localStorage.setItem('chat_public_destruct_time', publicDestructTimeValue);
            localStorage.setItem('chat_private_destruct_time', privateDestructTimeValue);
            
            // 如果聊天保护已启用，更新超时时间
            if (window.getChatProtectionStatus && window.getChatProtectionStatus()) {
                if (window.updateScreenLockTimeout) {
                    window.updateScreenLockTimeout(screenLockTimeoutValue);
                }
            }
            
            addSystemMessage('配置已保存', 'success');
            
            // 关闭模态框
            window.hideGlobalConfigModal();
        }
    };

    // 将关键函数添加到window对象，以便HTML可以直接调用
    window.loadCurrentConfigToForm = loadCurrentConfigToForm;
    
    // 添加系统消息（需要从chat.js传入该函数）
    
    // 移除返回模态框实例，因为我们不再使用Bootstrap实例
}

// 从本地存储加载配置
function loadSavedConfig() {
    const savedPublicDestructTime = localStorage.getItem('chat_public_destruct_time');
    const savedPrivateDestructTime = localStorage.getItem('chat_private_destruct_time');
    const savedTempPassword = localStorage.getItem('chat_temp_password');
    const savedScreenLockTimeout = localStorage.getItem('chat_screen_lock_timeout');
    const savedChatProtectionEnabled = localStorage.getItem('chat_protection_enabled');
    
    let config = {};
    
    if (savedPublicDestructTime) {
        config.globalPublicDestructTime = parseInt(savedPublicDestructTime);
    } else {
        config.globalPublicDestructTime = 1440; // 默认24小时
    }
    
    if (savedPrivateDestructTime) {
        config.globalPrivateDestructTime = parseInt(savedPrivateDestructTime);
    } else {
        config.globalPrivateDestructTime = 1440; // 默认24小时
    }
    
    if (savedTempPassword) {
        config.globalTempPassword = savedTempPassword; // 保存的是哈希值
    } else {
        config.globalTempPassword = '';
    }
    
    if (savedScreenLockTimeout) {
        config.screenLockTimeoutMs = parseInt(savedScreenLockTimeout) * 60 * 1000; // 转换为毫秒
    } else {
        config.screenLockTimeoutMs = 5 * 60 * 1000; // 默认5分钟
    }
    
    if (savedChatProtectionEnabled) {
        config.chatProtectionEnabled = savedChatProtectionEnabled === 'true';
    } else {
        config.chatProtectionEnabled = false; // 默认关闭
    }
    
    return config;
}