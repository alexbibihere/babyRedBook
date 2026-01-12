import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import https from 'https';
import http from 'http';

const notesFile = path.join(process.cwd(), 'data', 'notes.json');
const tempDir = path.join(process.cwd(), 'temp_images');
const outputFile = path.join(process.cwd(), 'data', 'notes-with-ocr-new.json');

// 确保临时目录存在
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

console.log('\n═══════════════════════════════════════');
console.log('🔍 OCR 图片识别工具');
console.log('═══════════════════════════════════════\n');

// 读取笔记数据
const notes = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));
console.log(`📚 待处理笔记数: ${notes.length}\n`);

// 下载图片函数
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filepath);

        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                file.close();
                fs.unlink(filepath, () => {});
                reject(new Error(`Failed to download: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            file.close();
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

// OCR 识别函数 (使用 PaddleOCR)
function runOCR(imagePath) {
    try {
        // 调用 Python OCR 脚本
        const result = execSync(
            `python "${path.join(process.cwd(), 'scripts', 'ocr_image.py')}" "${imagePath}"`,
            { encoding: 'utf-8' }
        );
        return JSON.parse(result);
    } catch (error) {
        console.error(`   ❌ OCR 识别失败: ${error.message}`);
        return null;
    }
}

// 处理单篇笔记
async function processNote(note, index) {
    console.log(`\n[${index + 1}/${notes.length}] 处理: ${note.title || '无标题'}`);

    // 如果笔记没有 images 字段,跳过
    if (!note.images || note.images.length === 0) {
        console.log('   ⚠️  无图片,跳过');
        return note;
    }

    const imageTexts = [];

    for (let i = 0; i < note.images.length; i++) {
        const imgUrl = note.images[i];
        console.log(`   📷 [${i + 1}/${note.images.length}] 下载图片...`);

        try {
            // 下载图片
            const filename = `note_${note.id}_${i}.jpg`;
            const filepath = path.join(tempDir, filename);
            await downloadImage(imgUrl, filepath);

            // OCR 识别
            console.log(`   🔍 识别文字...`);
            const ocrResult = runOCR(filepath);

            if (ocrResult && ocrResult.text) {
                imageTexts.push({
                    index: i,
                    url: imgUrl,
                    text: ocrResult.text,
                    confidence: ocrResult.confidence || 0
                });
                console.log(`   ✅ 识别成功 (${ocrResult.text.length} 字符)`);
            } else {
                imageTexts.push({
                    index: i,
                    url: imgUrl,
                    text: '',
                    confidence: 0
                });
                console.log(`   ⚠️  未识别到文字`);
            }

            // 清理临时图片
            fs.unlinkSync(filepath);

            // 延迟避免过快
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error(`   ❌ 处理失败: ${error.message}`);
            imageTexts.push({
                index: i,
                url: imgUrl,
                text: '',
                confidence: 0,
                error: error.message
            });
        }
    }

    // 更新笔记数据
    return {
        ...note,
        imageTexts: imageTexts,
        ocrProcessed: true,
        ocrProcessedAt: new Date().toISOString()
    };
}

// 主处理函数
async function main() {
    const results = [];
    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < notes.length; i++) {
        try {
            const processed = await processNote(notes[i], i);
            results.push(processed);

            if (processed.imageTexts && processed.imageTexts.length > 0) {
                successCount++;
            } else {
                skipCount++;
            }

            // 每 5 篇保存一次进度
            if ((i + 1) % 5 === 0) {
                fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');
                console.log(`\n   💾 进度已保存 (${i + 1}/${notes.length})`);
            }

        } catch (error) {
            console.error(`\n❌ 处理失败: ${error.message}`);
            results.push({
                ...notes[i],
                error: error.message
            });
        }
    }

    // 保存最终结果
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');

    console.log('\n\n═══════════════════════════════════════');
    console.log('✅ OCR 识别完成!');
    console.log('═══════════════════════════════════════\n');
    console.log(`📊 统计:`);
    console.log(`   - 总笔记数: ${results.length}`);
    console.log(`   - 成功识别: ${successCount} ✅`);
    console.log(`   - 无图片跳过: ${skipCount} ⚠️`);
    console.log(`\n📁 已保存到: ${outputFile}\n`);
}

// 运行
main().catch(console.error);
