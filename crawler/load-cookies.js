import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

/**
 * 加载保存的 Cookie 到浏览器
 * 使用方法:
 *   import { loadCookies } from './crawler/load-cookies.js';
 *   await loadCookies(page, 'data/cookies.json');
 */

const COOKIES_FILE = path.join(process.cwd(), 'data', 'cookies.json');

/**
 * 加载 Cookie 到页面
 * @param {Page} page - Puppeteer 页面对象
 * @param {string} cookieFile - Cookie 文件路径
 */
export async function loadCookies(page, cookieFile = COOKIES_FILE) {
    try {
        // 检查 Cookie 文件是否存在
        if (!fs.existsSync(cookieFile)) {
            console.log('⚠️  Cookie 文件不存在:', cookieFile);
            return false;
        }

        // 读取 Cookie
        const cookies = JSON.parse(fs.readFileSync(cookieFile, 'utf-8'));

        if (!cookies || cookies.length === 0) {
            console.log('⚠️  Cookie 文件为空');
            return false;
        }

        // 设置 Cookie
        await page.setCookie(...cookies);

        console.log(`✅ 已加载 ${cookies.length} 个 Cookie`);
        return true;
    } catch (error) {
        console.error('❌ 加载 Cookie 失败:', error.message);
        return false;
    }
}

/**
 * 保存页面 Cookie 到文件
 * @param {Page} page - Puppeteer 页面对象
 * @param {string} cookieFile - Cookie 文件路径
 */
export async function saveCookies(page, cookieFile = COOKIES_FILE) {
    try {
        const cookies = await page.cookies();

        // 确保目录存在
        if (!fs.existsSync(path.dirname(cookieFile))) {
            fs.mkdirSync(path.dirname(cookieFile), { recursive: true });
        }

        fs.writeFileSync(cookieFile, JSON.stringify(cookies, null, 2), 'utf-8');

        console.log(`✅ 已保存 ${cookies.length} 个 Cookie 到: ${cookieFile}`);
        return true;
    } catch (error) {
        console.error('❌ 保存 Cookie 失败:', error.message);
        return false;
    }
}

/**
 * 创建带有已登录会话的浏览器
 * @param {Object} options - Puppeteer 启动选项
 */
export async function createBrowserWithSession(options = {}) {
    const userDataDir = options.userDataDir || path.join(process.cwd(), '.puppeteer-data');

    const browser = await puppeteer.launch({
        headless: options.headless ?? false,
        userDataDir: userDataDir,
        ...options
    });

    const page = await browser.newPage();

    // 设置 User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 加载 Cookie
    await loadCookies(page);

    return { browser, page };
}

/**
 * 检查登录状态
 * @param {Page} page - Puppeteer 页面对象
 */
export async function checkLoginStatus(page) {
    try {
        // 访问小红书首页
        await page.goto('https://www.xiaohongshu.com', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // 检查是否存在登录按钮
        const loginButton = await page.$('.login-btn, .sign-in-btn');
        const userAvatar = await page.$('.user-avatar, .avatar-container');

        return !loginButton && userAvatar;
    } catch (error) {
        console.error('检查登录状态失败:', error.message);
        return false;
    }
}

/**
 * 获取 Cookie 字符串(用于 HTTP 请求)
 * @param {string} cookieFile - Cookie 文件路径
 * @returns {string} Cookie 字符串
 */
export function getCookieString(cookieFile = COOKIES_FILE) {
    try {
        if (!fs.existsSync(cookieFile)) {
            return '';
        }

        const cookies = JSON.parse(fs.readFileSync(cookieFile, 'utf-8'));

        return cookies
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
    } catch (error) {
        console.error('获取 Cookie 字符串失败:', error.message);
        return '';
    }
}

// 如果直接运行此脚本,显示使用示例
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('\n═══════════════════════════════════════');
    console.log('🍪 Cookie 管理工具');
    console.log('═══════════════════════════════════════\n');

    const cookieString = getCookieString();

    if (cookieString) {
        console.log('✅ Cookie 字符串:');
        console.log('─'.repeat(50));
        console.log(cookieString);
        console.log('─'.repeat(50));
        console.log('\n💡 使用方法:');
        console.log('   import { loadCookies } from "./crawler/load-cookies.js";');
        console.log('   const { browser, page } = await createBrowserWithSession();');
        console.log('');
    } else {
        console.log('⚠️  未找到 Cookie 文件');
        console.log('\n请先运行登录脚本:');
        console.log('   npm run login\n');
    }
}
