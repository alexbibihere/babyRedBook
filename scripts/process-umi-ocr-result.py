#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
处理 Umi-OCR 导出的结果，生成完整 Markdown 文档
"""

import json
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# 文件路径
umi_ocr_json = Path("data/umi-ocr-result.json")
notes_json = Path("data/notes-cleaned.json")
output_md = Path("docs/小红书笔记完整版-UmiOCR.md")
output_json = Path("data/notes-with-umi-ocr.json")

print("=" * 70)
print("处理 Umi-OCR 识别结果")
print("=" * 70)

# 1. 读取数据
print(f"\n读取笔记数据: {notes_json}")
with open(notes_json, 'r', encoding='utf-8') as f:
    notes = json.load(f)

print(f"读取 OCR 结果: {umi_ocr_json}")
with open(umi_ocr_json, 'r', encoding='utf-8') as f:
    ocr_results = json.load(f)

print(f"笔记数量: {len(notes)}")
print(f"OCR结果数量: {len(ocr_results)}")

# 2. 标准化标题函数
def normalize_title(t):
    # 将下划线、破折号等统一处理
    return re.sub(r'[_\-—–]+', '', t)

# 3. 匹配 OCR 结果到笔记
print("\n匹配 OCR 结果到笔记...")
matched_count = 0

for ocr_item in ocr_results:
    image_path = Path(ocr_item.get('image_path', ocr_item.get('path', '')))
    name = image_path.stem
    parts = name.split('_')
    
    if len(parts) >= 4:
        # 提取作者和标题信息
        author = parts[2]
        file_title = '_'.join(parts[3:-1]) if len(parts) > 4 else parts[3]
        file_title_norm = normalize_title(file_title)
        
        # 查找匹配的笔记
        for note in notes:
            note_title_norm = normalize_title(note.get('title', ''))
            note_author = note.get('author', '')
            
            # 同时匹配作者和标题
            if (author in note_author or note_author in author) and \
               (file_title_norm in note_title_norm or note_title_norm in file_title_norm):
                
                if 'images_with_ocr' not in note:
                    note['images_with_ocr'] = []
                
                # 添加 OCR 结果
                note['images_with_ocr'].append({
                    'path': str(image_path),
                    'filename': image_path.name,
                    'ocr_text': ocr_item.get('ocr_text', '')
                })
                
                matched_count += 1
                break

print(f"成功匹配: {matched_count} 张图片")

# 4. 保存 JSON 结果
print(f"\n保存 JSON 结果: {output_json}")
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(notes, f, ensure_ascii=False, indent=2)

# 5. 生成 Markdown 文档
print(f"\n生成 Markdown 文档: {output_md}")

total_images_with_ocr = sum(len(note.get('images_with_ocr', [])) for note in notes)

markdown = f"""# 小红书笔记完整版 (Umi-OCR 识别)

> 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
> 笔记数量: {len(notes)}
> 图片数量: {total_images_with_ocr}
> OCR 服务: Umi-OCR (离线识别)

## 说明

本文档包含:
- 笔记完整文本内容
- 作者、点赞数、链接
- 所有图片展示
- **图片文字 Umi-OCR 识别内容**

---

"""

# 按作者分组
notes_by_author = defaultdict(list)
for note in notes:
    notes_by_author[note.get('author', '未知')].append(note)

# 生成内容
for author, author_notes in sorted(notes_by_author.items()):
    if not author or author == '未知':
        continue
    
    markdown += f"## {author}\n\n"
    
    for note in author_notes:
        title = note.get('title', '无标题')
        content = note.get('content', '')
        likes = note.get('likes', '0')
        url = note.get('url', '')
        images_with_ocr = note.get('images_with_ocr', [])
        
        markdown += f"### {title}\n\n"
        
        if likes:
            markdown += f"**点赞**: {likes}\n\n"
        
        if url:
            markdown += f"**原文链接**: {url}\n\n"
        
        # 正文内容
        if content:
            markdown += f"#### 正文内容\n\n{content}\n\n"
        
        # 图片和OCR
        if images_with_ocr:
            markdown += f"#### 图片 ({len(images_with_ocr)} 张)\n\n"
            
            for i, img_info in enumerate(images_with_ocr, 1):
                img_path = img_info['path']
                rel_path = Path(img_path).as_posix()
                
                markdown += f"##### 图片 {i}\n\n"
                markdown += f"![{title}-图片{i}](file:///{rel_path})\n\n"
                
                # OCR 识别的文字
                ocr_text = img_info.get('ocr_text', '')
                if ocr_text and ocr_text.strip():
                    markdown += f"**OCR 识别文字**:\n\n"
                    markdown += f"```\n{ocr_text}\n```\n\n"
                else:
                    markdown += f"*（此图片未识别到文字）*\n\n"
        
        markdown += "---\n\n"

# 保存 Markdown
with open(output_md, 'w', encoding='utf-8') as f:
    f.write(markdown)

print(f"\n{'=' * 70}")
print("完成!")
print(f"{'=' * 70}")
print(f"\n查看结果:")
print(f"  Markdown: {output_md}")
print(f"  JSON: {output_json}")
print(f"\n统计:")
print(f"  笔记数: {len(notes)}")
print(f"  OCR图片: {total_images_with_ocr}")
