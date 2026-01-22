// 矩阵背景动画功能模块

// 初始化矩阵背景动画
function initMatrixBg() {
    const canvas = document.getElementById('matrix-bg');
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

// 确保在DOM加载完成后初始化，并将函数暴露到全局
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.initMatrixBg = initMatrixBg;
        initMatrixBg();
    });
} else {
    // DOM已经加载完成，直接初始化
    window.initMatrixBg = initMatrixBg;
    initMatrixBg();
}