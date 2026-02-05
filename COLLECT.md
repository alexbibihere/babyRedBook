# 小红书数据收集指南

由于小红书的反爬虫机制,我们提供多种数据收集方式:

## 方法一: 浏览器控制台收集 (推荐)

这是最可靠的方法,直接在浏览器中收集数据:

### 步骤:

1. **打开小红书网站**
   - 访问 https://www.xiaohongshu.com
   - 登录你的账号

2. **访问你的个人主页**
   - URL: https://www.xiaohongshu.com/user/profile/7410657861
   - 或者点击"我的"头像进入主页

3. **打开浏览器控制台**
   - 按 F12 (Windows) 或 Cmd+Option+I (Mac)
   - 切换到"控制台"(Console)标签

4. **运行收集脚本**

运行以下命令获取脚本:
```bash
npm run manual
```

将输出的脚本复制到浏览器控制台,按回车运行。

5. **等待收集完成**
   - 脚本会自动滚动页面并收集笔记
   - 完成后会输出JSON数据

6. **保存数据**
   - 复制输出的JSON数据
   - 创建 `data/notes.json` 文件
   - 粘贴数据并保存

### 收集脚本示例:

```javascript
(function() {
    const notes = [];
    let scrollCount = 0;
    const maxScrolls = 20;

    async function collectNotes() {
        console.log('🎨 开始收集笔记...');

        async function scrollAndCollect() {
            const noteLinks = document.querySelectorAll('a[href*="/explore/"]');
            const currentIds = new Set(notes.map(n => n.id));

            noteLinks.forEach(link => {
                const href = link.href;
                const id = href.split('/explore/').pop().split('?')[0];

                if (id && !currentIds.has(id)) {
                    const container = link.closest('[class*="note"], [class*="card"]') || link;
                    const img = container.querySelector('img');
                    const titleEl = container.querySelector('[class*="title"], h1, h2, h3');
                    const likesEl = container.querySelector('[class*="like"], [class*="count"]');

                    notes.push({
                        id: id,
                        title: titleEl?.textContent?.trim().substring(0, 100) || '无标题',
                        cover: img?.src || img?.getAttribute('data-src') || '',
                        url: href,
                        likes: parseInt(likesEl?.textContent?.trim().replace(/[^0-9]/g, '') || '0') || 0,
                        createTime: new Date().toISOString().split('T')[0]
                    });
                }
            });

            console.log(`已收集 ${notes.length} 条笔记`);

            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 2000));

            scrollCount++;
            if (scrollCount < maxScrolls) {
                await scrollAndCollect();
            }
        }

        await scrollAndCollect();

        console.log('\\n✅ 收集完成！共 ' + notes.length + ' 条笔记');
        console.log('\\n复制以下数据:');
        console.log(JSON.stringify(notes, null, 2));

        return notes;
    }

    collectNotes();
})();
```

## 方法二: 手动添加数据

如果自动收集不可用,你可以手动添加笔记数据:

### 1. 创建数据文件

在 `data/` 目录下创建 `notes.json`:

```json
[
  {
    "id": "笔记ID",
    "title": "笔记标题",
    "content": "笔记内容",
    "description": "笔记描述",
    "images": ["图片URL1", "图片URL2"],
    "cover": "封面图片URL",
    "tags": ["标签1", "标签2"],
    "url": "https://www.xiaohongshu.com/explore/笔记ID",
    "createTime": "2024-01-11",
    "likes": 100,
    "collects": 50,
    "comments": 20
  }
]
```

### 2. 从小红书复制数据

1. 打开你的笔记
2. 复制标题、内容等信息
3. 右键图片→"复制图片地址"
4. 按照上述格式添加到 `notes.json`

## 方法三: 使用示例数据

如果想先查看展示效果,可以使用示例数据:

```bash
npm run import:sample
```

这会生成一些示例笔记数据。

## 查看结果

数据收集完成后,在浏览器中打开 `index.html` 查看笔记展示。

## 数据格式说明

笔记数据包含以下字段:

| 字段 | 类型 | 说明 | 必需 |
|------|------|------|------|
| id | string | 笔记唯一ID | 是 |
| title | string | 笔记标题 | 是 |
| content | string | 笔记完整内容 | 否 |
| description | string | 笔记描述/摘要 | 否 |
| images | array | 所有图片URL | 否 |
| cover | string | 封面图片URL | 否 |
| tags | array | 标签列表 | 否 |
| url | string | 笔记链接 | 是 |
| createTime | string | 创建时间 | 否 |
| likes | number | 点赞数 | 否 |
| collects | number | 收藏数 | 否 |
| comments | number | 评论数 | 否 |

## 常见问题

### Q: 为什么自动爬取不可用?
A: 小红书有严格的反爬虫机制,包括:
- 需要登录状态
- 复杂的签名算法
- 设备指纹检测
- 频率限制

因此最可靠的方式是手动在浏览器中收集数据。

### Q: 如何批量收集?
A: 使用浏览器控制台脚本可以快速收集大量笔记,通常几分钟内可以收集几十条。

### Q: Cookie在哪里找?
A: 如果需要Cookie:
1. 按F12打开开发者工具
2. 切换到"网络"(Network)标签
3. 刷新页面
4. 点击任意请求
5. 在"请求头"(Request Headers)中找到Cookie

### Q: 数据会丢失吗?
A: 不会。所有数据保存在本地 `data/` 目录,你可以随时备份。
