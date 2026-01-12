import fs from 'fs';
import path from 'path';

const inputFile = path.join(process.cwd(), 'data', 'notes-with-images-merged.json');
const outputFile = path.join(process.cwd(), 'data', 'notes-cleaned.json');

console.log('\n═══════════════════════════════════════');
console.log('🧹 清理图片数据');
console.log('═══════════════════════════════════════\n');

const notes = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

console.log(`📚 处理笔记数: ${notes.length}\n`);

let totalBefore = 0;
let totalAfter = 0;

// 清理每篇笔记的图片
const cleaned = notes.map(note => {
    if (!note.images || note.images.length === 0) {
        return note;
    }

    const beforeCount = note.images.length;

    // 过滤掉:
    // 1. 头像 (sns-avatar)
    // 2. 非笔记图片
    const cleanImages = note.images.filter(img => {
        // 排除头像
        if (img.includes('/avatar/')) {
            return false;
        }

        // 排除用户头像
        if (img.includes('sns-avatar')) {
            return false;
        }

        // 只保留笔记内容图片 (notes_pre_post 或包含图片编号的)
        // 小红书笔记图片通常包含这些特征
        if (img.includes('notes_pre_post') ||
            img.includes('!nd_dft_wlteh') ||
            img.includes('!nc_n_webp')) {
            return true;
        }

        return false;
    });

    totalBefore += beforeCount;
    totalAfter += cleanImages.length;

    console.log(`笔记: ${note.title}`);
    console.log(`  清理前: ${beforeCount} 张 → 清理后: ${cleanImages.length} 张`);

    return {
        ...note,
        images: cleanImages,
        imageCount: cleanImages.length
    };
});

// 保存清理后的数据
fs.writeFileSync(outputFile, JSON.stringify(cleaned, null, 2), 'utf-8');

console.log('\n═══════════════════════════════════════');
console.log('✅ 清理完成!');
console.log('═══════════════════════════════════════\n');
console.log(`📊 统计:`);
console.log(`   - 清理前总图片: ${totalBefore}`);
console.log(`   - 清理后总图片: ${totalAfter}`);
console.log(`   - 过滤掉: ${totalBefore - totalAfter} 张`);
console.log(`\n📁 已保存到: ${outputFile}\n`);
