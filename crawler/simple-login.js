import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const COOKIES_FILE = path.join(process.cwd(), 'data', 'cookies.json');

console.log('\n═══════════════════════════════════════');
console.log('🔐 小红书登录 - Cookie 保存工具');
console.log('═══════════════════════════════════════\n');

async function main() {
    // 启动浏览器
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();

    console.log('✅ 浏览器已启动');
    console.log('\n📱 请在浏览器中完成以下操作:');
    console.log('   1. 页面会自动跳转到小红书');
    console.log('   2. 使用手机号或扫码登录');
    console.log('   3. 登录成功后,回到这里按回车键');
    console.log('   4. 脚本会自动保存 Cookie\n');

    // 访问小红书
    await page.goto('https://www.xiaohongshu.com');

    console.log('⏳ 等待你登录...\n');

    // 等待用户按回车
    console.log('登录成功后,请按 Ctrl+C 然后运行: npm run save-cookies');
    console.log('\n或者,等待 30 秒后自动尝试保存 Cookie...\n');

    // 30秒后自动保存
    setTimeout(async () => {
        try {
            const cookies = await page.cookies();

            // 确保目录存在
            if (!fs.existsSync(path.dirname(COOKIES_FILE))) {
                fs.mkdirSync(path.dirname(COOKIES_FILE), { recursive: true });
            }

            // 保存 Cookie
            fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2), 'utf-8');

            console.log('\n✅ Cookie 已自动保存!');
            console.log(`📁 位置: ${COOKIES_FILE}`);
            console.log(`📊 数量: ${cookies.length} 个\n`);

            // 显示关键 Cookie
            const keyCookies = cookies.filter(c =>
                ['a1', 'web_session', 'webId', 'webBuild'].includes(c.name)
            );

            console.log('🔑 关键 Cookie:');
            keyCookies.forEach(c => {
                const preview = c.value.substring(0, 30) + '...';
                console.log(`   - ${c.name}: ${preview}`);
            });
            console.log('\n═══════════════════════════════════════\n');

            await browser.close();
            process.exit(0);
        } catch (error) {
            console.error('保存 Cookie 失败:', error.message);
            await browser.close();
            process.exit(1);
        }
    }, 30000);

    // 保持运行
    process.on('SIGINT', async () => {
        console.log('\n\n正在保存 Cookie...');
        try {
            const cookies = await page.cookies();

            if (!fs.existsSync(path.dirname(COOKIES_FILE))) {
                fs.mkdirSync(path.dirname(COOKIES_FILE), { recursive: true });
            }

            fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2), 'utf-8');
            console.log(`✅ 已保存 ${cookies.length} 个 Cookie\n`);
        } catch (error) {
            console.error('保存失败:', error.message);
        }
        await browser.close();
        process.exit(0);
    });
}

main().catch(error => {
    console.error('错误:', error);
    process.exit(1);
});
