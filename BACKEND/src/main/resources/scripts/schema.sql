// Note: Tạo bảng users trong MySQL để lưu thông tin người dùng.
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL,

    //information
    full_name VARCHAR(100),
    portfolio_url VARCHAR(255),
    experience_years INT,
    status VARCHAR(50) NOT NULL

    // Note: Lưu tổng điểm tích lũy của người chơi
    total_points BIGINT NOT NULL DEFAULT 0
);

// Note: Tạo bảng games trong MySQL để lưu thông tin game do Developer upload.
CREATE TABLE IF NOT EXISTS games (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    requirements TEXT,
    preview_image_url VARCHAR(255),
    apk_file_url VARCHAR(255),
    support_leaderboard BOOLEAN NOT NULL DEFAULT FALSE,
    support_points BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL,
    developer_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (developer_id) REFERENCES users(id)
);

// Note: Tạo bảng reviews để lưu đánh giá của người chơi về game.
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    player_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

// Note: Tạo bảng point_transactions để lưu lịch sử giao dịch điểm (tải game, viết review).
CREATE TABLE IF NOT EXISTS point_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    player_id BIGINT NOT NULL,
    game_id BIGINT, // Note: Có thể null nếu hành động không liên quan đến game cụ thể
    action_type VARCHAR(50) NOT NULL, // Note: Loại hành động: DOWNLOAD_GAME, WRITE_REVIEW
    points BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

// Bảng gifts lưu thông tin quà tặng do Developer upload.
CREATE TABLE IF NOT EXISTS gifts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    point_cost BIGINT NOT NULL CHECK (point_cost > 0),
    quantity BIGINT NOT NULL CHECK (quantity >= 0), // Thêm trường quantity để giữ số lượng quà
    developer_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES users(id)
);

// Bảng gift_transactions để lưu lịch sử đổi quà của người chơi.
CREATE TABLE IF NOT EXISTS gift_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    player_id BIGINT NOT NULL,
    gift_id BIGINT NOT NULL,
    points_spent BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES users(id),
    FOREIGN KEY (gift_id) REFERENCES gifts(id)
);


// Note: Tạo bảng assets trong MySQL để lưu thông tin assets do Designer upload.
CREATE TABLE IF NOT EXISTS assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(255) NOT NULL,
    tags VARCHAR(255), -- Lưu dưới dạng comma-separated, ví dụ: "2D sprite,3D model"
    is_free BOOLEAN NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    designer_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (designer_id) REFERENCES users(id)
    );

-- Tạo bảng payment_info để lưu thông tin thanh toán của admin
CREATE TABLE payment_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    qr_code_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng deposit_requests để lưu yêu cầu nạp tiền
CREATE TABLE deposit_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    transaction_note TEXT,
    admin_note TEXT,
    approved_by BIGINT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_deposit_status (status),
    INDEX idx_deposit_user (user_id),
    INDEX idx_deposit_created (created_at)
);

-- Tạo bảng transactions
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,0) NOT NULL COMMENT 'Số tiền VND (không có phần thập phân)',
    platform_fee DECIMAL(15,0) NOT NULL COMMENT 'Phí nền tảng 10% (VND)',
    designer_amount DECIMAL(15,0) NOT NULL COMMENT 'Số tiền designer nhận được (VND)',
    status VARCHAR(20) NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    asset_id BIGINT NOT NULL,
    approved_by_id BIGINT,
    approved_at DATETIME,
    rejection_reason VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (approved_by_id) REFERENCES users(id),

    INDEX idx_status (status),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_created_at (created_at)
    );
