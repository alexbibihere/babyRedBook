@echo off
chcp 65001 >nul
title 综合系统修复工具 v3.0
color 0B

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] 需要管理员权限运行此脚本
    echo 正在请求管理员权限...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit
)

:main
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║              综合系统修复工具 v3.0                        ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║                                                            ║
echo ║  系统修复:                                                ║
echo ║  1. 网络修复 - 重置网络适配器和DNS                        ║
echo ║  2. 依赖环境修复 - 安装Python依赖包                       ║
echo ║  3. 数据完整性检查 - 修复数据缺失问题                     ║
echo ║  4. 删除重复文件 - 清理重复文件                           ║
echo ║  5. 数据导出修复 - 修复导出失败问题                       ║
echo ║  6. 系统环境优化 - 清理临时文件和缓存                     ║
echo ║                                                            ║
echo ║  高级工具:                                                ║
echo ║  7. NCM转MP3 - 网易云音乐格式转换                         ║
echo ║  8. OCR图片识别 - 批量图片文字识别                        ║
echo ║  9. 批量重命名 - 文件批量重命名                           ║
echo ║                                                            ║
echo ║  10. 全自动修复 - 执行所有修复操作                         ║
echo ║                                                            ║
echo ║  0. 退出程序                                              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
set /p choice="请选择功能 (0-10): "

if "%choice%"=="1" goto fix_network
if "%choice%"=="2" goto fix_dependencies
if "%choice%"=="3" goto fix_data_integrity
if "%choice%"=="4" goto delete_duplicates
if "%choice%"=="5" goto fix_export
if "%choice%"=="6" goto system_optimize
if "%choice%"=="7" goto convert_ncm
if "%choice%"=="8" goto ocr_images
if "%choice%"=="9" goto rename_files
if "%choice%"=="10" goto full_fix
if "%choice%"=="0" goto end
goto main

:: ============================================================
:: 1. 网络修复
:: ============================================================
:fix_network
cls
echo ══════════════════════════════════════════════════════════
echo                      网络修复
echo ══════════════════════════════════════════════════════════
echo.

echo [1/6] 释放IP地址...
ipconfig /release >nul 2>&1

echo [2/6] 刷新DNS缓存...
ipconfig /flushdns

echo [3/6] 注册DNS...
ipconfig /registerdns >nul 2>&1

echo [4/6] 重新获取IP地址...
ipconfig /renew >nul 2>&1

echo [5/6] 重启WLAN AutoConfig服务...
net stop WlanSvc /y >nul 2>&1
timeout /t 2 >nul
net start WlanSvc >nul 2>&1

echo [6/6] 重置网络适配器...
powershell -Command "Get-NetAdapter | Restart-NetAdapter" >nul 2>&1

echo.
echo [√] 网络修复完成!
echo.
echo 正在测试网络连接...
ping -n 4 223.5.5.5 | findstr "TTL" >nul
if %errorLevel%==0 (
    echo [√] 网络连接正常
) else (
    echo [!] 网络可能仍有问题，建议重启计算机
)
echo.
pause
goto main

:: ============================================================
:: 2. 依赖环境修复
:: ============================================================
:fix_dependencies
cls
echo ══════════════════════════════════════════════════════════
echo                  依赖环境修复
echo ══════════════════════════════════════════════════════════
echo.
echo 正在检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Python，请先安装Python 3.8+
    pause
    goto main
)

echo [√] Python环境正常
echo.
echo 正在升级pip...
python -m pip install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple

echo.
echo 正在安装核心依赖包...
echo [1/6] 安装requests库...
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple

echo [2/6] 安装pillow图像处理库...
pip install pillow -i https://pypi.tuna.tsinghua.edu.cn/simple

echo [3/6] 安装PaddleOCR...
pip install paddleocr -i https://pypi.tuna.tsinghua.edu.cn/simple

echo [4/6] 安装paddlepaddle...
pip install paddlepaddle -i https://pypi.tuna.tsinghua.edu.cn/simple

echo [5/6] 安装NCM转换工具...
pip install ncmdump -i https://pypi.tuna.tsinghua.edu.cn/simple

