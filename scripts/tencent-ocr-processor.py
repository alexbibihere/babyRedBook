#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用腾讯云 OCR 批量识别图片文字
"""

import os
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict
from tencentcloud.common import credential
from tencentcloud.common.profile.client_profile import ClientProfile
from tencentcloud.common.profile.http_profile import HttpProfile
from tencentcloud.ocr.v20181119 import ocr_client, models

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class TencentOCRProcessor:
    def __init__(self, image_dir, secret_id, secret_key, region="ap-guangzhou"):
        self.image_dir = Path(image_dir)
        self.notes = defaultdict(lambda: {
            'title': '',
            'author': '',
            'date': '',
            'images': [],
            'texts': []
        })

        # 初始化腾讯云 OCR 客户端
        cred = credential.Credential(secret_id, secret_key)
        httpProfile = HttpProfile()
        httpProfile.endpoint = "ocr.tencentcloudapi.com"

        clientProfile = ClientProfile()
        clientProfile.httpProfile = httpProfile

        self.client = ocr_client.OcrClient(cred, region, clientProfile)

    def parse_filename(self, filename):
        """解析文件名,提取笔记信息"""
        # 文件名格式: 日期_时间_作者_标题_序号.png
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
            # 读取图片并转换为 base64
            with open(image_path, 'rb') as f:
                image_base64 = f.read()

            # 调用腾讯云 OCR API (通用印刷体识别)
            req = models.GeneralBasicOCRRequest()
            req.ImageBase64 = image_base64

            resp = self.client.GeneralBasicOCR(req)

            # 提取识别的文字
            if resp.TextDetections:
                texts = [item.DetectedText for item in resp.TextDetections]
                return '\n'.join(texts)

            return ""

        except Exception as e:
            print(f"  OCR 失败: {e}")
            return ""

    def process_images(self, max_images=None):
        """处理所有图片"""
        print('\n' + '=' * 50)
        print('开始批量 OCR 识别 (腾讯云)')
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

        markdown = f"""# 小红书笔记图片文字识别合集 (腾讯云 OCR)

> 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
> 图片总数: {total_images}
> 笔记数量: {total_notes}
> OCR 服务: 腾讯云

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
                    markdown += f"![{title}-图片{i}]({relative_path})\n\n"

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
    import sys

    # 从环境变量或配置读取密钥
    SECRET_ID = os.getenv('TENCENT_SECRET_ID', '')
    SECRET_KEY = os.getenv('TENCENT_SECRET_KEY', '')

    if not SECRET_ID or not SECRET_KEY:
        print("错误: 请设置腾讯云密钥!")
        print("\n方法1: 设置环境变量")
        print("  export TENCENT_SECRET_ID=你的SecretId")
        print("  export TENCENT_SECRET_KEY=你的SecretKey")
        print("\n方法2: 创建 .env 文件")
        print("  TENCENT_SECRET_ID=你的SecretId")
        print("  TENCENT_SECRET_KEY=你的SecretKey")
        sys.exit(1)

    # 配置
    image_dir = r"D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download"
    output_file = "docs/小红书笔记图片OCR识别-腾讯云.md"

    # 测试模式: 只处理前 10 张图片
    # max_images = 10
    max_images = None  # 处理所有图片

    # 创建处理器
    processor = TencentOCRProcessor(
        image_dir=image_dir,
        secret_id=SECRET_ID,
        secret_key=SECRET_KEY
    )

    # 运行
    processor.run(output_file, max_images)
