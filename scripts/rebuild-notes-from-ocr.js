import fs from 'fs';
import path from 'path';

/**
 * 从OCR结果重建笔记内容
 * 使用OCR识别的图片文字作为笔记主要内容
 */

const notesFile = path.join(process.cwd(), 'data', 'notes-with-ocr.json');
const rebuiltFile = path.join(process.cwd(), 'data', 'notes-rebuilt.json');

const notes = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));

console.log('\n═══════════════════════════════════════');
console.log('🔨 从OCR重建笔记内容');
console.log('═══════════════════════════════════════\n');
console.log(`📚 原始笔记数: ${notes.length}\n`);

// 定义需要过滤的虚假内容关键词
const spamKeywords = [
    '《用户协议》',
    '《隐私政策》',
    '沪ICP备13030189号',
    '营业执照',
    '沪公网安备',
    '增值电信业务经营许可证',
    '网信算备',
    '广告屏蔽插件',
    '发现发布通知登录'
];

// 重建笔记内容
const rebuiltNotes = notes.map(note => {
    // 检查原始内容是否是垃圾内容
    const originalContent = note.content || '';
    const isSpam = spamKeywords.some(keyword => originalContent.includes(keyword));

    let newContent = '';

    if (isSpam) {
        // 如果是垃圾内容,尝试从OCR重建
        if (note.ocrProcessed && note.imageTexts && note.imageTexts.length > 0) {
            // 合并所有OCR识别的文字
            newContent = note.imageTexts
                .map(img => img.text)
                .filter(text => text && text.length > 0)
                .join('\n\n');
        } else if (note.images && note.images.length > 0) {
            // 有图片但没有OCR,添加占位符
            newContent = `[此笔记包含${note.images.length}张图片,内容需手动查看]`;
        } else {
            // 既无有效内容也无图片
            newContent = '[无内容]';
        }
    } else {
        // 原始内容有效,保留
        newContent = originalContent;

        // 如果有OCR内容,追加到后面
        if (note.ocrProcessed && note.imageTexts && note.imageTexts.length > 0) {
            const ocrContent = note.imageTexts
                .map(img => img.text)
                .filter(text => text && text.length > 0)
                .join('\n\n');

            if (ocrContent.length > 0) {
                newContent += '\n\n---\n\n### 图片识别内容:\n\n' + ocrContent;
            }
        }
    }

    return {
        ...note,
        content: newContent,
        originalContentWasSpam: isSpam,
        hasValidContent: newContent && newContent.length > 50
    };
});

// 过滤掉完全没有有效内容的笔记
const validNotes = rebuiltNotes.filter(note => note.hasValidContent);

// 统计
const spamCount = notes.filter(n => n.originalContentWasSpam).length;
const ocrOnlyCount = validNotes.filter(n => n.originalContentWasSpam && n.ocrProcessed).length;
const validWithOCR = validNotes.filter(n => n.ocrProcessed).length;

// 保存重建后的数据
fs.writeFileSync(rebuiltFile, JSON.stringify(validNotes, null, 2), 'utf-8');

console.log(`📊 统计:`);
console.log(`   - 原始笔记数: ${notes.length}`);
console.log(`   - 垃圾内容笔记: ${spamCount}`);
console.log(`   - 仅OCR有效: ${ocrOnlyCount}`);
console.log(`   - 最终有效笔记: ${validNotes.length}`);
console.log(`   - 有OCR识别: ${validWithOCR}\n`);

// 显示一些示例
console.log(`✅ 有效笔记示例:\n`);
validNotes.slice(0, 5).forEach((note, i) => {
    const contentPreview = note.content.substring(0, 150).replace(/\n/g, ' ');
    console.log(`${i + 1}. ${note.title || '无标题'}`);
    console.log(`   ${contentPreview}...\n`);
});

console.log(`\n📁 已保存到: ${rebuiltFile}\n`);
console.log(`═══════════════════════════════════════\n`);
