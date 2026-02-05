#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 XHS-Downloader 下载的数据中提取笔记文本
XHS-Downloader 下载时会自动保存笔记的文本内容到 SQLite 数据库
"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime

# XHS-Downloader 数据保存路径
data_dir = Path(r"D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download")
db_file = data_dir / "data.db"  # 或者查找 .db 文件

print("=" * 50)
print("查找 XHS-Downloader 数据库...")
print("=" * 50)

# 查找数据库文件
db_files = list(data_dir.glob("*.db"))
if db_files:
    print(f"\n找到数据库文件: {db_files[0]}")
    db_file = db_files[0]
else:
    print("\n未找到数据库文件")
    print("尝试从 JSON 文件读取...")

    # 查找 JSON 文件
    json_files = list(data_dir.glob("*.json"))
    if json_files:
        print(f"找到 JSON 文件: {json_files[0]}")
        with open(json_files[0], 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"\n笔记数量: {len(data) if isinstance(data, list) else 'N/A'}")
            if isinstance(data, list) and len(data) > 0:
                print(f"\n第一条数据示例:")
                print(json.dumps(data[0], ensure_ascii=False, indent=2))
    else:
        print("未找到数据文件")
        print("\n提示: XHS-Downloader 需要在设置中开启'保存数据'选项")
