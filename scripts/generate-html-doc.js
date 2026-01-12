import fs from 'fs';
import path from 'path';

const notesFile = path.join(process.cwd(), 'data', 'notes-cleaned.json');
const outputFile = path.join(process.cwd(), 'docs', '我的小红书笔记-完整版.html');

console.log('\n═══════════════════════════════════════');
console.log('📝 生成网页文档');
console.log('═══════════════════════════════════════\n');

// 读取数据
let notes;
try {
    notes = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));
} catch (error) {
    console.log('⚠️  合并数据文件不存在,使用原始 notes.json');
    notes = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'notes.json'), 'utf-8'));
}

console.log(`📚 笔记数量: ${notes.length}\n`);

// 生成 HTML
let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的小红书笔记全集</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        header {
            background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            margin-bottom: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(255, 36, 66, 0.3);
        }

        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        header .meta {
            font-size: 1.1em;
            opacity: 0.95;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .stat-card .number {
            font-size: 2em;
            font-weight: bold;
            color: #ff2442;
        }

        .stat-card .label {
            color: #666;
            margin-top: 5px;
        }

        .toc {
            background: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .toc h2 {
            color: #ff2442;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ff2442;
        }

        .toc ul {
            list-style: none;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 10px;
        }

        .toc li a {
            color: #333;
            text-decoration: none;
            padding: 8px 12px;
            display: block;
            border-radius: 5px;
            transition: all 0.3s;
        }

        .toc li a:hover {
            background: #fff0f2;
            color: #ff2442;
        }

        .note {
            background: white;
            padding: 30px;
            margin-bottom: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            scroll-margin-top: 20px;
        }

        .note h2 {
            color: #ff2442;
            margin-bottom: 20px;
            font-size: 1.8em;
        }

        .note-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
        }

        .note-meta span {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .note-meta .icon {
            font-size: 1.2em;
        }

        .note-content {
            margin-bottom: 20px;
        }

        .note-content h3 {
            color: #ff2442;
            margin-bottom: 15px;
            font-size: 1.3em;
        }

        .content-text {
            background: #fff9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ff2442;
            white-space: pre-wrap;
            line-height: 1.8;
        }

        .images-section {
            margin-top: 30px;
        }

        .images-section h3 {
            color: #ff2442;
            margin-bottom: 15px;
            font-size: 1.3em;
        }

        .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        .image-item {
            background: #f9f9f9;
            border-radius: 8px;
            overflow: hidden;
        }

        .image-item img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-text {
            padding: 15px;
        }

        .image-text h4 {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 10px;
        }

        .image-text p {
            background: white;
            padding: 12px;
            border-radius: 5px;
            font-size: 0.95em;
            line-height: 1.6;
            white-space: pre-wrap;
        }

        .confidence {
            display: inline-block;
            background: #e8f5e9;
            color: #2e7d32;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.85em;
            margin-top: 8px;
        }

        .no-ocr {
            color: #999;
            font-style: italic;
        }

        footer {
            text-align: center;
            padding: 30px;
            color: #666;
            background: white;
            border-radius: 10px;
            margin-top: 30px;
        }

        @media (max-width: 768px) {
            header h1 {
                font-size: 1.8em;
            }

            .note {
                padding: 20px;
            }

            .images-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📚 我的小红书笔记全集</h1>
            <div class="meta">
                <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
                <p>共收录 ${notes.length} 篇精华笔记</p>
            </div>
        </header>

        <div class="stats">
            <div class="stat-card">
                <div class="number">${notes.length}</div>
                <div class="label">总笔记数</div>
            </div>
            <div class="stat-card">
                <div class="number">${notes.reduce((sum, n) => sum + parseInt(n.likes || 0), 0).toLocaleString()}</div>
                <div class="label">总点赞数</div>
            </div>
            <div class="stat-card">
                <div class="number">${[...new Set(notes.map(n => n.author).filter(Boolean))].length}</div>
                <div class="label">作者数</div>
            </div>
        </div>

        <div class="toc">
            <h2>📋 目录</h2>
            <ul>
`;

// 生成目录
notes.forEach((note, index) => {
    const title = note.title || '无标题';
    html += `                <li><a href="#note-${index + 1}">${index + 1}. ${title}</a></li>\n`;
});

html += `            </ul>
        </div>

`;

// 生成每篇笔记
notes.forEach((note, index) => {
    html += `        <div class="note" id="note-${index + 1}">
            <h2>${index + 1}. ${note.title || '无标题'}</h2>

            <div class="note-meta">
`;

    if (note.author) {
        html += `                <span><span class="icon">✍️</span> ${note.author}</span>\n`;
    }

    if (note.likes) {
        html += `                <span><span class="icon">❤️</span> ${note.likes} 点赞</span>\n`;
    }

    if (note.url) {
        html += `                <span><span class="icon">🔗</span> <a href="${note.url}" target="_blank">查看原文</a></span>\n`;
    }

    html += `            </div>

`;

    // 内容部分
    if (note.content && note.content.length > 50) {
        html += `            <div class="note-content">
                <h3>📄 正文内容</h3>
                <div class="content-text">${note.content}</div>
            </div>

`;
    }

    // 图片和 OCR 部分
    if (note.imageTexts && note.imageTexts.length > 0) {
        html += `            <div class="images-section">
                <h3>📷 图片与识别文字 (${note.imageTexts.length} 张)</h3>
                <div class="images-grid">
`;

        note.imageTexts.forEach((img, i) => {
            if (img.text && img.text.length > 0) {
                html += `                    <div class="image-item">
                        <img src="${img.url}" alt="${note.title} - 图片${i + 1}" loading="lazy">
                        <div class="image-text">
                            <h4>📝 图片 ${i + 1} - 识别文字</h4>
                            <p>${img.text}</p>
                            <span class="confidence">置信度: ${(img.confidence * 100).toFixed(1)}%</span>
                        </div>
                    </div>
`;
            } else {
                html += `                    <div class="image-item">
                        <img src="${img.url}" alt="${note.title} - 图片${i + 1}" loading="lazy">
                        <div class="image-text">
                            <h4>📝 图片 ${i + 1}</h4>
                            <p class="no-ocr">未识别到文字</p>
                        </div>
                    </div>
`;
            }
        });

        html += `                </div>
            </div>

`;
    }

    html += `        </div>

`;
});

// 页脚
html += `        <footer>
            <p>📖 本文档由自动生成工具创建</p>
            <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
            <p>数据来源: 小红书</p>
        </footer>
    </div>
</body>
</html>`;

// 保存文件
fs.writeFileSync(outputFile, html, 'utf-8');

console.log('✅ 网页文档生成完成!');
console.log(`📁 保存位置: ${outputFile}\n`);

// 统计信息
const totalLikes = notes.reduce((sum, n) => sum + parseInt(n.likes || 0), 0);
const authors = [...new Set(notes.map(n => n.author).filter(Boolean))];

console.log('📊 统计信息:');
console.log(`   - 总笔记数: ${notes.length}`);
console.log(`   - 总点赞数: ${totalLikes.toLocaleString()}`);
console.log(`   - 作者数: ${authors.length}\n`);

console.log('🌐 在浏览器中打开查看:');
console.log(`   file:///${outputFile.replace(/\\/g, '/')}\n`);
