import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const COOKIE_FILE = path.join(process.cwd(), 'data', 'cookies.json');
const NOTES_FILE = path.join(process.cwd(), 'data', 'notes.json');

console.log('\n═══════════════════════════════════════');
console.log('🧪 测试登录采集功能');
console.log('═══════════════════════════════════════\n');

// 1. 检查 Cookie 文件
console.log('1️⃣ 检查 Cookie 文件...');
if (!fs.existsSync(COOKIE_FILE)) {
    console.log('❌ Cookie 文件不存在:', COOKIE_FILE);
    process.exit(1);
}
const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE, 'utf-8'));
console.log(`✅ Cookie 文件存在,共 ${cookies.length} 个 Cookie\n`);

// 2. 检查笔记文件
console.log('2️⃣ 检查笔记文件...');
if (!fs.existsSync(NOTES_FILE)) {
    console.log('❌ 笔记文件不存在:', NOTES_FILE);
    process.exit(1);
}
const notes = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf-8'));
console.log(`✅ 笔记文件存在,共 ${notes.length} 篇笔记\n`);

// 3. 测试浏览器启动
console.log('3️⃣ 启动浏览器...');
const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
});
console.log('✅ 浏览器已启动\n');

// 4. 创建页面
console.log('4️⃣ 创建页面...');
const page = await browser.newPage();
console.log('✅ 页面已创建\n');

// 5. 设置 Cookie
console.log('5️⃣ 设置 Cookie...');
await page.setCookie(...cookies);
console.log(`✅ 已设置 ${cookies.length} 个 Cookie\n`);

// 6. 访问小红书首页检查登录状态
console.log('6️⃣ 检查登录状态...');
await page.goto('https://www.xiaohongshu.com', {
    waitUntil: 'networkidle2',
    timeout: 30000
});

await new Promise(resolve => setTimeout(resolve, 3000));

const isLoggedIn = await page.evaluate(() => {
    const loginBtn = document.querySelector('.login-btn, .sign-in-btn, [class*="login"]');
    const avatar = document.querySelector('.user-avatar, .avatar-container, [class*="avatar"]');
    return {
        hasLoginBtn: !!loginBtn,
        hasAvatar: !!avatar,
        isLoggedIn: !loginBtn && avatar
    };
});

console.log('登录状态检查结果:');
console.log(`  - 登录按钮: ${isLoggedIn.hasLoginBtn ? '存在' : '不存在'}`);
console.log(`  - 用户头像: ${isLoggedIn.hasAvatar ? '存在' : '不存在'}`);
console.log(`  - 是否已登录: ${isLoggedIn.isLoggedIn ? '✅ 是' : '❌ 否'}\n`);

if (!isLoggedIn.isLoggedIn) {
    console.log('⚠️  未检测到登录状态!');
    console.log('   请检查 Cookie 是否有效\n');
    await browser.close();
    process.exit(1);
}

// 7. 测试访问第一篇笔记
console.log('7️⃣ 测试访问第一篇笔记...');
const firstNote = notes[0];
console.log(`   URL: ${firstNote.url}\n`);

await page.goto(firstNote.url, {
    waitUntil: 'networkidle2',
    timeout: 30000
});

await new Promise(resolve => setTimeout(resolve, 3000));

// 提取内容
const noteData = await page.evaluate(() => {
    const titleEl = document.querySelector('.title, .note-title, h1, [class*="title"]');
    const contentEl = document.querySelector('.note-content, .content, .post-content, .desc, [class*="content"]');
    const authorEl = document.querySelector('.author-name, .username, .user-name, [class*="author"]');

    return {
        title: titleEl?.textContent?.trim() || '',
        content: contentEl?.textContent?.trim() || '',
        author: authorEl?.textContent?.trim() || '',
        pageTitle: document.title
    };
});

console.log('提取结果:');
console.log(`  - 页面标题: ${noteData.pageTitle}`);
console.log(`  - 笔记标题: ${noteData.title || '(未提取到)'}`);
console.log(`  - 作者: ${noteData.author || '(未提取到)'}`);
console.log(`  - 内容长度: ${noteData.content.length} 字符`);
console.log(`  - 内容预览: ${noteData.content.substring(0, 100)}...\n`);

// 检查是否是虚假内容
const spamKeywords = ['用户协议', '隐私政策', '沪ICP备', '营业执照'];
const isSpam = spamKeywords.some(kw => noteData.content.includes(kw));

console.log('内容质量检查:');
console.log(`  - 包含虚假内容: ${isSpam ? '⚠️ 是' : '✅ 否'}`);
console.log(`  - 内容有效: ${noteData.content.length > 50 && !isSpam ? '✅ 是' : '❌ 否'}\n`);

await browser.close();

console.log('═══════════════════════════════════════');
console.log('✅ 测试完成!');
console.log('═══════════════════════════════════════\n');
