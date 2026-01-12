import fs from 'fs';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

/**
 * 批量OCR处理脚本
 * 处理所有笔记中的图片
 */

class BatchOCRProcessor {
    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.notesFile = path.join(this.dataDir, 'notes.json');
        this.outputDir = path.join(this.dataDir, 'ocr-results');
        this.imageDir = path.join(this.dataDir, 'images');

        // 确保目录存在
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        if (!fs.existsSync(this.imageDir)) {
            fs.mkdirSync(this.imageDir, { recursive: true });
        }
    }

    // 下载图片
    async downloadImage(url, filename) {
        const filepath = path.join(this.imageDir, filename);

        // 如果已存在,跳过
        if (fs.existsSync(filepath)) {
            return filepath;
        }

        try {
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream',
                timeout: 30000
            });

            const writer = fs.createWriteStream(filepath);

            return new Promise((resolve, reject) => {
                response.data.pipe(writer);
                writer.on('finish', () => resolve(filepath));
                writer.on('error', reject);
            });
        } catch (error) {
            console.log(`  ❌ 下载失败: ${error.message}`);
            return null;
        }
    }

    // 识别单张图片
    async processImage(imagePath) {
        try {
            const { stdout } = await execAsync(`python batch_ocr.py "${imagePath}"`);
            const result = JSON.parse(stdout);
            return result;
        } catch (error) {
            console.log(`  ❌ 识别失败: ${error.message}`);
            return null;
        }
    }

    // 处理单篇笔记
    async processNote(note, index) {
        console.log(`\n[${index + 1}] ${note.title || '无标题'}`);
        console.log(`  URL: ${note.url}`);

        if (!note.images || note.images.length === 0) {
            console.log('  ⚠️  无图片');
            return { ...note, imageTexts: [] };
        }

        const imageTexts = [];

        for (let i = 0; i < note.images.length; i++) {
            const imageUrl = note.images[i];
            const filename = `${note.id}_${i}.jpg`;
            const imagePath = path.join(this.imageDir, filename);

            console.log(`  [${i + 1}/${note.images.length}] 下载并识别图片...`);

            // 下载图片
            const downloaded = await this.downloadImage(imageUrl, filename);
            if (!downloaded) {
                continue;
            }

            // OCR识别
            const result = await this.processImage(downloaded);
            if (result && result.full_text) {
                imageTexts.push({
                    index: i,
                    url: imageUrl,
                    text: result.full_text,
                    confidence: result.texts?.[0]?.confidence || 0
                });
                console.log(`    ✓ 识别成功 (${result.full_text.length} 字符)`);
            }
        }

        return {
            ...note,
            imageTexts: imageTexts
        };
    }

    // 批量处理
    async processAll(notes, start = 0, end = null) {
        console.log('\n═══════════════════════════════════════');
        console.log('🚀 批量OCR处理');
        console.log('═══════════════════════════════════════\n');
        console.log(`📚 总笔记数: ${notes.length}`);
        console.log(`📝 处理范围: ${start} - ${end || notes.length - 1}`);
        console.log(`🖼️  图片目录: ${this.imageDir}`);
        console.log(`📁 结果目录: ${this.outputDir}\n`);

        const endIndex = end || notes.length;
        const batch = notes.slice(start, endIndex);

        console.log(`📊 本批处理: ${batch.length} 篇笔记\n`);

        const results = [];

        for (let i = 0; i < batch.length; i++) {
            const note = batch[i];
            const processed = await this.processNote(note, start + i);
            results.push(processed);

            // 每5篇保存一次进度
            if ((i + 1) % 5 === 0) {
                const progressFile = path.join(this.outputDir, `progress-${start + i + 1}.json`);
                fs.writeFileSync(progressFile, JSON.stringify(results, null, 2), 'utf-8');
                console.log(`\n💾 进度已保存: ${start + i + 1}/${notes.length}\n`);
            }
        }

        // 保存最终结果
        const outputFile = path.join(this.outputDir, `batch-${start}-${endIndex - 1}.json`);
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');

        console.log('\n═══════════════════════════════════════');
        console.log('✅ 批量处理完成!');
        console.log('═══════════════════════════════════════\n');
        console.log(`📁 结果已保存: ${outputFile}`);
        console.log(`📊 处理笔记数: ${results.length}\n`);

        return results;
    }

    // 统计信息
    showStats(notes) {
        let totalImages = 0;
        let totalChars = 0;

        notes.forEach(note => {
            if (note.imageTexts) {
                totalImages += note.imageTexts.length;
                totalChars += note.imageTexts.reduce((sum, t) => sum + t.text.length, 0);
            }
        });

        console.log('📊 统计信息:');
        console.log(`   - 笔记数: ${notes.length}`);
        console.log(`   - 图片总数: ${totalImages}`);
        console.log(`   - 识别字符数: ${totalChars}\n`);
    }
}

// CLI
const args = process.argv.slice(2);
const start = parseInt(args[0]) || 0;
const end = parseInt(args[1]) || null;

// 读取笔记数据
const notesData = JSON.parse(fs.readFileSync('data/notes.json', 'utf-8'));

// 创建处理器
const processor = new BatchOCRProcessor();

// 处理
processor.processAll(notesData, start, end)
    .then(results => {
        processor.showStats(results);
        console.log('✅ 完成!');
    })
    .catch(console.error);

export default BatchOCRProcessor;
