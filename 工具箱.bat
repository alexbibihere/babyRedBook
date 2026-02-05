@echo off
chcp 65001 >nul
title 多功能工具箱 v1.0

:main
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    多功能工具箱 v1.0                       ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  1. 删除重复文件                                         ║
echo ║  2. NCM转MP3 (网易云音乐转换)                            ║
echo ║  3. 批量OCR图片识别                                      ║
echo ║  4. 清理临时文件                                         ║
echo ║  5. 批量重命名文件                                       ║
echo ║  6. 查看系统信息                                         ║
echo ║  0. 退出                                                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
set /p choice="请选择功能 (0-6): "

if "%choice%"=="1" goto delete_duplicates
if "%choice%"=="2" goto convert_ncm
if "%choice%"=="3" goto ocr_images
if "%choice%"=="4" goto clean_temp
if "%choice%"=="5" goto rename_files
if "%choice%"=="6" goto sys_info
if "%choice%"=="0" goto end
goto main

:: ============================================================
:: 1. 删除重复文件
:: ============================================================
:delete_duplicates
cls
echo ══════════════════════════════════════════════════════════
echo                删除重复文件工具
echo ══════════════════════════════════════════════════════════
echo.
set /p target_dir="请输入要清理的目录路径: "
if "%target_dir%"=="" goto main

echo.
echo 正在扫描 %target_dir% ...
echo.

python -c "from pathlib import Path; import re; d = Path(r'%target_dir%'); files = [f for f in d.glob('*') if f.is_file()]; dup_count = 0; base_names = {}; 
for file in files:
    name = file.stem
    ext = file.suffix
    match = re.search(r' \(\d+\)$', name)
    if match:
        base_name = name[:-len(match.group(0))] + ext
        if base_name in base_names:
            try:
                file.unlink()
                dup_count += 1
                print(f'已删除: {file.name}')
            except:
                pass
        else:
            base_names[base_name] = True

print(f'\n完成! 共删除 {dup_count} 个重复文件')"

echo.
pause
goto main

:: ============================================================
:: 2. NCM转MP3
:: ============================================================
:convert_ncm
cls
echo ══════════════════════════════════════════════════════════
echo              NCM转MP3工具 (网易云音乐)
echo ══════════════════════════════════════════════════════════
echo.
set /p music_dir="请输入网易云音乐目录路径: "
if "%music_dir%"=="" set "music_dir=D:\CloudMusic\VipSongsDownload"

echo.
echo 目标目录: %music_dir%
echo 正在转换...
echo.

python -c "from pathlib import Path; from concurrent.futures import ThreadPoolExecutor; from ncmdump import dump; d = Path(r'%music_dir%'); out = d / 'converted_mp3'; out.mkdir(exist_ok=True); ncm_files = list(d.glob('*.ncm')); 
def convert(f):
    try:
        output = out / f'{f.stem}.mp3'
        if not output.exists():
            dump(str(f), str(output))
        return 'ok', f.name
    except:
        return 'err', f.name

with ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(convert, ncm_files))

ok = sum(1 for r in results if r[0]=='ok')
print(f'转换完成: {ok}/{len(ncm_files)} 个文件')
print(f'输出目录: {out}')"

echo.
pause
goto main

:: ============================================================
:: 3. OCR图片识别
:: ============================================================
:ocr_images
cls
echo ══════════════════════════════════════════════════════════
echo                OCR图片批量识别工具
echo ══════════════════════════════════════════════════════════
echo.
echo 请确保已安装 PaddleOCR: pip install paddleocr
echo.
set /p img_dir="请输入图片目录路径: "
if "%img_dir%"=="" goto main

echo.
echo 正在识别图片...
echo.

python -c "from pathlib import Path; from paddleocr import PaddleOCR; d = Path(r'%img_dir%'); images = list(d.glob('*.png')) + list(d.glob('*.jpg')); 
print(f'找到 {len(images)} 张图片');
ocr = PaddleOCR(use_angle_cls=True, lang='ch');
results = [];
for i, img in enumerate(images[:10], 1):
    result = ocr.ocr(str(img), cls=True);
    text = '';
    if result and result[0]:
        text = '\n'.join([line[1][0] for line in result[0]]);
    results.append({'image': img.name, 'text': text[:100]});
    print(f'[{i}/{min(10, len(images))}] {img.name[:30]}...');

import json;
with open(d / 'ocr_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2);

print(f'\n完成! 结果已保存到: {d / \"ocr_results.json\"}')"

echo.
pause
goto main

:: ============================================================
:: 4. 清理临时文件
:: ============================================================
:clean_temp
cls
echo ══════════════════════════════════════════════════════════
echo                  清理临时文件工具
echo ══════════════════════════════════════════════════════════
echo.
echo 正在清理临时文件...
echo.

:: 清理Windows临时文件
echo 清理 %%TEMP%% ...
del /q /s "%TEMP%\*" 2>nul

:: 清理浏览器缓存
echo 清理浏览器缓存...
del /q /s "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache\*" 2>nul
del /q /s "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache\*" 2>nul

:: 清理回收站
echo 清理回收站...
powershell -Command "Clear-RecycleBin -Force" 2>nul

echo.
echo 清理完成!
echo.
pause
goto main

:: ============================================================
:: 5. 批量重命名
:: ============================================================
:rename_files
cls
echo ══════════════════════════════════════════════════════════
echo                  批量重命名工具
echo ══════════════════════════════════════════════════════════
echo.
set /p target_dir="请输入目录路径: "
if "%target_dir%"=="" goto main

echo.
set /p prefix="请输入新文件名前缀: "
set /p start_num="请输入起始编号: "

echo.
echo 正在重命名...
echo.

set /a count=%start_num%
for %%f in ("%target_dir%\*") do (
    ren "%%f" "%prefix%_!count!%%~xf"
    set /a count+=1
)

echo.
echo 重命名完成!
echo.
pause
goto main

:: ============================================================
:: 6. 系统信息
:: ============================================================
:sys_info
cls
echo ══════════════════════════════════════════════════════════
echo                    系统信息
echo ══════════════════════════════════════════════════════════
echo.

echo 操作系统:
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"

echo.
echo 计算机信息:
systeminfo | findstr /B /C:"System Type" /C:"Total Physical Memory"

echo.
echo 磁盘信息:
wmic logicaldisk get name,size,freespace

echo.
echo Python版本:
python --version

echo.
echo Pip包列表:
pip list

echo.
pause
goto main

:: ============================================================
:: 退出
:: ============================================================
:end
exit