echo [6/6] 安装其他工具...
pip install pyyaml tqdm openpyxl -i https://pypi.tuna.tsinghua.edu.cn/simple

echo.
echo [√] 依赖安装完成!
echo.
pause
goto main

:: ============================================================
:: 3. 数据完整性检查
:: ============================================================
:fix_data_integrity
cls
echo ══════════════════════════════════════════════════════════
echo                  数据完整性检查
echo ══════════════════════════════════════════════════════════
echo.

if not exist "data" (
    echo [!] 创建data目录...
    mkdir data
)

echo [1/4] 检查notes.json...
if not exist "data\notes.json" (
    echo [!] 创建空的notes.json...
    echo [] > "data\notes.json"
) else (
    python -c "import json; data=json.load(open('data/notes.json', encoding='utf-8')); print(f'[√] notes.json正常，包含{len(data)}条笔记')" 2>nul
)

echo [2/4] 检查collections.json...
if not exist "data\collections.json" (
    echo [!] 创建空的collections.json...
    echo [] > "data\collections.json"
) else (
    python -c "import json; data=json.load(open('data/collections.json', encoding='utf-8')); print(f'[√] collections.json正常，包含{len(data)}条收藏')" 2>nul
)

echo [3/4] 检查likes.json...
if not exist "data\likes.json" (
    echo [!] 创建空的likes.json...
    echo [] > "data\likes.json"
) else (
    python -c "import json; data=json.load(open('data/likes.json', encoding='utf-8')); print(f'[√] likes.json正常，包含{len(data)}条点赞')" 2>nul
)

echo [4/4] 修复JSON格式错误...
python -c "
import json
import os

for file in ['notes.json', 'collections.json', 'likes.json']:
    path = f'data/{file}'
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f'[√] {file} 格式正常')
        except Exception as e:
            print(f'[!] {file} 存在错误: {e}')
            os.rename(path, path + '.backup')
            print(f'[!] 已备份到 {file}.backup')
            with open(path, 'w', encoding='utf-8') as f:
                json.dump([], f)
            print(f'[√] 已重置 {file}')
" 2>nul

echo.
echo [√] 数据完整性检查完成!
echo.
pause
goto main

:: ============================================================
:: 4. 删除重复文件
:: ============================================================
:delete_duplicates
cls
echo ══════════════════════════════════════════════════════════
echo                  删除重复文件
echo ══════════════════════════════════════════════════════════
echo.
set /p target_dir="请输入要清理的目录 (留空则清理当前目录): "

if "%target_dir%"=="" set "target_dir=."

echo.
echo 正在扫描 %target_dir% ...
echo.

python -c "
from pathlib import Path
import re

d = Path(r'%target_dir%')
files = [f for f in d.glob('**/*') if f.is_file()]
dup_count = 0
base_names = {}

for file in files:
    name = file.stem
    ext = file.suffix.lower()

    match = re.search(r' \(\d+\)$', name)
    if match:
        base_name = name[:-len(match.group(0))] + ext
        if base_name in base_names:
            try:
                file.unlink()
                dup_count += 1
                print(f'已删除: {file.relative_to(d)}')
            except:
                pass
        else:
            base_names[base_name] = True
    else:
        base_names[name + ext] = True

print(f'\n[√] 完成! 共删除 {dup_count} 个重复文件')
"

echo.
pause
goto main

:: ============================================================
:: 5. 数据导出修复
:: ============================================================
:fix_export
cls
echo ══════════════════════════════════════════════════════════
echo                  数据导出修复
echo ══════════════════════════════════════════════════════════
echo.

if not exist "data\notes.json" (
    echo [!] 未找到data/notes.json
    echo 请先收集数据
    pause
    goto main
)

echo [1/3] 检查数据完整性...
python -c "
import json
try:
    with open('data/notes.json', 'r', encoding='utf-8') as f:
        notes = json.load(f)
    print(f'[√] notes.json 包含 {len(notes)} 条笔记')
except Exception as e:
    print(f'[!] 数据读取失败: {e}')
    exit(1)
"

