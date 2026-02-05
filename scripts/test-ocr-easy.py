#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
快速测试 EasyOCR 识别单张图片
"""

import sys
from pathlib import Path

try:
    import easyocr
except ImportError:
    print("请先安装 EasyOCR:")
    print("  pip install easyocr")
    sys.exit(1)

# 初始化
print("初始化 EasyOCR (首次运行会下载模型)...")
reader = easyocr.Reader(['ch_sim', 'en'], gpu=False)
print("初始化完成!\n")

# 测试图片
image_dir = Path(r"D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download")
images = sorted(image_dir.glob('*.png'))

if not images:
    print("未找到图片!")
    sys.exit(1)

# 测试前 3 张图片
test_images = images[:3]

print(f"测试 {len(test_images)} 张图片:\n")

for i, img_path in enumerate(test_images, 1):
    print(f"[{i}] {img_path.name}")
    print(f"    文件大小: {img_path.stat().st_size / 1024:.2f} KB")

    try:
        # 识别
        result = reader.readtext(str(img_path))

        print(f"    识别到 {len(result)} 行文字:")

        for j, (bbox, text, confidence) in enumerate(result[:5], 1):
            if confidence > 0.5:
                preview = text[:50].replace('\n', ' ')
                print(f"      {j}. [{confidence:.1%}] {preview}...")

        if len(result) > 5:
            print(f"      ... 还有 {len(result) - 5} 行")

    except Exception as e:
        print(f"    错误: {e}")

    print()

print("测试完成!")
print(f"\n如果效果满意,可以运行:")
print(f"  python scripts/easyocr-processor.py")
