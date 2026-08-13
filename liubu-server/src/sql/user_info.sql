-- 用户个性化字段（前端 localStorage 同步用，后端可选接入）
CREATE TABLE IF NOT EXISTS user_info (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  home_slogan VARCHAR(30) NOT NULL DEFAULT '把种草的店，轻轻收好' COMMENT '首页自定义副标题'
);
