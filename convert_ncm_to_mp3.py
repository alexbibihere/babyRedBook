#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量转换 ncm 文件为 mp3
"""

from pathlib import Path
import sys
from concurrent.futures import ThreadPoolExecutor
import time

def convert_ncm(ncm_file, output_dir, index, total):
    """转换单个 ncm 文件"""
    try:
        from ncmdump import dump
        
        output_file = output_dir / f"{ncm_file.stem}.mp3"
        
        # 如果输出文件已存在，跳过
        if output_file.exists():
            return {
                'status': 'skip',
                'file': ncm_file.name,
                'reason': '已存在'
            }
        
        # 转换
        dump(str(ncm_file), str(output_file))
        
        return {
            'status': 'success',
            'file': ncm_file.name,
            'output': output_file.name,
            'size_mb': output_file.stat().st_size / 1024 / 1024
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'file': ncm_file.name,
            'error': str(e)
        }

def main():
    music_dir = Path(r'D:\CloudMusic\VipSongsDownload')
    output_dir = music_dir / 'converted_mp3'
    output_dir.mkdir(exist_ok=True)
    
    # 扫描所有 ncm 文件
    ncm_files = list(music_dir.glob('*.ncm'))
    total = len(ncm_files)
    
    if total == 0:
        print("没有找到 ncm 文件")
        return
    
    print(f"找到 {total} 个 ncm 文件")
    print(f"输出目录: {output_dir}\n")
    
    # 统计
    success_count = 0
    skip_count = 0
    error_count = 0
    total_size = 0
    
    start_time = time.time()
    
    # 使用多线程加速转换（最多4个线程）
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = []
        for i, ncm_file in enumerate(ncm_files, 1):
            future = executor.submit(convert_ncm, ncm_file, output_dir, i, total)
            futures.append(future)
        
        # 收集结果
        for future in futures:
            result = future.result()
            
            if result['status'] == 'success':
                success_count += 1
                total_size += result.get('size_mb', 0)
                print(f"[{success_count}/{total}] OK: {result['file'][:50]}... -> {result['output'][:50]}")
            
            elif result['status'] == 'skip':
                skip_count += 1
                print(f"[跳过] {result['file'][:50]}... ({result['reason']})")
            
            elif result['status'] == 'error':
                error_count += 1
                print(f"[错误] {result['file'][:50]}...: {result.get('error', 'Unknown error')}")
    
    # 总结
    elapsed = time.time() - start_time
    
    print("\n" + "=" * 60)
    print("转换完成!")
    print("=" * 60)
    print(f"成功转换: {success_count} 个文件")
    print(f"跳过: {skip_count} 个文件")
    print(f"失败: {error_count} 个文件")
    print(f"总大小: {total_size:.2f} MB")
    print(f"耗时: {elapsed:.1f} 秒")
    print(f"输出目录: {output_dir}")

if __name__ == '__main__':
    main()
