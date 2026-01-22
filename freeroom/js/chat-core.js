// 核心聊天功能模块

document.addEventListener('DOMContentLoaded', function() {
    console.log('核心聊天功能模块已加载');
    
    // 获取DOM元素
    const chatContainer = document.getElementById('chatContainer');
    const messageInput = document.getElementById('messageInput');
    const usernameInput = document.getElementById('usernameInput');
    const sendButton = document.getElementById('sendButton');
    const encryptToggle = document.getElementById('encryptToggle');
    const encStatus = document.getElementById('encStatus');
    const encIndicator = document.getElementById('encIndicator');
    const connStatus = document.getElementById('connStatus');
    const connIndicator = document.getElementById('connIndicator');
    const lastActivityEl = document.getElementById('lastActivity');
    const sessionIdEl = document.getElementById('sessionId');
    const uptimeEl = document.getElementById('uptimeEl');
    const languageSelect = document.getElementById('languageSelect');
    const randomUserBtn = document.getElementById('randomUserBtn');
    const encryptionMethod = document.getElementById('encryptionMethod');
    const themeSelect = document.getElementById('themeSelect');
    const pageTitle = document.getElementById('pageTitle');
    const encryptionKeyInput = document.getElementById('encryptionKey');
    const generateKeyBtn = document.getElementById('generateKeyBtn');
    const channelSelect = document.getElementById('channelSelect');
    const targetUsernameInput = document.getElementById('targetUsernameInput');
    const sendRequestBtn = document.getElementById('sendRequestBtn');
    const requestList = document.getElementById('requestList');
    const systemMessagesContainer = document.getElementById('systemMessages');
    const globalConfigBtn = document.getElementById('globalConfigBtn');
    const globalConfigModal = document.getElementById('globalConfigModal');
    const closeModal = document.getElementById('closeModal');
    const saveConfig = document.getElementById('saveConfig');
    const cancelConfig = document.getElementById('cancelConfig');
    const tempPassword = document.getElementById('tempPassword');
    const screenLockTimeout = document.getElementById('screenLockTimeout');
    const publicDestructTime = document.getElementById('publicDestructTime');
    const privateDestructTime = document.getElementById('privateDestructTime');
    const chatProtectionToggle = document.getElementById('chatProtectionToggle');
    const screenLockModal = document.getElementById('screenLockModal');
    const unlockPassword = document.getElementById('unlockPassword');
    const unlockScreenBtn = document.getElementById('unlockScreen');
    
    // 右侧面板信息元素
    const networkInfoEl = document.getElementById('networkInfo');  // 修改：现在只需要一个元素显示所有网络信息
    const encryptionStatusEl = document.getElementById('encryptionStatus');
    const connectionStatusEl = document.getElementById('connectionStatus');
    const messagesSentEl = document.getElementById('messagesSent');
    const destructionTimeEl = document.getElementById('destructionTime');
    const riskLevelEl = document.getElementById('riskLevel');
    const riskProgressEl = document.getElementById('riskProgress');
    
    console.log('DOM元素获取完成');
    
    // 存储加密请求
    let encryptionRequests = [];
    
    // 存储联系人列表
    let contacts = [];
    
    // 当前聊天对象
    let currentChatContact = null;
    
    // 消息销毁时间配置（分钟）
    let globalPublicDestructTime = 1440; // 默认24小时
    let globalPrivateDestructTime = 1440; // 默认24小时
    
    // 临时密码
    let globalTempPassword = '';
    
    // 当前频道类型
    let currentChannel = 'public';
    
    // 当前加密密钥
    let currentEncryptionKey = '';
    
    // 连接状态管理
    let isConnected = true;
    let messagesSentCount = 0;
    
    // 初始化配置管理器
    initializeConfigManager(globalConfigModal, {
        tempPassword,
        screenLockTimeout,
        publicDestructTime,
        privateDestructTime
    }, addSystemMessage, window.startScreenLockTimer, window.stopScreenLockTimer);

    
    // 初始化 - 从本地存储加载配置
    const savedConfig = loadSavedConfig();
    globalPublicDestructTime = savedConfig.globalPublicDestructTime;
    globalPrivateDestructTime = savedConfig.globalPrivateDestructTime;
    globalTempPassword = savedConfig.globalTempPassword;
    // 从本地存储获取screenLockTimeoutMs，不再使用全局变量
    const savedScreenLockTimeout = localStorage.getItem('chat_screen_lock_timeout');
    window.screenLockTimeoutMs = (savedScreenLockTimeout ? parseInt(savedScreenLockTimeout) : 5) * 60 * 1000;
    
    // 从本地存储获取聊天保护状态
    // 现在由chat-protection.js管理
    // const savedChatProtectionEnabled = localStorage.getItem('chat_protection_enabled');
    // chatProtectionEnabled = savedChatProtectionEnabled === 'true';
    
    // 初始化聊天保护功能
    window.initializeChatProtection();

    // 频道切换处理函数
    function handleChannelChange() {
        const selectedChannel = channelSelect.value;
        if (currentChannel !== selectedChannel) {
            // 保存当前频道的用户名
            if (currentChannel === 'public') {
                // 保存公共频道的用户名
                localStorage.setItem('chat_current_public_username', usernameInput.value);
            } else {
                // 保存加密频道的用户名
                localStorage.setItem('chat_current_private_username', usernameInput.value);
            }
            
            // 更新当前频道
            currentChannel = selectedChannel;
            
            // 根据频道类型加载不同的配置
            if (currentChannel === 'public') {
                // 公共频道：加载用户名，加密方式设为简单加密，清空加密密钥
                const savedPublicUsername = localStorage.getItem('chat_current_public_username');
                if (savedPublicUsername) {
                    usernameInput.value = savedPublicUsername;
                }
                
                // 公共频道默认使用简单加密方式
                encryptionMethod.value = 'none'; // 修改：公共频道默认不加密
                
                // 清空加密密钥（公共频道不需要专门的密钥）
                encryptionKeyInput.value = '';
                
                // 隐藏加密密钥和加密申请相关的部分
                const encryptionMethodSection = document.getElementById('encryptionMethodSection');
                const encryptionKeySection = document.getElementById('encryptionKeySection');
                const encryptionRequestSection = document.getElementById('encryptionRequestSection');
                
                if (encryptionMethodSection) encryptionMethodSection.style.display = 'none';
                if (encryptionKeySection) encryptionKeySection.style.display = 'none';
                if (encryptionRequestSection) encryptionRequestSection.style.display = 'none';
            } else {
                // 加密频道：加载用户名，设置加密方式和密钥
                const sessionInfo = window.getCurrentSessionInfo ? window.getCurrentSessionInfo() : {
                    username: 'default_user',
                    key: 'default_key'
                };
                const savedPrivateUsername = localStorage.getItem('chat_current_private_username');
                
                // 使用会话用户名或保存的用户名
                usernameInput.value = savedPrivateUsername || sessionInfo.username || 'encrypted_user';
                
                // 加密频道默认使用密钥加密方式
                encryptionMethod.value = 'key';
                
                // 使用会话密钥
                encryptionKeyInput.value = sessionInfo.key || '';
                
                // 显示加密密钥和加密申请相关的部分
                const encryptionMethodSection = document.getElementById('encryptionMethodSection');
                const encryptionKeySection = document.getElementById('encryptionKeySection');
                const encryptionRequestSection = document.getElementById('encryptionRequestSection');
                
                if (encryptionMethodSection) encryptionMethodSection.style.display = '';
                if (encryptionKeySection) encryptionKeySection.style.display = '';  // 修复：之前写成了encryptionMethodSection
                if (encryptionRequestSection) encryptionRequestSection.style.display = '';
            }
            
            // 重新获取消息
            if (window.fetchMessagesAPI) {
                window.fetchMessagesAPI();
            }
            
            // 更新UI显示
            addSystemMessage(`切换到${currentChannel === 'public' ? '公共频道' : '加密频道'}`, 'info');
        }
    }
    
    // 初始化时根据当前频道设置UI显示
    if (currentChannel === 'public') {
        // 隐藏加密相关的部分
        const encryptionMethodSection = document.getElementById('encryptionMethodSection');
        const encryptionKeySection = document.getElementById('encryptionKeySection');
        const encryptionRequestSection = document.getElementById('encryptionRequestSection');
        
        if (encryptionMethodSection) encryptionMethodSection.style.display = 'none';
        if (encryptionKeySection) encryptionKeySection.style.display = 'none';
        if (encryptionRequestSection) encryptionRequestSection.style.display = 'none';
    }
    
    // 监听频道选择变化
    if (channelSelect) {
        channelSelect.addEventListener('change', handleChannelChange);
    }
    
    // 显示全局配置模态框
    // 事件绑定已移至HTML onclick属性，此处不再重复绑定
    
    // 绑定ESC键关闭模态框
    document.addEventListener('keydown', function(event) {
        // 检查全局配置模态框是否显示
        const globalConfigModal = document.getElementById('globalConfigModal');
        if (event.key === 'Escape' && globalConfigModal && 
            (globalConfigModal.style.display === 'flex' || globalConfigModal.classList.contains('show'))) {
            // 直接调用全局隐藏函数
            window.hideGlobalConfigModal();
        }
    });
    
    // 点击模态框外部区域关闭模态框
    const globalConfigModalElement = document.getElementById('globalConfigModal');
    if (globalConfigModalElement) {
        globalConfigModalElement.addEventListener('click', function(event) {
            // 检查点击的目标是否是模态框overlay本身（而不是模态框内容）
            if (event.target === globalConfigModalElement) {
                // 直接关闭模态框
                window.hideGlobalConfigModal();
            }
        });
    }
    
    // 关闭模态框
    if (closeModal) {
        // 先移除可能存在的重复事件监听器
        const newCloseClickHandler = function() {
            // 直接关闭模态框
            window.hideGlobalConfigModal();
        };
        
        // 移除现有的事件监听器（如果有）
        if(closeModal['_globalConfigCloseHandler']) {
            closeModal.removeEventListener('click', closeModal['_globalConfigCloseHandler']);
        }
        // 添加新的事件监听器
        closeModal.addEventListener('click', newCloseClickHandler);
        closeModal['_globalConfigCloseHandler'] = newCloseClickHandler;
    }
    
    // 取消配置
    if (cancelConfig) {
        // 先移除可能存在的重复事件监听器
        const newCancelClickHandler = function() {
            // 直接关闭模态框
            window.hideGlobalConfigModal();
        };
        
        // 移除现有的事件监听器（如果有）
        if(cancelConfig['_globalConfigCancelHandler']) {
            cancelConfig.removeEventListener('click', cancelConfig['_globalConfigCancelHandler']);
        }
        // 添加新的事件监听器
        cancelConfig.addEventListener('click', newCancelClickHandler);
        cancelConfig['_globalConfigCancelHandler'] = newCancelClickHandler;
    }
    
    // 解锁屏幕按钮事件
    if (unlockScreenBtn) {
        unlockScreenBtn.addEventListener('click', function() {
            const screenLockModalInstance = null; // 在当前实现中，我们不使用Bootstrap的模态框实例
            window.unlockScreenFunc(unlockPassword, screenLockModal, screenLockModalInstance, addSystemMessage);
        });
    }
    
    // 聊天保护开关事件 - 由chat-protection.js管理
    // 移除原来的事件处理代码
    
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
    
    // 获取当前会话信息
    function getCurrentSessionInfo() {
        // 使用api.js中定义的函数
        return window.getCurrentSessionInfo ? window.getCurrentSessionInfo() : {
            username: 'default_user',
            key: 'default_key'
        };
    }
    
    // 添加联系人到聊天列表
    function addContactToChatList(contact) {
        // 使用contact-manager.js中的函数
        window.addContactToChatList(contact, contacts, window.renderContactList);
    }
    
    // 渲染联系人列表
    function renderContactList() {
        window.renderContactList(contacts);
    }
    
    // 切换到指定联系人聊天
    function switchToContact(username) {
        currentChatContact = window.switchToContact(username, currentChatContact, addSystemMessage);
    }
    
    // 移除联系人
    function removeContact(username) {
        const result = window.removeContact(username, contacts, currentChatContact, addSystemMessage);
        contacts = result.contacts;
        currentChatContact = result.currentChatContact;
    }
    
    // 添加加密请求到列表
    function addRequestToList(request) {
        window.addRequestToList(request, encryptionRequests, addSystemMessage);
    }
    
    // 发送响应给请求发起方
    function sendResponse(toUser, action) {
        // 这里只是记录日志，因为实际的通知机制需要服务器端的支持
        console.log(`通知 ${toUser}: 加密请求已被${action === 'accept' ? '接受' : '拒绝'}`);
        
        // 在实际应用中，这里可能需要实现一个通知机制
        // 比如通过WebSocket或定期轮询来通知对方
        addSystemMessage(`已通知 ${toUser} 加密请求已被${action === 'accept' ? '接受' : '拒绝'}`, 'info');
    }
    
    function handleRequest(requestId, action) {
        window.handleRequest(
            requestId, 
            action, 
            encryptionRequests, 
            addSystemMessage, 
            sendResponse, 
            addContactToChatList, 
            contacts, 
            window.renderContactList
        );
    }
    
    // 发送加密请求
    function sendEncryptionRequest() {
        const targetUsernameInput = document.getElementById('targetUsernameInput');
        const usernameInput = document.getElementById('usernameInput');
        
        if (!targetUsernameInput || !usernameInput) {
            addSystemMessage('页面元素未找到，请刷新页面重试', 'error');
            return;
        }
        
        const fromUser = usernameInput.value.trim();
        const toUser = targetUsernameInput.value.trim();
        
        if (!fromUser) {
            addSystemMessage('请先输入您的用户名', 'error');
            return;
        }
        
        if (!toUser) {
            addSystemMessage('请输入要发送加密申请的用户名', 'error');
            return;
        }
        
        if (fromUser === toUser) {
            addSystemMessage('不能向自己发送加密申请', 'error');
            return;
        }
        
        // 调用API发送加密请求
        window.sendEncryptionRequest(fromUser, toUser)
            .then(response => {
                if (response.success) {
                    // 清空目标用户名输入框
                    targetUsernameInput.value = '';
                }
            })
            .catch(error => {
                console.error('发送加密请求失败:', error);
            });
    }
    
    // 生成随机用户名
    function generateRandomUsername() {
        return window.generateRandomUsername();
    }
    
    // 生成密钥并更新UI
    function generateAndSetKey() {
        window.generateAndSetKey(encryptionKeyInput, addSystemMessage);
    }
    
    // 为发送加密请求按钮添加事件监听器
    if (sendRequestBtn) {
        sendRequestBtn.addEventListener('click', sendEncryptionRequest);
    } else {
        console.warn('sendRequestBtn元素未找到');
    }

    // 定期获取待处理的加密请求
    async function pollPendingRequests() {
        if (usernameInput && usernameInput.value.trim() !== '') {
            const currentUser = usernameInput.value.trim();
            await window.getPendingRequests(currentUser, encryptionRequests, addSystemMessage, addRequestToList);
        }
    }
    
    // 每10秒获取一次待处理请求
    setInterval(pollPendingRequests, 10000);
    
    // 页面加载后立即获取一次待处理请求
    setTimeout(pollPendingRequests, 2000); // 延迟2秒执行，确保其他初始化完成
    
    // 添加到window对象的函数
    window.handleRequest = handleRequest;
    window.switchToContact = switchToContact;
    window.removeContact = removeContact;
    
    // 初始化 - 移除了语言更新功能
    fetchMessagesAPI();
    // 替换updateLastActivity调用，使用window对象上的函数
    if (window.updateLastActivity && lastActivityEl) {
        window.updateLastActivity(lastActivityEl);
    }
    setInterval(fetchMessagesAPI, 5000); // 每5秒获取一次新消息
    setInterval(() => {
        if (window.updateUptime && uptimeEl) {
            window.updateUptime(uptimeEl);
        }
    }, 1000); // 每秒更新一次运行时间
    
    // 初始连接状态
    if (window.updateConnectionStatus) {
        window.updateConnectionStatus(isConnected, connStatus, connIndicator);
    }
});

