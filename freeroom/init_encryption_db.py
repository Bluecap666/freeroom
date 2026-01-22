#!/usr/bin/env python3
"""
初始化加密聊天所需的数据库表
"""

import pymysql

def init_database():
    """初始化数据库表"""
    # 数据库连接配置，与PHP配置保持一致
    config = {
        'host': '127.0.0.1',
        'user': 'freeroom',
        'password': 'freeroom',
        'database': 'freeroom',
        'charset': 'utf8mb4'
    }
    
    try:
        # 连接到数据库
        connection = pymysql.connect(**config)
        
        with connection.cursor() as cursor:
            # 创建加密请求表
            create_requests_table_sql = """
            CREATE TABLE IF NOT EXISTS encryption_requests (
                id VARCHAR(50) PRIMARY KEY,
                from_user VARCHAR(100) NOT NULL,
                to_user VARCHAR(100) NOT NULL,
                key_value VARCHAR(255) NOT NULL,
                status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                handled_by VARCHAR(100),
                handled_at TIMESTAMP NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
            
            cursor.execute(create_requests_table_sql)
            print("加密请求表 encryption_requests 创建/更新成功")
            
            # 创建联系人密钥表
            create_contact_keys_table_sql = """
            CREATE TABLE IF NOT EXISTS contact_keys (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                contact_name VARCHAR(100) NOT NULL,
                key_value VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_contact (username, contact_name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
            
            cursor.execute(create_contact_keys_table_sql)
            print("联系人密钥表 contact_keys 创建/更新成功")
            
            # 尝试创建索引以提高查询性能
            # 注意：MySQL的CREATE INDEX语句不支持IF NOT EXISTS，所以我们需要先检查索引是否存在
            try:
                cursor.execute("SHOW INDEX FROM encryption_requests WHERE Key_name = 'idx_from_user';")
                if not cursor.fetchone():
                    cursor.execute("CREATE INDEX idx_from_user ON encryption_requests (from_user);")
                    print("索引 idx_from_user 创建成功")
                else:
                    print("索引 idx_from_user 已存在")
            except Exception as e:
                print(f"创建索引 idx_from_user 时出错: {str(e)}")
                
            try:
                cursor.execute("SHOW INDEX FROM encryption_requests WHERE Key_name = 'idx_to_user';")
                if not cursor.fetchone():
                    cursor.execute("CREATE INDEX idx_to_user ON encryption_requests (to_user);")
                    print("索引 idx_to_user 创建成功")
                else:
                    print("索引 idx_to_user 已存在")
            except Exception as e:
                print(f"创建索引 idx_to_user 时出错: {str(e)}")
            
            print("数据库表结构初始化完成")
        
        connection.commit()
        print("所有更改已提交到数据库")
        
    except Exception as e:
        print(f"数据库操作过程中发生错误: {str(e)}")
        if 'connection' in locals():
            connection.rollback()
            print("已回滚事务")
    finally:
        if 'connection' in locals():
            connection.close()
            print("数据库连接已关闭")

if __name__ == "__main__":
    print("开始初始化加密聊天数据库...")
    init_database()