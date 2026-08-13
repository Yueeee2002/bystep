# 留步

把种草的店，轻轻收好。

留步是一款极简的探店 / 出游打卡点位收纳工具。刷到想去的地方，把截图收进来，周末再慢慢挑、慢慢走。V1.0 是纯前端 Web App：数据只存在你的浏览器里，没有登录，也没有云同步。

## 功能

- 批量拖拽或点击上传图片，自动生成未打卡卡片
- 网格 / 列表两种视图，点击卡片编辑店名、地址、备注、心得
- 未打卡 / 已打卡状态切换
- 自定义标签，多选绑定，支持按状态 + 标签筛选
- 全文搜索标题、地址、备注、心得和标签
- 导出 / 导入 JSON 备份，支持清空数据
- 昵称与默认筛选偏好

## 本地开发

```bash
npm install
npm run dev
```

浏览器打开提示的本地地址即可。生产构建：

```bash
npm run build
npm run preview
```

测试与检查：

```bash
npm test
npm run lint
```

## 数据说明

所有数据保存在 `localStorage`：

| Key | 内容 |
| --- | --- |
| `explore_cards` | 点位卡片 |
| `explore_tags` | 标签 |
| `explore_config` | 昵称、默认筛选、视图偏好 |

图片会先压缩为 JPEG Base64 再存储。浏览器存储空间有限，建议单次不要导入过多大图；定期导出 JSON 备份更安心。

## 技术栈

React + TypeScript + Vite + Zustand + Headless UI。地图相关接口预留在 `src/api/mapAdapter.ts`，供 V2.0 接入高德 / 百度 SDK。
