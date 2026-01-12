import fs from 'fs';
import path from 'path';
import readline from 'readline';

/**
 * 小红书数据导入工具
 * 提供多种方式导入你的小红书数据
 */

class DataImporter {
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
     * 从JSON文件导入数据
     */
    importFromJSON(filePath, type) {
        try {
            const fullPath = path.resolve(filePath);
            if (!fs.existsSync(fullPath)) {
                console.log(`❌ 文件不存在: ${fullPath}`);
                return [];
            }

            const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            console.log(`✅ 成功从 ${filePath} 导入 ${data.length} 条${this.getTypeName(type)}`);
            return data;
        } catch (error) {
            console.error(`❌ 导入失败:`, error.message);
            return [];
        }
    }

    /**
     * 保存数据
     */
    saveData(notes, collections, likes) {
        console.log('\n💾 正在保存数据...\n');

        if (notes.length > 0) {
            fs.writeFileSync(
                path.join(this.dataDir, 'notes.json'),
                JSON.stringify(notes, null, 2),
                'utf-8'
            );
            console.log(`✓ 笔记: ${notes.length} 条`);
        }

        if (collections.length > 0) {
            fs.writeFileSync(
                path.join(this.dataDir, 'collections.json'),
                JSON.stringify(collections, null, 2),
                'utf-8'
            );
            console.log(`✓ 收藏: ${collections.length} 条`);
        }

        if (likes.length > 0) {
            fs.writeFileSync(
                path.join(this.dataDir, 'likes.json'),
                JSON.stringify(likes, null, 2),
                'utf-8'
            );
            console.log(`✓ 点赞: ${likes.length} 条`);
        }

        console.log(`\n📁 数据已保存到: ${this.dataDir}\n`);
    }

    /**
     * 创建示例数据
     */
    createSampleData() {
        const sampleData = {
            notes: [
                {
                    id: 'sample001',
                    title: '示例笔记 - 如何使用小红书笔记收集器',
                    content: '这是一个示例笔记,展示数据格式。你可以通过以下方式导入你的真实数据:\n\n1. 从小红书导出JSON文件\n2. 手动整理数据格式\n3. 使用浏览器扩展导出',
                    description: '这是一个示例笔记',
                    images: [
                        'https://picsum.photos/400/300?random=1',
                        'https://picsum.photos/400/300?random=2'
                    ],
                    cover: 'https://picsum.photos/400/300?random=1',
                    tags: ['教程', '示例', '小红书'],
                    url: 'https://www.xiaohongshu.com/explore/sample001',
                    createTime: '2024-01-11',
                    likes: 100,
                    collects: 50,
                    comments: 20,
                    author: {
                        id: '7410657861',
                        nickname: '示例用户',
                        avatar: 'https://via.placeholder.com/100'
                    }
                },
                {
                    id: 'sample002',
                    title: '美好生活记录',
                    content: '分享生活中的美好瞬间,记录每一天的快乐时光。让我们一起发现生活中的小确幸!',
                    description: '分享生活中的美好瞬间',
                    images: [
                        'https://picsum.photos/400/300?random=3'
                    ],
                    cover: 'https://picsum.photos/400/300?random=3',
                    tags: ['生活', '分享', '日常'],
                    url: 'https://www.xiaohongshu.com/explore/sample002',
                    createTime: '2024-01-10',
                    likes: 256,
                    collects: 89,
                    comments: 45,
                    author: {
                        id: '7410657861',
                        nickname: '示例用户',
                        avatar: 'https://via.placeholder.com/100'
                    }
                }
            ],
            collections: [
                {
                    id: 'col001',
                    title: '收藏的美食教程',
                    content: '超详细的美食制作教程,收藏起来慢慢学!',
                    description: '美食制作教程',
                    images: [
                        'https://picsum.photos/400/300?random=4'
                    ],
                    cover: 'https://picsum.photos/400/300?random=4',
                    tags: ['美食', '教程'],
                    url: 'https://www.xiaohongshu.com/explore/col001',
                    collectTime: '2024-01-09',
                    likes: 520,
                    collects: 128
                }
            ],
            likes: [
                {
                    id: 'like001',
                    title: '旅行摄影技巧分享',
                    content: '教你拍出大片感的旅行照片!',
                    description: '旅行摄影技巧',
                    images: [
                        'https://picsum.photos/400/300?random=5'
                    ],
                    cover: 'https://picsum.photos/400/300?random=5',
                    tags: ['摄影', '旅行'],
                    url: 'https://www.xiaohongshu.com/explore/like001',
                    likeTime: '2024-01-08',
                    likes: 1024,
                    collects: 256
                }
            ]
        };

        return sampleData;
    }

    getTypeName(type) {
        const names = {
            notes: '笔记',
            collections: '收藏',
            likes: '点赞'
        };
        return names[type] || '数据';
    }

    /**
     * 显示使用指南
     */
    showGuide() {
        console.log('\n📖 数据导入指南\n');
        console.log('由于小红书API限制,我们提供以下几种导入数据的方式:\n');
        console.log('方式1: 使用示例数据');
        console.log('  - 直接生成示例数据用于测试\n');
        console.log('方式2: 手动导入JSON');
        console.log('  - 准备符合格式的JSON文件');
        console.log('  - 运行: node crawler/import.js manual <文件路径> <类型>\n');
        console.log('方式3: 浏览器控制台导出');
        console.log('  1. 打开小红书网页版');
        console.log('  2. 打开浏览器开发者工具(F12)');
        console.log('  3. 在控制台运行导出脚本');
        console.log('  4. 将导出的数据保存为JSON文件\n');
        console.log('数据格式示例:');
        console.log(JSON.stringify(this.createSampleData().notes[0], null, 2));
        console.log('\n----------------------------------------\n');
    }
}

// 主程序
async function main() {
    const importer = new DataImporter();
    const args = process.argv.slice(2);

    console.log('📥 小红书数据导入工具\n');

    const command = args[0];

    switch (command) {
        case 'manual':
            // 手动导入: node import.js manual <文件路径> <类型>
            const filePath = args[1];
            const type = args[2] || 'notes';

            if (!filePath) {
                console.log('❌ 请指定文件路径');
                console.log('用法: node crawler/import.js manual <文件路径> [notes|collections|likes]');
                break;
            }

            const data = importer.importFromJSON(filePath, type);
            if (data.length > 0) {
                if (type === 'notes') {
                    importer.saveData(data, [], []);
                } else if (type === 'collections') {
                    importer.saveData([], data, []);
                } else if (type === 'likes') {
                    importer.saveData([], [], data);
                }
            }
            break;

        case 'sample':
            // 生成示例数据
            console.log('🎨 正在生成示例数据...\n');
            const sampleData = importer.createSampleData();
            importer.saveData(sampleData.notes, sampleData.collections, sampleData.likes);
            console.log('✅ 示例数据生成完成!');
            console.log('💡 现在可以在浏览器中打开 index.html 查看效果\n');
            break;

        default:
            // 显示帮助
            importer.showGuide();
            console.log('可用命令:');
            console.log('  node crawler/import.js sample    - 生成示例数据');
            console.log('  node crawler/import.js manual <文件路径> [类型] - 手动导入JSON文件');
            console.log('\n示例:');
            console.log('  node crawler/import.js sample');
            console.log('  node crawler/import.js manual my-notes.json notes');
            console.log('');
            break;
    }
}

main().catch(console.error);

export default DataImporter;
