#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试单张图片 OCR 识别
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

# 获取第一张图片
image_dir = Path(r"D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download")
images = sorted(image_dir.glob('*.png'))

if not images:
    print("未找到图片!")
    sys.exit(1)

# 选择第一张图片
test_image = images[0]
print(f"\n测试图片: {test_image.name}")
print(f"图片路径: {test_image}")
print(f"文件大小: {test_image.stat().st_size / 1024:.2f} KB\n")

# 进行 OCR 识别
print("开始识别...\n")
result = ocr.predict(str(test_image))

print("=" * 50)
print("识别结果:")
print("=" * 50)

# 显示返回类型
print(f"\n返回类型: {type(result)}")

# 提取文字
if isinstance(result, dict):
    rec_texts = result.get('rec_texts', [])
    rec_scores = result.get('rec_scores', [])

    print(f"\n识别到 {len(rec_texts)} 行文字:\n")

    for i, (text, score) in enumerate(zip(rec_texts, rec_scores), 1):
        print(f"{i}. [{score:.2%}] {text}")

elif isinstance(result, list) and len(result) > 0:
    print(f"\n列表长度: {len(result)}")
    print(f"第一个元素类型: {type(result[0])}")

    if isinstance(result[0], dict):
        print(f"\n第一个元素内容: {result[0]}")

print("\n" + "=" * 50)
print("测试完成!")
