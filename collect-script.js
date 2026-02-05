// 小红书笔记收集脚本
// 使用方法:
// 1. 打开浏览器访问 https://www.xiaohongshu.com/user/profile/7410657861
// 2. 确保已登录
// 3. 按F12打开控制台
// 4. 复制本脚本到控制台并回车
// 5. 等待收集完成,复制输出的JSON数据

(async function() {
    console.log('\n🎨 开始收集小红书笔记...\n');

    const notes = [];
    const maxScrolls = 30;
    let scrollCount = 0;
    let lastCount = 0;

    function extractNotes() {
        const links = document.querySelectorAll('a[href*="/explore/"]');
        const newNotes = [];

        links.forEach(link => {
            const href = link.href;
            const match = href.match(/\/explore\/([a-zA-Z0-9]+)/);

            if (match) {
                const id = match[1];

                if (!notes.find(n => n.id === id)) {
                    const container = link.closest('[class*="note"], [class*="card"], section, article, li, div') || link;
                    const img = container.querySelector('img');
                    const titleEl = container.querySelector('[class*="title"], h1, h2, h3, span');
                    const likesEl = container.querySelector('[class*="like"], [class*="count"], [class*="liked"]');

                    const note = {
                        id: id,
                        title: titleEl?.textContent?.trim().substring(0, 100) || '无标题',
                        cover: img?.src || img?.getAttribute('data-src') || '',
                        url: href,
                        likes: parseInt(likesEl?.textContent?.trim().replace(/[^0-9]/g, '') || '0') || 0,
                        createTime: new Date().toISOString().split('T')[0]
                    };

                    notes.push(note);
                    newNotes.push(note);
                }
            }
        });

        return newNotes.length;
    }

    async function autoScroll() {
        while (scrollCount < maxScrolls) {
            scrollCount++;

            const newCount = extractNotes();
            console.log('[' + scrollCount + '/30] 已收集 ' + notes.length + ' 条笔记 (本次 +' + newCount + ')');

            if (notes.length === lastCount) {
                if (scrollCount - lastCount > 3) {
                    console.log('\n✅ 没有更多笔记了');
                    break;
                }
            } else {
                lastCount = notes.length;
            }

            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 2500));
        }

        console.log('\n═══════════════════════════════════════');
        console.log('✅ 收集完成! 共 ' + notes.length + ' 条笔记\n');

        console.log('📋 复制下面的JSON数据:');
        console.log('─────────────────────────────────────');
        console.log(JSON.stringify(notes, null, 2));
        console.log('─────────────────────────────────────\n');

        console.log('💾 保存方法:');
        console.log('1. 复制上面的JSON数据');
        console.log('2. 创建或打开 data/notes.json 文件');
        console.log('3. 粘贴数据并保存\n');

        return notes;
    }

    await autoScroll();
})();