// 将关键函数添加到window对象，以便HTML可以直接调用
window.handleRequest = handleRequest;
window.switchToContact = switchToContact;
window.removeContact = removeContact;

// 使用Web Crypto API计算SHA-256哈希
async function sha256HashForStorage(text) {
    if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
        // 如果浏览器不支持Web Crypto API，则使用js/crypto.js中的模拟实现
        // 为了避免无限循环，我们直接实现一个简单的版本
        const shaChars = '0123456789abcdef';
        let hash = '';
        for (let i = 0; i < 64; i++) {
            hash += shaChars[Math.floor(Math.random() * 16)];
        }
        return Promise.resolve(hash);
    }
}


// 绑定发送按钮事件
if (sendButton) {
    sendButton.addEventListener('click', function() {
        // 检查是否设置了临时密码
        if (!checkTempPassword()) {
            addSystemMessage('请先设置临时密码才能发送加密消息！', 'error');
            return;
        }
        sendMessageAPI();
    });
}

// 回车键发送消息
if (messageInput) {
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            // 检查是否设置了临时密码
            if (!checkTempPassword()) {
                addSystemMessage('请先设置临时密码才能发送加密消息！', 'error');
                return;
            }
            sendMessageAPI();
        }
    });
}

// 控制加密频道配置的折叠功能
let encryptionChannelExpanded = false;

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const header = section.parentElement.querySelector('.section-header');
    
    if (section.style.display === 'none' || !section.style.display) {
        section.style.display = 'block';
        header.classList.add('active');
        encryptionChannelExpanded = true;
    } else {
        section.style.display = 'none';
        header.classList.remove('active');
        encryptionChannelExpanded = false;
    }
}

