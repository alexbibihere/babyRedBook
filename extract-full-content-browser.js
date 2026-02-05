// 小红书笔记完整内容提取脚本
// 使用方法:
// 1. 打开浏览器访问 https://www.xiaohongshu.com (确保已登录)
// 2. 按F12打开控制台
// 3. 复制本脚本到控制台并回车
// 4. 脚本会自动读取data/notes.json中的笔记URL并提取完整内容

(async function() {
    console.log('\n📝 开始提取小红书笔记完整内容...\n');

    // 从本地文件读取笔记列表
    let notesData = [];
    try {
        // 如果在浏览器环境中,需要用户手动粘贴notes.json内容
        console.log('═══════════════════════════════════════');
        console.log('📋 第一步: 获取笔记列表');
        console.log('═══════════════════════════════════════\n');
        console.log('请在项目目录中运行以下命令获取笔记列表:\n');
        console.log('  node -e "const fs=require(\\'fs\\'); console.log(JSON.stringify(JSON.parse(fs.readFileSync(\\'data/notes.json\\')), null, 2))"\n');
        console.log('然后复制输出的JSON数据,在这里输入:\n');

        // 等待用户输入
        const input = await new Promise(resolve => {
            const inputHandler = (e) => {
                if (e.key === 'Enter' && e.target.value === 'paste') {
                    window.removeEventListener('keydown', inputHandler);
                    resolve(e.target.value);
                }
            };
            window.addEventListener('keydown', inputHandler);
        });

    } catch (error) {
        console.error('读取笔记列表失败:', error);
        return;
    }

    // 优化后的单篇笔记提取函数
    async function extractSingleNote(noteUrl) {
        console.log(`正在提取: ${noteUrl}`);

        // 在新标签页打开笔记
        const newWindow = window.open(noteUrl, '_blank');

        if (!newWindow) {
            console.error('❌ 无法打开新窗口,请允许弹出窗口');
            return null;
        }

        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 5000));

        try {
            const content = await newWindow Promise(async (resolve) => {
                // 尝试多种选择器提取正文
                const selectors = [
                    '[class*="note-text"]',
                    '[class*="desc-text"]',
                    '[class*="content-text"]',
                    'section[class*="note"] span[class*="text"]',
                    'div[class*="note"] div[class*="desc"]',
                    'article',
                    '.post-content',
                    '[class*="rich-text"]',
                    '[class*="note-content"]'
                ];

                let fullContent = '';
                let images = [];
                let tags = [];

                // 提取正文
                for (const selector of selectors) {
                    const elements = newWindow.document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        const texts = Array.from(elements)
                            .map(el => el.textContent?.trim())
                            .filter(text => text && text.length > 0);

                        if (texts.length > 0) {
                            fullContent = texts.join('\n\n');
                            if (fullContent.length > 50) {
                                break;
                            }
                        }
                    }
                }

                // 提取图片
                const imgElements = newWindow.document.querySelectorAll('img[class*="image"], img[class*="cover"], img[class*="note"]');
                images = Array.from(imgElements)
                    .map(img => img.src || img.getAttribute('data-src'))
                    .filter(src => src && !src.includes('logo') && !src.includes('avatar'));

                // 提取标签
                const tagElements = newWindow.document.querySelectorAll('[class*="tag"], [class*="topic"], [class*="hashtag"]');
                tags = Array.from(tagElements)
                    .map(el => el.textContent?.trim())
                    .filter(text => text && text.length > 0 && text.length < 50);

                resolve({
                    content: fullContent,
                    images: images.slice(0, 9), // 最多9张图
                    tags: [...new Set(tags)] // 去重
                });
            });

            // 关闭窗口
            newWindow.close();

            // 延迟避免请求过快
            await new Promise(resolve => setTimeout(resolve, 3000));

            return content;

        } catch (error) {
            console.error(`❌ 提取失败: ${error.message}`);
            try { newWindow.close(); } catch(e) {}
            return { content: '', images: [], tags: [] };
        }
    }

    // 批量提取笔记
    async function extractAllNotes(notesList) {
        const results = [];
        const maxNotes = Math.min(notesList.length, 20); // 限制最多20篇

        console.log(`\n📝 准备提取 ${maxNotes} 篇笔记...\n`);

        for (let i = 0; i < maxNotes; i++) {
            const note = notesList[i];
            console.log(`[${i + 1}/${maxNotes}] ${note.title || '无标题'}`);

            const extractedData = await extractSingleNote(note.url);

            if (extractedData && extractedData.content) {
                results.push({
                    ...note,
                    content: extractedData.content,
                    images: extractedData.images,
                    tags: extractedData.tags
                });
                console.log(`✓ 提取成功 (${extractedData.content.length} 字符)\n`);
            } else {
                results.push(note); // 保留原始数据
                console.log(`⚠️ 未能提取到内容,保留原数据\n`);
            }
        }

        return results;
    }

    // 输出结果
    console.log('\n═══════════════════════════════════════');
    console.log('📋 提取完成!');
    console.log('═══════════════════════════════════════\n');
    console.log('💾 使用方法:');
    console.log('1. 复制下面输出的JSON数据');
    console.log('2. 保存为 data/notes.json');
    console.log('3. 运行 npm run doc:full 生成完整文档\n');

})();
