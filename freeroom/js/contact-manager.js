// 聊天联系人和请求管理模块

// 添加联系人到聊天列表
function addContactToChatList(contact, contacts, renderContactList) {
    // 检查联系人是否已存在
    const existingContact = contacts.find(c => c.username === contact.username);
    if (existingContact) {
        // 更新现有联系人的信息
        Object.assign(existingContact, contact);
    } else {
        // 添加新联系人
        contacts.push(contact);
    }
    
    // 重新渲染联系人列表
    renderContactList(contacts);
}

// 渲染联系人列表
function renderContactList(contacts) {
    const contactList = document.getElementById('contactList');
    if (!contactList) return;
    
    // 清空现有列表
    contactList.innerHTML = '';
    
    // 添加联系人项
    contacts.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';
        contactItem.innerHTML = `
            <div class="contact-info" onclick="switchToContact('${contact.username}')">
                <i class="fas fa-user-circle"></i>
                <span class="contact-name">${contact.username}</span>
                <span class="contact-status ${contact.status}"></span>
            </div>
            <div class="contact-actions">
                <button class="remove-contact-btn" onclick="removeContact('${contact.username}')">移除</button>
            </div>
        `;
        
        contactList.appendChild(contactItem);
    });
}

// 切换到指定联系人聊天
function switchToContact(username, currentChatContact, addSystemMessage) {
    // 更新当前聊天对象
    currentChatContact = username;
    
    // 更新界面显示
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.classList.remove('active-contact');
    });
    
    // 找到当前点击的联系人并高亮
    const clickedItem = Array.from(contactItems).find(item => 
        item.querySelector('.contact-name').textContent === username
    );
    if (clickedItem) {
        clickedItem.classList.add('active-contact');
    }
    
    // 添加系统消息
    addSystemMessage(`正在与 ${username} 私聊`, 'info');
    
    return currentChatContact;
}

// 移除联系人
function removeContact(username, contacts, currentChatContact, addSystemMessage) {
    if (confirm(`确定要移除联系人 ${username} 吗？`)) {
        contacts = contacts.filter(contact => contact.username !== username);
        renderContactList(contacts);
        
        if (currentChatContact === username) {
            currentChatContact = null;
            addSystemMessage(`已结束与 ${username} 的聊天`, 'info');
        }
        
        return { contacts, currentChatContact };
    }
    
    return { contacts, currentChatContact };
}

// 添加加密请求到列表
function addRequestToList(request, encryptionRequests, addSystemMessage) {
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
    encryptionRequests.push(request);
    
    // 添加系统消息
    addSystemMessage(`来自 ${request.from_user} 的加密申请`, 'info');
}

// 从列表中移除请求
function removeRequestFromList(requestId) {
    const requestElement = document.querySelector(`.request-item[data-id="${requestId}"]`);
    if (requestElement) {
        requestElement.remove();
    }
}

// 处理加密请求
function handleRequest(requestId, action, encryptionRequests, addSystemMessage, sendResponse, addContactToChatList, contacts, renderContactList) {
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
        addContactToChatList({
            username: request.from_user,
            status: 'online'
        }, contacts, renderContactList);
        
        // 从请求列表中移除
        encryptionRequests.splice(requestIndex, 1);
        removeRequestFromList(requestId);
        
        // 异步调用API，通知对方也添加自己为联系人
        setTimeout(() => {
            notifyOtherToAddMeAsContact(request.from_user);
        }, 1000); // 延迟1秒执行，确保当前请求处理完成
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

// 通知对方也添加自己为联系人
function notifyOtherToAddMeAsContact(username) {
    // 在实际应用中，这里可能需要实现一个通知机制
    // 比如通过WebSocket或轮询检查数据库
    console.log(`通知 ${username} 将当前用户添加为联系人`);
    
    // 可以通过API调用来实现这个功能
    // 这里只是一个示意
}

// 获取待处理的加密请求
async function getPendingRequests(username, encryptionRequests, addSystemMessage, addRequestToList) {
    try {
        // 调用API获取待处理请求
        const response = await window.getPendingRequests(username);
        
        if (response.success) {
            const requests = response.requests;
            
            // 清空当前请求列表UI
            const requestList = document.getElementById('requestList');
            if (requestList) {
                requestList.innerHTML = '';
            }
            
            // 重新填充请求列表
            encryptionRequests.length = 0; // 清空数组
            
            if (requests.length > 0) {
                requests.forEach(request => {
                    // 将请求添加到列表
                    addRequestToList(request, encryptionRequests, addSystemMessage);
                });
                
                addSystemMessage(`收到 ${requests.length} 个加密申请`, 'info');
            } else {
                addSystemMessage('暂无新的加密申请', 'info');
            }
        } else {
            addSystemMessage('获取待处理请求失败', 'error');
        }
    } catch (error) {
        addSystemMessage(`获取待处理请求时发生错误: ${error.message}`, 'error');
    }
}

// 将函数暴露给全局作用域
window.getPendingRequests = getPendingRequests;
window.addRequestToList = addRequestToList;
