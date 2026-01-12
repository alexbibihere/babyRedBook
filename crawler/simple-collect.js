import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║          小红书笔记数据收集 - 浏览器控制台方法           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📌 步骤说明:\n');
console.log('1. 打开浏览器访问: https://www.xiaohongshu.com/user/profile/7410657861');
console.log('2. 确保已登录你的账号');
console.log('3. 按 F12 打开开发者工具,切换到"控制台"(Console)');
console.log('4. 复制下面的脚本,粘贴到控制台并回车');
console.log('5. 等待收集完成');
console.log('6. 复制输出的JSON数据');
console.log('7. 保存为 data/notes.json\n');

console.log('════════════════════════════════════════════════════════════\n');
console.log('📜 收集脚本(复制下面所有内容):\n');

const script = `
(async function() {
    console.log('\\n🎨 开始收集小红书笔记...\\n');

    const notes = [];
    const maxScrolls = 30;
    let scrollCount = 0;
    let lastCount = 0;

    function extractNotes() {
        const links = document.querySelectorAll('a[href*="/explore/"]');
        const newNotes = [];

        links.forEach(link => {
            const href = link.href;
            const match = href.match(/\\/explore\\/([a-zA-Z0-9]+)/);

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
                    console.log('\\n✅ 没有更多笔记了');
                    break;
                }
            } else {
                lastCount = notes.length;
            }

            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 2500));
        }

        console.log('\\n═══════════════════════════════════════');
        console.log('✅ 收集完成! 共 ' + notes.length + ' 条笔记\\n');

        console.log('📋 复制下面的JSON数据:');
        console.log('─────────────────────────────────────');
        console.log(JSON.stringify(notes, null, 2));
        console.log('─────────────────────────────────────\\n');

        console.log('💾 保存方法:');
        console.log('1. 复制上面的JSON数据');
        console.log('2. 创建或打开 data/notes.json 文件');
        console.log('3. 粘贴数据并保存\\n');

        return notes;
    }

    await autoScroll();
})();
`;

console.log(script);
console.log('\n────────────────────────────────────────────────────────────\n');
console.log('💡 提示: 脚本会自动滚动并收集,完成后复制JSON数据保存\n');
