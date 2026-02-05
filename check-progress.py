#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""实时检查 OCR 进度"""

import json
from pathlib import Path
from datetime import datetime

# 检查进度文件
progress_file = Path("data/ocr-progress.txt")
if progress_file.exists():
    with open(progress_file, 'r', encoding='utf-8') as f:
        progress = json.load(f)
    print(f"\n进度文件: {progress['processed']}/{progress['total']} ({progress['progress']}) - {progress['time']}")

# 检查 JSON 文件
json_file = Path("data/notes-with-paddleocr.json")
if json_file.exists():
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    total_ocr = sum(len(n.get('images_with_ocr', [])) for n in data)
    notes_with_ocr = len([n for n in data if n.get('images_with_ocr')])

    print(f"JSON文件: {total_ocr} 张图片已处理")
    print(f"        {notes_with_ocr}/{len(data)} 篇笔记有 OCR 结果")
    print(f"        文件大小: {json_file.stat().st_size / 1024:.1f} KB")
    print(f"        最后修改: {datetime.fromtimestamp(json_file.stat().st_mtime).strftime('%H:%M:%S')}")

# 显示处理中的笔记示例
if total_ocr > 0:
    print("\n已处理的笔记:")
    for note in data:
        if note.get('images_with_ocr'):
            title = note.get('title', '无标题')[:30]
            img_count = len(note['images_with_ocr'])
            print(f"  - {title}... ({img_count} 张)")
