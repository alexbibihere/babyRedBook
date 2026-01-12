import puppeteer from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

// 使用 stealth 插件避免被检测
puppeteerExtra.use(StealthPlugin());

/**
 * 自动化提取所有笔记的完整内容
 * 使用已登录的浏览器会话
 */

class AutoContentExtractor {
    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.notesFile = path.join(this.dataDir, 'notes.json');
        this.notesData = JSON.parse(fs.readFileSync(this.notesFile, 'utf-8'));
        this.batchSize = 5; // 每批处理5篇,避免浏览器卡顿
    }

    async launchBrowser() {
        // 查找Chrome用户数据目录
        const userDataDir = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data');

        console.log('🚀 启动浏览器...');
        console.log('📁 用户数据目录:', userDataDir);

        this.browser = await puppeteerExtra.launch({
            headless: false, // 显示浏览器窗口,方便调试
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            userDataDir: userDataDir, // 使用你的Chrome用户数据
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--start-maximized'
            ]
        });

        console.log('✓ 浏览器已启动\n');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async extractNoteContent(page, note, index, total) {
        try {
            console.log(`[${index + 1}/${total}] ${note.title || '无标题'}`);
            console.log(`  URL: ${note.url}`);

            // 访问笔记页面
            await page.goto(note.url, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // 等待页面加载
            await this.delay(3000);

            // 提取内容
            const extractedData = await page.evaluate(() => {
                const result = {
                    content: '',
                    images: [],
                    tags: []
                };

                // 多种选择器策略
                const contentSelectors = [
                    '[class*="note-text"]',
                    '[class*="desc-text"]',
                    '[class*="content-text"]',
                    'section[class*="note"] div[class*="text"]',
                    'article[class*="note"]',
                    'div[class*="rich-text"]',
                    'div[class*="note-content"]',
                    'article p',
                    '[class*="main-content"] p'
                ];

                // 提取正文
                for (const selector of contentSelectors) {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        const texts = Array.from(elements)
                            .map(el => {
                                const cloned = el.cloneNode(true);
                                cloned.querySelectorAll('script, style, nav, footer, header').forEach(s => s.remove());
                                return cloned.innerText.trim();
                            })
                            .filter(text => text && text.length > 20)
                            .join('\n\n');

                        if (texts.length > result.content.length) {
                            result.content = texts;
                        }
                    }
                }

                // 如果内容仍然很短,尝试获取页面主要文本
                if (!result.content || result.content.length < 100) {
                    const bodyText = document.body.innerText;
                    const lines = bodyText.split('\n')
                        .map(line => line.trim())
                        .filter(line => {
                            return line.length > 10 &&
                                   !line.includes('点赞') &&
                                   !line.includes('收藏') &&
                                   !line.includes('评论') &&
                                   !line.includes('分享') &&
                                   !line.includes('ICP') &&
                                   !line.includes('营业执照') &&
                                   !line.includes('隐私政策') &&
                                   !line.includes('用户协议') &&
                                   !line.includes('沪公网安备') &&
                                   !line.includes('增值电信') &&
                                   !line.includes('违法不良') &&
                                   !line.includes('互联网举报') &&
                                   !line.includes('广告屏蔽');
                        })
                        .join('\n\n');

                    result.content = lines;
                }

                // 提取图片
                const imgElements = document.querySelectorAll('img');
                result.images = Array.from(imgElements)
                    .map(img => img.src || img.getAttribute('data-src'))
                    .filter(src => src && (src.includes('sns-webpic') || src.includes('xhscdn')))
                    .slice(0, 9);

                // 提取标签
                const tagElements = document.querySelectorAll('[class*="tag"], [class*="topic"], [class*="hashtag"]');
                result.tags = Array.from(tagElements)
                    .map(el => el.textContent?.trim())
                    .filter(text => text && text.length > 0 && text.length < 50)
                    .slice(0, 10);

                return result;
            });

            // 更新笔记数据
            const updatedNote = {
                ...note,
                content: extractedData.content || note.content || '',
                images: extractedData.images.length > 0 ? extractedData.images : (note.images || []),
                tags: extractedData.tags,
                extractedAt: new Date().toISOString()
            };

            if (extractedData.content && extractedData.content.length > 100) {
                console.log(`  ✓ 成功 (${extractedData.content.length} 字符)\n`);
            } else {
                console.log(`  ⚠️  内容较短 (${extractedData.content.length} 字符)\n`);
            }

            return updatedNote;

        } catch (error) {
            console.log(`  ❌ 失败: ${error.message}\n`);
            return note;
        }
    }

    async extractBatch(startIndex) {
        const endIndex = Math.min(startIndex + this.batchSize, this.notesData.length);
        const batch = this.notesData.slice(startIndex, endIndex);

        console.log('\n═══════════════════════════════════════');
        console.log(`📝 批次 ${startIndex}-${endIndex - 1}`);
        console.log('═══════════════════════════════════════\n');
        console.log(`📊 本批数量: ${batch.length} 篇`);
        console.log(`📁 进度: ${endIndex}/${this.notesData.length} (${Math.round(endIndex/this.notesData.length*100)}%)\n`);

        const page = await this.browser.newPage();

        // 设置视口
        await page.setViewport({ width: 1920, height: 1080 });

        const results = [];

        for (let i = 0; i < batch.length; i++) {
            const note = batch[i];
            const result = await this.extractNoteContent(page, note, startIndex + i, this.notesData.length);
            results.push(result);

            // 延迟避免请求过快
            if (i < batch.length - 1) {
                await this.delay(2000 + Math.random() * 1000);
            }
        }

        await page.close();

        return results;
    }

    async extractAll() {
        console.log('\n═══════════════════════════════════════');
        console.log('🚀 开始自动提取所有笔记内容');
        console.log('═══════════════════════════════════════\n');
        console.log(`📚 总笔记数: ${this.notesData.length}`);
        console.log(`📦 批次大小: ${this.batchSize} 篇/批`);
        console.log(`🔄 预计批次: ${Math.ceil(this.notesData.length / this.batchSize)} 批\n`);

        await this.launchBrowser();

        const allResults = [];
        let successCount = 0;

        // 添加提示
        console.log('💡 提示: 浏览器窗口会自动访问每篇笔记');
        console.log('   请确保小红书网页已登录\n');

        // 等待5秒让用户看到浏览器
        await this.delay(5000);

        for (let i = 0; i < this.notesData.length; i += this.batchSize) {
            const batch = await this.extractBatch(i);

            // 保存批次结果
            const batchFile = path.join(this.dataDir, `extracted-batch-${i}.json`);
            fs.writeFileSync(batchFile, JSON.stringify(batch, null, 2), 'utf-8');
            console.log(`💾 已保存批次: data/extracted-batch-${i}.json\n`);

            allResults.push(...batch);

            const batchSuccess = batch.filter(n => n.content && n.content.length > 100).length;
            successCount += batchSuccess;

            // 批次间休息
            if (i + this.batchSize < this.notesData.length) {
                console.log('⏸️  休息5秒后继续...\n');
                await this.delay(5000);
            }
        }

        await this.browser.close();

        // 备份原始文件
        const backupFile = this.notesFile + '.backup';
        fs.copyFileSync(this.notesFile, backupFile);
        console.log(`✓ 已备份原始文件到: notes.json.backup\n`);

        // 保存合并结果
        fs.writeFileSync(this.notesFile, JSON.stringify(allResults, null, 2), 'utf-8');

        console.log('\n═══════════════════════════════════════');
        console.log('✅ 全部提取完成!');
        console.log('═══════════════════════════════════════');
        console.log(`📊 总笔记数: ${allResults.length}`);
        console.log(`✓ 成功: ${successCount} (${Math.round(successCount/allResults.length*100)}%)`);
        console.log(`📁 已保存到: data/notes.json\n`);

        // 清理批次文件
        console.log('💡 提示: 批次文件已保存到 data/extracted-batch-*.json');
        console.log('   如需清理,运行: rm data/extracted-batch-*.json\n');
    }
}

// 运行提取
const extractor = new AutoContentExtractor();
extractor.extractAll().catch(console.error);

export default AutoContentExtractor;
