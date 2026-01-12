import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { loadCookies, saveCookies, createBrowserWithSession } from './load-cookies.js';

/**
 * 使用已登录会话采集小红书笔记
 * 解决"用户协议"和虚假内容问题
 */

const OUTPUT_FILE = path.join(process.cwd(), 'data', 'notes-with-login.json');

/**
 * 提取单篇笔记的完整内容
 */
async function extractNoteContent(page, url) {
    try {
        console.log(`   正在提取: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // 等待内容加载
        await page.waitForSelector('.note-content, .content, .post-content', {
            timeout: 10000
        }).catch(() => {});

        // 提取数据
        const noteData = await page.evaluate(() => {
            // 提取标题
            const titleEl = document.querySelector('.title, .note-title, h1');
            const title = titleEl?.textContent?.trim() || '';

            // 提取正文内容(在登录状态下应该能获取到真实内容)
            const contentEl = document.querySelector('.note-content, .content, .post-content, .desc');
            const content = contentEl?.textContent?.trim() || '';

            // 提取作者
            const authorEl = document.querySelector('.author-name, .username, .user-name');
            const author = authorEl?.textContent?.trim() || '';

            // 提取点赞数
            const likesEl = document.querySelector('.like-count, .praise-count, [class*="like"]');
            const likesText = likesEl?.textContent?.trim() || '0';
            const likes = parseInt(likesText.replace(/\D/g, '')) || 0;

            // 提取图片
            const images = Array.from(document.querySelectorAll('img[class*="image"], img[class*="photo"]'))
                .map(img => img.src || img.dataset?.original)
                .filter(src => src && src.includes('xhscdn.com'));

            // 提取标签
            const tags = Array.from(document.querySelectorAll('.tag, .topic'))
                .map(tag => tag.textContent?.trim())
                .filter(Boolean);

            return {
                title,
                content,
                author,
                likes,
                images,
                tags
            };
        });

        return {
            url,
            ...noteData,
            extractedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error(`   ❌ 提取失败: ${error.message}`);
        return null;
    }
}

/**
 * 批量提取笔记
 */
async function extractNotesWithLogin(noteUrls) {
    console.log('\n═══════════════════════════════════════');
    console.log('📝 小红书笔记采集工具 (使用已登录会话)');
    console.log('═══════════════════════════════════════\n');
    console.log(`📚 待采集笔记数: ${noteUrls.length}\n`);

    // 使用保存的会话创建浏览器
    const { browser, page } = await createBrowserWithSession({
        headless: false  // 显示浏览器,便于调试
    });

    console.log('✅ 浏览器已启动\n');

    // 检查登录状态
    console.log('🔍 检查登录状态...');
    await page.goto('https://www.xiaohongshu.com', {
        waitUntil: 'networkidle2'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const isLoggedIn = await page.evaluate(() => {
        const loginBtn = document.querySelector('.login-btn, .sign-in-btn');
        const avatar = document.querySelector('.user-avatar, .avatar-container');
        return !loginBtn && avatar;
    });

    if (!isLoggedIn) {
        console.log('\n⚠️  未检测到登录状态!');
        console.log('   请先运行: npm run login');
        console.log('   或在浏览器中手动登录\n');
        await browser.close();
        return [];
    }

    console.log('✅ 已登录\n');

    const results = [];

    // 逐个提取笔记
    for (let i = 0; i < noteUrls.length; i++) {
        const url = noteUrls[i];
        console.log(`\n[${i + 1}/${noteUrls.length}]`);

        const noteData = await extractNoteContent(page, url);

        if (noteData) {
            // 检查是否是虚假内容
            const spamKeywords = ['用户协议', '隐私政策', '沪ICP备', '营业执照'];
            const isSpam = spamKeywords.some(kw => noteData.content?.includes(kw));

            noteData.isSpam = isSpam;
            noteData.hasValidContent = noteData.content && noteData.content.length > 50 && !isSpam;

            results.push(noteData);

            console.log(`   ✅ 标题: ${noteData.title || '无标题'}`);
            console.log(`   📝 内容长度: ${noteData.content?.length || 0}`);
            console.log(`   🖼️  图片数: ${noteData.images?.length || 0}`);
            console.log(`   ${isSpam ? '⚠️  可能是虚假内容' : '✅ 内容有效'}`);
        }

        // 保存进度
        if ((i + 1) % 5 === 0 || i === noteUrls.length - 1) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
            console.log(`   💾 已保存进度 (${i + 1}/${noteUrls.length})`);
        }

        // 随机延迟,避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    }

    await browser.close();

    // 统计
    const validCount = results.filter(n => n.hasValidContent).length;
    const spamCount = results.filter(n => n.isSpam).length;

    console.log('\n═══════════════════════════════════════');
    console.log('✅ 采集完成!');
    console.log('═══════════════════════════════════════\n');
    console.log('📊 统计:');
    console.log(`   - 总笔记数: ${results.length}`);
    console.log(`   - 有效内容: ${validCount}`);
    console.log(`   - 虚假内容: ${spamCount}`);
    console.log(`\n📁 已保存到: ${OUTPUT_FILE}\n`);

    return results;
}

// 导出函数
export { extractNotesWithLogin };

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
    // 读取已有的笔记列表
    const notesFile = path.join(process.cwd(), 'data', 'notes.json');

    if (!fs.existsSync(notesFile)) {
        console.log('❌ 未找到笔记列表文件: data/notes.json');
        console.log('   请先运行采集脚本获取笔记列表\n');
        process.exit(1);
    }

    const notes = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));
    const noteUrls = notes.map(n => n.url).filter(Boolean);

    extractNotesWithLogin(noteUrls).catch(error => {
        console.error('\n❌ 发生错误:', error);
        process.exit(1);
    });
}
