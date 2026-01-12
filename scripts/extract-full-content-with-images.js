import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { loadCookies } from '../crawler/load-cookies.js';

const notesFile = path.join(process.cwd(), 'data', 'notes.json');
const outputFile = path.join(process.cwd(), 'data', 'notes-with-images.json');

console.log('\n═══════════════════════════════════════');
console.log('📝 提取笔记完整内容(含图片)');
console.log('═══════════════════════════════════════\n');

// 读取笔记数据
const notes = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));
console.log(`📚 待处理笔记数: ${notes.length}\n`);

// 提取单篇笔记
async function extractNote(note, browser, index) {
    console.log(`[${index + 1}/${notes.length}] ${note.title || '无标题'}`);

    const page = await browser.newPage();

    try {
        // 访问笔记页面
        await page.goto(note.url, { waitUntil: 'networkidle2', timeout: 30000 });

        // 等待内容加载
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 提取数据
        const data = await page.evaluate(() => {
            // 提取图片
            const images = [];
            const imgElements = document.querySelectorAll('img[src*="xhscdn.com"]');

            imgElements.forEach((img, i) => {
                const src = img.src;
                if (src && !images.includes(src)) {
                    images.push(src);
                }
            });

            // 提取内容
            const contentEl = document.querySelector('.note-content, .content, .post-content, .desc, [class*="content"]');
            const content = contentEl ? contentEl.innerText : '';

            // 提取标题
            const titleEl = document.querySelector('.title, .note-title, h1, [class*="title"]');
            const title = titleEl ? titleEl.innerText.trim() : '';

            // 提取作者
            const authorEl = document.querySelector('.author-name, .username, .user-name, [class*="author"]');
            const author = authorEl ? authorEl.innerText.trim() : '';

            // 提取点赞数
            const likesEl = document.querySelector('.like-count, .praise-count, [class*="like"]');
            const likes = likesEl ? parseInt(likesEl.innerText.replace(/\D/g, '')) || 0 : 0;

            return {
                title,
                content: content || '',
                author,
                likes,
                images,
                contentLength: content.length,
                hasValidContent: content.length > 50 && !content.includes('用户协议')
            };
        });

        await page.close();

        console.log(`   ✅ 成功! (${data.images.length} 张图片, ${data.content.length} 字符)`);

        return {
            ...note,
            ...data,
            extractedAt: new Date().toISOString()
        };

    } catch (error) {
        await page.close();
        console.error(`   ❌ 失败: ${error.message}`);

        return {
            ...note,
            images: [],
            error: error.message
        };
    }
}

// 主函数
async function main() {
    const results = [];
    let successCount = 0;

    // 启动浏览器
    console.log('🌐 启动浏览器...\n');
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // 加载 Cookie
    try {
        const cookies = loadCookies();
        if (cookies && cookies.length > 0) {
            const page = await browser.newPage();
            await page.setCookie(...cookies);
            await page.close();
            console.log('✅ Cookie 已加载\n');
        }
    } catch (error) {
        console.log('⚠️  未找到 Cookie,继续运行...\n');
    }

    // 处理每篇笔记
    for (let i = 0; i < notes.length; i++) {
        try {
            const result = await extractNote(notes[i], browser, i);
            results.push(result);

            if (result.images && result.images.length > 0) {
                successCount++;
            }

            // 每 5 篇保存一次
            if ((i + 1) % 5 === 0) {
                fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');
                console.log(`\n   💾 进度已保存 (${i + 1}/${notes.length})\n`);
            }

            // 延迟避免过快
            await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (error) {
            console.error(`\n❌ 处理失败: ${error.message}\n`);
            results.push({
                ...notes[i],
                images: [],
                error: error.message
            });
        }
    }

    await browser.close();

    // 保存最终结果
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');

    console.log('\n═══════════════════════════════════════');
    console.log('✅ 提取完成!');
    console.log('═══════════════════════════════════════\n');
    console.log(`📊 统计:`);
    console.log(`   - 总笔记数: ${results.length}`);
    console.log(`   - 成功提取: ${successCount} ✅`);
    console.log(`   - 失败: ${results.length - successCount} ⚠️`);
    console.log(`\n📁 已保存到: ${outputFile}\n`);
}

main().catch(console.error);
