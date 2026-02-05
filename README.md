# 小红书笔记收集器

一个用于收集和整理小红书笔记的工具,可以爬取用户的笔记、收藏和点赞内容,并生成交互式网页展示。

## 功能特点

- 📝 **获取用户笔记**: 使用浏览器自动化爬取自己发布的所有笔记
- ⭐ **获取收藏列表**: 获取所有收藏的笔记(开发中)
- ❤️ **获取点赞列表**: 获取所有点赞的笔记(开发中)
- 🎨 **精美网页展示**: 响应式设计,支持搜索和排序
- 💾 **本地数据存储**: 数据保存为JSON格式,方便管理
- 🔍 **数据归档**: 将你的小红书笔记永久保存在本地

## 项目结构

```
babyRedBook/
├── crawler/           # 爬虫模块
│   ├── index.js      # 主程序入口
│   └── api.js        # API接口封装
├── data/             # 数据存储目录
│   ├── notes.json       # 笔记数据
│   ├── collections.json  # 收藏数据
│   └── likes.json       # 点赞数据
├── index.html        # 前端展示页面
├── styles.css        # 样式文件
├── script.js         # 前端逻辑
└── package.json      # 项目配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置信息

项目已内置你的小红书配置,如需修改请编辑 [crawler/index.js](crawler/index.js:11-12):

- **用户ID**: 你的小红书用户ID
- **Cookie**: 小红书登录凭证

#### 获取Cookie的方法:

1. 打开浏览器,访问小红书官网 https://www.xiaohongshu.com
2. 登录你的账号
3. 按F12打开开发者工具
4. 切换到"网络"(Network)标签
5. 刷新页面,找到任意请求
6. 在请求头中找到"Cookie"字段,复制完整内容

### 3. 收集数据

#### 方法一: 浏览器控制台收集(推荐)

**收集笔记:**
```bash
npm run collect
```
或打开 [collect-script.js](collect-script.js) 复制脚本到浏览器控制台

**收集收藏和点赞:**
打开 [collect-collections-likes.js](collect-collections-likes.js) 复制脚本到浏览器控制台

#### 方法二: 使用手动工具

按照提示:
1. 打开浏览器,访问你的小红书主页
2. 按F12打开控制台
3. 复制脚本到控制台运行
4. 收集完成后保存数据到 `data/notes.json`

详细说明请查看: [数据收集指南](COLLECT.md)

### 4. 查看结果

在浏览器中打开 [index.html](index.html) 查看整理好的笔记展示页面。

## 其他数据收集方式

如果自动爬取遇到问题,你可以使用示例数据来体验系统:

```bash
npm run import:sample
```

这会生成示例笔记数据,让你先查看展示效果。

## 参考的开源项目

本项目参考了以下优秀的开源项目:

- **[MediaCrawler](https://github.com/NanmiCoder/MediaCrawler)** - 多平台媒体爬虫,支持小红书、抖音等
- **[xiaohongshu-mcp-nodejs](https://github.com/ToDieOrNot/xiaohongshu-mcp-nodejs)** - 基于MCP协议的小红书工具
- **[xhscrawl](https://github.com/submato/xhscrawl)** - 小红书数据采集工具

## 网页功能

### 标签切换
- **我的笔记**: 查看自己发布的笔记
- **我的收藏**: 查看收藏的笔记
- **我的点赞**: 查看点赞的笔记

### 搜索功能
- 支持搜索笔记标题和内容
- 支持搜索标签关键词

### 排序功能
- **最新优先**: 按时间倒序
- **最早优先**: 按时间正序
- **最受欢迎**: 按点赞数排序

### 详情查看
- 点击笔记卡片查看完整内容
- 查看所有图片
- 支持跳转到原文

## 配置说明

### 环境变量配置

你也可以使用环境变量配置:

```bash
# 复制配置模板
cp .env.example .env

# 编辑.env文件,填入你的信息
XHS_USER_ID=你的用户ID
XHS_COOKIE=你的Cookie
```

## 注意事项

1. **Cookie有效期**: Cookie可能会过期,如果爬取失败请重新获取
2. **请求频率**: 程序已内置延迟,避免请求过快被限制
3. **数据隐私**: 数据保存在本地,不会上传到任何服务器
4. **合法使用**: 仅供个人学习使用,请勿用于商业目的

## 技术栈

- **后端**: Node.js + Axios
- **前端**: HTML + CSS + JavaScript (原生)
- **数据存储**: JSON文件

## 常见问题

### Q: 爬取失败怎么办?
A: 检查以下几点:
1. 网络连接是否正常
2. Cookie是否过期
3. 用户ID是否正确

### Q: 如何更新数据?
A: 重新运行 `npm start` 即可更新数据

### Q: 可以导出数据吗?
A: 数据保存在 `data/` 目录下的JSON文件中,可以直接复制使用

## 开发计划

- [ ] 支持图片本地下载
- [ ] 添加数据导出功能(Markdown/Excel)
- [ ] 支持定时自动更新
- [ ] 添加笔记分类功能

## 许可证

MIT License

## 致谢

感谢使用小红书笔记收集器!
