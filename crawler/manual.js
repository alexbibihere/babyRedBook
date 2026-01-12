import fs from 'fs';
import path from 'path';
import readline from 'readline';

/**
 * 手动数据收集工具
 * 通过浏览器控制台收集小红书数据
 */

class ManualCollector {
    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.initDataDir();
    }

    initDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    /**
     * 生成浏览器控制台脚本
     */
    generateBrowserScript() {
        return `
// 小红书数据收集脚本
// 在你的小红书个人主页运行此脚本

(function() {
    const notes = [];
    let scrollCount = 0;
    const maxScrolls = 20;

    async function collectNotes() {
        console.log('🎨 开始收集笔记...');

        async function scrollAndCollect() {
            // 获取当前页面所有笔记链接
            const noteLinks = document.querySelectorAll('a[href*="/explore/"]');
            const currentIds = new Set(notes.map(n => n.id));

            noteLinks.forEach(link => {
                const href = link.href;
                const id = href.split('/explore/').pop().split('?')[0];

                if (id && !currentIds.has(id)) {
                    const container = link.closest('[class*="note"], [class*="card"], section, article') || link;
                    const img = container.querySelector('img');
                    const titleEl = container.querySelector('[class*="title"], h1, h2, h3');
                    const likesEl = container.querySelector('[class*="like"], [class*="count"], [class*="interact"]');

                    notes.push({
                        id: id,
                        title: titleEl?.textContent?.trim().substring(0, 100) || '无标题',
                        cover: img?.src || img?.getAttribute('data-src') || '',
                        url: href,
                        likes: parseInt(likesEl?.textContent?.trim().replace(/[^0-9]/g, '') || '0') || 0,
                        createTime: new Date().toISOString().split('T')[0]
                    });
                }
            });

            console.log(\`已收集 \${notes.length} 条笔记\`);

            // 滚动到底部
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 2000));

            scrollCount++;
            if (scrollCount < maxScrolls) {
                await scrollAndCollect();
            }
        }

        await scrollAndCollect();

        // 输出结果
        console.log('\\n✅ 收集完成！共 ' + notes.length + ' 条笔记');
        console.log('\\n请复制以下数据到 notes.json 文件:');
        console.log(JSON.stringify(notes, null, 2));

        return notes;
    }

    collectNotes();
})();
        `;
    }

    /**
     * 显示使用说明
     */
    showInstructions() {
        console.log('\n📖 小红书数据收集指南\n');
        console.log('由于小红书的反爬虫机制,我们提供手动收集方式:\n');
        console.log('步骤:\n');
        console.log('1. 打开浏览器,访问小红书网站并登录');
        console.log('2. 访问你的个人主页: https://www.xiaohongshu.com/user/profile/7410657861');
        console.log('3. 按F12打开开发者工具,切换到"控制台"(Console)');
        console.log('4. 复制下面的脚本到控制台并运行');
        console.log('5. 等待脚本运行完成');
        console.log('6. 复制输出的JSON数据');
        console.log('7. 将数据保存到 data/notes.json 文件\n');
        console.log('════════════════════════════════════════════════════\n');
        console.log(this.generateBrowserScript());
        console.log('\n════════════════════════════════════════════════════\n');
    }

    /**
     * 保存收集到的数据
     */
    saveNotes(notesData) {
        try {
            const notes = typeof notesData === 'string' ? JSON.parse(notesData) : notesData;

            fs.writeFileSync(
                path.join(this.dataDir, 'notes.json'),
                JSON.stringify(notes, null, 2),
                'utf-8'
            );

            console.log(`\n✅ 已保存 ${notes.length} 条笔记到 data/notes.json`);
            console.log('\n📝 下一步: 在浏览器中打开 index.html 查看笔记展示\n');

            return true;
        } catch (error) {
            console.error('❌ 保存失败:', error.message);
            return false;
        }
    }

    /**
     * 创建空的数据文件
     */
    createEmptyFiles() {
        const empty = [];
        fs.writeFileSync(path.join(this.dataDir, 'notes.json'), JSON.stringify(empty, null, 2));
        fs.writeFileSync(path.join(this.dataDir, 'collections.json'), JSON.stringify(empty, null, 2));
        fs.writeFileSync(path.join(this.dataDir, 'likes.json'), JSON.stringify(empty, null, 2));
        console.log('✅ 已创建空的数据文件\n');
    }
}

// 主程序
async function main() {
    const collector = new ManualCollector();

    console.log('🎨 小红书手动数据收集工具\n');

    // 显示使用说明
    collector.showInstructions();

    console.log('💡 提示: 你也可以稍后运行 node crawler/manual.js 查看此说明\n');
}

main().catch(console.error);

export default ManualCollector;
