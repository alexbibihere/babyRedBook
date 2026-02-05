import requests
import json
import time
import re
from typing import List, Dict, Optional
import random
from datetime import datetime
import os
import logging
from urllib.parse import urlparse, parse_qs

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class XiaohongshuSpider:
    def __init__(self, cookies: str = None):
        """
        初始化爬虫
        
        Args:
            cookies: 浏览器登录后的cookies字符串
        """
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Referer': 'https://www.xiaohongshu.com/',
            'Origin': 'https://www.xiaohongshu.com',
        })
        
        if cookies:
            self.set_cookies(cookies)
    
    def set_cookies(self, cookies_str: str):
        """设置cookies"""
        cookies_dict = {}
        for item in cookies_str.split(';'):
            if '=' in item:
                key, value = item.strip().split('=', 1)
                cookies_dict[key] = value
        self.session.cookies.update(cookies_dict)
    
    def get_user_id_from_url(self, url: str) -> Optional[str]:
        """从URL中提取用户ID"""
        patterns = [
            r'/user/profile/([a-f0-9]+)',
            r'/user/([a-f0-9]+)',
            r'xhsdiscover://user/([a-f0-9]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def get_user_info(self, user_id: str) -> Optional[Dict]:
        """
        获取用户基本信息
        
        注意：需要登录后才能访问
        """
        url = f'https://www.xiaohongshu.com/user/profile/{user_id}'
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            # 从HTML中提取用户信息
            html_content = response.text
            
            # 查找用户信息的JSON数据
            user_info_pattern = r'window\.__INITIAL_STATE__\s*=\s*({.*?})\s*</script>'
            match = re.search(user_info_pattern, html_content, re.DOTALL)
            
            if match:
                json_str = match.group(1)
                data = json.loads(json_str)
                
                # 提取用户信息
                user_info = data.get('user', {}).get('userPageData', {})
                return {
                    'user_id': user_info.get('id'),
                    'nickname': user_info.get('nickname'),
                    'avatar': user_info.get('images'),
                    'desc': user_info.get('desc'),
                    'location': user_info.get('location'),
                    'notes_count': user_info.get('notes_count', 0),
                    'fans_count': user_info.get('fans_count', 0),
                    'follows_count': user_info.get('follows_count', 0),
                }
            
        except Exception as e:
            logger.error(f"获取用户信息失败: {e}")
        
        return None
    
    def get_user_notes(self, user_id: str, max_count: int = 100) -> List[Dict]:
        """
        获取用户的所有笔记
        
        Args:
            user_id: 用户ID
            max_count: 最大获取笔记数量
            
        Returns:
            笔记列表
        """
        notes = []
        cursor = ''
        
        try:
            while len(notes) < max_count:
                url = 'https://edith.xiaohongshu.com/api/sns/web/v1/user_posted'
                
                params = {
                    'num': 20,  # 每次请求的数量
                    'cursor': cursor,
                    'user_id': user_id,
                    'image_scenes': 'https://sns-img-bd.xhscdn.com'
                }
                
                response = self.session.get(url, params=params, timeout=10)
                response.raise_for_status()
                
                data = response.json()
                
                if data.get('success'):
                    items = data['data']['notes']
                    
                    for item in items:
                        note_info = self.parse_note_info(item)
                        if note_info:
                            notes.append(note_info)
                            logger.info(f"获取笔记: {note_info['title'][:30]}...")
                    
                    # 检查是否还有更多数据
                    if not data['data']['has_more']:
                        break
                    
                    cursor = data['data']['cursor']
                    time.sleep(random.uniform(1, 2))  # 随机延迟避免被封
                else:
                    logger.error(f"API请求失败: {data}")
                    break
                    
        except Exception as e:
            logger.error(f"获取用户笔记失败: {e}")
        
        return notes[:max_count]
    
    def parse_note_info(self, note_data: Dict) -> Optional[Dict]:
        """解析单篇笔记信息"""
        try:
            # 基本信息
            note_id = note_data.get('note_id', '')
            title = note_data.get('title', '')
            desc = note_data.get('desc', '')
            user = note_data.get('user', {})
            
            # 标签
            tags = []
            for tag in note_data.get('tag_list', []):
                if tag.get('name'):
                    tags.append(tag['name'])
            
            # 图片信息
            images = []
            for image in note_data.get('images_list', []):
                if 'url_default' in image.get('info_list', [{}])[0]:
                    images.append(image['info_list'][0]['url_default'])
            
            # 视频信息
            video_url = None
            if note_data.get('type') == 'video':
                media_info = note_data.get('video', {}).get('media', {})
                video_url = media_info.get('stream', {}).get('h264', [{}])[0].get('master_url')
            
            # 统计信息
            stats = note_data.get('interact_info', {})
            
            return {
                'note_id': note_id,
                'title': title,
                'description': desc,
                'create_time': note_data.get('time', ''),
                'user_id': user.get('user_id', ''),
                'nickname': user.get('nickname', ''),
                'tags': tags,
                'images': images,
                'video_url': video_url,
                'likes': stats.get('liked_count', 0),
                'collects': stats.get('collected_count', 0),
                'comments': stats.get('comment_count', 0),
                'shares': stats.get('share_count', 0),
                'type': note_data.get('type', 'normal'),
                'url': f'https://www.xiaohongshu.com/explore/{note_id}'
            }
            
        except Exception as e:
            logger.error(f"解析笔记信息失败: {e}")
            return None
    
    def save_to_json(self, data: List[Dict], filename: str = None):
        """保存数据到JSON文件"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'xiaohongshu_notes_{timestamp}.json'
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"数据已保存到: {filename}")
        return filename
    
    def save_to_csv(self, data: List[Dict], filename: str = None):
        """保存数据到CSV文件"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'xiaohongshu_notes_{timestamp}.csv'
        
        import csv
        
        if not data:
            return
        
        # 提取所有可能的字段
        all_keys = set()
        for item in data:
            all_keys.update(item.keys())
        
        with open(filename, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=list(all_keys))
            writer.writeheader()
            writer.writerows(data)
        
        logger.info(f"数据已保存到: {filename}")
        return filename

def main():
    """主函数"""
    # 1. 初始化爬虫
    spider = XiaohongshuSpider()
    
    # 2. 从用户输入获取信息
    print("=" * 50)
    print("小红书个人账号笔记爬取工具")
    print("=" * 50)
    
    # 输入用户主页URL
    user_url = input("请输入小红书用户主页URL: ").strip()
    
    # 输入cookies（可选，但建议提供）
    use_cookie = input("是否使用cookies登录？(y/n, 建议使用): ").strip().lower()
    
    if use_cookie == 'y':
        print("\n请按照以下步骤获取cookies：")
        print("1. 登录小红书网页版 (https://www.xiaohongshu.com)")
        print("2. 按F12打开开发者工具")
        print("3. 切换到Network标签页")
        print("4. 刷新页面")
        print("5. 复制任意请求的Cookie值")
        print("-" * 50)
        cookies = input("请输入cookies字符串: ").strip()
        spider.set_cookies(cookies)
    
    # 3. 提取用户ID
    user_id = spider.get_user_id_from_url(user_url)
    
    if not user_id:
        print("无法从URL中提取用户ID，请检查URL格式")
        return
    
    print(f"提取到用户ID: {user_id}")
    
    # 4. 获取用户信息
    print("\n正在获取用户信息...")
    user_info = spider.get_user_info(user_id)
    
    if user_info:
        print(f"用户昵称: {user_info.get('nickname')}")
        print(f"笔记数量: {user_info.get('notes_count')}")
        print(f"粉丝数量: {user_info.get('fans_count')}")
        print(f"简介: {user_info.get('desc', '')}")
    else:
        print("获取用户信息失败，可能因为未登录或用户不存在")
    
    # 5. 获取笔记
    max_notes = input(f"\n请输入要获取的笔记数量 (默认100): ").strip()
    max_notes = int(max_notes) if max_notes.isdigit() else 100
    
    print(f"\n开始获取笔记，预计获取 {max_notes} 篇...")
    notes = spider.get_user_notes(user_id, max_notes)
    
    # 6. 显示结果
    print(f"\n成功获取 {len(notes)} 篇笔记")
    
    if notes:
        print("\n前5篇笔记信息:")
        for i, note in enumerate(notes[:5], 1):
            print(f"{i}. {note['title'][:50]}...")
            print(f"   点赞: {note['likes']}  收藏: {note['collects']}  评论: {note['comments']}")
            print(f"   图片数: {len(note['images'])}  标签: {', '.join(note['tags'][:3])}")
            print()
    
    # 7. 保存数据
    save_option = input("是否保存数据？(y/n): ").strip().lower()
    
    if save_option == 'y':
        print("\n请选择保存格式:")
        print("1. JSON格式（推荐）")
        print("2. CSV格式")
        print("3. 两种格式都保存")
        
        choice = input("请输入选择 (1/2/3): ").strip()
        
        if choice in ['1', '3']:
            json_file = spider.save_to_json(notes)
            print(f"JSON文件已保存: {json_file}")
        
        if choice in ['2', '3']:
            csv_file = spider.save_to_csv(notes)
            print(f"CSV文件已保存: {csv_file}")
    
    print("\n程序执行完成！")

if __name__ == "__main__":
    main()