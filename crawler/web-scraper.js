import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

/**
 * 小红书网页爬虫
 * 使用Puppeteer浏览器自动化工具爬取数据
 */

class XHSWebScraper {
    constructor(userId, cookie) {
        this.userId = userId;
        this.cookie = cookie;
        this.dataDir = path.join(process.cwd(), 'data');
        this.initDataDir();
    }

    initDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    /**
     * 启动浏览器
     */
    async launchBrowser() {
        console.log('🚀 正在启动浏览器...\n');

        // 尝试找到系统Chrome路径
        const chromePaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
        ];

        let executablePath = undefined;
        for (const path of chromePaths) {
            if (fs.existsSync(path)) {
                executablePath = path;
                console.log(`✓ 找到Chrome: ${path}\n`);
                break;
            }
        }

        this.browser = await puppeteer.launch({
            headless: 'new',
            executablePath: executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });

        this.page = await this.browser.newPage();

        // 设置用户代理
        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // 设置Cookie
        if (this.cookie) {
            await this.page.setCookie(...this.parseCookie(this.cookie));
        }

        // 添加window对象防护
        await this.page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        });
    }

    /**
     * 解析Cookie字符串
     */
    parseCookie(cookieString) {
        return cookieString.split(';').map(cookie => {
            const [name, value] = cookie.trim().split('=');
            return {
                name,
                value,
                domain: '.xiaohongshu.com',
                path: '/'
            };
        }).filter(cookie => cookie.name && cookie.value);
    }

    /**
     * 等待选择器出现
     */
    async waitForSelector(selector, timeout = 10000) {
        try {
            await this.page.waitForSelector(selector, { timeout });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 获取用户笔记
     */
    async scrapeUserNotes() {
        console.log('📝 开始获取用户笔记...\n');

        const notes = [];
        let scrollCount = 0;
        const maxScrolls = 10; // 最多滚动10次

        try {
            // 访问用户主页
            const url = `https://www.xiaohongshu.com/user/profile/${this.userId}`;
            console.log(`正在访问: ${url}\n`);

            await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            console.log('✓ 页面加载完成');

            // 等待页面内容加载
            await this.delay(5000);

            // 截图调试
            await this.page.screenshot({ path: 'debug.png' });
            console.log('✓ 已保存页面截图到 debug.png\n');

            // 获取页面HTML来调试
            const pageHtml = await this.page.content();
            console.log(`页面标题: ${await this.page.title()}`);
            console.log(`页面URL: ${this.page.url()}\n`);

            // 滚动加载更多
            for (let i = 0; i < maxScrolls; i++) {
                scrollCount++;
                console.log(`正在滚动加载... (${scrollCount}/${maxScrolls})`);

                // 滚动到底部
                await this.page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });

                await this.delay(3000);

                // 尝试提取笔记数据
                const pageNotes = await this.extractNotesFromPage();
                if (pageNotes.length > 0) {
                    const newNotes = pageNotes.filter(n => !notes.some(existing => existing.id === n.id));
                    if (newNotes.length > 0) {
                        notes.push(...newNotes);
                        console.log(`✓ 本页获取 ${newNotes.length} 条新笔记，总计 ${notes.length} 条`);
                    } else {
                        console.log('⚠️  没有新笔记了');
                        break;
                    }
                } else {
                    console.log('⚠️  未提取到笔记数据，可能需要调整选择器');
                    // 尝试打印页面结构
                    const bodyText = await this.page.evaluate(() => {
                        return document.body.innerText.substring(0, 500);
                    });
                    console.log('页面文本预览:', bodyText);
                }
            }

            console.log(`\n✅ 笔记获取完成，共 ${notes.length} 条\n`);
            return this.deduplicate(notes);

        } catch (error) {
            console.error('❌ 获取笔记失败:', error.message);
            console.error('错误详情:', error.stack);
            return [];
        }
    }

    /**
     * 从页面提取笔记数据
     */
    async extractNotesFromPage() {
        try {
            const notes = await this.page.evaluate(() => {
                const extracted = [];

                // 尝试多种选择器
                const selectors = [
                    'a[href*="/explore/"]',
                    '.note-item',
                    '.feed-card',
                    '[class*="note"]',
                    '[class*="card"]'
                ];

                for (const selector of selectors) {
                    const items = document.querySelectorAll(selector);
                    console.log(`选择器 ${selector}: 找到 ${items.length} 个元素`);

                    items.forEach(item => {
                        try {
                            const href = item.href || item.querySelector('a')?.href;
                            if (href && href.includes('/explore/')) {
                                const id = href.split('/explore/').pop().split('?')[0].split('/')[0];
                                if (id && id.length > 0 && !extracted.find(n => n.id === id)) {
                                    const img = item.querySelector('img') || item;
                                    const titleEl = item.querySelector('[class*="title"]') || item;
                                    const likesEl = item.querySelector('[class*="like"], [class*="count"]');

                                    extracted.push({
                                        id: id,
                                        title: titleEl?.textContent?.trim()?.substring(0, 100) || '无标题',
                                        cover: img?.src || img?.getAttribute('data-src') || '',
                                        url: href,
                                        likes: parseInt(likesEl?.textContent?.trim()?.replace(/\D/g, '') || '0') || 0,
                                        createTime: new Date().toISOString().split('T')[0]
                                    });
                                }
                            }
                        } catch (e) {
                            // 忽略错误
                        }
                    });

                    if (extracted.length > 0) {
                        break; // 找到数据就停止
                    }
                }

                return extracted;
            });

            console.log(`✓ 提取到 ${notes.length} 条笔记`);
            return notes;
        } catch (error) {
            console.error('提取笔记失败:', error.message);
            return [];
        }
    }

    /**
     * 检查是否还有更多内容
     */
    async checkHasMore() {
        try {
            const hasMore = await this.page.evaluate(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;

                // 如果滚动到接近底部，可能没有更多了
                return scrollTop + windowHeight < documentHeight - 100;
            });
            return hasMore;
        } catch {
            return false;
        }
    }

    /**
     * 获取笔记详情
     */
    async getNoteDetails(noteUrl) {
        try {
            await this.page.goto(noteUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            await this.delay(2000);

            const details = await this.page.evaluate(() => {
                const title = document.querySelector('.title, h1, [class*="title"]');
                const content = document.querySelector('.content, [class*="content"], .desc');
                const images = document.querySelectorAll('img[class*="image"], img[class*="cover"]');
                const author = document.querySelector('[class*="author"], [class*="user"]');
                const tags = document.querySelectorAll('[class*="tag"], [class*="topic"]');

                return {
                    title: title?.textContent?.trim() || '',
                    content: content?.textContent?.trim() || '',
                    images: Array.from(images).map(img => img.src).filter(Boolean),
                    author: author?.textContent?.trim() || '',
                    tags: Array.from(tags).map(tag => tag.textContent?.trim()).filter(Boolean)
                };
            });

            return details;
        } catch (error) {
            console.error(`获取笔记详情失败: ${error.message}`);
            return null;
        }
    }

    /**
     * 数据去重
     */
    deduplicate(notes) {
        const seen = new Set();
        return notes.filter(note => {
            if (seen.has(note.id)) {
                return false;
            }
            seen.add(note.id);
            return true;
        });
    }

    /**
     * 延迟函数
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 保存数据
     */
    saveData(notes, collections = [], likes = []) {
        console.log('💾 正在保存数据...\n');

        if (notes.length > 0) {
            fs.writeFileSync(
                path.join(this.dataDir, 'notes.json'),
                JSON.stringify(notes, null, 2),
                'utf-8'
            );
            console.log(`✓ 笔记: ${notes.length} 条`);
        }

        if (collections.length > 0) {
            fs.writeFileSync(
                path.join(this.dataDir, 'collections.json'),
                JSON.stringify(collections, null, 2),
                'utf-8'
            );
            console.log(`✓ 收藏: ${collections.length} 条`);
        }

        if (likes.length > 0) {
            fs.writeFileSync(
                path.join(this.dataDir, 'likes.json'),
                JSON.stringify(likes, null, 2),
                'utf-8'
            );
            console.log(`✓ 点赞: ${likes.length} 条`);
        }

        console.log(`\n📁 数据已保存到: ${this.dataDir}\n`);
    }

    /**
     * 关闭浏览器
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

export default XHSWebScraper;
