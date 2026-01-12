#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
单张图片 OCR 识别
使用 PaddleOCR 进行中文文字识别
"""

import sys
import json
from paddleocr import PaddleOCR

def ocr_image(image_path):
    """对单张图片进行 OCR 识别"""

    try:
        # 初始化 PaddleOCR (使用中英文模型)
        ocr = PaddleOCR(
            use_angle_cls=True,
            lang='ch',
            show_log=False
        )

        # 执行识别
        result = ocr.ocr(image_path, cls=True)

        if not result or not result[0]:
            return {
                'text': '',
                'confidence': 0,
                'details': []
            }

        # 提取文字和置信度
        texts = []
        total_confidence = 0
        details = []

        for line in result[0]:
            if line:
                box = line[0]
                text_info = line[1]
                text = text_info[0]
                confidence = text_info[1]

                texts.append(text)
                total_confidence += confidence
                details.append({
                    'text': text,
                    'confidence': confidence,
                    'box': box
                })

        # 合并所有文字
        full_text = '\n'.join(texts)
        avg_confidence = total_confidence / len(result[0]) if result[0] else 0

        return {
            'text': full_text,
            'confidence': avg_confidence,
            'details': details
        }

    except Exception as e:
        return {
            'text': '',
            'confidence': 0,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': '请提供图片路径'}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = ocr_image(image_path)
    print(json.dumps(result, ensure_ascii=False, indent=2))
