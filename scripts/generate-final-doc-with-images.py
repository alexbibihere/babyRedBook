#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用已有的笔记文本 + 下载的图片生成最终 Markdown 文档
"""

import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# 数据路径
notes_file = Path("data/notes-cleaned.json")
image_dir = Path(r"D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download")
output_file = Path("docs/小红书笔记完整合集.md")

print("=" * 50)
print("生成小红书笔记完整文档")
print("=" * 50)

# 读取笔记数据
print(f"\n读取笔记数据: {notes_file}")
with open(notes_file, 'r', encoding='utf-8') as f:
    notes = json.load(f)

print(f"笔记数量: {len(notes)}")

# 读取图片文件
print(f"\n扫描图片目录: {image_dir}")
images = list(image_dir.glob('*.png')) + list(image_dir.glob('*.jpg'))
print(f"图片数量: {len(images)}")

# 创建标题到图片的映射
title_to_images = defaultdict(list)
for img in images:
    # 文件名格式: 日期_时间_作者_标题_序号.png
    name = img.stem
    parts = name.split('_')

    if len(parts) >= 4:
        # 提取标题 (第4个部分到最后第2个部分)
        title = '_'.join(parts[3:-1]) if len(parts) > 4 else parts[3]
        title_to_images[title].append(str(img))

# 按 URL 匹配图片
print(f"\n匹配笔记和图片...")
matched = 0
for note in notes:
    title = note['title']

    # 精确匹配标题
    if title in title_to_images:
        note['local_images'] = title_to_images[title]
        matched += 1

    # 如果没匹配到,尝试模糊匹配
    else:
        for img_title in title_to_images.keys():
            if title in img_title or img_title in title:
                note['local_images'] = title_to_images[img_title]
                matched += 1
                break

print(f"成功匹配: {matched}/{len(notes)} 篇笔记")

# 生成 Markdown
print("\n生成 Markdown 文档...")
markdown = f"""# 小红书笔记完整合集

> 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
> 笔记数量: {len(notes)}
> 图片数量: {len(images)}

---

"""

# 按作者分组
notes_by_author = defaultdict(list)
for note in notes:
    notes_by_author[note.get('author', '未知')].append(note)

# 生成每个作者的内容
for author, author_notes in sorted(notes_by_author.items()):
    if not author or author == '未知':
        continue

    markdown += f"## ✍️ {author}\n\n"

    for note in author_notes:
        title = note.get('title', '无标题')
        content = note.get('content', '')
        likes = note.get('likes', '0')
        url = note.get('url', '')
        local_images = note.get('local_images', [])

        markdown += f"### {title}\n\n"

        if likes:
            markdown += f"**❤️ 点赞**: {likes}\n\n"

        if url:
            markdown += f"**🔗 链接**: {url}\n\n"

        # 正文内容
        if content:
            markdown += f"#### 📄 正文\n\n{content}\n\n"

        # 图片展示
        if local_images:
            markdown += f"#### 📷 图片 ({len(local_images)} 张)\n\n"
            for i, img_path in enumerate(local_images, 1):
                # 使用相对路径
                rel_path = Path(img_path).as_posix()
                markdown += f"![{title}-图片{i}](file:///{rel_path})\n\n"

        markdown += "---\n\n"

# 保存文件
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(markdown)

print(f"文档已生成: {output_file}")
print(f"文件大小: {output_file.stat().st_size / 1024:.2f} KB")
print("\n" + "=" * 50)
print("完成!")
print("=" * 50)