if errorlevel 1 (
    pause
    goto main
)

echo [2/3] 创建导出目录...
if not exist "export" mkdir export

echo [3/3] 生成导出文件...
python -c "
import json
from datetime import datetime
import csv

with open('data/notes.json', 'r', encoding='utf-8') as f:
    notes = json.load(f)

# 生成Markdown
with open('export/notes.md', 'w', encoding='utf-8') as f:
    f.write(f'# 小红书笔记导出\n\n')
    f.write(f'导出时间: {datetime.now().strftime(\"%%Y-%%m-%%d %%H:%%M:%%S\")}\n\n')
    f.write(f'---\n\n')

    for note in notes:
        f.write(f'## {note.get(\"title\", \"无标题\")}\n\n')
        if note.get('content'):
            f.write(f'{note[\"content\"]}\n\n')
        if note.get('tags'):
            f.write(f'标签: {\", \".join(note[\"tags\"])}\n\n')
        f.write(f'链接: {note.get(\"url\", \"\")}\n\n')
        f.write(f'发布时间: {note.get(\"createTime\", \"未知\")}\n\n')
        f.write(f'---\n\n')

print(f'[√] 已生成 export/notes.md')

# 生成CSV
with open('export/notes.csv', 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['标题', '内容', '链接', '发布时间', '点赞数', '收藏数'])
    for note in notes:
        writer.writerow([
            note.get('title', ''),
            note.get('content', '')[:100],
            note.get('url', ''),
            note.get('createTime', ''),
            note.get('likes', 0),
            note.get('collects', 0)
        ])

print(f'[√] 已生成 export/notes.csv')
print(f'[√] 导出完成! 共 {len(notes)} 条笔记')
"

echo.
pause
goto main

:: ============================================================
:: 6. 系统环境优化
:: ============================================================
:system_optimize
cls
echo ══════════════════════════════════════════════════════════
echo                  系统环境优化
echo ══════════════════════════════════════════════════════════
echo.

echo [1/5] 清理Python缓存...
if exist "__pycache__" rmdir /s /q __pycache__ 2>nul
del /s /q *.pyc 2>nul
echo [√] Python缓存已清理

echo [2/5] 清理项目临时文件...
del /q "*.log" 2>nul
del /q "nul" 2>nul
del /q "debug.png" 2>nul
echo [√] 临时文件已清理

echo [3/5] 清理系统临时文件...
del /q /s "%TEMP%\*" 2>nul
del /q /s "%LOCALAPPDATA%\Temp\*" 2>nul
echo [√] 系统临时文件已清理

echo [4/5] 清理DNS缓存...
ipconfig /flushdns >nul 2>&1
echo [√] DNS缓存已清理

echo [5/5] 清理回收站...
powershell -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue" 2>nul
echo [√] 回收站已清理

echo.
echo [√] 系统优化完成!
echo.
pause
goto main

:: ============================================================
:: 7. NCM转MP3
:: ============================================================
:convert_ncm
cls
echo ══════════════════════════════════════════════════════════
echo              NCM转MP3工具 (网易云音乐)
echo ══════════════════════════════════════════════════════════
echo.
set /p music_dir="请输入网易云音乐目录路径 (留空使用默认): "
if "%music_dir%"=="" set "music_dir=D:\CloudMusic\VipSongsDownload"

echo.
echo 目标目录: %music_dir%
echo 正在转换...
echo.

python -c "
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
try:
    from ncmdump import dump
except:
    print('[!] 未安装ncmdump，正在安装...')
    import subprocess
    subprocess.run(['pip', 'install', 'ncmdump', '-i', 'https://pypi.tuna.tsinghua.edu.cn/simple'])
    from ncmdump import dump

d = Path(r'%music_dir%')
out = d / 'converted_mp3'
out.mkdir(exist_ok=True)
ncm_files = list(d.glob('*.ncm'))

if not ncm_files:
    print('[!] 未找到NCM文件')
    exit(0)

print(f'找到 {len(ncm_files)} 个NCM文件')

