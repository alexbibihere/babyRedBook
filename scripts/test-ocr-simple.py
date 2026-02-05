#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单测试 OCR
"""

import sys
from pathlib import Path

try:
    from paddleocr import PaddleOCR
except ImportError:
    print("请先安装 PaddleOCR: pip install paddleocr")
    sys.exit(1)

# 初始化 OCR
print("初始化 OCR 模型...")
ocr = PaddleOCR(use_textline_orientation=True, lang='ch')

# 测试图片
image_dir = Path(r"D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download")
images = list(image_dir.glob('*.png'))[:5]  # 只测试前 5 张

print(f"\n测试 {len(images)} 张图片:\n")

for i, img in enumerate(images, 1):
    print(f"[{i}/{len(images)}] {img.name}")

    try:
        result = ocr.predict(str(img))

        print(f"返回类型: {type(result)}")
        print(f"返回内容: {result}")

        if isinstance(result, list) and len(result) > 0:
            print(f"  识别成功! 第一个元素: {result[0]}")
        elif isinstance(result, dict):
            if result.get('rec_texts'):
                texts = result['rec_texts']
                print(f"识别到 {len(texts)} 行文字:")
                for text in texts[:3]:
                    print(f"  {text}")
        else:
            print(f"  未知格式: {type(result)}")

        print()

    except Exception as e:
        print(f"  错误: {e}\n")

print("测试完成!")
