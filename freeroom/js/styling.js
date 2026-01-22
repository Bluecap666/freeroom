// 样式控制功能模块

// 初始化矩阵背景动画
function initMatrixBg() {
    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 设置画布大小
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 监听窗口大小变化
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // 矩阵字符集
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%^&*()_-+=[]{}|;:,.<>?/";
    const charArray = chars.split("");
    
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    
    // 每列的y坐标
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
    }
    
    // 绘制函数
    function draw() {
        // 半透明背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = `${fontSize}px monospace`;
        
        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            drops[i]++;
        }
    }
    
    // 开始动画
    setInterval(draw, 33);
}

// 更新风险级别
function updateRiskLevel(level, riskProgressEl, riskLevelEl, lang, translations) {
    riskProgressEl.style.width = level + '%';
    let riskText;
    let bgGradient;
    
    if (level < 30) {
        riskText = '低风险';
        bgGradient = 'linear-gradient(to right, #00ff00, #00cc00)';
    } else if (level < 70) {
        riskText = '中等风险';
        bgGradient = 'linear-gradient(to right, #ffff00, #ff9900)';
    } else {
        riskText = '高风险';
        bgGradient = 'linear-gradient(to right, #ff0000, #cc0000)';
    }
    
    riskLevelEl.textContent = riskText;
    riskProgressEl.style.background = bgGradient;
}

// 更新连接状态显示
function updateConnectionStatus(status, connStatus, connIndicator, lang, translations) {
    if (status) {
        connStatus.textContent = '在线';
        if (connIndicator) {
            connIndicator.classList.remove('disconnected');
        }
    } else {
        connStatus.textContent = '离线';
        if (connIndicator) {
            connIndicator.classList.add('disconnected');
        }
    }
}


// 更新运行时间
function updateUptime(uptimeEl) {
    const startTime = localStorage.getItem('chat_start_time');
    if (!startTime) {
        localStorage.setItem('chat_start_time', new Date().toISOString());
        if (uptimeEl) uptimeEl.textContent = '00:00:00';
        return;
    }
    
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    
    const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const seconds = (diff % 60).toString().padStart(2, '0');
    
    if (uptimeEl) uptimeEl.textContent = `${hours}:${minutes}:${seconds}`;
}

// 更新最后活动时间
function updateLastActivity(lastActivityEl) {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    if (lastActivityEl) lastActivityEl.textContent = timestamp;
}