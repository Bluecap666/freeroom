import pymysql
import sys
from datetime import datetime

# 数据库连接配置
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'freeroom',
    'password': 'freeroom',
    'charset': 'utf8mb4'
}

def init_database():
    try:
        # 首先连接到MySQL服务器但不指定数据库
        connection = pymysql.connect(**DB_CONFIG)
        
        with connection.cursor() as cursor:
            # 创建数据库（如果不存在）
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS freeroom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print("数据库创建成功或已存在")
            
            # 选择数据库
            cursor.execute("USE freeroom")
            
            # 创建消息表
            sql = """
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                encrypted BOOLEAN DEFAULT FALSE,
                method VARCHAR(20) DEFAULT 'simple',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                channel VARCHAR(20) DEFAULT 'public',
                INDEX idx_channel_timestamp (channel, timestamp),
                INDEX idx_username (username)
            );
            """
            cursor.execute(sql)
            print("消息表创建成功或已存在")
            
            # 创建加密请求表
            sql = """
            CREATE TABLE IF NOT EXISTS encryption_requests (
                id VARCHAR(50) PRIMARY KEY,
                from_user VARCHAR(50) NOT NULL,
                to_user VARCHAR(50) NOT NULL,
                key_value VARCHAR(255) NOT NULL,
                status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                handled_at DATETIME NULL,
                handled_by VARCHAR(50) NULL,
                INDEX idx_to_user_status (to_user, status),
                INDEX idx_from_user (from_user)
            );
            """
            cursor.execute(sql)
            print("加密请求表创建成功或已存在")
            
            # 创建会话信息表
            sql = """
            CREATE TABLE IF NOT EXISTS sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                key_value VARCHAR(255) NOT NULL,
                session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
            """
            cursor.execute(sql)
            print("会话信息表创建成功或已存在")
            
            # 创建联系人密钥表
            sql = """
            CREATE TABLE IF NOT EXISTS contact_keys (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                contact_name VARCHAR(50) NOT NULL,
                key_value VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_contact (username, contact_name)
            );
            """
            cursor.execute(sql)
            print("联系人密钥表创建成功或已存在")
            
        connection.commit()
        print("\n数据库和表初始化完成！")
        
    except Exception as e:
        print(f"数据库初始化失败: {str(e)}")
        sys.exit(1)
    finally:
        try:
            connection.close()
        except:
            pass

if __name__ == "__main__":
    init_database()