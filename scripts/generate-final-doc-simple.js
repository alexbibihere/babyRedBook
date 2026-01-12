import fs from 'fs';
import path from 'path';

const notesFile = path.join(process.cwd(), 'data', 'notes.json');
const outputFile = path.join(process.cwd(), 'docs', '我的小红书笔记-最终版.md');

const notes = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));

console.log('\n═══════════════════════════════════════');
console.log('📝 生成最终文档');
console.log('═══════════════════════════════════════\n');
console.log(`📚 笔记数量: ${notes.length}\n`);

// 生成 Markdown
let markdown = `# 我的小红书笔记全集

> 生成时间: ${new Date().toLocaleString('zh-CN')}
>
> 笔记数量: ${notes.length} 篇
>
> 数据来源: 小红书手动提取

---

## 📋 目录

`;

// 生成目录
notes.forEach((note, index) => {
    const title = note.title || '无标题';
    markdown += `${index + 1}. [${title}](#${index + 1})\n`;
});

markdown += `\n---\n\n`;

// 统计信息
const totalLikes = notes.reduce((sum, n) => sum + parseInt(n.likes || 0), 0);
const authors = [...new Set(notes.map(n => n.author).filter(Boolean))];

// 生成每篇笔记的详细内容
notes.forEach((note, index) => {
    markdown += `## ${index + 1}. ${note.title || '无标题'}\n\n`;

    if (note.author) {
        markdown += `**✍️ 作者**: ${note.author}\n\n`;
    }

    if (note.likes) {
        markdown += `**❤️ 点赞数**: ${note.likes}\n\n`;
    }

    if (note.url) {
        markdown += `**🔗 链接**: ${note.url}\n\n`;
    }

    // 笔记内容
    if (note.content && note.content.length > 0) {
        markdown += `### 📄 内容\n\n`;
        markdown += `${note.content}\n\n`;
    }

    // 图片展示
    if (note.images && note.images.length > 0) {
        markdown += `### 📷 图片 (${note.images.length} 张)\n\n`;
        note.images.forEach((imgUrl, i) => {
            markdown += `![${note.title} - 图片${i + 1}](${imgUrl})\n\n`;
        });
    }

    markdown += `---\n\n`;
});

// 添加统计信息
markdown += `## 📊 统计信息\n\n`;
markdown += `- **总笔记数**: ${notes.length} 篇\n`;
markdown += `- **总点赞数**: ${totalLikes}\n`;
markdown += `- **作者数**: ${authors.length} 位\n`;
markdown += `\n### 👨‍👩‍👧‍👦 作者列表\n\n`;
authors.forEach((author, i) => {
    markdown += `${i + 1}. ${author}\n`;
});

markdown += `\n---\n\n`;
markdown += `*本文档由自动生成工具创建*\n`;
markdown += `\n*生成时间: ${new Date().toLocaleString('zh-CN')}*\n`;

// 保存文件
fs.writeFileSync(outputFile, markdown, 'utf-8');

console.log('✅ 文档生成完成!');
console.log(`📁 保存位置: ${outputFile}\n`);

// 显示统计
console.log('📊 统计信息:');
console.log(`   - 总笔记数: ${notes.length}`);
console.log(`   - 总点赞数: ${totalLikes}`);
console.log(`   - 作者数: ${authors.length}\n`);

// 显示前5篇笔记
console.log('📚 笔记列表 (前5篇):');
notes.slice(0, 5).forEach((note, i) => {
    const contentPreview = note.content ? note.content.substring(0, 50).replace(/\n/g, ' ') : '无内容';
    console.log(`   ${i + 1}. ${note.title}`);
    console.log(`      ${contentPreview}...`);
});
if (notes.length > 5) {
    console.log(`   ... 还有 ${notes.length - 5} 篇`);
}
console.log('');
