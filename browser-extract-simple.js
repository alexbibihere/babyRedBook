// 小红书笔记完整内容提取脚本 - 浏览器控制台版
//
// 使用方法:
// 1. 确保已登录小红书 (https://www.xiaohongshu.com)
// 2. 按F12打开控制台
// 3. 复制整个脚本到控制台
// 4. 按Enter运行
// 5. 等待提取完成,复制输出的JSON数据

(async function() {
    console.log('\n📝 小红书笔记内容提取器');
    console.log('═══════════════════════════════════\n');

    // 读取项目中的笔记数据
    const notesData = [
        // 这里需要你手动粘贴笔记数据
        // 运行: node -e "const fs=require('fs'); copy(JSON.stringify(JSON.parse(fs.readFileSync('data/notes.json')).slice(0,5)))"
        // 然后粘贴到这里
    ];

    if (notesData.length === 0) {
        console.log('❌ 请先在 notesData 变量中填入笔记数据!');
        console.log('\n获取数据步骤:');
        console.log('1. 在项目目录运行: node -e "const fs=require(\'fs\'); copy(JSON.stringify(JSON.parse(fs.readFileSync(\'data/notes.json\')).slice(0,5)))"');
        console.log('2. 复制输出的数据');
        console.log('3. 粘贴到上面的 notesData 变量中');
        console.log('4. 重新运行脚本\n');
        return;
    }

    console.log(`📚 准备提取 ${notesData.length} 篇笔记...\n`);

    const results = [];
    let successCount = 0;

    for (let i = 0; i < notesData.length; i++) {
        const note = notesData[i];
        const index = i + 1;

        console.log(`[${index}/${notesData.length}] ${note.title || '无标题'}`);

        try {
            // 在当前窗口访问笔记
            window.location.href = note.url;

            // 等待页面加载
            await new Promise(resolve => setTimeout(resolve, 5000));

            // 提取内容
            const extractedData = await new Promise((resolve) => {
                // 多种选择器策略
                const contentSelectors = [
                    '.note-text',
                    '[class*="desc-text"]',
                    '[class*="content-text"]',
                    'section[class*="note"] div[class*="text"]',
                    'article[class*="note"]',
                    'div[class*="rich-text"]',
                    'div[class*="note-content"]',
                    '[class*="note"] span[class*="text"]'
                ];

                let content = '';
                let images = [];

                // 尝试提取正文
                for (const selector of contentSelectors) {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        const texts = Array.from(elements)
                            .map(el => el.innerText?.trim())
                            .filter(text => text && text.length > 20);

                        if (texts.length > 0) {
                            const combined = texts.join('\n\n');
                            if (combined.length > content.length) {
                                content = combined;
                            }
                        }
                    }
                }

                // 如果还是没找到,尝试获取所有段落
                if (!content || content.length < 50) {
                    const allText = document.body.innerText;
                    const lines = allText.split('\n')
                        .map(line => line.trim())
                        .filter(line =>
                            line.length > 15 &&
                            !line.includes('点赞') &&
                            !line.includes('收藏') &&
                            !line.includes('评论') &&
                            !line.includes('分享') &&
                            !line.includes('ICP') &&
                            !line.includes('营业执照') &&
                            !line.includes('隐私政策')
                        )
                        .join('\n\n');
                    content = lines;
                }

                // 提取图片
                const imgElements = document.querySelectorAll('img');
                images = Array.from(imgElements)
                    .map(img => img.src || img.getAttribute('data-src'))
                    .filter(src => src && (src.includes('sns-webpic') || src.includes('xhscdn')))
                    .slice(0, 9);

                resolve({
                    content: content,
                    images: images
                });
            });

            // 更新笔记数据
            const updatedNote = {
                ...note,
                content: extractedData.content || note.content || '',
                images: extractedData.images.length > 0 ? extractedData.images : (note.images || []),
                extractedAt: new Date().toISOString()
            };

            results.push(updatedNote);

            if (extractedData.content && extractedData.content.length > 50) {
                successCount++;
                console.log(`  ✓ 成功 (${extractedData.content.length} 字符)\n`);
            } else {
                console.log(`  ⚠️ 内容较短\n`);
            }

        } catch (error) {
            console.log(`  ❌ 提取失败: ${error.message}\n`);
            results.push(note);
        }

        // 延迟避免请求过快
        if (i < notesData.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // 输出结果
    console.log('\n═══════════════════════════════════');
    console.log('✅ 提取完成!');
    console.log('═══════════════════════════════════');
    console.log(`成功: ${successCount}/${notesData.length}`);
    console.log('\n📋 复制下面的JSON数据:\n');
    console.log('─────────────────────────────────────');
    console.log(JSON.stringify(results, null, 2));
    console.log('─────────────────────────────────────\n');

})();
