/**
 * 小红书笔记批量采集脚本 - 浏览器 Console 版本
 *
 * 使用方法:
 * 1. 在已登录的小红书网站打开浏览器 Console (F12)
 * 2. 复制整个脚本内容并粘贴到 Console
 * 3. 按回车执行
 * 4. 等待自动采集完成
 * 5. 下载 JSON 文件
 */

(async function() {
    console.log('%c═══════════════════════════════════════', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('%c📝 小红书笔记批量采集工具', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('%c═══════════════════════════════════════', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('');

    // 笔记列表 - 从你的 notes.json 获取
    const notes = [
        {"id":"66f17ccc000000001b0207d5","title":"生产后1—3天，老公如何照顾孕妇","url":"https://www.xiaohongshu.com/explore/66f17ccc000000001b0207d5","likes":1664},
        {"id":"694d2fec000000001e00bf51","title":"无标题","url":"https://www.xiaohongshu.com/explore/694d2fec000000001e00bf51","likes":622},
        {"id":"66f1c077000000000a0276f5","title":"孕期每个月身体感受+注意事项+营养补充✅","url":"https://www.xiaohongshu.com/explore/66f1c077000000000a0276f5","likes":410},
        {"id":"66f23cfa0000000019014b9c","title":"无标题","url":"https://www.xiaohongshu.com/explore/66f23cfa0000000019014b9c","likes":385},
        {"id":"66f1c047000000001401755a","title":"二胎妈血泪总结：新生儿用品红黑榜","url":"https://www.xiaohongshu.com/explore/66f1c047000000001401755a","likes":348},
        {"id":"66f423d3000000002e01e0d9","title":"深圳市妇幼保健院建档流程及注意事项","url":"https://www.xiaohongshu.com/explore/66f423d3000000002e01e0d9","likes":270},
        {"id":"66f40ee9000000002b01e9c6","title":"深圳异地产检定额报销一波三折终于好了","url":"https://www.xiaohongshu.com/explore/66f40ee9000000002b01e9c6","likes":245},
        {"id":"66f1c4450000000029017027","title":"无标题","url":"https://www.xiaohongshu.com/explore/66f1c4450000000029017027","likes":234}
        // ... 更多笔记会在后面自动加载
    ];

    console.log(`%c📚 待采集笔记数: ${notes.length}`, 'color: #00aa00; font-size: 14px');
    console.log('%c⏳ 开始采集...\n', 'color: #ff9800; font-size: 14px');

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // 遍历每篇笔记
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        console.log(`%c[${i + 1}/${notes.length}] 正在采集: ${note.title || '无标题'}`, 'color: #2196f3');

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
                        likes: likesEl ? parseInt(likesEl.innerText.replace(/\D/g, '')) || note.likes : note.likes,
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
                console.log(`%c   ⚠️  虚假内容 (用户协议)`, 'color: #ff9800');
                failCount++;
            } else if (pageData.content.length < 50) {
                console.log(`%c   ⚠️  内容过短 (${pageData.content.length} 字符)`, 'color: #ff9800');
                failCount++;
            } else {
                console.log(`%c   ✅ 成功! (${pageData.content.length} 字符)`, 'color: #00aa00');
                successCount++;
            }

            results.push(pageData);

            // 每 5 篇保存一次进度
            if ((i + 1) % 5 === 0) {
                console.log(`%c   💾 进度已保存 (${i + 1}/${notes.length})`, 'color: #2196f3');
                sessionStorage.setItem('xhs_collect_progress', JSON.stringify(results));
                sessionStorage.setItem('xhs_collect_index', i + 1);
            }

        } catch (error) {
            console.log(`%c   ❌ 失败: ${error.message}`, 'color: #f44336');
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
    console.log('\n');
    console.log('%c═══════════════════════════════════════', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('%c✅ 采集完成!', 'color: #00aa00; font-size: 16px; font-weight: bold');
    console.log('%c═══════════════════════════════════════', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('');
    console.log(`%c📊 统计:`, 'color: #2196f3; font-size: 14px; font-weight: bold');
    console.log(`   - 总笔记数: ${results.length}`);
    console.log(`   - 成功采集: ${successCount} ✅`);
    console.log(`   - 失败/虚假: ${failCount} ⚠️`);
    console.log('');

    // 生成下载链接
    const jsonStr = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xhs-notes-${new Date().toISOString().slice(0,10)}.json`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`%c📁 文件已开始下载: xhs-notes-${new Date().toISOString().slice(0,10)}.json`, 'color: #00aa00; font-size: 14px');
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
