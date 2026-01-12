import fs from 'fs';
import path from 'path';

/**
 * 笔记内容提取辅助工具
 * 帮助生成浏览器控制台脚本并管理提取过程
 */

class ExtractHelper {
    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.notesFile = path.join(this.dataDir, 'notes.json');
    }

    loadNotes() {
        if (!fs.existsSync(this.notesFile)) {
            console.error('❌ data/notes.json 不存在!');
            console.log('请先运行收集脚本获取笔记数据');
            return null;
        }
        return JSON.parse(fs.readFileSync(this.notesFile, 'utf-8'));
    }

    /**
     * 生成浏览器控制台脚本
     * @param {number} start 起始索引
     * @param {number} end 结束索引
     */
    generateBrowserScript(start = 0, end = 10) {
        const notes = this.loadNotes();
        if (!notes) return;

        const batchNotes = notes.slice(start, end);

        console.log('\n═══════════════════════════════════════');
        console.log('📋 浏览器提取脚本生成器');
        console.log('═══════════════════════════════════════\n');
        console.log(`📝 批次: 第 ${Math.floor(start/10) + 1} 批`);
        console.log(`📊 范围: 索引 ${start}-${end-1} (共 ${batchNotes.length} 篇)`);
        console.log(`📚 总笔记数: ${notes.length} 篇\n`);
        console.log('─────────────────────────────────────');
        console.log('使用步骤:');
        console.log('─────────────────────────────────────');
        console.log('1. 复制下面的脚本内容');
        console.log('2. 打开 https://www.xiaohongshu.com (确保已登录)');
        console.log('3. 按F12打开控制台');
        console.log('4. 粘贴脚本并运行');
        console.log('5. 等待提取完成');
        console.log('6. 复制输出的JSON数据');
        console.log('7. 保存为 data/extracted-batch-' + start + '.json\n');
        console.log('═══════════════════════════════════════\n');

        // 生成浏览器脚本
        const browserScript = `
// 小红书笔记完整内容提取脚本 - 批次 ${start}-${end-1}
// 自动生成于: ${new Date().toLocaleString('zh-CN')}

(async function() {
    const notesToExtract = ${JSON.stringify(batchNotes, null, 2)};

    console.log('\\n📝 开始提取 ' + notesToExtract.length + ' 篇笔记...\\n');

    const results = [];
    let successCount = 0;

    for (let i = 0; i < notesToExtract.length; i++) {
        const note = notesToExtract[i];
        const index = i + 1;

        console.log('[' + index + '/' + notesToExtract.length + '] ' + (note.title || '无标题'));

        try {
            // 使用fetch获取页面
            const response = await fetch(note.url);
            const html = await response.text();

            // 解析HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 提取正文 - 尝试多种选择器
            const contentSelectors = [
                '[class*="note-text"]',
                '[class*="desc-text"]',
                '[class*="content-text"]',
                'span[class*="text"]',
                'div[class*="desc"]',
                'article',
                '[class*="rich-text"]',
                '[class*="note-content"]'
            ];

            let content = '';
            for (const selector of contentSelectors) {
                const elements = doc.querySelectorAll(selector);
                const texts = Array.from(elements)
                    .map(el => el.textContent?.trim())
                    .filter(text => text && text.length > 20)
                    .join('\\n\\n');

                if (texts.length > 50) {
                    content = texts;
                    break;
                }
            }

            // 提取图片
            const images = Array.from(doc.querySelectorAll('img'))
                .map(img => img.src || img.getAttribute('data-src'))
                .filter(src => src && (src.includes('sns-webpic') || src.includes('xhscdn')))
                .slice(0, 9);

            // 更新笔记
            const updatedNote = {
                ...note,
                content: content || note.content || '',
                images: images.length > 0 ? images : (note.images || []),
                extractedAt: new Date().toISOString()
            };

            results.push(updatedNote);

            if (content && content.length > 50) {
                successCount++;
                console.log('  ✓ 成功 (' + content.length + ' 字符)');
            } else {
                console.log('  ⚠️ 内容为空或过短');
            }

        } catch (error) {
            console.log('  ❌ 失败: ' + error.message);
            results.push(note);
        }

        // 延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    }

    // 输出结果
    console.log('\\n═══════════════════════════════════════');
    console.log('✅ 提取完成!');
    console.log('═══════════════════════════════════════');
    console.log('成功: ' + successCount + '/' + notesToExtract.length);
    console.log('\\n📋 复制下面的JSON数据,保存为 data/extracted-batch-${start}.json:\\n');
    console.log('─────────────────────────────────────');
    console.log(JSON.stringify(results, null, 2));
    console.log('─────────────────────────────────────\\n');

})();
`;

        console.log(browserScript);
        console.log('\n═══════════════════════════════════════\n');
    }

    /**
     * 合并所有批次
     */
    mergeBatches() {
        const dataDir = this.dataDir;
        const batchFiles = fs.readdirSync(dataDir)
            .filter(f => f.startsWith('extracted-batch-') && f.endsWith('.json'))
            .sort();

        if (batchFiles.length === 0) {
            console.log('❌ 没有找到提取的批次文件!');
            console.log('请先运行浏览器脚本提取内容');
            return;
        }

        console.log(`\n📁 找到 ${batchFiles.length} 个批次文件\n`);

        const allNotes = [];
        for (const file of batchFiles) {
            const filePath = path.join(dataDir, file);
            const batch = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            allNotes.push(...batch);
            console.log(`✓ 已合并: ${file} (${batch.length} 篇)`);
        }

        // 备份原始文件
        const backupFile = this.notesFile + '.backup';
        fs.copyFileSync(this.notesFile, backupFile);
        console.log(`\n✓ 已备份原始文件到: notes.json.backup`);

        // 保存合并后的数据
        fs.writeFileSync(this.notesFile, JSON.stringify(allNotes, null, 2), 'utf-8');

        console.log(`\n✅ 合并完成!`);
        console.log(`📊 总笔记数: ${allNotes.length}`);
        console.log(`📁 已保存到: data/notes.json\n`);

        // 清理批次文件
        console.log('是否删除批次文件? (data/extracted-batch-*.json)');
        console.log('运行以下命令删除:');
        console.log('  Windows: del data\\extracted-batch-*.json');
        console.log('  Mac/Linux: rm data/extracted-batch-*.json\n');
    }

    /**
     * 显示提取状态
     */
    showStatus() {
        const notes = this.loadNotes();
        if (!notes) return;

        const extractedCount = notes.filter(n => n.content && n.content.length > 100).length;

        console.log('\n═══════════════════════════════════════');
        console.log('📊 笔记提取状态');
        console.log('═══════════════════════════════════════\n');
        console.log(`📚 总笔记数: ${notes.length}`);
        console.log(`✅ 已提取内容: ${extractedCount} (${Math.round(extractedCount/notes.length*100)}%)`);
        console.log(`⏳ 待提取: ${notes.length - extractedCount}\n`);

        if (extractedCount < notes.length) {
            console.log('下一步操作:');
            const nextIndex = extractedCount;
            const batchSize = 10;
            const end = Math.min(nextIndex + batchSize, notes.length);

            console.log(`  生成下个批次脚本 (索引 ${nextIndex}-${end-1}):`);
            console.log(`  node crawler/extract-helper.js --batch ${nextIndex} ${end}\n`);
        } else {
            console.log('🎉 所有笔记已提取完成!\n');
            console.log('生成完整文档:');
            console.log('  npm run doc:full\n');
        }

        console.log('═══════════════════════════════════════\n');
    }
}

// CLI
const args = process.argv.slice(2);
const helper = new ExtractHelper();

if (args.length === 0) {
    // 默认显示状态
    helper.showStatus();
} else if (args[0] === '--batch') {
    // 生成指定批次
    const start = parseInt(args[1]) || 0;
    const end = parseInt(args[2]) || start + 10;
    helper.generateBrowserScript(start, end);
} else if (args[0] === '--merge') {
    // 合并批次
    helper.mergeBatches();
} else if (args[0] === '--status') {
    // 显示状态
    helper.showStatus();
} else {
    console.log('用法:');
    console.log('  node crawler/extract-helper.js              # 查看状态');
    console.log('  node crawler/extract-helper.js --batch 0 10  # 生成批次脚本(索引0-9)');
    console.log('  node crawler/extract-helper.js --merge       # 合并所有批次');
    console.log('  node crawler/extract-helper.js --status      # 查看提取状态');
}

export default ExtractHelper;
