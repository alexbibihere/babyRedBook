#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用 Tesseract OCR 批量识别图片文字 (完全免费,无需密钥)
"""

import os
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

try:
    import pytesseract
    from PIL import Image
except ImportError:
    print("请先安装依赖:")
    print("  pip install pytesseract pillow")
    print("\n并安装 Tesseract:")
    print("  Windows: https://github.com/UB-Mannheim/tesseract/wiki")
    print("  或: choco install tesseract")
    exit(1)


class TesseractOCRProcessor:
    def __init__(self, image_dir):
        self.image_dir = Path(image_dir)
        self.notes = defaultdict(lambda: {
            'title': '',
            'author': '',
            'date': '',
            'images': [],
            'texts': []
        })

        # 设置 Tesseract 路径 (Windows)
        if os.name == 'nt':
            # 常见安装路径
            possible_paths = [
                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
                r"C:\ProgramData\chocolatey\lib\tesseract\tools\tesseract.exe",
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    pytesseract.pytesseract.tesseract_cmd = path
                    print(f"找到 Tesseract: {path}")
                    break
            else:
                print("警告: 未找到 Tesseract,请确保已安装")

    def parse_filename(self, filename):
        """解析文件名,提取笔记信息"""
        name = filename.stem
        parts = name.split('_')

        if len(parts) < 4:
            return None

        date = parts[0] if len(parts) > 0 else ''
        author = parts[2] if len(parts) > 2 else ''
        title = '_'.join(parts[3:-1]) if len(parts) > 4 else ''
        index = parts[-1] if len(parts) > 4 else ''

        note_key = title

        return {
            'note_key': note_key,
            'date': date,
            'author': author,
            'title': title,
            'index': index,
            'filename': filename.name
        }

    def ocr_image(self, image_path):
        """对单张图片进行 OCR 识别"""
        try:
            # 打开图片
            image = Image.open(image_path)

            # 使用 Tesseract 识别中文
            # lang='chi_sim' : 简体中文
            # config='--psm 6' : 假设单列文本块
            text = pytesseract.image_to_string(
                image,
                lang='chi_sim+eng',  # 中文+英文
                config='--psm 6'
            )

            return text.strip()

        except Exception as e:
            print(f"  OCR 失败: {e}")
            return ""

    def process_images(self, max_images=None):
        """处理所有图片"""
        print('\n' + '=' * 50)
        print('开始批量 OCR 识别 (Tesseract)')
        print('=' * 50 + '\n')

        # 获取所有图片文件
        image_files = list(self.image_dir.glob('*.png')) + list(self.image_dir.glob('*.jpg'))

        if max_images:
            image_files = image_files[:max_images]

        print(f"找到 {len(image_files)} 张图片\n")

        # 按文件名排序
        image_files.sort()

        processed = 0
        for i, image_path in enumerate(image_files, 1):
            info = self.parse_filename(image_path)
            if not info:
                continue

            print(f"[{i}/{len(image_files)}] {info['title'][:50]}...")

            # OCR 识别
            text = self.ocr_image(image_path)

            # 显示识别结果预览
            if text:
                preview = text[:50].replace('\n', ' ')
                print(f"  识别: {preview}...")

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

            if processed % 10 == 0:
                print(f"  已处理 {processed}/{len(image_files)} 张\n")

        print(f'\n处理完成! 共识别 {processed} 张图片\n')

    def generate_markdown(self, output_file):
        """生成 Markdown 文档"""
        print('=' * 50)
        print('生成 Markdown 文档')
        print('=' * 50 + '\n')

        total_images = sum(len(note['images']) for note in self.notes.values())
        total_notes = len(self.notes)

        markdown = f"""# 小红书笔记图片文字识别合集 (Tesseract OCR)

> 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
> 图片总数: {total_images}
> 笔记数量: {total_notes}
> OCR 服务: Tesseract (开源免费)

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

            markdown += f"## {author}\n\n"

            for note in notes:
                title = note['title']
                date = note['date']
                images = note['images']
                texts = note['texts']

                markdown += f"### {title}\n\n"
                if date:
                    markdown += f"**日期**: {date}\n\n"

                # 图片和文字展示
                for i, (img, text) in enumerate(zip(images, texts), 1):
                    relative_path = os.path.relpath(img['path'], os.path.dirname(output_file))

                    markdown += f"#### 图片 {i}\n\n"
                    markdown += f"![{title}-图片{i}](file:///{relative_path.replace(os.sep, '/')})\n\n"

                    # OCR 识别的文字
                    if text and text.strip():
                        markdown += "**识别文字**:\n\n"
                        markdown += f"{text}\n\n"
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

    def run(self, output_file, max_images=None):
        """运行处理流程"""
        self.process_images(max_images)
        self.generate_markdown(output_file)


if __name__ == '__main__':
    # 配置
    image_dir = r"D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download"
    output_file = "docs/小红书笔记图片OCR识别-Tesseract.md"

    # 测试模式: 只处理前 10 张图片
    max_images = 10
    # max_images = None  # 处理所有图片

    # 创建处理器
    processor = TesseractOCRProcessor(image_dir)

    # 运行
    processor.run(output_file, max_images)
