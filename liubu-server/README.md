# 留步后端（本地磁盘图片存储）

前端上传图片 → multer 接收 → 写入 `public/upload` → 静态资源托管 → 返回可访问 URL。

手机相册原图上传后即与站点解绑，删除相册不影响网站展示。

## 启动

```bash
cd liubu-server
cp .env.example .env
npm install
npm run dev
```

默认地址：`http://127.0.0.1:3000`。

- 上传：`POST /api/upload`，字段名 `file`
- 标签列表：`GET /api/tags`，可选 `?category_group=catering|other`
- 新建标签：`POST /api/tags`（`tag_name`、`category_group` 必填）
- 修改标签归属：`PATCH /api/tags/:id`
- 保存点位：`POST /api/records`（校验所有 `tag_ids` 必须与点位 `category_group` 一致，否则 400）
- 打卡日历：`GET /api/calendar?year=2026&month=8`，可选 `category_group`

## 数据库（可选）

执行 `sql/init.sql` 创建 `liubu_db`。未配置或连接失败时，图片仍会写入磁盘，只是不写入 `images` 表。

`records.category_group` 枚举固定为：

- `catering` → 食肆小店
- `other` → 野趣小仓

## 前端切换

把 `src/api/imageStore.ts` 里的 `BACKEND_READY` 改为 `true`。开发过渡期图片仍压缩后存在浏览器；上线后走本服务。

## 部署与备份

1. 云服务器安装 Node.js 与 MySQL
2. `npm run build` 后常驻运行 `node dist/index.js`
3. 定期把 `public/upload` 整夹下载到本地存档
