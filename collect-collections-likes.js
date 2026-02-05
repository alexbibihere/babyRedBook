// 小红书收藏和点赞收集脚本
// 使用方法:
// 1. 打开浏览器访问 https://www.xiaohongshu.com/user/profile/7410657861
// 2. 确保已登录
// 3. 按F12打开控制台
// 4. 复制本脚本到控制台并回车
// 5. 等待收集完成,复制输出的JSON数据

(async function() {
    console.log('\n🎨 开始收集小红书收藏和点赞...\n');

    const collections = [];
    const likes = [];
    let scrollCount = 0;
    const maxScrolls = 30;

    // 提取笔记的通用函数
    function extractNotesFromLinks(links, targetArray) {
        links.forEach(link => {
            const href = link.href;
            const match = href.match(/\/explore\/([a-zA-Z0-9]+)/);

            if (match) {
                const id = match[1];

                if (!targetArray.find(n => n.id === id)) {
                    const container = link.closest('[class*="note"], [class*="card"], section, article, li, div') || link;
                    const img = container.querySelector('img');
                    const titleEl = container.querySelector('[class*="title"], h1, h2, h3, span');
                    const likesEl = container.querySelector('[class*="like"], [class*="count"], [class*="liked"]');
                    const authorEl = container.querySelector('[class*="author"], [class*="user"], [class*="nickname"]');
                    const descEl = container.querySelector('[class*="desc"], [class*="content"]');

                    const note = {
                        id: id,
                        title: titleEl?.textContent?.trim().substring(0, 100) || '无标题',
                        cover: img?.src || img?.getAttribute('data-src') || '',
                        content: descEl?.textContent?.trim().substring(0, 200) || '',
                        url: href,
                        likes: parseInt(likesEl?.textContent?.trim().replace(/[^0-9]/g, '') || '0') || 0,
                        author: authorEl?.textContent?.trim() || '',
                        createTime: new Date().toISOString().split('T')[0]
                    };

                    targetArray.push(note);
                }
            }
        });
    }

    // 收集收藏
    async function collectCollections() {
        console.log('⭐ 开始收集收藏...\n');

        // 点击收藏标签
        const collectionsTab = Array.from(document.querySelectorAll('button, a, div')).find(el =>
            el.textContent.includes('收藏') || el.textContent.includes('Collections')
        );

        if (collectionsTab) {
            collectionsTab.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        let lastCount = 0;
        scrollCount = 0;

        while (scrollCount < maxScrolls) {
            scrollCount++;

            const links = document.querySelectorAll('a[href*="/explore/"]');
            const beforeCount = collections.length;
            extractNotesFromLinks(links, collections);
            const newCount = collections.length - beforeCount;

            console.log('[收藏 ' + scrollCount + '/30] 已收集 ' + collections.length + ' 条 (本次 +' + newCount + ')');

            if (collections.length === lastCount) {
                if (scrollCount - lastCount > 3) {
                    console.log('\n✅ 没有更多收藏了');
                    break;
                }
            } else {
                lastCount = collections.length;
            }

            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 2500));
        }

        console.log('\n✅ 收藏收集完成! 共 ' + collections.length + ' 条\n');
    }

    // 收集点赞
    async function collectLikes() {
        console.log('❤️ 开始收集点赞...\n');

        // 点击点赞标签
        const likesTab = Array.from(document.querySelectorAll('button, a, div')).find(el =>
            el.textContent.includes('点赞') || el.textContent.includes('Likes')
        );

        if (likesTab) {
            likesTab.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        let lastCount = 0;
        scrollCount = 0;

        while (scrollCount < maxScrolls) {
            scrollCount++;

            const links = document.querySelectorAll('a[href*="/explore/"]');
            const beforeCount = likes.length;
            extractNotesFromLinks(links, likes);
            const newCount = likes.length - beforeCount;

            console.log('[点赞 ' + scrollCount + '/30] 已收集 ' + likes.length + ' 条 (本次 +' + newCount + ')');

            if (likes.length === lastCount) {
                if (scrollCount - lastCount > 3) {
                    console.log('\n✅ 没有更多点赞了');
                    break;
                }
            } else {
                lastCount = likes.length;
            }

            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 2500));
        }

        console.log('\n✅ 点赞收集完成! 共 ' + likes.length + ' 条\n');
    }

    // 执行收集
    await collectCollections();
    await collectLikes();

    // 输出结果
    console.log('\n═══════════════════════════════════════');
    console.log('✅ 全部收集完成!');
    console.log('⭐ 收藏: ' + collections.length + ' 条');
    console.log('❤️ 点赞: ' + likes.length + ' 条\n');

    console.log('📋 收藏数据 (collections.json):');
    console.log('─────────────────────────────────────');
    console.log(JSON.stringify(collections, null, 2));
    console.log('─────────────────────────────────────\n');

    console.log('📋 点赞数据 (likes.json):');
    console.log('─────────────────────────────────────');
    console.log(JSON.stringify(likes, null, 2));
    console.log('─────────────────────────────────────\n');

    console.log('💾 保存方法:');
    console.log('1. 分别复制上面的JSON数据');
    console.log('2. 保存为 data/collections.json');
    console.log('3. 保存为 data/likes.json\n');

})();
