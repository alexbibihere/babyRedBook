#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用 PaddleOCR 批量识别所有图片 - 小批次版本
"""

import os
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict
import re

try:
    from paddleocr import PaddleOCR
except ImportError:
    print("请先安装 PaddleOCR: pip install paddleocr")
    exit(1)

# 配置
image_dir = Path(r"D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download")
notes_file = Path("data/notes-cleaned.json")
output_file = Path("docs/小红书笔记完整版-PaddleOCR.md")
json_output = Path("data/notes-with-paddleocr.json")

print("=" * 60)
print("使用 PaddleOCR 批量识别小红书图片 (小批次版本)")
print("=" * 60)

# 1. 读取笔记数据
print(f"\n读取笔记数据: {notes_file}")
with open(notes_file, 'r', encoding='utf-8') as f:
    notes = json.load(f)
print(f"笔记数量: {len(notes)}\n")

# 2. 获取所有图片
print(f"扫描图片目录: {image_dir}")
images = list(image_dir.glob('*.png')) + list(image_dir.glob('*.jpg'))
print(f"图片总数: {len(images)}\n")

# 3. 标准化函数
def normalize_title(t):
    # 将下划线、破折号等统一处理
    return re.sub(r'[_\-—–]+', '', t)

# 4. 批量 OCR 识别 - 每批10张
print("=" * 60)
print("开始批量 OCR 识别")
print("=" * 60 + "\n")

batch_size = 10
total_batches = (len(images) + batch_size - 1) // batch_size

processed_total = 0

for batch_idx in range(total_batches):
    print(f"\n>>> 批次 {batch_idx + 1}/{total_batches}")

    # 每批次重新初始化 OCR，释放内存
    print("初始化 PaddleOCR...")
    ocr = PaddleOCR(use_textline_orientation=True, lang='ch')
    print("初始化完成!\n")

    start_idx = batch_idx * batch_size
    end_idx = min(start_idx + batch_size, len(images))
    batch_images = images[start_idx:end_idx]

    for i, image_path in enumerate(batch_images, 1):
        global_idx = start_idx + i
        print(f"[{global_idx}/{len(images)}] {image_path.name[:50]}...")

        try:
            # OCR 识别
            result = ocr.predict(str(image_path))

            # 提取文字 - 新版本 PaddleOCR 返回格式
            ocr_text = ""
            if isinstance(result, list) and len(result) > 0:
                first_item = result[0]
                if isinstance(first_item, dict):
                    texts = first_item.get('rec_texts', [])
                    ocr_text = '\n'.join(texts)
                elif isinstance(first_item, list):
                    # 旧格式兼容
                    texts = [line[1][0] for line in first_item if line and len(line) > 1]
                    ocr_text = '\n'.join(texts)

            # 显示识别结果预览
            if ocr_text:
                preview = ocr_text[:50].replace('\n', ' ')
                print(f"  [OK] 识别: {preview}...")
            else:
                print(f"  - 未识别到文字")

            # 保存到对应笔记
            name = image_path.stem
            parts = name.split('_')
            if len(parts) >= 4:
                # 提取作者和标题信息
                author = parts[2]
                file_title = '_'.join(parts[3:-1]) if len(parts) > 4 else parts[3]

                file_title_norm = normalize_title(file_title)

                # 为每篇笔记添加 OCR 结果
                for note in notes:
                    note_title_norm = normalize_title(note.get('title', ''))
                    note_author = note.get('author', '')

                    # 同时匹配作者和标题
                    if (author in note_author or note_author in author) and \
                       (file_title_norm in note_title_norm or note_title_norm in file_title_norm):

                        if 'images_with_ocr' not in note:
                            note['images_with_ocr'] = []

                        # 查找或创建图片条目
                        found = False
                        for img_info in note['images_with_ocr']:
                            if img_info['filename'] == image_path.name:
                                img_info['ocr_text'] = ocr_text
                                found = True
                                break

                        if not found:
                            note['images_with_ocr'].append({
                                'path': str(image_path),
                                'filename': image_path.name,
                                'ocr_text': ocr_text
                            })
                        break

            processed_total += 1

        except Exception as e:
            print(f"  [ERROR] 错误: {e}")

    # 保存进度
    print(f"\n批次完成，保存进度...")
    with open(json_output, 'w', encoding='utf-8') as f:
        json.dump(notes, f, ensure_ascii=False, indent=2)

    print(f"已处理: {processed_total}/{len(images)}")

    # 释放内存
    del ocr
    import gc
    gc.collect()

print(f"\n处理完成! 共识别 {processed_total}/{len(images)} 张图片\n")

# 5. 生成 Markdown 文档
print("\n生成 Markdown 文档...")

total_images_with_ocr = sum(len(note.get('images_with_ocr', [])) for note in notes)

markdown = f"""# 小红书笔记完整版 (PaddleOCR 识别)

> 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
> 笔记数量: {len(notes)}
> 图片数量: {total_images_with_ocr}
> OCR 服务: PaddleOCR (离线识别)

## 说明

本文档包含:
- 笔记完整文本内容
- 作者、点赞数、链接
- 所有图片展示
- **图片文字 PaddleOCR 识别内容**

---

"""

# 按作者分组
notes_by_author = defaultdict(list)
for note in notes:
    notes_by_author[note.get('author', '未知')].append(note)

# 生成内容
for author, author_notes in sorted(notes_by_author.items()):
    if not author or author == '未知':
        continue

    markdown += f"## {author}\n\n"

    for note in author_notes:
        title = note.get('title', '无标题')
        content = note.get('content', '')
        likes = note.get('likes', '0')
        url = note.get('url', '')
        images_with_ocr = note.get('images_with_ocr', [])

        markdown += f"### {title}\n\n"

        if likes:
            markdown += f"**点赞**: {likes}\n\n"

        if url:
            markdown += f"**原文链接**: {url}\n\n"

        # 正文内容
        if content:
            markdown += f"#### 正文内容\n\n{content}\n\n"

        # 图片和OCR
        if images_with_ocr:
            markdown += f"#### 图片 ({len(images_with_ocr)} 张)\n\n"

            for i, img_info in enumerate(images_with_ocr, 1):
                # 图片路径
                img_path = img_info['path']
                rel_path = Path(img_path).as_posix()

                markdown += f"##### 图片 {i}\n\n"
                markdown += f"![{title}-图片{i}](file:///{rel_path})\n\n"

                # OCR 识别的文字
                ocr_text = img_info.get('ocr_text', '')
                if ocr_text and ocr_text.strip():
                    markdown += f"**OCR 识别文字**:\n\n"
                    markdown += f"```\n{ocr_text}\n```\n\n"
                else:
                    markdown += f"*（此图片未识别到文字）*\n\n"

        markdown += "---\n\n"

# 保存文件
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(markdown)

print(f"Markdown 文档已生成: {output_file}")
print(f"文件大小: {output_file.stat().st_size / 1024:.2f} KB")

print("\n" + "=" * 60)
print("完成!")
print("=" * 60)
print(f"\n查看文档:")
print(f"   {output_file}")
print(f"\n查看数据:")
print(f"   {json_output}")
