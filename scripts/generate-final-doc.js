import fs from 'fs';
import path from 'path';

const notesFile = path.join(process.cwd(), 'data', 'notes-rebuilt.json');
const outputFile = path.join(process.cwd(), 'docs', '我的小红书笔记全集-最终版.md');

const notes = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));

console.log('\n═══════════════════════════════════════');
console.log('📝 生成最终文档');
console.log('═══════════════════════════════════════\n');
console.log(`📚 有效笔记数: ${notes.length}\n`);

// 生成 Markdown
let markdown = `# 我的小红书笔记全集

> 生成时间: ${new Date().toLocaleString('zh-CN')}
>
> 笔记数量: ${notes.length} 篇
>
> 数据来源: OCR 识别的图片文字

---

## 📋 目录

`;

// 生成目录
notes.forEach((note, index) => {
    const title = note.title || '无标题';
    markdown += `${index + 1}. [${title}](#${index + 1})\n`;
});

markdown += `\n---\n\n`;

// 生成每篇笔记的详细内容
notes.forEach((note, index) => {
    markdown += `## ${index + 1}. ${note.title || '无标题'}\n\n`;
    markdown += `**📝 发布时间**: ${note.createTime || '未知'}\n\n`;
    markdown += `**❤️ 点赞数**: ${note.likes || 0}\n\n`;
    markdown += `**✍️ 作者**: ${note.author || '未知'}\n\n`;
    markdown += `**🔗 链接**: ${note.url}\n\n`;

    // 笔记内容
    if (note.content && note.content.length > 0) {
        markdown += `### 📄 内容\n\n`;
        markdown += `${note.content}\n\n`;
    }

    // OCR 识别的图片文字
    if (note.imageTexts && note.imageTexts.length > 0) {
        markdown += `### 🖼️ 图片识别内容 (${note.imageTexts.length} 张)\n\n`;
        note.imageTexts.forEach((img, i) => {
            if (img.text && img.text.length > 0) {
                markdown += `#### 图片 ${i + 1}\n\n`;
                markdown += `${img.text}\n\n`;
                if (img.confidence) {
                    markdown += `*置信度: ${(img.confidence * 100).toFixed(1)}%*\n\n`;
                }
            }
        });
    }

    // 图片列表
    if (note.images && note.images.length > 0) {
        markdown += `### 📷 图片 (${note.images.length} 张)\n\n`;
        note.images.forEach((imgUrl, i) => {
            markdown += `${i + 1}. ![${note.title} 图片${i + 1}](${imgUrl})\n\n`;
        });
    }

    markdown += `---\n\n`;
});

// 添加统计信息
markdown += `## 📊 统计信息\n\n`;
markdown += `- **总笔记数**: ${notes.length} 篇\n`;
markdown += `- **总点赞数**: ${notes.reduce((sum, n) => sum + (n.likes || 0), 0)}\n`;
markdown += `- **有OCR识别**: ${notes.filter(n => n.ocrProcessed).length} 篇\n`;
markdown += `- **总图片数**: ${notes.reduce((sum, n) => sum + (n.imageTexts?.length || 0), 0)} 张\n`;

markdown += `\n---\n\n`;
markdown += `*本文档由自动生成工具创建*\n`;

// 保存文件
fs.writeFileSync(outputFile, markdown, 'utf-8');

console.log('✅ 文档生成完成!');
console.log(`📁 保存位置: ${outputFile}\n`);

// 显示前3篇笔记的标题
console.log('📚 笔记列表:');
notes.slice(0, Math.min(10, notes.length)).forEach((note, i) => {
    console.log(`   ${i + 1}. ${note.title || '无标题'}`);
});
if (notes.length > 10) {
    console.log(`   ... 还有 ${notes.length - 10} 篇`);
}
console.log('');