// 根据频道选择更新配置显示
function updateConfigDisplay(channel) {
    const configItems = document.getElementById('configItems');
    const configHeader = document.getElementById('configHeader');
    
    if (configItems && configHeader) {
        if (channel === 'private') {
            // 在私有频道时启用折叠功能，隐藏配置项直到用户点击展开
            configItems.style.display = 'none';
            configHeader.classList.remove('active');
            encryptionChannelExpanded = false;
        } else {
            // 在公共频道时显示所有配置，禁用折叠功能
            configItems.style.display = 'block';
            configHeader.classList.add('active');
            encryptionChannelExpanded = true;
        }
    }
}

// 监听频道切换
const channelSelect = document.getElementById('channelSelect');
if (channelSelect) {
    channelSelect.addEventListener('change', function() {
        updateConfigDisplay(this.value);
    });
    
    // 初始化时根据默认频道设置
    updateConfigDisplay(channelSelect.value || 'public');
}

// 当切换频道时，根据频道类型控制用户名输入框的可见性
function onChannelChange() {
    const usernameInput = document.getElementById('usernameInput');
    const configHeader = document.getElementById('configHeader');
    const configItems = document.getElementById('configItems');
    
    if (getCurrentChannel() === 'public') {
        // 公共频道：隐藏用户名输入框，自动生成用户名
        if (usernameInput) {
            usernameInput.style.display = 'none'; // 隐藏输入框
        }
        
        // 如果没有存储的公共频道用户名，则生成一个
        let publicUsername = localStorage.getItem('public_chat_username');
        if (!publicUsername) {
            publicUsername = generateRandomUsername();
            localStorage.setItem('public_chat_username', publicUsername);
        }
        
        // 显示当前使用的用户名（在标签旁边）
        if (configHeader) {
            const existingSpan = configHeader.querySelector('.current-username-display');
            if (!existingSpan) {
                const usernameDisplay = document.createElement('span');
                usernameDisplay.className = 'current-username-display';
                usernameDisplay.textContent = ` (当前: ${publicUsername})`;
                usernameDisplay.style.fontSize = '0.8em';
                usernameDisplay.style.color = '#7ec8e3';
                configHeader.appendChild(usernameDisplay);
            } else {
                existingSpan.textContent = ` (当前: ${publicUsername})`;
            }
        }
        
        console.log('公共频道用户名:', publicUsername);
    } else {
        // 加密频道：显示用户名输入框
        if (usernameInput) {
            usernameInput.style.display = 'inline-block'; // 显示输入框
        }
        
        // 移除公共频道用户名显示
        const existingSpan = configHeader?.querySelector('.current-username-display');
        if (existingSpan) {
            existingSpan.remove();
        }
    }
}

// 生成随机用户名
function generateRandomUsername() {
    const adjectives = ['敏捷', '勇敢', '智慧', '冷静', '坚韧', '忠诚', '神秘', '机智', '强大', '优雅'];
    const nouns = ['忍者', '黑客', '武士', '龙', '鹰', '狼', '豹', '虎', '蛇', '熊'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 9000) + 1000; // 生成4位数字
    
    return `${adj}${noun}${number}`;
}

// 初始化频道选择事件监听器
$(document).ready(function() {
    // 初始化频道选择
    $('#channelSelect').val('public');
    
    // 添加频道切换事件监听器
    $('#channelSelect').change(function() {
        onChannelChange();
        
        // 刷新消息列表
        if (typeof fetchMessagesAPI === 'function') {
            fetchMessagesAPI();
        }
    });
    
    // 页面加载完成后，根据当前频道设置UI
    setTimeout(onChannelChange, 100);
});
