import fs from 'fs';
import path from 'path';

/**
 * 完整笔记内容文档生成器
 * 提取所有笔记的完整内容并整合成一篇文档
 */

class FullContentDocumentGenerator {
    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.outputDir = path.join(process.cwd(), 'docs');
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    loadData() {
        const loadFile = (filename) => {
            const filePath = path.join(this.dataDir, filename);
            if (fs.existsSync(filePath)) {
                return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            }
            return [];
        };

        return {
            notes: loadFile('notes.json'),
            collections: loadFile('collections.json'),
            likes: loadFile('likes.json')
        };
    }

    /**
     * 生成完整内容文档
     */
    generateFullContentDocument() {
        const data = this.loadData();

        let markdown = '# 我的小红书笔记全集\n\n';
        markdown += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
        markdown += `> 包含 ${data.notes.length} 篇笔记的完整内容\n\n`;
        markdown += `---\n\n`;

        // 目录
        markdown += '## 目录\n\n';
        data.notes.forEach((note, index) => {
            markdown += `${index + 1}. [${note.title || '无标题'}](#${note.id || index})\n`;
        });
        markdown += '\n---\n\n';

        // 完整内容
        data.notes.forEach((note, index) => {
            markdown += `## ${index + 1}. ${note.title || '无标题'}\n\n`;

            // 元信息
            if (note.createTime) {
                markdown += `**发布时间**: ${note.createTime}\n\n`;
            }

            if (note.likes && note.likes > 0) {
                markdown += `**点赞数**: ${note.likes}\n\n`;
            }

            if (note.url) {
                markdown += `**原文链接**: ${note.url}\n\n`;
            }

            // 标签
            if (note.tags && note.tags.length > 0) {
                markdown += `**标签**: ${note.tags.join('、')}\n\n`;
            }

            // 完整内容
            if (note.content) {
                markdown += `### 内容\n\n${note.content}\n\n`;
            } else if (note.description) {
                markdown += `### 内容\n\n${note.description}\n\n`;
            }

            // 图片列表
            if (note.images && note.images.length > 0) {
                markdown += `### 图片\n\n`;
                note.images.forEach((img, i) => {
                    markdown += `![图片${i + 1}](${img})\n\n`;
                });
            }

            markdown += `---\n\n`;
        });

        return markdown;
    }

    /**
     * 生成按主题分类的完整内容
     */
    generateCategorizedFullContent() {
        const data = this.loadData();
        const notes = data.notes;

        // 按标签分类
        const categorized = {};
        notes.forEach(note => {
            const tags = note.tags || ['未分类'];
            tags.forEach(tag => {
                if (!categorized[tag]) {
                    categorized[tag] = [];
                }
                categorized[tag].push(note);
            });
        });

        let markdown = '# 我的小红书笔记全集 - 主题分类版\n\n';
        markdown += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        markdown += `---\n\n`;

        // 目录
        markdown += '## 目录\n\n';
        Object.keys(categorized).sort().forEach(tag => {
            markdown += `- [#${tag}](#${tag}) (${categorized[tag].length}篇)\n`;
        });
        markdown += '\n---\n\n';

        // 各主题内容
        Object.keys(categorized).sort().forEach(tag => {
            const tagNotes = categorized[tag];

            markdown += `# #${tag}\n\n`;
            markdown += `*本主题共 ${tagNotes.length} 篇笔记*\n\n`;

            tagNotes.forEach((note, index) => {
                markdown += `## ${index + 1}. ${note.title || '无标题'}\n\n`;

                if (note.createTime) {
                    markdown += `**发布时间**: ${note.createTime}\n\n`;
                }

                if (note.likes && note.likes > 0) {
                    markdown += `**点赞数**: ${note.likes}\n\n`;
                }

                // 完整内容
                if (note.content) {
                    markdown += `${note.content}\n\n`;
                } else if (note.description) {
                    markdown += `${note.description}\n\n`;
                }

                if (note.url) {
                    markdown += `🔗 [查看原文](${note.url})\n\n`;
                }

                markdown += `---\n\n`;
            });
        });

        return markdown;
    }

    /**
     * 生成纯文本可打印版本
     */
    generatePrintableVersion() {
        const data = this.loadData();

        let text = '我的小红书笔记全集\n';
        text += '=' .repeat(50) + '\n\n';
        text += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
        text += `共 ${data.notes.length} 篇笔记\n\n`;
        text += '=' .repeat(50) + '\n\n\n';

        data.notes.forEach((note, index) => {
            text += `${'='.repeat(50)}\n\n`;
            text += `【${index + 1}】${note.title || '无标题'}\n\n`;

            if (note.createTime) {
                text += `发布时间: ${note.createTime}\n`;
            }
            if (note.likes && note.likes > 0) {
                text += `点赞数: ${note.likes}\n`;
            }
            text += '\n';

            // 完整内容
            if (note.content) {
                text += `${note.content}\n\n`;
            } else if (note.description) {
                text += `${note.description}\n\n`;
            }

            if (note.url) {
                text += `原文链接: ${note.url}\n\n`;
            }

            text += '\n';
        });

        return text;
    }

    saveDocument(content, filename) {
        const filePath = path.join(this.outputDir, filename);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ 已生成: ${filePath}`);
        return filePath;
    }

    generateAll() {
        console.log('📝 正在生成完整内容文档...\n');

        // Markdown完整版
        const fullMd = this.generateFullContentDocument();
        this.saveDocument(fullMd, '我的小红书笔记全集-完整内容.md');

        // 分类完整版
        const categorizedMd = this.generateCategorizedFullContent();
        this.saveDocument(categorizedMd, '我的小红书笔记全集-主题分类.md');

        // 可打印文本版
        const printable = this.generatePrintableVersion();
        this.saveDocument(printable, '我的小红书笔记全集-可打印版.txt');

        console.log('\n✅ 所有文档生成完成!');
        console.log(`📁 文档保存在: ${this.outputDir}\n`);
    }
}

// 运行
const generator = new FullContentDocumentGenerator();
generator.generateAll();

export default FullContentDocumentGenerator;
