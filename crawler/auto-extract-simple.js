import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

/**
 * 自动化提取所有笔记的完整内容 - 简化版
 * 一次性处理所有笔记
 */

class SimpleAutoExtractor {
    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.notesFile = path.join(this.dataDir, 'notes.json');
        this.notesData = JSON.parse(fs.readFileSync(this.notesFile, 'utf-8'));
    }

    async launchBrowser() {
        console.log('🚀 启动浏览器...\n');

        this.browser = await puppeteer.launch({
            headless: false, // 显示浏览器窗口
            executablePath: process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--start-maximized'
            ]
        });

        console.log('✓ 浏览器已启动');
        console.log('💡 请在浏览器中手动登录小红书账号');
        console.log('   登录后脚本会自动继续...\n');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async extractNoteContent(page, note, index, total) {
        try {
            console.log(`[${index + 1}/${total}] ${note.title || '无标题'}`);

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

                // 尝试多种选择器提取正文
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

                // 如果内容仍然很短,获取页面主要文本
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

                return result;
            });

            // 更新笔记数据
            const updatedNote = {
                ...note,
                content: extractedData.content || note.content || '',
                images: extractedData.images.length > 0 ? extractedData.images : (note.images || []),
                extractedAt: new Date().toISOString()
            };

            if (extractedData.content && extractedData.content.length > 100) {
                console.log(`  ✓ 成功 (${extractedData.content.length} 字符)`);
            } else {
                console.log(`  ⚠️  内容较短 (${extractedData.content.length} 字符)`);
            }

            return updatedNote;

        } catch (error) {
            console.log(`  ❌ 失败: ${error.message}`);
            return note;
        }
    }

    async extractAll() {
        console.log('\n═══════════════════════════════════════');
        console.log('🚀 自动提取所有笔记内容');
        console.log('═══════════════════════════════════════\n');
        console.log(`📚 总笔记数: ${this.notesData.length}\n`);

        await this.launchBrowser();

        // 打开新标签页
        const page = await this.browser.newPage();

        // 设置视口
        await page.setViewport({ width: 1920, height: 1080 });

        // 先访问小红书主页,让用户登录
        console.log('🌐 正在打开小红书登录页面...');
        await page.goto('https://www.xiaohongshu.com', { waitUntil: 'networkidle2' });

        console.log('⏳ 等待60秒供你登录...');
        console.log('   登录完成后脚本会自动继续\n');
        await this.delay(60000); // 等待60秒让用户登录

        console.log('🔄 开始提取笔记内容...\n');

        const allResults = [];
        let successCount = 0;

        for (let i = 0; i < this.notesData.length; i++) {
            const note = this.notesData[i];
            const result = await this.extractNoteContent(page, note, i, this.notesData.length);
            allResults.push(result);

            if (result.content && result.content.length > 100) {
                successCount++;
            }

            // 每10篇保存一次进度
            if ((i + 1) % 10 === 0) {
                const batchFile = path.join(this.dataDir, `extracted-progress-${i + 1}.json`);
                fs.writeFileSync(batchFile, JSON.stringify(allResults, null, 2), 'utf-8');
                console.log(`\n💾 已保存进度: ${i + 1}/${this.notesData.length}\n`);
            }

            // 延迟避免请求过快
            await this.delay(2000 + Math.random() * 1000);
        }

        await page.close();
        await this.browser.close();

        // 备份原始文件
        const backupFile = this.notesFile + '.backup';
        fs.copyFileSync(this.notesFile, backupFile);
        console.log('\n✓ 已备份原始文件到: notes.json.backup');

        // 保存结果
        fs.writeFileSync(this.notesFile, JSON.stringify(allResults, null, 2), 'utf-8');

        console.log('\n═══════════════════════════════════════');
        console.log('✅ 全部提取完成!');
        console.log('═══════════════════════════════════════');
        console.log(`📊 总笔记数: ${allResults.length}`);
        console.log(`✓ 成功: ${successCount} (${Math.round(successCount/allResults.length*100)}%)`);
        console.log(`📁 已保存到: data/notes.json\n`);
    }
}

// 运行提取
const extractor = new SimpleAutoExtractor();
extractor.extractAll().catch(console.error);

export default SimpleAutoExtractor;
