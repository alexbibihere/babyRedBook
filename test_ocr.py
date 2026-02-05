#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from paddleocr import PaddleOCR
import sys
import json

# 初始化OCR
ocr = PaddleOCR(use_angle_cls=True, lang='ch')

# 读取图片路径
image_path = sys.argv[1]

# 执行识别
result = ocr.ocr(image_path, cls=True)

# 提取文字
texts = []
if result and result[0]:
    for line in result[0]:
        text = line[1][0]
        confidence = line[1][1]
        texts.append({
            'text': text,
            'confidence': confidence
        })

# 输出结果
output = {
    'image': image_path,
    'texts': texts,
    'full_text': '\n'.join([t['text'] for t in texts])
}

print(json.dumps(output, ensure_ascii=False, indent=2))
