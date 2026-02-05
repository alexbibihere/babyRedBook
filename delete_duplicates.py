#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
删除网易云音乐文件夹中的重复文件
保留原文件，删除带 (1), (2) 等标记的副本
"""

from pathlib import Path
import re

music_dir = Path(r'D:\CloudMusic\VipSongsDownload')

# 扫描所有文件
files = list(music_dir.glob('*'))
files = [f for f in files if f.is_file()]

print(f"找到 {len(files)} 个文件\n")

# 找出重复文件
files_to_delete = []
duplicate_groups = []

# 按基本文件名分组（去掉 (1), (2) 等后缀）
base_names = {}
for file in files:
    # 匹配模式: 文件名 (数字).ncm
    name = file.stem
    ext = file.suffix
    
    # 检查是否是副本（带数字标记）
    match = re.search(r' \(\d+\)$', name)
    
    if match:
        # 这是一个副本文件
        base_name = name[:-len(match.group(0))]  # 去掉 (数字)
        original_name = base_name + ext
        
        if original_name not in base_names:
            base_names[original_name] = {'original': None, 'copies': []}
        
        base_names[original_name]['copies'].append(file)
    else:
        # 这可能是原文件
        full_name = name + ext
        if full_name not in base_names:
            base_names[full_name] = {'original': None, 'copies': []}
        
        base_names[full_name]['original'] = file

# 找出真正有重复的组
for name, group in base_names.items():
    if group['original'] and group['copies']:
        duplicate_groups.append({
            'original': group['original'],
            'copies': group['copies']
        })

print(f"发现 {len(duplicate_groups)} 组重复文件\n")

# 显示重复文件
total_delete_size = 0

for i, group in enumerate(duplicate_groups, 1):
    original = group['original']
    copies = group['copies']
    
    print(f"--- 组 {i} ---")
    print(f"原文件: {original.name} ({original.stat().st_size / 1024 / 1024:.2f} MB)")
    
    for copy in copies:
        size_mb = copy.stat().st_size / 1024 / 1024
        print(f"  [删除] {copy.name} ({size_mb:.2f} MB)")
        total_delete_size += copy.stat().st_size
        files_to_delete.append(copy)
    
    print()

print("=" * 60)
print(f"总结:")
print(f"  重复组数: {len(duplicate_groups)}")
print(f"  将删除文件: {len(files_to_delete)}")
print(f"  可释放空间: {total_delete_size / 1024 / 1024:.2f} MB")
print("=" * 60)

# 确认删除
response = input("\n确认删除这些重复文件吗? (yes/no): ")

if response.lower() in ['yes', 'y']:
    deleted_count = 0
    deleted_size = 0
    
    for file in files_to_delete:
        try:
            size = file.stat().st_size
            file.unlink()
            deleted_count += 1
            deleted_size += size
            print(f"✓ 已删除: {file.name}")
        except Exception as e:
            print(f"✗ 删除失败 {file.name}: {e}")
    
    print(f"\n完成! 删除了 {deleted_count} 个文件，释放 {deleted_size / 1024 / 1024:.2f} MB")
else:
    print("\n已取消删除")
