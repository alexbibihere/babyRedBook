#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量 OCR 识别下载的图片并生成 Markdown 文档
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

try:
    from paddleocr import PaddleOCR
except ImportError:
    print("请先安装 PaddleOCR: pip install paddleocr")
    exit(1)


class ImageOCRProcessor:
    def __init__(self, image_dir):
        self.image_dir = Path(image_dir)
        self.ocr = PaddleOCR(use_textline_orientation=True, lang='ch')
        self.notes = defaultdict(lambda: {
            'title': '',
            'author': '',
            'date': '',
            'images': [],
            'texts': []
        })

    def parse_filename(self, filename):
        """解析文件名,提取笔记信息"""
        # 文件名格式: 日期_时间_作者_标题_序号.png
        # 例如: 2024-09-23_22.35.56_陈如意_生产后1_3天，老公如何照顾孕妇_1.png

        name = filename.stem  # 去除扩展名
        parts = name.split('_')

        if len(parts) < 4:
            return None

        date = parts[0] if len(parts) > 0 else ''
        time = parts[1] if len(parts) > 1 else ''
        author = parts[2] if len(parts) > 2 else ''
        title = '_'.join(parts[3:-1]) if len(parts) > 4 else ''
        index = parts[-1] if len(parts) > 4 else ''

        # 使用标题作为笔记的唯一标识
        note_key = title

        return {
            'note_key': note_key,
            'date': date,
            'time': time,
            'author': author,
            'title': title,
            'index': index,
            'filename': filename.name
        }

    def ocr_image(self, image_path):
        """对单张图片进行 OCR 识别"""
        try:
            result = self.ocr.predict(str(image_path))

            if not result:
                return ""

            # 提取文字 (新版本 PaddleOCR 返回格式)
            if isinstance(result, list) and len(result) > 0:
                first_item = result[0]
                if isinstance(first_item, dict) and 'rec_texts' in first_item:
                    # 新版本: 返回列表,元素是字典,包含 rec_texts
                    texts = first_item.get('rec_texts', [])
                else:
                    return ""
            elif isinstance(result, dict):
                # 兼容字典格式
                texts = result.get('rec_texts', [])
            else:
                return ""

            return '\n'.join(str(t) for t in texts if t)

        except Exception as e:
            print(f"  OCR 失败: {e}")
            return ""

    def process_images(self):
        """处理所有图片"""
        print('\n' + '=' * 50)
        print('开始批量 OCR 识别')
        print('=' * 50 + '\n')

        # 获取所有图片文件
        image_files = list(self.image_dir.glob('*.png')) + list(self.image_dir.glob('*.jpg'))
        print(f"找到 {len(image_files)} 张图片\n")

        # 按文件名排序
        image_files.sort()

        processed = 0
        for image_path in image_files:
            info = self.parse_filename(image_path)
            if not info:
                continue

            print(f"[{processed + 1}/{len(image_files)}] {info['title'][:30]}...")

            # OCR 识别
            text = self.ocr_image(image_path)

            # 保存信息
            note_key = info['note_key']
            self.notes[note_key]['title'] = info['title']
            self.notes[note_key]['author'] = info['author']
            self.notes[note_key]['date'] = info['date']
            self.notes[note_key]['images'].append({
                'path': str(image_path),
                'index': info['index'],
                'filename': info['filename']
            })
            self.notes[note_key]['texts'].append(text)

            processed += 1

        print(f'\n处理完成! 共识别 {processed} 张图片\n')

    def generate_markdown(self, output_file):
        """生成 Markdown 文档"""
        print('=' * 50)
        print('生成 Markdown 文档')
        print('=' * 50 + '\n')

        markdown = f"""# 小红书笔记图片文字识别合集

> 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
> 图片总数: {sum(len(note['images']) for note in self.notes.values())}
> 笔记数量: {len(self.notes)}

---

"""

        # 按作者分组
        notes_by_author = defaultdict(list)
        for note_key, note in self.notes.items():
            notes_by_author[note['author']].append(note)

        # 生成每个作者的笔记
        for author, notes in sorted(notes_by_author.items()):
            if not author:
                continue

            markdown += f"## ✍️ {author}\n\n"

            for note in notes:
                title = note['title']
                date = note['date']
                images = note['images']
                texts = note['texts']

                markdown += f"### {title}\n\n"
                if date:
                    markdown += f"**发布日期**: {date}\n\n"

                # 图片展示
                markdown += "#### 📷 图片\n\n"
                for i, (img, text) in enumerate(zip(images, texts), 1):
                    relative_path = os.path.relpath(img['path'], os.path.dirname(output_file))
                    markdown += f"##### 图片 {i}\n\n"
                    markdown += f"![{title}-图片{i}]({relative_path})\n\n"

                    # OCR 识别的文字
                    if text.strip():
                        markdown += "**识别文字**:\n\n"
                        markdown += f"```\n{text}\n```\n\n"
                    else:
                        markdown += "*（未识别到文字）*\n\n"

                markdown += "---\n\n"

            markdown += "\n"

        # 保存文件
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown)

        print(f"Markdown 文档已生成: {output_file}\n")

        # 同时保存 JSON 数据
        json_file = output_file.replace('.md', '.json')
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(dict(self.notes), f, ensure_ascii=False, indent=2)
        print(f"JSON 数据已保存: {json_file}\n")

    def run(self, output_file):
        """运行处理流程"""
        self.process_images()
        self.generate_markdown(output_file)


if __name__ == '__main__':
    import sys

    # 配置
    image_dir = r"D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download"
    output_file = "docs/小红书笔记图片OCR识别.md"

    # 创建处理器
    processor = ImageOCRProcessor(image_dir)

    # 运行
    processor.run(output_file)
