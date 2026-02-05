// ========== 小红书笔记完整内容提取脚本 ==========
//
// 使用方法:
// 1. 在你已登录的小红书浏览器中,打开第一篇笔记
// 2. 按F12打开控制台
// 3. 复制整个脚本到控制台并运行
// 4. 按照提示操作即可
// =========================================

(async function() {
    // 从项目读取笔记列表
    const response = await fetch('data/notes.json');
    const notes = await response.json();
    const notesList = notes.map(n => ({
        url: n.url,
        title: n.title || '无标题'
    }));

    let extractedNotes = [];
    let currentIndex = 0;

    // 提取当前页面内容
    function extractCurrentPage() {
        console.clear();
        console.log('📝 正在提取当前页面...\n');

        // 获取标题
        const titleEl = document.querySelector('[class*="title"], h1, h2');
        const title = titleEl ? titleEl.innerText.trim() : document.title.split('-')[0].trim();

        // 获取正文
        let content = '';
        const selectors = [
            '[class*="note-text"]',
            '[class*="desc-text"]',
            '[class*="content-text"]',
            'section[class*="note"] div[class*="text"]',
            'article[class*="note"]',
            'div[class*="rich-text"]',
            'div[class*="note-content"]',
            'article p',
            '[class*="main-content"] p'
        ];

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                const texts = Array.from(elements)
                    .map(el => {
                        const cloned = el.cloneNode(true);
                        cloned.querySelectorAll('script, style, nav, footer, header').forEach(s => s.remove());
                        return cloned.innerText.trim();
                    })
                    .filter(text => text && text.length > 20)
                    .join('\n\n');

                if (texts.length > content.length) {
                    content = texts;
                }
            }
        }

        // 获取图片
        const imgElements = document.querySelectorAll('img');
        const images = Array.from(imgElements)
            .map(img => img.src || img.getAttribute('data-src'))
            .filter(src => src && (src.includes('sns-webpic') || src.includes('xhscdn')))
            .slice(0, 9);

        // 保存结果
        const result = {
            url: window.location.href,
            title: title,
            content: content,
            images: images,
            extractedAt: new Date().toISOString()
        };

        extractedNotes.push(result);

        console.log('═════════════════════════════');
        console.log('✅ 提取完成!');
        console.log('═════════════════════════════\n');
        console.log('📊 进度: ' + extractedNotes.length + '/' + notesList.length);
        console.log('📝 标题: ' + title);
        console.log('📏 内容长度: ' + content.length + ' 字符');
        console.log('🖼️ 图片数: ' + images.length);
        console.log('\n');

        // 显示当前提取的内容预览
        if (content.length > 0) {
            console.log('─────────────────────────────────────');
            console.log('📄 内容预览:');
            console.log('─────────────────────────────────────\n');
            console.log(content.substring(0, 300));
            if (content.length > 300) {
                console.log('...\n(内容已截断,完整内容已保存)\n');
            }
        }

        return result;
    }

    // 显示操作提示
    function showPrompt() {
        console.clear();
        console.log('\n═══════════════════════════════════════');
        console.log('📝 小红书笔记提取工具');
        console.log('═══════════════════════════════════════\n');
        console.log('📊 总进度: ' + extractedNotes.length + '/' + notesList.length);
        console.log('📁 当前是第 ' + (currentIndex + 1) + ' 篇笔记\n');

        if (currentIndex < notesList.length) {
            const note = notesList[currentIndex];
            console.log('─────────────────────────────────────');
            console.log('📋 下一步操作:');
            console.log('─────────────────────────────────────\n');
            console.log('1. 在浏览器中访问:\n   ' + note.url + '\n');
            console.log('2. 标题: ' + note.title + '\n');
            console.log('3. 页面加载完成后,在控制台输入:\n   extract()\n');
            console.log('4. 等待提取完成\n');
            console.log('═══════════════════════════════════════\n');
        } else {
            console.log('═══════════════════════════════════════');
            console.log('🎉 全部提取完成!');
            console.log('═══════════════════════════════════════\n');
            console.log('📋 复制下面的JSON数据:\n');
            console.log('─────────────────────────────────────\n');
            console.log(JSON.stringify(extractedNotes, null, 2));
            console.log('\n─────────────────────────────────────\n');
        }
    }

    // 提取函数
    window.extract = function() {
        const result = extractCurrentPage();
        currentIndex++;
        showPrompt();
    };

    // 显示JSON数据
    window.showJSON = function() {
        console.log('\n═══════════════════════════════════════');
        console.log('📋 已提取的笔记数据 (JSON格式)');
        console.log('═══════════════════════════════════════\n');
        console.log(JSON.stringify(extractedNotes, null, 2));
        console.log('\n═══════════════════════════════════════\n');
    };

    // 保存到本地存储
    window.saveData = function() {
        localStorage.setItem('xhs_extracted_notes', JSON.stringify(extractedNotes));
        console.log('\n✅ 数据已保存到浏览器本地存储\n');
        console.log('💡 刷新页面后可使用 loadData() 恢复数据\n');
    };

    // 从本地存储加载
    window.loadData = function() {
        const data = localStorage.getItem('xhs_extracted_notes');
        if (data) {
            extractedNotes = JSON.parse(data);
            currentIndex = extractedNotes.length;
            console.log('\n✅ 已恢复数据\n');
            console.log('📊 当前进度: ' + currentIndex + '/' + notesList.length + '\n');
            showPrompt();
        } else {
            console.log('\n⚠️  未找到保存的数据\n');
        }
    };

    // 初始化
    console.log('\n✅ 提取工具已加载!\n');
    console.log('💡 可用命令:');
    console.log('   extract()  - 提取当前页面内容');
    console.log('   showJSON() - 显示已提取的数据');
    console.log('   saveData() - 保存数据到本地存储');
    console.log('   loadData() - 从本地存储恢复数据\n');

    showPrompt();

})();
