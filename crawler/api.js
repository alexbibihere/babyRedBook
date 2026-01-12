import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * 小红书API爬虫
 * 使用真实的小红书API获取用户数据
 */

class XiaoHongShuAPI {
    constructor(userId, cookie) {
        this.userId = userId;
        this.cookie = cookie;
        this.baseURL = 'https://edith.xiaohongshu.com';

        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.xiaohongshu.com/',
                'Origin': 'https://www.xiaohongshu.com'
            }
        });

        this.dataDir = path.join(process.cwd(), 'data');
        this.initDataDir();
    }

    initDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    /**
     * 生成X-S签名
     * 小红书API需要特定的签名格式
     */
    generateXSign(url, method = 'GET') {
        const timestamp = Date.now();
        const randomStr = this.generateRandomString(5);

        // 简化的签名生成(实际签名算法更复杂)
        const sign = crypto.createHash('md5')
            .update(`${url}${method}${timestamp}${randomStr}`)
            .digest('hex');

        return `${sign}.${timestamp}.${randomStr}`;
    }

    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * 获取用户笔记列表
     */
    async getUserNotes(cursor = '', pageSize = 30) {
        try {
            const url = '/api/sns/web/v1/user_posted';
            const params = {
                num: pageSize,
                cursor: cursor,
                user_id: this.userId
            };

            const response = await this.client.get(url, {
                params,
                headers: {
                    'X-S': this.generateXSign(url),
                    'X-T': Date.now().toString()
                }
            });

            if (response.data.success) {
                const notes = response.data.data.notes || [];
                const hasMore = response.data.data.has_more || false;
                const cursor = response.data.data.cursor || '';

                return { notes, hasMore, cursor };
            }

            return { notes: [], hasMore: false, cursor: '' };
        } catch (error) {
            console.error('获取用户笔记失败:', error.message);
            return { notes: [], hasMore: false, cursor: '' };
        }
    }

    /**
     * 获取用户收藏列表
     */
    async getUserCollections(cursor = '', pageSize = 30) {
        try {
            const url = '/api/sns/web/v1/note/favorite/list';
            const params = {
                num: pageSize,
                cursor: cursor
            };

            const response = await this.client.get(url, {
                params,
                headers: {
                    'X-S': this.generateXSign(url),
                    'X-T': Date.now().toString()
                }
            });

            if (response.data.success) {
                const notes = response.data.data.notes || [];
                const hasMore = response.data.data.has_more || false;
                const cursor = response.data.cursor || '';

                return { notes, hasMore, cursor };
            }

            return { notes: [], hasMore: false, cursor: '' };
        } catch (error) {
            console.error('获取用户收藏失败:', error.message);
            return { notes: [], hasMore: false, cursor: '' };
        }
    }

    /**
     * 获取用户点赞列表
     */
    async getUserLikes(cursor = '', pageSize = 30) {
        try {
            const url = '/api/sns/web/v1/note/like/list';
            const params = {
                num: pageSize,
                cursor: cursor
            };

            const response = await this.client.get(url, {
                params,
                headers: {
                    'X-S': this.generateXSign(url),
                    'X-T': Date.now().toString()
                }
            });

            if (response.data.success) {
                const notes = response.data.data.notes || [];
                const hasMore = response.data.data.has_more || false;
                const cursor = response.data.cursor || '';

                return { notes, hasMore, cursor };
            }

            return { notes: [], hasMore: false, cursor: '' };
        } catch (error) {
            console.error('获取用户点赞失败:', error.message);
            return { notes: [], hasMore: false, cursor: '' };
        }
    }

    /**
     * 解析笔记数据
     */
    parseNoteData(note, type = 'note') {
        try {
            const card = note.card || note;
            const noteCard = card.note || card;

            return {
                id: noteCard.id || noteCard.note_id || '',
                title: noteCard.title || noteCard.display_title || '无标题',
                content: noteCard.desc || noteCard.content || '',
                description: noteCard.desc || noteCard.summary || '',
                images: this.extractImages(noteCard),
                cover: noteCard.cover?.url_default || noteCard.image?.info?.url_default || '',
                tags: this.extractTags(noteCard),
                url: `https://www.xiaohongshu.com/explore/${noteCard.id || noteCard.note_id}`,
                createTime: this.formatDate(noteCard.time || noteCard.create_time),
                collectTime: type === 'collection' ? this.formatDate(noteCard.collect_time) : '',
                likeTime: type === 'like' ? this.formatDate(noteCard.like_time) : '',
                likes: noteCard.liked_count || noteCard.interact_info?.liked_count || 0,
                collects: noteCard.collected_count || noteCard.interact_info?.collected_count || 0,
                comments: noteCard.comment_count || noteCard.interact_info?.comment_count || 0,
                author: {
                    id: noteCard.user?.user_id || '',
                    nickname: noteCard.user?.nick_name || '',
                    avatar: noteCard.user?.avatar || ''
                }
            };
        } catch (error) {
            console.error('解析笔记数据失败:', error);
            return null;
        }
    }

    /**
     * 提取图片列表
     */
    extractImages(noteCard) {
        const images = [];

        // 从image_list提取
        if (noteCard.image_list && Array.isArray(noteCard.image_list)) {
            noteCard.image_list.forEach(img => {
                if (img.info?.url_default) {
                    images.push(img.info.url_default);
                }
            });
        }

        // 从images提取
        if (noteCard.images && Array.isArray(noteCard.images)) {
            noteCard.images.forEach(img => {
                if (img.url_default || img.url) {
                    images.push(img.url_default || img.url);
                }
            });
        }

        return images;
    }

    /**
     * 提取标签
     */
    extractTags(noteCard) {
        const tags = [];

        if (noteCard.topics && Array.isArray(noteCard.topics)) {
            noteCard.topics.forEach(topic => {
                if (topic.name) {
                    tags.push(topic.name);
                }
            });
        }

        if (noteCard.tags && Array.isArray(noteCard.tags)) {
            noteCard.tags.forEach(tag => {
                if (tag.tag_name) {
                    tags.push(tag.tag_name);
                }
            });
        }

        return tags;
    }

    /**
     * 格式化日期
     */
    formatDate(timestamp) {
        if (!timestamp) return '';

        try {
            const date = new Date(parseInt(timestamp) * 1000);
            return date.toISOString().split('T')[0];
        } catch {
            return '';
        }
    }

    /**
     * 获取所有笔记(分页)
     */
    async getAllNotes() {
        console.log('📝 开始获取笔记...\n');
        const allNotes = [];
        let cursor = '';
        let page = 1;

        while (true) {
            console.log(`正在获取第 ${page} 页笔记...`);

            const { notes, hasMore, cursor: newCursor } = await this.getUserNotes(cursor);

            if (notes.length === 0) {
                console.log(`第 ${page} 页没有数据，停止获取\n`);
                break;
            }

            const parsedNotes = notes
                .map(note => this.parseNoteData(note, 'note'))
                .filter(note => note !== null);

            allNotes.push(...parsedNotes);
            console.log(`✓ 第 ${page} 页获取了 ${parsedNotes.length} 条笔记\n`);

            if (!hasMore) {
                console.log(`已获取全部笔记，共 ${allNotes.length} 条\n`);
                break;
            }

            cursor = newCursor;
            page++;

            // 延迟避免请求过快
            await this.delay(500);
        }

        return allNotes;
    }

    /**
     * 获取所有收藏(分页)
     */
    async getAllCollections() {
        console.log('⭐ 开始获取收藏...\n');
        const allCollections = [];
        let cursor = '';
        let page = 1;

        while (true) {
            console.log(`正在获取第 ${page} 页收藏...`);

            const { notes, hasMore, cursor: newCursor } = await this.getUserCollections(cursor);

            if (notes.length === 0) {
                console.log(`第 ${page} 页没有数据，停止获取\n`);
                break;
            }

            const parsedNotes = notes
                .map(note => this.parseNoteData(note, 'collection'))
                .filter(note => note !== null);

            allCollections.push(...parsedNotes);
            console.log(`✓ 第 ${page} 页获取了 ${parsedNotes.length} 条收藏\n`);

            if (!hasMore) {
                console.log(`已获取全部收藏，共 ${allCollections.length} 条\n`);
                break;
            }

            cursor = newCursor;
            page++;

            // 延迟避免请求过快
            await this.delay(500);
        }

        return allCollections;
    }

    /**
     * 获取所有点赞(分页)
     */
    async getAllLikes() {
        console.log('❤️ 开始获取点赞...\n');
        const allLikes = [];
        let cursor = '';
        let page = 1;

        while (true) {
            console.log(`正在获取第 ${page} 页点赞...`);

            const { notes, hasMore, cursor: newCursor } = await this.getUserLikes(cursor);

            if (notes.length === 0) {
                console.log(`第 ${page} 页没有数据，停止获取\n`);
                break;
            }

            const parsedNotes = notes
                .map(note => this.parseNoteData(note, 'like'))
                .filter(note => note !== null);

            allLikes.push(...parsedNotes);
            console.log(`✓ 第 ${page} 页获取了 ${parsedNotes.length} 条点赞\n`);

            if (!hasMore) {
                console.log(`已获取全部点赞，共 ${allLikes.length} 条\n`);
                break;
            }

            cursor = newCursor;
            page++;

            // 延迟避免请求过快
            await this.delay(500);
        }

        return allLikes;
    }

    /**
     * 保存数据到文件
     */
    saveData(notes, collections, likes) {
        console.log('💾 正在保存数据...\n');

        fs.writeFileSync(
            path.join(this.dataDir, 'notes.json'),
            JSON.stringify(notes, null, 2),
            'utf-8'
        );

        fs.writeFileSync(
            path.join(this.dataDir, 'collections.json'),
            JSON.stringify(collections, null, 2),
            'utf-8'
        );

        fs.writeFileSync(
            path.join(this.dataDir, 'likes.json'),
            JSON.stringify(likes, null, 2),
            'utf-8'
        );

        console.log('✅ 数据保存成功!');
        console.log(`📁 保存位置: ${this.dataDir}`);
        console.log(`📝 笔记: ${notes.length} 条`);
        console.log(`⭐ 收藏: ${collections.length} 条`);
        console.log(`❤️ 点赞: ${likes.length} 条\n`);
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default XiaoHongShuAPI;
