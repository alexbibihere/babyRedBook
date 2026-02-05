// 小红书笔记完整内容批量提取脚本
//
// 使用方法:
// 1. 在项目目录运行: node -e "const fs=require('fs'); copy(JSON.stringify(JSON.parse(fs.readFileSync('data/notes.json')).slice(0,10)))"
// 2. 打开已登录的小红书网页: https://www.xiaohongshu.com
// 3. 按F12打开控制台
// 4. 粘贴步骤1的数据到下面的notesInput变量中
// 5. 将整个脚本复制到控制台运行
// 6. 等待提取完成,复制输出的JSON数据保存为 data/notes.json

(async function() {
    // ===========================
    // 👇 在这里粘贴你的笔记数据
    // ===========================
    const notesInput = [
        // 粘贴从项目复制的notes数据到这里
    ];

    if (notesInput.length === 0) {
        console.log('❌ 请先在 notesInput 变量中填入笔记数据!');
        return;
    }

    console.log('\n📝 开始提取 ' + notesInput.length + ' 篇笔记的完整内容...\n');

    const results = [];
    let successCount = 0;

    for (let i = 0; i < notesInput.length; i++) {
        const note = notesInput[i];
        const index = i + 1;

        console.log('[' + index + '/' + notesInput.length + '] ' + (note.title || '无标题'));

        try {
            // 使用fetch获取页面内容
            const response = await fetch(note.url);
            const html = await response.text();

            // 创建临时DOM解析
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 尝试多种选择器
            const contentSelectors = [
                '[class*="note-text"]',
                '[class*="desc-text"]',
                '[class*="content-text"]',
                'span[class*="text"]',
                'div[class*="desc"]',
                'article',
                '[class*="rich-text"]'
            ];

            let content = '';
            for (const selector of contentSelectors) {
                const elements = doc.querySelectorAll(selector);
                const texts = Array.from(elements)
                    .map(el => el.textContent?.trim())
                    .filter(text => text && text.length > 20)
                    .join('\n\n');

                if (texts.length > 50) {
                    content = texts;
                    break;
                }
            }

            // 提取图片
            const images = Array.from(doc.querySelectorAll('img'))
                .map(img => img.src || img.getAttribute('data-src'))
                .filter(src => src && src.includes('sns-webpic'))
                .slice(0, 9);

            // 更新笔记数据
            const updatedNote = {
                ...note,
                content: content || note.content || '',
                images: images.length > 0 ? images : (note.images || []),
                extractedAt: new Date().toISOString()
            };

            results.push(updatedNote);

            if (content && content.length > 50) {
                successCount++;
                console.log('  ✓ 提取成功 (' + content.length + ' 字符)');
            } else {
                console.log('  ⚠️ 未能提取到完整内容');
            }

        } catch (error) {
            console.log('  ❌ 提取失败: ' + error.message);
            results.push(note);
        }

        // 延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    }

    // 输出结果
    console.log('\n═══════════════════════════════════════');
    console.log('✅ 提取完成!');
    console.log('═══════════════════════════════════════');
    console.log('成功: ' + successCount + '/' + notesInput.length);
    console.log('\n📋 复制下面的JSON数据,保存为 data/notes.json:\n');
    console.log('─────────────────────────────────────');
    console.log(JSON.stringify(results, null, 2));
    console.log('─────────────────────────────────────\n');

})();
