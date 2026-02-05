#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用 PaddleOCR 批量识别所有图片 - 稳定版本
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

try:
    from paddleocr import PaddleOCR
except ImportError:
    print("请先安装 PaddleOCR: pip install paddleocr")
    sys.exit(1)

# 配置
image_dir = Path(r"D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download")
notes_file = Path("data/notes-cleaned.json")
output_file = Path("docs/小红书笔记完整版-PaddleOCR.md")
json_output = Path("data/notes-with-paddleocr.json")
progress_file = Path("data/ocr-progress.txt")

print("=" * 60)
print("使用 PaddleOCR 批量识别小红书图片")
print("=" * 60)

# 1. 读取笔记数据
print(f"\n读取笔记数据: {notes_file}")
with open(notes_file, 'r', encoding='utf-8') as f:
    notes = json.load(f)
print(f"笔记数量: {len(notes)}")

# 为每篇笔记初始化 images_with_ocr
for note in notes:
    if 'images_with_ocr' not in note:
        note['images_with_ocr'] = []

# 2. 获取所有图片
print(f"\n扫描图片目录: {image_dir}")
images = list(image_dir.glob('*.png'))
print(f"图片总数: {len(images)}\n")

# 3. 初始化 PaddleOCR
print("初始化 PaddleOCR...")
ocr = PaddleOCR(use_textline_orientation=True, lang='ch')
print("初始化完成!\n")

# 4. 批量 OCR 识别
print("=" * 60)
print("开始批量 OCR 识别")
print("=" * 60)
print(f"开始时间: {datetime.now().strftime('%H:%M:%S')}\n")

processed = 0
total_images = len(images)
start_time = datetime.now()

for i, image_path in enumerate(images, 1):
    try:
        # OCR 识别
        result = ocr.predict(str(image_path))

        # 提取文字
        ocr_text = ""
        if isinstance(result, list) and len(result) > 0:
            first_item = result[0]
            if isinstance(first_item, dict):
                texts = first_item.get('rec_texts', [])
                ocr_text = '\n'.join(texts)

        # 显示进度
        progress = (i / total_images) * 100
        elapsed = (datetime.now() - start_time).total_seconds()
        avg_time = elapsed / i
        remaining = (total_images - i) * avg_time

        print(f"[{i}/{total_images}] {progress:.1f}% - 预计剩余: {remaining:.0f}秒")

        # 显示识别结果预览
        if ocr_text:
            preview = ocr_text[:30].replace('\n', ' ')
            print(f"      {preview}...")
        else:
            print(f"      (未识别到文字)")

        # 保存到对应笔记
        name = image_path.stem
        parts = name.split('_')
        if len(parts) >= 4:
            title = '_'.join(parts[3:-1]) if len(parts) > 4 else parts[3]

            # 为每篇笔记添加 OCR 结果
            for note in notes:
                if title in note['title'] or note['title'] in title:
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

        processed += 1

        # 每 10 张保存一次进度
        if processed % 10 == 0:
            # 保存进度
            progress_info = {
                'processed': processed,
                'total': total_images,
                'progress': f"{(processed/total_images)*100:.1f}%",
                'time': datetime.now().strftime('%H:%M:%S')
            }
            with open(progress_file, 'w', encoding='utf-8') as f:
                json.dump(progress_info, f, ensure_ascii=False)

            # 保存完整数据
            with open(json_output, 'w', encoding='utf-8') as f:
                json.dump(notes, f, ensure_ascii=False, indent=2)

            print(f"\n--- 已保存进度 ({processed}/{total_images}) ---\n")

    except Exception as e:
        print(f"\n[ERROR] 图片 {i} 处理失败: {e}\n")

elapsed_total = (datetime.now() - start_time).total_seconds()

print(f"\n处理完成!")
print(f"总共识别: {processed}/{total_images} 张图片")
print(f"总耗时: {elapsed_total/60:.1f} 分钟")
print(f"平均速度: {elapsed_total/processed:.1f} 秒/张\n")

# 5. 保存最终数据
print("=" * 60)
print("保存数据")
print("=" * 60 + "\n")

with open(json_output, 'w', encoding='utf-8') as f:
    json.dump(notes, f, ensure_ascii=False, indent=2)

print(f"JSON 数据已保存: {json_output}")
print(f"文件大小: {json_output.stat().st_size / 1024:.2f} KB\n")

# 6. 生成 Markdown 文档
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
            markdown += f"**❤️ 点赞**: {likes}\n\n"

        if url:
            markdown += f"**🔗 原文链接**: {url}\n\n"

        # 正文内容
        if content:
            markdown += f"#### 📄 正文内容\n\n{content}\n\n"

        # 图片和OCR
        if images_with_ocr:
            markdown += f"#### 📷 图片 ({len(images_with_ocr)} 张)\n\n"

            for i, img_info in enumerate(images_with_ocr, 1):
                img_path = img_info['path']
                rel_path = Path(img_path).as_posix()

                markdown += f"##### 图片 {i}\n\n"
                markdown += f"![{title}-图片{i}](file:///{rel_path})\n\n"

                ocr_text = img_info.get('ocr_text', '')
                if ocr_text and ocr_text.strip():
                    markdown += f"**📝 OCR 识别文字**:\n\n"
                    markdown += f"```\n{ocr_text}\n```\n\n"
                else:
                    markdown += f"*（此图片未识别到文字）*\n\n"

        markdown += "---\n\n"

# 保存文件
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(markdown)

print(f"Markdown 文档已生成: {output_file}")
print(f"文件大小: {output_file.stat().st_size / 1024:.2f} KB")

# 删除进度文件
if progress_file.exists():
    progress_file.unlink()

print("\n" + "=" * 60)
print("全部完成!")
print("=" * 60)
print(f"\n查看文档:")
print(f"  {output_file}")
