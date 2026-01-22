# FreeRoom 项目 GitHub 推送指南

## 🚀 第一步：在 GitHub 上创建仓库

1. 登录到 [GitHub](https://github.com)
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `freeroom` （或你喜欢的名称）
   - Description: `FreeRoom - 安全加密聊天室系统`
   - 设置为 Public 或 Private
   - **注意：不要勾选 "Initialize this repository with a README"**
   - 点击 "Create repository"

## 🔧 第二步：连接本地仓库到远程仓库

在你的终端中执行以下命令（将 `<your-username>` 替换为你的 GitHub 用户名）：

```bash
# 添加远程仓库地址
git remote add origin https://github.com/<your-username>/freeroom.git

# 验证远程仓库地址
git remote -v
```

## 📤 第三步：推送代码到 GitHub

```bash
# 推送主分支到 GitHub
git branch -M main
git push -u origin main
```

## 🔄 或者推送至现有仓库

如果你已经有一个仓库，可以执行：

```bash
# 替换 URL 为你自己的仓库地址
git remote set-url origin https://github.com/<your-username>/freeroom.git
git push -u origin main
```

## 📋 提交历史说明

本项目包含以下主要模块的提交：

### :books: feat: 添加 FreeRoom 安全聊天室项目文档及源码
- 完整的前端界面 (HTML/CSS/JS)
- 加密通信功能模块
- 数据库初始化脚本
- API 接口实现
- 联系人管理系统
- 屏幕保护及其他安全功能

## 🛠️ 项目特点

- **端到端加密**: 使用 AES-256、RSA 等多种加密算法
- **安全通信**: 防止第三方窃听和篡改
- **联系人管理**: 加密请求和双向验证系统
- **多频道支持**: 公共频道与私有频道
- **响应式界面**: 适配多种设备尺寸

## 📦 包含的文件

- `index.html` - 主页面
- `css/chat.css` - 样式文件
- `js/*` - JavaScript 功能模块
- `api/*` - 后端 API 接口
- `README.md` - 项目说明文档

## 📞 后续维护

项目推送完成后，你可以通过以下命令进行后续更新：

```bash
# 添加更改
git add .

# 提交更改
git commit -m ":memo: docs: 更新文档"

# 推送 GitHub
git push
```

## 🎉 完成

恭喜！你现在成功将 FreeRoom 安全聊天室项目推送到了 GitHub。