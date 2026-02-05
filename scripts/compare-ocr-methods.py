#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
对比测试不同 OCR 方案的识别效果
"""

import sys
import time
from pathlib import Path

# 获取第一张测试图片
image_dir = Path(r"D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download")
images = sorted(image_dir.glob('*.png'))

if not images:
    print("未找到测试图片!")
    sys.exit(1)

test_image = images[0]

print("=" * 60)
print("OCR 方案对比测试")
print("=" * 60)
print(f"\n测试图片: {test_image.name}")
print(f"图片大小: {test_image.stat().st_size / 1024:.2f} KB")
print(f"图片路径: {test_image}\n")

# 显示图片
try:
    from PIL import Image
    img = Image.open(test_image)
    print(f"图片尺寸: {img.size[0]} x {img.size[1]} 像素")
except:
    pass

print("\n" + "=" * 60)
print()

# ============ 方案 1: EasyOCR ============
print("【方案 1: EasyOCR】")
print("-" * 60)

try:
    import easyocr

    start_time = time.time()
    print("初始化 EasyOCR...")
    reader = easyocr.Reader(['ch_sim', 'en'], gpu=False)
    init_time = time.time() - start_time
    print(f"初始化耗时: {init_time:.2f} 秒\n")

    print("开始识别...")
    start_time = time.time()
    result = reader.readtext(str(test_image))
    ocr_time = time.time() - start_time

    print(f"识别耗时: {ocr_time:.2f} 秒")
    print(f"识别到 {len(result)} 行文字\n")

    # 显示前5行
    for i, (bbox, text, confidence) in enumerate(result[:5], 1):
        if confidence > 0.5:
            preview = text[:60].replace('\n', ' ')
            print(f"  {i}. [{confidence:.1%}] {preview}...")

    if len(result) > 5:
        print(f"  ... 还有 {len(result) - 5} 行")

    # 保存完整结果
    easyocr_text = '\n'.join([text for bbox, text, conf in result if conf > 0.5])
    print(f"\n完整文字预览 (前200字符):\n{easyocr_text[:200]}...")

except ImportError:
    print("EasyOCR 未安装: pip install easyocr")
    easyocr_text = ""
    easyocr_time = 0
except Exception as e:
    print(f"错误: {e}")
    easyocr_text = ""
    easyocr_time = 0

print("\n" + "=" * 60)
print()

# ============ 方案 2: PaddleOCR ============
print("【方案 2: PaddleOCR】")
print("-" * 60)

try:
    from paddleocr import PaddleOCR

    start_time = time.time()
    print("初始化 PaddleOCR...")
    ocr = PaddleOCR(use_textline_orientation=True, lang='ch')
    init_time = time.time() - start_time
    print(f"初始化耗时: {init_time:.2f} 秒\n")

    print("开始识别...")
    start_time = time.time()
    result = ocr.predict(str(test_image))
    ocr_time = time.time() - start_time

    print(f"识别耗时: {ocr_time:.2f} 秒")

    # 提取文字
    if isinstance(result, list) and len(result) > 0:
        first_item = result[0]
        if isinstance(first_item, dict):
            texts = first_item.get('rec_texts', [])
            scores = first_item.get('rec_scores', [])

            print(f"识别到 {len(texts)} 行文字\n")

            # 显示前5行
            for i, (text, score) in enumerate(zip(texts[:5], scores[:5]), 1):
                preview = text[:60].replace('\n', ' ')
                print(f"  {i}. [{score:.1%}] {preview}...")

            if len(texts) > 5:
                print(f"  ... 还有 {len(texts) - 5} 行")

            paddleocr_text = '\n'.join(texts)
            print(f"\n完整文字预览 (前200字符):\n{paddleocr_text[:200]}...")

except ImportError:
    print("PaddleOCR 未安装: pip install paddleocr")
    paddleocr_text = ""
except Exception as e:
    print(f"错误: {e}")
    paddleocr_text = ""

print("\n" + "=" * 60)
print()

# ============ 方案 3: Tesseract ============
print("【方案 3: Tesseract】")
print("-" * 60)

try:
    import pytesseract
    from PIL import Image

    # 设置 Tesseract 路径
    import os
    if os.name == 'nt':
        possible_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        ]
        for path in possible_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                break

    start_time = time.time()
    print("开始识别 (Tesseract)...")

    image = Image.open(test_image)
    text = pytesseract.image_to_string(image, lang='chi_sim+eng', config='--psm 6')

    ocr_time = time.time() - start_time

    print(f"识别耗时: {ocr_time:.2f} 秒")

    lines = [line.strip() for line in text.split('\n') if line.strip()]
    print(f"识别到 {len(lines)} 行文字\n")

    # 显示前5行
    for i, line in enumerate(lines[:5], 1):
        preview = line[:60].replace('\n', ' ')
        print(f"  {i}. {preview}...")

    if len(lines) > 5:
        print(f"  ... 还有 {len(lines) - 5} 行")

    tesseract_text = text
    print(f"\n完整文字预览 (前200字符):\n{tesseract_text[:200]}...")

except ImportError:
    print("Tesseract 未安装:")
    print("  pip install pytesseract pillow")
    print("  并安装 Tesseract 程序")
    tesseract_text = ""
except Exception as e:
    print(f"错误: {e}")
    print("提示: 请确保已安装 Tesseract 程序")
    tesseract_text = ""

print("\n" + "=" * 60)
print("【对比总结】")
print("=" * 60)
print()

# 保存结果到文件
output = {
    "测试图片": str(test_image),
    "EasyOCR": easyocr_text if 'easyocr_text' in locals() else "",
    "PaddleOCR": paddleocr_text if 'paddleocr_text' in locals() else "",
    "Tesseract": tesseract_text if 'tesseract_text' in locals() else "",
}

output_file = Path("data/ocr-comparison-result.json")
import json
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"完整识别结果已保存到: {output_file}\n")

# 生成对比报告
markdown = f"""# OCR 方案对比测试结果

## 测试图片

- 文件名: {test_image.name}
- 大小: {test_image.stat().st_size / 1024:.2f} KB
- 路径: {test_image}

---

## 方案 1: EasyOCR

### 识别结果

"""

if 'easyocr_text' in locals() and easyocr_text:
    markdown += f"```\n{easyocr_text}\n```\n\n"
else:
    markdown += "*未安装或识别失败*\n\n"

markdown += "## 方案 2: PaddleOCR\n\n### 识别结果\n\n"

if 'paddleocr_text' in locals() and paddleocr_text:
    markdown += f"```\n{paddleocr_text}\n```\n\n"
else:
    markdown += "*未安装或识别失败*\n\n"

markdown += "## 方案 3: Tesseract\n\n### 识别结果\n\n"

if 'tesseract_text' in locals() and tesseract_text:
    markdown += f"```\n{tesseract_text}\n```\n\n"
else:
    markdown += "*未安装或识别失败*\n\n"

markdown_file = Path("docs/OCR方案对比测试结果.md")
with open(markdown_file, 'w', encoding='utf-8') as f:
    f.write(markdown)

print(f"Markdown 对比报告已保存到: {markdown_file}")
print("\n测试完成!")
