import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

/**
 * 智能笔记内容提取器
 * 使用多种策略提取小红书笔记的完整内容
 */

class SmartContentExtractor {
    constructor(startIndex = 0, endIndex = 10) {
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.dataDir = path.join(process.cwd(), 'data');
        this.notesFile = path.join(this.dataDir, 'notes.json');
        this.batchFile = path.join(this.dataDir, `extracted-batch-${startIndex}.json`);

        this.notesData = JSON.parse(fs.readFileSync(this.notesFile, 'utf-8'));
        this.batchNotes = this.notesData.slice(startIndex, endIndex);
    }

    async launchBrowser() {
        // 查找Chrome路径
        const chromePaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
        ];

        let executablePath = undefined;
        for (const chromePath of chromePaths) {
            if (fs.existsSync(chromePath)) {
                executablePath = chromePath;
                console.log(`✓ 找到Chrome: ${chromePath}`);
                break;
            }
        }

        if (!executablePath) {
            console.log('⚠️  未找到Chrome,使用Puppeteer默认浏览器');
        }

        this.browser = await puppeteer.launch({
            headless: true,
            executablePath: executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security'
            ]
        });

        console.log('✓ 浏览器已启动\n');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async extractNoteContent(note, index) {
        const page = await this.browser.newPage();

        try {
            // 设置用户代理
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            console.log(`[${index + 1}/${this.batchNotes.length}] ${note.title || '无标题'}`);
            console.log(`  URL: ${note.url}`);

            // 访问页面
            await page.goto(note.url, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // 等待页面加载
            await this.delay(3000);

            // 尝试多种方式提取内容
            const extractedData = await page.evaluate(() => {
                const result = {
                    content: '',
                    images: [],
                    tags: [],
                    author: '',
                    likes: 0
                };

                // 策略1: 查找正文容器 - 尝试多个选择器
                const contentSelectors = [
                    // 小红书常用选择器
                    '[class*="note-text"]',
                    '[class*="desc-text"]',
                    '[class*="content-text"]',
                    'section[class*="note"] div[class*="text"]',
                    'article[class*="note"]',
                    'div[class*="rich-text"]',
                    'div[class*="note-content"]',
                    // 通用选择器
                    'article',
                    '[role="article"]',
                    '.post-content',
                    '.note-content'
                ];

                for (const selector of contentSelectors) {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        const texts = Array.from(elements)
                            .map(el => {
                                // 获取文本,但排除子元素中的重复文本
                                const cloned = el.cloneNode(true);
                                // 移除script和style标签
                                cloned.querySelectorAll('script, style').forEach(s => s.remove());
                                return cloned.innerText.trim();
                            })
                            .filter(text => text && text.length > 20);

                        if (texts.length > 0) {
                            const combined = texts.join('\n\n');
                            // 只选择最长的内容
                            if (combined.length > result.content.length) {
                                result.content = combined;
                            }
                        }
                    }
                }

                // 如果还是没找到,尝试提取段落
                if (!result.content || result.content.length < 50) {
                    const paragraphs = Array.from(document.querySelectorAll('p, div[class*="text"], span[class*="text"]'))
                        .map(el => el.textContent?.trim())
                        .filter(text => text && text.length > 15)
                        .join('\n\n');

                    if (paragraphs.length > result.content.length) {
                        result.content = paragraphs;
                    }
                }

                // 提取图片
                const imgElements = document.querySelectorAll('img[class*="image"], img[class*="cover"], img[class*="note"], img[src*="sns-webpic"]');
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

                // 提取作者
                const authorEl = document.querySelector('[class*="author"], [class*="user-name"], [class*="nickname"]');
                if (authorEl) {
                    result.author = authorEl.textContent?.trim() || '';
                }

                // 提取点赞数
                const likesEl = document.querySelector('[class*="like"], [class*="praise"]');
                if (likesEl) {
                    const likesText = likesEl.textContent?.trim() || '0';
                    result.likes = parseInt(likesText.replace(/\D/g, '')) || 0;
                }

                return result;
            });

            // 更新笔记数据
            const updatedNote = {
                ...note,
                content: extractedData.content || note.content || '',
                images: extractedData.images.length > 0 ? extractedData.images : (note.images || []),
                tags: extractedData.tags,
                author: extractedData.author || note.author || '',
                extractedAt: new Date().toISOString()
            };

            if (extractedData.content && extractedData.content.length > 50) {
                console.log(`  ✓ 成功提取 (${extractedData.content.length} 字符)`);
            } else {
                console.log(`  ⚠️  内容较短或未提取到`);
            }

            await page.close();
            return updatedNote;

        } catch (error) {
            console.log(`  ❌ 提取失败: ${error.message}`);
            try { await page.close(); } catch(e) {}
            return note;
        }
    }

    async extractBatch() {
        console.log('\n═══════════════════════════════════════');
        console.log(`📝 开始提取批次 ${this.startIndex}-${this.endIndex - 1}`);
        console.log('═══════════════════════════════════════\n');
        console.log(`📊 本批数量: ${this.batchNotes.length} 篇`);
        console.log(`📚 总笔记数: ${this.notesData.length} 篇\n`);

        await this.launchBrowser();

        const results = [];
        let successCount = 0;

        for (let i = 0; i < this.batchNotes.length; i++) {
            const note = this.batchNotes[i];
            const result = await this.extractNoteContent(note, i);
            results.push(result);

            if (result.content && result.content.length > 50) {
                successCount++;
            }

            // 延迟避免请求过快
            if (i < this.batchNotes.length - 1) {
                await this.delay(2000 + Math.random() * 1000);
            }
        }

        await this.browser.close();

        // 保存结果
        fs.writeFileSync(this.batchFile, JSON.stringify(results, null, 2), 'utf-8');

        console.log('\n═══════════════════════════════════════');
        console.log('✅ 批次提取完成!');
        console.log('═══════════════════════════════════════');
        console.log(`📁 已保存到: data/extracted-batch-${this.startIndex}.json`);
        console.log(`✓ 成功: ${successCount}/${results.length}\n`);

        return results;
    }
}

// CLI
const args = process.argv.slice(2);
const start = parseInt(args[0]) || 0;
const end = parseInt(args[1]) || start + 10;

const extractor = new SmartContentExtractor(start, end);
extractor.extractBatch().catch(console.error);

export default SmartContentExtractor;
