import fs from 'fs';
import path from 'path';

/**
 * 笔记文档生成器
 * 将小红书笔记整理成可读的文档
 */

class NoteDocumentGenerator {
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

    /**
     * 加载所有数据
     */
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
     * 生成Markdown文档
     */
    generateMarkdown() {
        const data = this.loadData();

        let markdown = '# 我的小红书笔记集\n\n';
        markdown += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        markdown += `---\n\n`;

        // 统计信息
        markdown += '## 📊 统计信息\n\n';
        markdown += `- 📝 我的笔记: ${data.notes.length} 篇\n`;
        markdown += `- ⭐ 我的收藏: ${data.collections.length} 篇\n`;
        markdown += `- ❤️ 我的点赞: ${data.likes.length} 篇\n\n`;
        markdown += `---\n\n`;

        // 我的笔记
        if (data.notes.length > 0) {
            markdown += '## 📝 我的笔记\n\n';
            markdown += this.generateNotesSection(data.notes);
        }

        // 我的收藏
        if (data.collections.length > 0) {
            markdown += '## ⭐ 我的收藏\n\n';
            markdown += this.generateNotesSection(data.collections);
        }

        // 我的点赞
        if (data.likes.length > 0) {
            markdown += '## ❤️ 我的点赞\n\n';
            markdown += this.generateNotesSection(data.likes);
        }

        return markdown;
    }

    /**
     * 生成笔记章节
     */
    generateNotesSection(notes) {
        let content = '';

        notes.forEach((note, index) => {
            content += `### ${index + 1}. ${note.title || '无标题'}\n\n`;

            if (note.content || note.description) {
                content += `${note.content || note.description}\n\n`;
            }

            // 元数据
            const metadata = [];
            if (note.likes && note.likes > 0) metadata.push(`❤️ ${note.likes}`);
            if (note.collects && note.collects > 0) metadata.push(`⭐ ${note.collects}`);
            if (note.comments && note.comments > 0) metadata.push(`💬 ${note.comments}`);
            if (note.createTime) metadata.push(`📅 ${note.createTime}`);

            if (metadata.length > 0) {
                content += `${metadata.join(' | ')}\n\n`;
            }

            // 标签
            if (note.tags && note.tags.length > 0) {
                content += `**标签**: ${note.tags.map(tag => `#${tag}`).join(' ')}\n\n`;
            }

            // 链接
            if (note.url) {
                content += `🔗 [查看原文](${note.url})\n\n`;
            }

            content += `---\n\n`;
        });

        return content;
    }

    /**
     * 生成分类汇总文档
     */
    generateCategorizedDoc() {
        const data = this.loadData();
        const allNotes = [
            ...data.notes.map(n => ({...n, source: '我的笔记'})),
            ...data.collections.map(n => ({...n, source: '我的收藏'})),
            ...data.likes.map(n => ({...n, source: '我的点赞'}))
        ];

        // 按标签分类
        const categorized = {};
        allNotes.forEach(note => {
            const tags = note.tags || ['未分类'];
            tags.forEach(tag => {
                if (!categorized[tag]) {
                    categorized[tag] = [];
                }
                categorized[tag].push(note);
            });
        });

        let markdown = '# 我的小红书笔记 - 按主题分类\n\n';
        markdown += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        markdown += `---\n\n`;

        // 按标签数量排序
        const sortedTags = Object.keys(categorized).sort((a, b) => {
            return categorized[b].length - categorized[a].length;
        });

        sortedTags.forEach(tag => {
            const notes = categorized[tag];
            markdown += `## #${tag} (${notes.length} 篇)\n\n`;

            notes.forEach((note, index) => {
                markdown += `### ${index + 1}. ${note.title || '无标题'}\n\n`;
                markdown += `- **来源**: ${note.source}\n`;
                if (note.url) markdown += `- **链接**: [查看原文](${note.url})\n`;
                if (note.likes) markdown += `- **点赞**: ${note.likes}\n`;
                markdown += `\n`;
            });

            markdown += `---\n\n`;
        });

        return markdown;
    }

    /**
     * 生成精选合集
     */
    generateFeaturedDoc() {
        const data = this.loadData();
        const allNotes = [
            ...data.notes.map(n => ({...n, source: '我的笔记'})),
            ...data.collections.map(n => ({...n, source: '我的收藏'})),
            ...data.likes.map(n => ({...n, source: '我的点赞'}))
        ];

        let markdown = '# ✨ 精选笔记集\n\n';
        markdown += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        markdown += `---\n\n`;

        // 最受欢迎TOP10
        const mostLiked = [...allNotes]
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, 10);

        markdown += '## 🔥 最受欢迎 TOP 10\n\n';
        mostLiked.forEach((note, index) => {
            markdown += `${index + 1}. **${note.title || '无标题'}**\n`;
            markdown += `   - ❤️ ${note.likes || 0} 个赞\n`;
            markdown += `   - 📚 ${note.source}\n`;
            if (note.url) markdown += `   - 🔗 [查看](${note.url})\n`;
            markdown += `\n`;
        });

        markdown += `---\n\n`;

        // 最新笔记
        const latestNotes = [...allNotes]
            .sort((a, b) => new Date(b.createTime || 0) - new Date(a.createTime || 0))
            .slice(0, 10);

        markdown += '## 🆕 最新笔记\n\n';
        latestNotes.forEach((note, index) => {
            markdown += `${index + 1}. **${note.title || '无标题'}**\n`;
            markdown += `   - 📅 ${note.createTime || '未知日期'}\n`;
            markdown += `   - 📚 ${note.source}\n`;
            if (note.url) markdown += `   - 🔗 [查看](${note.url})\n`;
            markdown += `\n`;
        });

        return markdown;
    }

    /**
     * 保存文档
     */
    saveDocument(content, filename) {
        const filePath = path.join(this.outputDir, filename);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ 已生成: ${filePath}`);
        return filePath;
    }

    /**
     * 生成所有文档
     */
    generateAll() {
        console.log('📝 正在生成文档...\n');

        // 完整合集
        const fullDoc = this.generateMarkdown();
        this.saveDocument(fullDoc, '我的小红书笔记集.md');

        // 分类文档
        const categorizedDoc = this.generateCategorizedDoc();
        this.saveDocument(categorizedDoc, '按主题分类.md');

        // 精选合集
        const featuredDoc = this.generateFeaturedDoc();
        this.saveDocument(featuredDoc, '精选笔记集.md');

        console.log('\n✅ 所有文档生成完成!');
        console.log(`📁 文档保存在: ${this.outputDir}\n`);
    }
}

// 运行
const generator = new NoteDocumentGenerator();
generator.generateAll();

export default NoteDocumentGenerator;
