#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复 OCR 结果的中文编码问题
"""

import json
import sys
from pathlib import Path

def fix_encoding(text):
    """尝试修复编码问题"""
    if not text:
        return text

    try:
        # 尝试多种编码修复
        # Latin-1 to UTF-8
        try:
            return text.encode('latin-1').decode('utf-8')
        except:
            pass

        # Windows-1252 to UTF-8
        try:
            return text.encode('windows-1252').decode('utf-8')
        except:
            pass

        # GBK to UTF-8
        try:
            return text.encode('gbk').decode('utf-8')
        except:
            pass

        return text
    except:
        return text

def main():
    notes_file = Path('data/notes-rebuilt.json')
    output_file = Path('data/notes-rebuilt-fixed.json')

    print('\n═══════════════════════════════════════')
    print('🔧 修复 OCR 编码问题')
    print('═══════════════════════════════════════\n')

    # 读取数据
    with open(notes_file, 'r', encoding='utf-8') as f:
        notes = json.load(f)

    print(f'📚 读取笔记数: {len(notes)}\n')

    # 修复每篇笔记的编码
    fixed_notes = []
    for note in notes:
        fixed_note = note.copy()

        # 修复 content 字段
        if 'content' in note and note['content']:
            fixed_note['content'] = fix_encoding(note['content'])

        # 修复 OCR 识别的文字
        if 'imageTexts' in note and note['imageTexts']:
            fixed_note['imageTexts'] = []
            for img in note['imageTexts']:
                fixed_img = img.copy()
                if 'text' in img and img['text']:
                    fixed_img['text'] = fix_encoding(img['text'])
                fixed_note['imageTexts'].append(fixed_img)

        fixed_notes.append(fixed_note)

        # 显示修复示例
        if note.get('content') and len(note.get('content', '')) > 50:
            original_preview = note.get('content', '')[:50]
            fixed_preview = fixed_note.get('content', '')[:50]
            print(f'笔记: {note.get("title", "无标题")}')
            print(f'  修复前: {original_preview}...')
            print(f'  修复后: {fixed_preview}...')
            print()

    # 保存修复后的数据
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(fixed_notes, f, ensure_ascii=False, indent=2)

    print(f'\n✅ 修复完成!')
    print(f'📁 已保存到: {output_file}\n')

if __name__ == '__main__':
    main()
