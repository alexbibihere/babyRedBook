#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量OCR处理脚本 (适配新版PaddleOCR)
用于处理图片并识别文字
"""

from paddleocr import PaddleOCR
import sys
import json

# 初始化OCR
try:
    ocr = PaddleOCR(lang='ch')
except Exception as e:
    print(json.dumps({
        'error': str(e),
        'message': 'PaddleOCR初始化失败,请检查是否已安装: pip install paddleocr'
    }, ensure_ascii=False))
    sys.exit(1)

# 读取图片路径
if len(sys.argv) < 2:
    print(json.dumps({'error': '请提供图片路径'}, ensure_ascii=False))
    sys.exit(1)

image_path = sys.argv[1]

try:
    # 执行识别 (使用ocr方法)
    result = ocr.ocr(image_path)

    # 提取文字 - 新版数据结构
    texts = []
    if result and len(result) > 0:
        first_result = result[0]
        if isinstance(first_result, dict) and 'rec_texts' in first_result:
            # 新版格式
            rec_texts = first_result['rec_texts']
            rec_scores = first_result.get('rec_scores', [])
            for i, text in enumerate(rec_texts):
                confidence = rec_scores[i] if i < len(rec_scores) else 0.0
                texts.append({
                    'text': text,
                    'confidence': float(confidence)
                })

    # 输出结果
    output = {
        'image': image_path,
        'texts': texts,
        'full_text': '\n'.join([t['text'] for t in texts]),
        'line_count': len(texts),
        'char_count': sum(len(t['text']) for t in texts)
    }

    print(json.dumps(output, ensure_ascii=False, indent=2))

except Exception as e:
    import traceback
    print(json.dumps({
        'error': str(e),
        'image': image_path,
        'traceback': traceback.format_exc()
    }, ensure_ascii=False), file=sys.stderr)
    sys.exit(1)
