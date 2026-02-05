#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
实时监控 OCR 进度并显示日志
"""

import json
import time
from pathlib import Path
from datetime import datetime, timedelta

def get_file_age(filepath):
    """获取文件的修改时间"""
    if filepath.exists():
        return datetime.now() - datetime.fromtimestamp(filepath.stat().st_mtime)
    return None

def format_duration(seconds):
    """格式化时间间隔"""
    if seconds < 60:
        return f"{seconds:.0f}秒"
    elif seconds < 3600:
        return f"{seconds/60:.1f}分钟"
    else:
        return f"{seconds/3600:.1f}小时"

print("=" * 70)
print("PaddleOCR 批量识别 - 实时监控")
print("=" * 70)

json_file = Path("data/notes-with-paddleocr.json")

# 读取源数据
try:
    with open("data/notes-cleaned.json", 'r', encoding='utf-8') as f:
        total_notes = len(json.load(f))
except:
    total_notes = 18

print(f"\n监控文件: {json_file}")
print(f"笔记总数: {total_notes}")
print("\n" + "-" * 70)
print("按 Ctrl+C 停止监控")
print("-" * 70 + "\n")

last_processed = 0
last_check_time = datetime.now()

try:
    while True:
        # 读取进度
        processed = 0
        notes_with_ocr = 0

        if json_file.exists():
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                processed = sum(len(n.get('images_with_ocr', [])) for n in data)
                notes_with_ocr = len([n for n in data if n.get('images_with_ocr')])
            except:
                pass

        current_time = datetime.now()
        time_since_last_check = (current_time - last_check_time).total_seconds()
        last_check_time = current_time

        # 计算速度
        speed = 0
        if processed > last_processed and time_since_last_check > 0:
            speed = (processed - last_processed) / time_since_last_check

        last_processed = processed

        # 估算剩余时间
        total_images = 206
        remaining = total_images - processed
        if speed > 0:
            eta_seconds = remaining / speed
            eta = datetime.now() + timedelta(seconds=eta_seconds)
            eta_str = eta.strftime("%H:%M:%S")
        else:
            eta_str = "计算中..."

        # 显示进度
        progress_pct = (processed / total_images * 100) if total_images > 0 else 0

        timestamp = current_time.strftime("%H:%M:%S")

        print(f"\r[{timestamp}] 进度: {processed}/{total_images} ({progress_pct:.1f}%) | "
              f"速度: {speed:.1f} 张/秒 | 笔记: {notes_with_ocr}/{total_notes} | "
              f"预计完成: {eta_str}", end="", flush=True)

        time.sleep(5)  # 每5秒更新一次

except KeyboardInterrupt:
    print(f"\n\n{'=' * 70}")
    print("监控已停止")
    print(f"{'=' * 70}")
    print(f"\n最终进度: {processed}/{total_images} ({progress_pct:.1f}%)")
    print(f"处理笔记: {notes_with_ocr}/{total_notes}")
    print(f"\n查看结果:")
    print(f"  数据文件: {json_file}")
    print(f"  Markdown: docs/小红书笔记完整版-PaddleOCR.md")
