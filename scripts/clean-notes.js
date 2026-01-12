import fs from 'fs';
import path from 'path';

/**
 * 清理笔记数据
 * 过滤掉包含用户协议等虚假内容的笔记
 */

const notesFile = path.join(process.cwd(), 'data', 'notes-with-ocr.json');
const cleanedFile = path.join(process.cwd(), 'data', 'notes-cleaned.json');

const notes = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));

console.log('\n═══════════════════════════════════════');
console.log('🧹 清理笔记数据');
console.log('═══════════════════════════════════════\n');
console.log(`📚 原始笔记数: ${notes.length}\n`);

// 定义需要过滤的虚假内容关键词
const spamKeywords = [
    '《用户协议》',
    '《隐私政策》',
    '《儿童/青少年个人信息保护规则》',
    '沪ICP备13030189号',
    '营业执照',
    '沪公网安备',
    '增值电信业务经营许可证',
    '医疗器械网络交易服务第三方平台备案',
    '互联网药品信息服务资格证书',
    '违法不良信息举报电话',
    '上海市互联网举报中心',
    '网上有害信息举报专区',
    '自营经营者信息',
    '网络文化经营许可证',
    '个性化推荐算法',
    '网信算备',
    '广告屏蔽插件',
    '发现发布通知登录',
    '马上登录即可'
];

// 过滤函数
function isSpamContent(content) {
    if (!content || content.length < 50) {
        // 内容太短,可能是虚假内容
        return true;
    }

    // 检查是否包含垃圾内容关键词
    const hasSpamKeyword = spamKeywords.some(keyword => content.includes(keyword));

    // 检查是否主要是页脚信息(包含多个ICP相关)
    const icpCount = (content.match(/ICP|营业执照|许可证|备案/g) || []).length;
    const isFooter = icpCount >= 2;

    return hasSpamKeyword || isFooter;
}

// 清理笔记
const cleanedNotes = notes.filter(note => {
    const content = note.content || '';
    const isSpam = isSpamContent(content);

    if (isSpam) {
        console.log(`❌ 过滤: ${note.title || '无标题'} (包含虚假内容)`);
    }

    return !isSpam;
});

// 统计
const removedCount = notes.length - cleanedNotes.length;
const validWithOCR = cleanedNotes.filter(n => n.ocrProcessed).length;
const totalImages = cleanedNotes.reduce((sum, n) => sum + (n.imageTexts?.length || 0), 0);

// 保存清理后的数据
fs.writeFileSync(cleanedFile, JSON.stringify(cleanedNotes, null, 2), 'utf-8');

console.log(`\n═══════════════════════════════════════`);
console.log('✅ 清理完成!');
console.log('═══════════════════════════════════════\n');
console.log(`📊 统计:`);
console.log(`   - 原始笔记数: ${notes.length}`);
console.log(`   - 过滤笔记数: ${removedCount}`);
console.log(`   - 有效笔记数: ${cleanedNotes.length}`);
console.log(`   - 有OCR的笔记: ${validWithOCR}`);
console.log(`   - OCR图片数: ${totalImages}\n`);
console.log(`📁 已保存到: ${cleanedFile}\n`);

// 显示一些有效笔记的示例
const validExamples = cleanedNotes.slice(0, 5);
console.log(`✅ 有效笔记示例:\n`);
validExamples.forEach((note, i) => {
    const preview = (note.content || '').substring(0, 100);
    console.log(`${i + 1}. ${note.title || '无标题'}`);
    console.log(`   内容: ${preview}...\n`);
});
