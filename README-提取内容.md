# 🎯 快速提取小红书笔记完整内容

## 📌 方法一: 使用浏览器控制台脚本(推荐)

### 步骤:

1. **打开小红书网页**
   - 访问 https://www.xiaohongshu.com
   - 确保已登录你的账号

2. **打开任意一篇你的笔记**
   - 点击进入你想提取内容的笔记页面

3. **打开控制台**
   - 按 `F12` 键
   - 切换到 "Console(控制台)" 标签

4. **复制并运行脚本**

复制下面的代码到控制台,按回车:

```javascript
(async function() {
    console.log('📝 开始提取笔记内容...\n');

    setTimeout(() => {
        const titleEl = document.querySelector('[class*="title"], h1, h2');
        const title = titleEl ? titleEl.innerText.trim() : '未找到';

        const contentSelectors = [
            '[class*="note-text"]',
            '[class*="desc-text"]',
            '[class*="content-text"]',
            'section[class*="note"] div[class*="text"]',
            'article[class*="note"]',
            'div[class*="rich-text"]'
        ];

        let content = '';
        for (const selector of contentSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                const texts = Array.from(elements).map(el => el.innerText.trim())
                    .filter(t => t && t.length > 20).join('\n\n');
                if (texts.length > content.length) content = texts;
            }
        }

        console.log('═════════════════════════════');
        console.log('标题:', title);
        console.log('URL:', window.location.href);
        console.log('\n内容:\n', content);
        console.log('\n═════════════════════════════');
    }, 2000);
})();
```

5. **查看结果**
   - 脚本会在控制台输出标题、URL和完整内容
   - 复制输出的内容保存即可

---

## 📌 方法二: 使用提取工具页面

1. 在浏览器中打开项目中的 `extractor.html` 文件
2. 页面中有详细的使用说明和提取脚本
3. 可以保存提取的内容到本地

---

## 📌 方法三: 批量提取(适合多篇笔记)

如果你有多篇笔记需要提取,可以使用以下步骤:

### 1. 生成笔记列表

在项目目录运行:
```bash
node -e "const fs=require('fs'); console.log(JSON.stringify(JSON.parse(fs.readFileSync('data/notes.json')),null,2))"
```

复制输出的JSON数据。

### 2. 使用控制台脚本批量提取

打开你的第一篇笔记,按F12打开控制台,粘贴以下脚本:

```javascript
// 批量提取脚本 - 需要手动切换页面
let notesToExtract = [
    // 这里粘贴你的笔记数据
];

let currentBatch = [];
let batchIndex = 0;

function extractCurrentPage() {
    const titleEl = document.querySelector('[class*="title"], h1, h2');
    const title = titleEl ? titleEl.innerText.trim() : '';

    const contentSelectors = [
        '[class*="note-text"]',
        '[class*="desc-text"]',
        '[class*="content-text"]',
        'section[class*="note"] div[class*="text"]'
    ];

    let content = '';
    for (const selector of contentSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            const texts = Array.from(elements).map(el => el.innerText.trim())
                .filter(t => t && t.length > 20).join('\n\n');
            if (texts.length > content.length) content = texts;
        }
    }

    currentBatch.push({
        url: window.location.href,
        title: title,
        content: content,
        extractedAt: new Date().toISOString()
    });

    console.log(`✓ 已提取 ${currentBatch.length} 篇`);
    console.log(JSON.stringify(currentBatch[currentBatch.length - 1], null, 2));

    if (currentBatch.length >= 5) {
        console.log('\n📋 本批次JSON数据:');
        console.log(JSON.stringify(currentBatch, null, 2));
    }
}

// 运行提取
extractCurrentPage();
```

### 3. 重复操作

- 每访问一篇笔记,就在控制台运行一次 `extractCurrentPage()`
- 提取5篇后,会输出完整的JSON数据
- 复制并保存到 `data/extracted-batch-X.json`

### 4. 合并数据

提取完成后运行:
```bash
npm run extract:merge
```

---

## 💡 提示

1. **内容质量**: 已登录状态下提取的内容质量最好
2. **批量处理**: 建议每次提取5-10篇,避免浏览器卡顿
3. **数据备份**: 提取的数据会自动备份到 `notes.json.backup`
4. **手动保存**: 如果脚本无法提取,可以手动复制页面文本

---

## 🆘 常见问题

### Q: 提取的内容为空或很短?
A: 可能的原因:
- 页面还未加载完成,等待几秒后再试
- 当前页面不是笔记详情页
- 笔记内容主要是图片,文字较少

### Q: 如何批量提取所有笔记?
A: 可以使用方法三,每次提取5-10篇,分批处理

### Q: 提取的内容需要保存到哪里?
A: 保存到 `data/extracted-batch-X.json`,然后运行 `npm run extract:merge` 合并

---

## 📊 查看已收集的笔记

运行以下命令查看统计:
```bash
npm run extract:status
```

启动Web服务器查看:
```bash
npm run serve
```
然后访问 http://localhost:8080
