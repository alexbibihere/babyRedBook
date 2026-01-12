import fs from 'fs';
import path from 'path';

const notesFile = path.join(process.cwd(), 'data', 'notes.json');
const outputFile = path.join(process.cwd(), '浏览器自动采集脚本.js');

const notes = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));

console.log('\n═══════════════════════════════════════');
console.log('📝 生成浏览器自动采集脚本');
console.log('═══════════════════════════════════════\n');
console.log(`📚 笔记数量: ${notes.length}\n`);

// 生成浏览器脚本
let script = `/**
 * 小红书笔记批量采集脚本 - 浏览器 Console 版本
 *
 * 使用方法:
 * 1. 在已登录的小红书网站打开浏览器 Console (F12)
 * 2. 复制整个脚本内容并粘贴到 Console
 * 3. 按回车执行
 * 4. 等待自动采集完成(大约需要 5-10 分钟)
 * 5. 自动下载 JSON 文件
 *
 * 生成时间: ${new Date().toLocaleString('zh-CN')}
 * 笔记数量: ${notes.length} 篇
 */

(async function() {
    console.log('%c═══════════════════════════════════════', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('%c📝 小红书笔记批量采集工具', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('%c═══════════════════════════════════════', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('');

    // 笔记列表
    const notes = ${JSON.stringify(notes, null, 2)};

    console.log(\`%c📚 待采集笔记数: \${notes.length}\`, 'color: #00aa00; font-size: 14px');
    console.log('%c⏳ 开始采集... (预计需要 5-10 分钟)\\n', 'color: #ff9800; font-size: 14px');

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // 遍历每篇笔记
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        console.log(\`%c[\${i + 1}/\${notes.length}] 正在采集: \${note.title || '无标题'}\`, 'color: #2196f3');

        try {
            // 访问笔记页面
            window.location.href = note.url;

            // 等待页面加载
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 等待内容加载
            const maxWait = 10;
            let waited = 0;
            while (waited < maxWait) {
                const contentEl = document.querySelector('.note-content, .content, .post-content, [class*="desc"]');
                if (contentEl && contentEl.innerText.length > 50) {
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 500));
                waited++;
            }

            // 提取页面数据
            const pageData = await new Promise((resolve) => {
                setTimeout(() => {
                    const titleEl = document.querySelector('.title, .note-title, h1, [class*="title"]');
                    const contentEl = document.querySelector('.note-content, .content, .post-content, .desc, [class*="content"]');
                    const authorEl = document.querySelector('.author-name, .username, .user-name, [class*="author"]');
                    const likesEl = document.querySelector('.like-count, .praise-count, [class*="like"]');
                    const imagesEl = document.querySelectorAll('img[class*="image"], img[class*="photo"]');

                    const content = contentEl ? contentEl.innerText : '';

                    resolve({
                        ...note,
                        extractedTitle: titleEl ? titleEl.innerText.trim() : '',
                        content: content,
                        author: authorEl ? authorEl.innerText.trim() : '',
                        likes: likesEl ? parseInt(likesEl.innerText.replace(/\\D/g, '')) || note.likes : note.likes,
                        images: Array.from(imagesEl).map(img => img.src).filter(src => src.includes('xhscdn.com')),
                        contentLength: content.length,
                        hasValidContent: content.length > 50 && !content.includes('用户协议'),
                        extractedAt: new Date().toISOString()
                    });
                }, 100);
            });

            // 检查是否是虚假内容
            const spamKeywords = ['用户协议', '隐私政策', '沪ICP备', '营业执照'];
            const isSpam = spamKeywords.some(kw => pageData.content.includes(kw));

            pageData.isSpam = isSpam;

            if (isSpam) {
                console.log(\`%c   ⚠️  虚假内容 (用户协议)\`, 'color: #ff9800');
                failCount++;
            } else if (pageData.content.length < 50) {
                console.log(\`%c   ⚠️  内容过短 (\${pageData.content.length} 字符)\`, 'color: #ff9800');
                failCount++;
            } else {
                console.log(\`%c   ✅ 成功! (\${pageData.content.length} 字符)\`, 'color: #00aa00');
                successCount++;
            }

            results.push(pageData);

            // 每 5 篇保存一次进度
            if ((i + 1) % 5 === 0) {
                console.log(\`%c   💾 进度已保存 (\${i + 1}/\${notes.length})\`, 'color: #2196f3');
                sessionStorage.setItem('xhs_collect_progress', JSON.stringify(results));
                sessionStorage.setItem('xhs_collect_index', i + 1);
            }

        } catch (error) {
            console.log(\`%c   ❌ 失败: \${error.message}\`, 'color: #f44336');
            failCount++;
            results.push({
                ...note,
                error: error.message,
                content: '',
                hasValidContent: false
            });
        }

        // 随机延迟,避免请求过快
        const delay = 2000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // 采集完成
    console.log('\\n');
    console.log('%c═══════════════════════════════════════', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('%c✅ 采集完成!', 'color: #00aa00; font-size: 16px; font-weight: bold');
    console.log('%c═══════════════════════════════════════', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('');
    console.log(\`%c📊 统计:\`, 'color: #2196f3; font-size: 14px; font-weight: bold');
    console.log(\`   - 总笔记数: \${results.length}\`);
    console.log(\`   - 成功采集: \${successCount} ✅\`);
    console.log(\`   - 失败/虚假: \${failCount} ⚠️\`);
    console.log('');

    // 生成下载链接
    const jsonStr = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`xhs-notes-\${new Date().toISOString().slice(0,10)}.json\`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(\`%c📁 文件已开始下载: xhs-notes-\${new Date().toISOString().slice(0,10)}.json\`, 'color: #00aa00; font-size: 14px');
    console.log('');
    console.log('%c💾 数据已保存到剪贴板,可直接粘贴使用', 'color: #2196f3; font-size: 12px');

    // 复制到剪贴板
    try {
        await navigator.clipboard.writeText(jsonStr);
    } catch (e) {
        console.log('%c⚠️  自动复制失败,请手动下载文件', 'color: #ff9800');
    }

    // 返回结果
    return results;

})();
`;

// 保存脚本
fs.writeFileSync(outputFile, script, 'utf-8');

console.log('✅ 脚本生成完成!');
console.log(`📁 保存位置: ${outputFile}\n`);

console.log('📋 使用方法:');
console.log('   1. 打开小红书网站并登录');
console.log('   2. 按 F12 打开开发者工具');
console.log('   3. 切换到 Console 标签');
console.log('   4. 复制整个脚本内容并粘贴');
console.log('   5. 按回车执行');
console.log('   6. 等待自动采集完成(5-10分钟)');
console.log('   7. 自动下载 JSON 文件\n');

console.log('💡 提示:');
console.log('   - 脚本会自动遍历所有笔记');
console.log('   - 每 5 篇保存一次进度到 sessionStorage');
console.log('   - 采集完成后自动下载数据文件');
console.log('   - 数据也会保存到剪贴板\n');
