import fs from 'fs';
import path from 'path';

/**
 * 合并所有OCR批次结果
 */

const ocrResultsDir = path.join(process.cwd(), 'data', 'ocr-results');
const notesFile = path.join(process.cwd(), 'data', 'notes.json');
const outputFile = path.join(process.cwd(), 'data', 'notes-with-ocr.json');

console.log('\n═══════════════════════════════════════');
console.log('📝 合并OCR结果');
console.log('═══════════════════════════════════════\n');

// 读取原始笔记数据
const notes = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));
console.log(`📚 原始笔记数: ${notes.length}`);

// 读取所有批次文件
const batchFiles = fs.readdirSync(ocrResultsDir)
    .filter(f => f.startsWith('batch-') && f.endsWith('.json'))
    .sort();

console.log(`📁 找到 ${batchFiles.length} 个批次文件\n`);

// 创建笔记ID到OCR结果的映射
const ocrMap = new Map();

batchFiles.forEach((file, index) => {
    const filePath = path.join(ocrResultsDir, file);
    const batch = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    batch.forEach(note => {
        if (note.imageTexts && note.imageTexts.length > 0) {
            ocrMap.set(note.url, note.imageTexts);
        }
    });

    console.log(`  ✓ 已加载: ${file} (${batch.length} 篇)`);
});

// 合并OCR结果到笔记数据
const notesWithOCR = notes.map(note => {
    const imageTexts = ocrMap.get(note.url);
    if (imageTexts) {
        return {
            ...note,
            imageTexts: imageTexts,
            ocrProcessed: true
        };
    }
    return {
        ...note,
        imageTexts: [],
        ocrProcessed: false
    };
});

// 统计
const processedCount = notesWithOCR.filter(n => n.ocrProcessed).length;
const totalImages = notesWithOCR.reduce((sum, n) => sum + (n.imageTexts?.length || 0), 0);
const totalChars = notesWithOCR.reduce((sum, n) => {
    if (n.imageTexts) {
        return sum + n.imageTexts.reduce((s, t) => s + (t.text?.length || 0), 0);
    }
    return sum;
}, 0);

// 保存合并结果
fs.writeFileSync(outputFile, JSON.stringify(notesWithOCR, null, 2), 'utf-8');

console.log('\n═══════════════════════════════════════');
console.log('✅ 合并完成!');
console.log('═══════════════════════════════════════\n');
console.log(`📊 统计信息:`);
console.log(`   - 总笔记数: ${notesWithOCR.length}`);
console.log(`   - 有OCR结果: ${processedCount} (${Math.round(processedCount/notesWithOCR.length*100)}%)`);
console.log(`   - 识别图片数: ${totalImages}`);
console.log(`   - 识别字符数: ${totalChars}\n`);
console.log(`📁 已保存到: ${outputFile}\n`);
