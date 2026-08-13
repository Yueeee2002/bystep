-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS liubu_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE liubu_db;

-- 2. 图片存储表（存放服务器图片 URL）
CREATE TABLE IF NOT EXISTS images (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '图片自增ID',
  image_url VARCHAR(500) NOT NULL COMMENT '服务器图片访问地址',
  create_time DATETIME COMMENT '上传时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 探店主记录表（核心点位）
CREATE TABLE IF NOT EXISTS records (
  id VARCHAR(36) PRIMARY KEY COMMENT '记录唯一ID',
  title VARCHAR(120) NOT NULL COMMENT '店铺名称',
  category_group ENUM('catering','other') NOT NULL COMMENT '大类：catering=食肆小店 other=野趣小仓',
  star TINYINT COMMENT '星级1-5',
  is_check_in TINYINT DEFAULT 0 COMMENT '是否已打卡 0否1是',
  address TEXT COMMENT '地址',
  note TEXT COMMENT '种草备注',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 记录与图片关联中间表（一条点位多张图片）
CREATE TABLE IF NOT EXISTS record_image_rel (
  record_id VARCHAR(36) COMMENT '点位ID',
  image_id INT COMMENT '图片ID',
  PRIMARY KEY (record_id, image_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
