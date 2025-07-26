CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(100) NOT NULL,
    role_id INT REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(10) CHECK (status IN ('active', 'inactive')) DEFAULT 'active'
);

CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD'
);

CREATE TABLE histories (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    transaction_type VARCHAR(10) CHECK (transaction_type IN ('add', 'deduct')),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    action TEXT,
    detail JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (role_name) VALUES 
('Admin'),
('User');

INSERT INTO users (email, password, firstName, lastName, username, role_id, phone) VALUES 
('admin@example.com', '$2b$10$hashed_admin_password_here', 'Admin', 'User', 'admin', 1, '081111111'),
('johndoe@example.com', '$2b$10$hashed_user_password_here', 'John', 'Doe', 'johndoe', 2, '081111112');

INSERT INTO wallets (user_id, balance, currency) VALUES 
(1, 1000.00, 'USD'),
(2, 50.00, 'USD');

INSERT INTO histories (user_id, transaction_type, amount, currency, action, detail) VALUES 
(1, 'add', 100.00, 'USD', 'Deposit', '{"source": "initial deposit", "method": "bank transfer"}'),  
(2, 'deduct', 25.00, 'USD', 'Purchase', '{"item": "Book", "description": "Purchase of a book"}');  

CREATE TABLE records (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    record_data JSON DEFAULT '{}',
    random JSON DEFAULT '{}',
    status VARCHAR(10) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    is_redeem VARCHAR(10) CHECK (is_redeem IN ('false', 'true')) DEFAULT 'false',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nba (
    id SERIAL PRIMARY KEY,          
    type TEXT NOT NULL,             
    json_response JSONB NOT NULL,   
    created_at TIMESTAMP DEFAULT NOW() 
);

CREATE TABLE conditions (
    id SERIAL PRIMARY KEY,          
    json_response JSONB NOT NULL,   
    created_at TIMESTAMP DEFAULT NOW() 
);

INSERT INTO conditions (id, json_response) VALUES 
(1,'{"results": [0 ,0, 35, 85, 185, 365, 735, 1495, 3065, 6285, 12835] }');

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,  
    user_id INT REFERENCES users(id),        
    team_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() 
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,    
    user_id INT REFERENCES users(id),      
    json_response JSONB NOT NULL,   
    created_at TIMESTAMP DEFAULT NOW() 
);