def convert(f):
    try:
        output = out / f'{f.stem}.mp3'
        if not output.exists():
            dump(str(f), str(output))
        return 'ok', f.name
    except Exception as e:
        return 'err', f'{f.name}: {str(e)}'

with ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(convert, ncm_files))

ok = sum(1 for r in results if r[0]=='ok')
err = [r[1] for r in results if r[0]=='err']

print(f'\n转换完成: {ok}/{len(ncm_files)} 个文件')
print(f'输出目录: {out}')
if err:
    print(f'\n失败的文件:')
    for e in err[:5]:
        print(f'  - {e}')
"

echo.
pause
goto main

:: ============================================================
:: 8. OCR图片识别
:: ============================================================
:ocr_images
cls
echo ══════════════════════════════════════════════════════════
echo                OCR图片批量识别工具
echo ══════════════════════════════════════════════════════════
echo.
set /p img_dir="请输入图片目录路径: "
if "%img_dir%"=="" goto main

echo.
set /p ocr_engine="选择OCR引擎 (1=PaddleOCR, 2=EasyOCR, 3=Tesseract): "

if "%ocr_engine%"=="1" set "ocr_cmd=from paddleocr import PaddleOCR; ocr = PaddleOCR(use_angle_cls=True, lang='ch')"
if "%ocr_engine%"=="2" set "ocr_cmd=import easyocr; reader = easyocr.Reader(['ch_sim', 'en'])"
if "%ocr_engine%"=="3" set "ocr_cmd=import pytesseract; from PIL import Image"
if "%ocr_engine%"=="" set "ocr_cmd=from paddleocr import PaddleOCR; ocr = PaddleOCR(use_angle_cls=True, lang='ch')"

echo.
echo 正在识别图片...
echo.

python -c "
from pathlib import Path
import json
%ocr_cmd%

d = Path(r'%img_dir%')
images = list(d.glob('*.png')) + list(d.glob('*.jpg')) + list(d.glob('*.jpeg'))
print(f'找到 {len(images)} 张图片')

results = []
for i, img in enumerate(images, 1):
    try:
        if 'PaddleOCR' in '%ocr_engine%':
            result = ocr.ocr(str(img), cls=True)
            text = '\\n'.join([line[1][0] for line in result[0]]) if result and result[0] else ''
        elif 'easyocr' in '%ocr_engine%':
            result = reader.readtext(str(img))
            text = '\\n'.join([r[1] for r in result])
        else:
            text = pytesseract.image_to_string(Image.open(img), lang='chi_sim+eng')

        results.append({'image': img.name, 'text': text[:500]})
        print(f'[{i}/{len(images)}] {img.name[:30]}...')
    except Exception as e:
        results.append({'image': img.name, 'text': f'识别失败: {str(e)}'})
        print(f'[{i}/{len(images)}] {img.name[:30]}... 失败')

