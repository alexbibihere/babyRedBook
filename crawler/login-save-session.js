import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

/**
 * Puppeteer 自动登录并保存会话
 * 使用方法: node crawler/login-save-session.js
 */

const USER_DATA_DIR = path.join(process.cwd(), '.puppeteer-data');
const COOKIES_FILE = path.join(process.cwd(), 'data', 'cookies.json');

async function loginAndSaveSession() {
    console.log('\n═══════════════════════════════════════');
    console.log('🔐 小红书自动登录 - 会话保存工具');
    console.log('═══════════════════════════════════════\n');

    // 确保数据目录存在
    if (!fs.existsSync(USER_DATA_DIR)) {
        fs.mkdirSync(USER_DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(path.dirname(COOKIES_FILE))) {
        fs.mkdirSync(path.dirname(COOKIES_FILE), { recursive: true });
    }

    console.log('📂 用户数据目录:', USER_DATA_DIR);
    console.log('📋 Cookie 保存路径:', COOKIES_FILE);
    console.log('\n正在启动浏览器...\n');

    // 启动浏览器(显示窗口)
    const browser = await puppeteer.launch({
        headless: false,  // 显示浏览器窗口
        defaultViewport: {
            width: 1280,
            height: 800
        },
        args: [
            '--start-maximized',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
        userDataDir: USER_DATA_DIR  // 保存用户数据
    });

    const page = await browser.newPage();

    // 设置 User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('✅ 浏览器已启动');
    console.log('\n📱 请在浏览器中完成以下操作:');
    console.log('   1. 访问小红书登录页面');
    console.log('   2. 使用手机号或扫码登录');
    console.log('   3. 登录成功后,按 Ctrl+C 或关闭浏览器\n');

    // 访问小红书登录页
    await page.goto('https://www.xiaohongshu.com', {
        waitUntil: 'networkidle2',
        timeout: 60000
    });

    console.log('⏳ 等待用户登录...\n');

    // 监听页面变化,检测登录状态
    let isLoggedIn = false;
    let retryCount = 0;
    const maxRetries = 120; // 最多等待2分钟

    const checkLoginStatus = async () => {
        try {
            // 检查是否已登录(查找用户头像或用户名)
            const userAvatar = await page.$('.user-avatar, .avatar-container');
            const loginButton = await page.$('.login-btn, .sign-in-btn');

            if (userAvatar && !loginButton) {
                isLoggedIn = true;
                console.log('✅ 检测到登录成功!\n');

                // 获取所有 Cookie
                const cookies = await page.cookies();

                // 保存 Cookie 到文件
                fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2), 'utf-8');

                console.log('📋 Cookie 已保存到:', COOKIES_FILE);
                console.log(`   - 共保存 ${cookies.length} 个 Cookie`);
                console.log('   - 可在采集脚本中使用\n');

                // 显示关键 Cookie
                const keyCookies = cookies.filter(c =>
                    ['a1', 'web_session', 'webId', 'webBuild'].includes(c.name)
                );

                console.log('🔑 关键 Cookie:');
                keyCookies.forEach(cookie => {
                    const valuePreview = cookie.value.substring(0, 30) + '...';
                    console.log(`   - ${cookie.name}: ${valuePreview}`);
                });

                console.log('\n═══════════════════════════════════════');
                console.log('✅ 会话保存完成!');
                console.log('═══════════════════════════════════════\n');

                console.log('💡 使用方法:');
                console.log('   1. 下次启动浏览器时,使用相同的 userDataDir');
                console.log('   2. 或在采集脚本中加载保存的 Cookie');
                console.log('   3. 浏览器会自动保持登录状态\n');

                await browser.close();
                return true;
            }

            return false;
        } catch (error) {
            console.error('检查登录状态失败:', error.message);
            return false;
        }
    };

    // 定时检查登录状态
    const checkInterval = setInterval(async () => {
        if (isLoggedIn) {
            clearInterval(checkInterval);
            return;
        }

        retryCount++;
        const success = await checkLoginStatus();

        if (success) {
            clearInterval(checkInterval);
        } else if (retryCount >= maxRetries) {
            console.log('\n⏰ 等待超时,请手动保存 Cookie');
            console.log('   在浏览器 Console 中执行: document.cookie\n');
            clearInterval(checkInterval);
        } else if (retryCount % 10 === 0) {
            console.log(`⏳ 等待登录中... (${retryCount}/${maxRetries})`);
        }
    }, 1000);

    // 监听浏览器关闭事件
    browser.on('disconnected', () => {
        if (!isLoggedIn) {
            console.log('\n⚠️  浏览器已关闭,但未检测到登录状态');
            console.log('   请确保完成登录后再关闭浏览器\n');
        }
        clearInterval(checkInterval);
    });
}

// 导出函数供其他脚本使用
export { loginAndSaveSession, USER_DATA_DIR, COOKIES_FILE };

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    loginAndSaveSession().catch(error => {
        console.error('\n❌ 发生错误:', error.message);
        console.error(error.stack);
        process.exit(1);
    });
}
