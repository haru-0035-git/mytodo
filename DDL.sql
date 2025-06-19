    -- ★★★ このカラムを追加 ★★★
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clerk_user_id VARCHAR(255) NOT NULL UNIQUE, -- Clerkが発行する一意のユーザーIDを保存
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    tags JSON NOT NULL DEFAULT (JSON_ARRAY()),
    limited_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES task_statuses(id) ON DELETE SET NULL
);


insert into task_statuses (name) values ('ToDo'), ('Doing'), ('Done'), ('canceled');
insert into users (name, email) values ('山田太郎', 'aaa@aaa.com'), ('佐藤花子', 'bbb@bbb.com');
insert into tasks (user_id, title, description, status_id, tags, limited_at)
values 
(1, 'タスク1', 'タスク1の説明', 1, JSON_ARRAY('tag1', 'tag2'), '2023-12-31 23:59:59'),
(2, 'タスク2', 'タスク2の説明', 2, JSON_ARRAY('tag3'), NULL),
(1, 'タスク3', 'タスク3の説明', 3, JSON_ARRAY(), '2024-01-15 12:00:00');