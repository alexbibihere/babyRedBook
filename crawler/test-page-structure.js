import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const COOKIE_FILE = path.join(process.cwd(), 'data', 'cookies.json');
const NOTES_FILE = path.join(process.cwd(), 'data', 'notes.json');

const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE, 'utf-8'));
const notes = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf-8'));

console.log('\n═══════════════════════════════════════');
console.log('🔍 调试页面结构');
console.log('═══════════════════════════════════════\n');

const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
});

const page = await browser.newPage();

// 设置完整的请求头
await page.setCookie(...cookies);

// 拦截请求,查看请求头
page.on('request', request => {
    if (request.url().includes('xiaohongshu.com')) {
        const headers = request.headers();
        // 打印关键请求头
        if (request.url().includes('/api/')) {
            console.log('API 请求:', request.method(), request.url());
            console.log('Headers:', JSON.stringify({
                'x-s': headers['x-s'],
                'x-sign': headers['x-sign'],
                'x-t': headers['x-t'],
                'cookie': headers['cookie']?.substring(0, 100) + '...'
            }, null, 2));
        }
    }
});

// 拦截响应
page.on('response', async response => {
    if (response.url().includes('xiaohongshu.com/api/')) {
        console.log('\nAPI 响应:', response.status(), response.url());
        try {
            const data = await response.json();
            console.log('数据:', JSON.stringify(data).substring(0, 500));
        } catch (e) {
            console.log('响应不是 JSON');
        }
    }
});

console.log('正在访问笔记页面...\n');

const firstNote = notes[0];
console.log('URL:', firstNote.url);

try {
    await page.goto(firstNote.url, {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    console.log('\n等待页面加载...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 获取页面 HTML
    const pageHtml = await page.content();
    console.log('\n页面标题:', await page.title());
    console.log('页面 URL:', page.url());

    // 检查是否被重定向
    if (page.url() !== firstNote.url) {
        console.log('\n⚠️  页面被重定向!');
        console.log('原始 URL:', firstNote.url);
        console.log('当前 URL:', page.url());
    }

    // 查找页面内容
    const bodyText = await page.evaluate(() => {
        return document.body.innerText.substring(0, 500);
    });

    console.log('\n页面内容预览:');
    console.log('─'.repeat(50));
    console.log(bodyText);
    console.log('─'.repeat(50));

    // 检查特定的错误提示
    const errorSelectors = [
        '.error-page',
        '.page-not-found',
        '[class*="error"]',
        '[class*="not-found"]'
    ];

    for (const selector of errorSelectors) {
        const element = await page.$(selector);
        if (element) {
            const text = await element.evaluate(el => el.textContent);
            console.log(`\n找到错误元素 (${selector}):`, text);
        }
    }

    // 检查是否有真实的笔记内容
    const contentSelectors = [
        '.note-content',
        '.content',
        '.post-content',
        '.desc',
        '[class*="note-text"]',
        '[class*="post-text"]'
    ];

    console.log('\n查找内容元素:');
    for (const selector of contentSelectors) {
        const element = await page.$(selector);
        if (element) {
            const text = await element.evaluate(el => el.textContent);
            console.log(`  ✅ 找到 (${selector}):`, text.substring(0, 100));
        }
    }

    // 查看所有可能的内容容器
    const allDivs = await page.evaluate(() => {
        const divs = Array.from(document.querySelectorAll('div'));
        return divs
            .filter(d => d.textContent && d.textContent.length > 50 && d.textContent.length < 500)
            .map(d => ({
                class: d.className,
                text: d.textContent.substring(0, 100)
            }))
            .slice(0, 10);
    });

    console.log('\n页面上可能的文本容器:');
    allDivs.forEach((div, i) => {
        if (div.text && !div.text.includes('发现') && !div.text.includes('发布') && !div.text.includes('登录')) {
            console.log(`  ${i + 1}. [${div.class}]`);
            console.log(`     ${div.text}`);
        }
    });

} catch (error) {
    console.error('\n❌ 发生错误:', error.message);
    console.error(error.stack);
}

console.log('\n\n按 Ctrl+C 关闭浏览器...\n');

// 保持浏览器打开,让用户可以查看
process.on('SIGINT', async () => {
    await browser.close();
    process.exit(0);
});

await new Promise(() => {}); // 永久等待
