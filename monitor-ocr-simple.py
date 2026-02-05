#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
实时监控 OCR 进度 - 显示详细日志
"""

import json
import time
from pathlib import Path
from datetime import datetime

json_file = Path("data/notes-with-paddleocr.json")
total_images = 206

print("=" * 70)
print("PaddleOCR 批量识别 - 实时监控")
print("=" * 70)
print("\n按 Ctrl+C 停止监控\n")

last_count = 0
last_time = datetime.now()

try:
    while True:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            processed = sum(len(n.get('images_with_ocr', [])) for n in data)
            notes_count = len([n for n in data if n.get('images_with_ocr')])

            current_time = datetime.now()
            time_diff = (current_time - last_time).total_seconds()

            # 如果有新的图片被处理
            if processed > last_count:
                new_count = processed - last_count
                timestamp = current_time.strftime("%H:%M:%S")
                progress = (processed / total_images) * 100

                # 计算速度
                if time_diff > 0:
                    speed = new_count / time_diff
                    remaining = total_images - processed
                    if speed > 0:
                        eta_min = remaining / speed / 60
                        print(f"[{timestamp}] ✓ 处理了 {new_count} 张 | "
                              f"总计: {processed}/{total_images} ({progress:.1f}%) | "
                              f"速度: {speed:.2f} 张/秒 | "
                              f"预计剩余: {eta_min:.0f} 分钟")

                last_count = processed
                last_time = current_time

                # 显示最新处理的笔记
                for note in data:
                    if note.get('images_with_ocr'):
                        title = note.get('title', '无标题')
                        count = len(note['images_with_ocr'])
                        print(f"       → {title[:50]}... ({count} 张)")
                        break

            # 如果长时间没有更新（可能脚本停止了）
            elif time_diff > 180:  # 3分钟没更新
                timestamp = current_time.strftime("%H:%M:%S")
                print(f"[{timestamp}] ⚠ 脚本可能已停止 (3分钟无更新)")
                print(f"       当前进度: {processed}/{total_images}")
                break

        except Exception as e:
            print(f"错误: {e}")

        time.sleep(10)  # 每10秒检查一次

except KeyboardInterrupt:
    timestamp = datetime.now().strftime("%H:%M:%S")
    progress = (processed / total_images) * 100
    print(f"\n\n[{timestamp}] 监控已停止")
    print(f"最终进度: {processed}/{total_images} ({progress:.1f}%)")
    print(f"处理笔记: {notes_count} 篇")
