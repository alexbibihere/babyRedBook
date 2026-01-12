import fs from 'fs';
import path from 'path';

const notesFile = path.join(process.cwd(), 'data', 'notes.json');
const imagesFile = path.join(process.cwd(), 'data', 'notes-with-images.json');
const outputFile = path.join(process.cwd(), 'data', 'notes-with-images-merged.json');

console.log('\n═══════════════════════════════════════');
console.log('🔗 合并数据');
console.log('═══════════════════════════════════════\n');

// 读取数据
const notes = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));
const notesWithImages = JSON.parse(fs.readFileSync(imagesFile, 'utf-8'));

console.log(`📚 原始笔记数: ${notes.length}`);
console.log(`📷 图片数据: ${notesWithImages.length}\n`);

// 创建 URL 到图片的映射
const urlToImages = {};
notesWithImages.forEach(note => {
    if (note.images && note.images.length > 0) {
        // 提取 URL 的基础部分(去掉查询参数)
        const baseUrl = note.url.split('?')[0];
        urlToImages[baseUrl] = note.images;
    }
});

// 合并数据
const merged = notes.map(note => {
    const baseUrl = note.url.split('?')[0];
    const images = urlToImages[baseUrl] || [];

    return {
        ...note,
        images: images,
        imageCount: images.length
    };
});

// 保存合并后的数据
fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2), 'utf-8');

const totalImages = merged.reduce((sum, n) => sum + (n.images?.length || 0), 0);

console.log('✅ 合并完成!');
console.log(`📊 统计:`);
console.log(`   - 总笔记数: ${merged.length}`);
console.log(`   - 有图片的笔记: ${merged.filter(n => n.images && n.images.length > 0).length}`);
console.log(`   - 总图片数: ${totalImages}`);
console.log(`\n📁 已保存到: ${outputFile}\n`);