with open(d / 'ocr_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f'\n完成! 结果已保存到: {d / \"ocr_results.json\"}')
"

echo.
pause
goto main

:: ============================================================
:: 9. 批量重命名
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

setlocal enabledelayedexpansion
set /a count=%start_num%
for %%f in ("%target_dir%\*") do (
    ren "%%f" "%prefix%_!count!%%~xf" 2>nul
    if not errorlevel 1 (
        echo 重命名: %%~nxf -> %prefix%_!count!%%~xf
    )
    set /a count+=1
)
endlocal

echo.
echo 重命名完成!
echo.
pause
goto main

:: ============================================================
:: 10. 全自动修复
:: ============================================================
:full_fix
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    全自动修复模式                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 将依次执行所有修复操作...
echo.
pause

echo.
echo ══════════════════════════════════════════════════════════
echo [步骤 1/6] 网络修复
echo ══════════════════════════════════════════════════════════
call :fix_network_silent

echo.
echo ══════════════════════════════════════════════════════════
echo [步骤 2/6] 依赖环境修复
echo ══════════════════════════════════════════════════════════
call :fix_dependencies_silent

echo.
echo ══════════════════════════════════════════════════════════
echo [步骤 3/6] 数据完整性检查
echo ══════════════════════════════════════════════════════════
call :fix_data_integrity_silent

echo.
echo ══════════════════════════════════════════════════════════
echo [步骤 4/6] 删除重复文件
echo ══════════════════════════════════════════════════════════
call :delete_duplicates_silent

echo.
echo ══════════════════════════════════════════════════════════
echo [步骤 5/6] 数据导出修复
echo ══════════════════════════════════════════════════════════
call :fix_export_silent

echo.
echo ══════════════════════════════════════════════════════════
echo [步骤 6/6] 系统环境优化
echo ══════════════════════════════════════════════════════════
call :system_optimize_silent

cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║            ✅ 所有修复操作已完成!                        ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause
goto main

:: ============================================================
:: 静默执行函数
:: ============================================================
:fix_network_silent
echo 正在修复网络...
ipconfig /release >nul 2>&1
ipconfig /flushdns >nul 2>&1
ipconfig /renew >nul 2>&1
net stop WlanSvc /y >nul 2>&1
timeout /t 2 >nul
net start WlanSvc >nul 2>&1
powershell -Command "Get-NetAdapter | Restart-NetAdapter" >nul 2>&1
echo [√] 完成
goto :eof

:fix_dependencies_silent
echo 正在安装依赖...
pip install requests pillow paddleocr paddlepaddle ncmdump pyyaml tqdm openpyxl -i https://pypi.tuna.tsinghua.edu.cn/simple -q >nul 2>&1
echo [√] 完成
goto :eof

:fix_data_integrity_silent
echo 正在检查数据...
if not exist "data" mkdir data
if not exist "data\notes.json" echo [] > "data\notes.json"
if not exist "data\collections.json" echo [] > "data\collections.json"
if not exist "data\likes.json" echo [] > "data\likes.json"
echo [√] 完成
goto :eof

:delete_duplicates_silent
echo 正在清理重复文件...
python -c "from pathlib import Path; import re; d = Path('.'); files = [f for f in d.glob('*') if f.is_file()]; dup_count = 0; base_names = {}; [base_names.__setitem__(f.stem + f.suffix, True) if not re.search(r' \(\d+\)$', f.stem) else (base_names.__setitem__((f.stem[:-len(re.search(r' \(\d+\)$', f.stem).group(0))] + f.suffix, True) if (f.stem[:-len(re.search(r' \(\d+\)$', f.stem).group(0))] + f.suffix) not in base_names else (f.unlink(), dup_count.__iadd__(1))) for f in files]; print(f'[√] 删除了 {dup_count} 个重复文件')" 2>nul
echo [√] 完成
goto :eof

:fix_export_silent
echo 正在修复导出...
if exist "data\notes.json" (
    if not exist "export" mkdir export
    python -c "import json; from datetime import datetime; notes = json.load(open('data/notes.json', encoding='utf-8')); f=open('export/notes.md', 'w', encoding='utf-8'); f.write(f'# 小红书笔记导出\n\n导出时间: {datetime.now().strftime(\"%%Y-%%m-%%d %%H:%%M:%%S\")}\n\n---\n\n'); [f.write(f'## {n.get(\"title\", \"无标题\")}\n\n{n.get(\"content\", \"\")}\n\n标签: {\", \".join(n.get(\"tags\", []))}\n\n链接: {n.get(\"url\", \"\")}\n\n发布时间: {n.get(\"createTime\", \"未知\")}\n\n---\n\n') for n in notes]; f.close(); print('[√] 导出文件已生成')" 2>nul
) else (
    echo [!] 跳过（无数据）
)
goto :eof

:system_optimize_silent
echo 正在优化系统...
if exist "__pycache__" rmdir /s /q __pycache__ 2>nul
del /s /q *.pyc 2>nul
del /q "*.log" 2>nul
del /q "nul" 2>nul
del /q /s "%TEMP%\*" 2>nul
ipconfig /flushdns >nul 2>&1
powershell -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue" 2>nul
echo [√] 完成
goto :eof

:: ============================================================
:: 退出
:: ============================================================
:end
cls
echo.
echo 感谢使用综合系统修复工具!
echo.
timeout /t 2 >nul
exit
