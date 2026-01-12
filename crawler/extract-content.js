import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

/**
 * 完整笔记内容提取器
 * 访问每个笔记页面并提取完整正文
 */

class FullNoteContentExtractor {
    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.notesData = JSON.parse(fs.readFileSync(path.join(this.dataDir, 'notes.json'), 'utf-8'));
    }

    async launchBrowser() {
        const chromePaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
        ];

        let executablePath = undefined;
        for (const chromePath of chromePaths) {
            if (fs.existsSync(chromePath)) {
                executablePath = chromePath;
                break;
            }
        }

        this.browser = await puppeteer.launch({
            headless: 'new',
            executablePath: executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
    }

    async extractNoteContent(noteUrl, noteId) {
        const page = await this.browser.newPage();

        try {
            console.log(`正在提取: ${noteUrl}`);

            await page.goto(noteUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            await this.delay(3000);

            const content = await page.evaluate(() => {
                // 提取正文内容
                const selectors = [
                    '.note-text',
                    '[class*="desc"]',
                    '[class*="content"]',
                    '.content',
                    'article',
                    '.post-content'
                ];

                let fullContent = '';

                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        fullContent = element.innerText.trim();
                        if (fullContent.length > 50) {
                            break;
                        }
                    }
                }

                // 如果没找到,尝试获取所有文本
                if (!fullContent || fullContent.length < 50) {
                    const bodyText = document.body.innerText;
                    // 过滤掉导航等无关内容
                    const lines = bodyText.split('\n').filter(line => {
                        return line.trim().length > 10 &&
                               !line.includes('点赞') &&
                               !line.includes('收藏') &&
                               !line.includes('评论') &&
                               !line.includes('分享');
                    });
                    fullContent = lines.join('\n\n');
                }

                return {
                    content: fullContent,
                    images: Array.from(document.querySelectorAll('img[class*="image"], img[class*="cover"]'))
                        .map(img => img.src || img.getAttribute('data-src'))
                        .filter(Boolean),
                    tags: Array.from(document.querySelectorAll('[class*="tag"], [class*="topic"]'))
                        .map(el => el.textContent.trim())
                        .filter(Boolean)
                };
            });

            return content;

        } catch (error) {
            console.error(`提取失败 ${noteUrl}:`, error.message);
            return { content: '', images: [], tags: [] };
        } finally {
            await page.close();
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async extractAllNotes() {
        console.log(`📝 开始提取 ${this.notesData.length} 篇笔记的完整内容...\n`);

        await this.launchBrowser();

        // 提取前20篇笔记(避免时间过长)
        const notesToProcess = this.notesData.slice(0, 20);

        for (let i = 0; i < notesToProcess.length; i++) {
            const note = notesToProcess[i];
            console.log(`[${i + 1}/${notesToProcess.length}] 处理: ${note.title}`);

            const extractedData = await this.extractNoteContent(note.url, note.id);

            // 更新笔记内容
            if (extractedData.content) {
                note.content = extractedData.content;
            }
            if (extractedData.images && extractedData.images.length > 0) {
                note.images = extractedData.images;
            }
            if (extractedData.tags && extractedData.tags.length > 0) {
                note.tags = extractedData.tags;
            }

            // 保存进度
            if ((i + 1) % 5 === 0) {
                this.saveData(notesToProcess.slice(0, i + 1));
                console.log(`✓ 已保存 ${i + 1} 篇笔记\n`);
            }

            // 延迟避免请求过快
            await this.delay(2000);
        }

        // 保存所有数据
        this.saveData(notesToProcess);

        await this.browser.close();

        console.log('\n✅ 内容提取完成!');
        console.log(`📁 已保存到 data/notes.json\n`);
    }

    saveData(notes) {
        // 保留原始未处理的笔记
        const remainingNotes = this.notesData.slice(notes.length);
        const allNotes = [...notes, ...remainingNotes];

        fs.writeFileSync(
            path.join(this.dataDir, 'notes.json'),
            JSON.stringify(allNotes, null, 2),
            'utf-8'
        );
    }
}

// 运行
const extractor = new FullNoteContentExtractor();
extractor.extractAllNotes().catch(console.error);

export default FullNoteContentExtractor;
