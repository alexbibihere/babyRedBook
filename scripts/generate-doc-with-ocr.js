import fs from 'fs';
import path from 'path';

/**
 * 生成包含OCR结果的完整文档
 */

const notesFile = path.join(process.cwd(), 'data', 'notes-with-ocr.json');
const docsDir = path.join(process.cwd(), 'docs');

if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

const notes = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));

// 过滤出有OCR结果的笔记
const notesWithOCR = notes.filter(n => n.ocrProcessed && n.imageTexts && n.imageTexts.length > 0);

console.log(`\n📝 生成完整文档...\n`);
console.log(`📚 总笔记数: ${notes.length}`);
console.log(`✅ 有OCR结果: ${notesWithOCR.length}\n`);

// 生成Markdown文档
let markdown = `# 我的小红书笔记完整内容合集

> 生成时间: ${new Date().toLocaleString('zh-CN')}
> 包含 ${notes.length} 篇笔记
> 其中 ${notesWithOCR.length} 篇包含图片OCR识别内容

---

## 目录

`;

// 添加目录
notes.forEach((note, i) => {
    const title = note.title || '无标题';
    markdown += `${i + 1}. [${title}](#${note.id})\n`;
});

markdown += `\n---\n\n`;

// 添加每篇笔记
notes.forEach((note, index) => {
    markdown += `## ${index + 1}. ${note.title || '无标题'}

**发布时间**: ${note.createTime || '未知'}
**点赞数**: ${note.likes || 0}
**原文链接**: ${note.url}

---

### 正文内容

${note.content || '无正文内容'}

`;

    // 如果有OCR识别的图片文字
    if (note.ocrProcessed && note.imageTexts && note.imageTexts.length > 0) {
        markdown += `### 图片文字识别(OCR)\n\n`;

        note.imageTexts.forEach((imgText, i) => {
            markdown += `#### 图片 ${i + 1}\n\n`;
            markdown += `${imgText.text || '无文字'}\n\n`;
            markdown += `*置信度: ${(imgText.confidence * 100).toFixed(1)}%*\n\n`;
        });
    }

    markdown += `---
`;
});

// 保存文档
const docFile = path.join(docsDir, '我的小红书笔记全集-含OCR.md');
fs.writeFileSync(docFile, markdown, 'utf-8');

console.log(`✅ 已生成: ${docFile}`);

// 生成纯OCR文字版本
let ocrOnly = `# 小红书笔记图片文字识别合集

> 仅包含通过OCR识别的图片文字内容
> 共 ${notesWithOCR.length} 篇笔记的图片文字

---

`;

notesWithOCR.forEach((note, index) => {
    ocrOnly += `## ${index + 1}. ${note.title || '无标题'}\n\n`;
    ocrOnly += `**来源**: ${note.url}\n\n`;

    note.imageTexts.forEach((imgText, i) => {
        ocrOnly += `### 图片 ${i + 1}\n\n${imgText.text}\n\n`;
    });

    ocrOnly += `---\n\n`;
});

const ocrDocFile = path.join(docsDir, '图片文字识别合集.md');
fs.writeFileSync(ocrDocFile, ocrOnly, 'utf-8');

console.log(`✅ 已生成: ${ocrDocFile}`);

// 统计信息
const totalImages = notesWithOCR.reduce((sum, n) => sum + n.imageTexts.length, 0);
const totalChars = notesWithOCR.reduce((sum, n) =>
    sum + n.imageTexts.reduce((s, t) => s + (t.text?.length || 0), 0), 0);

console.log(`\n═══════════════════════════════════════`);
console.log('✅ 文档生成完成!');
console.log('═══════════════════════════════════════\n');
console.log(`📊 统计:`);
console.log(`   - 总笔记数: ${notes.length}`);
console.log(`   - 有OCR的笔记: ${notesWithOCR.length}`);
console.log(`   - 识别图片数: ${totalImages}`);
console.log(`   - 识别字符数: ${totalChars}\n`);
console.log(`📁 文件位置: ${docsDir}\n`);
