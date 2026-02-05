@echo off
chcp 65001 >nul
title 小红书笔记管理系统 - 一键修复工具 v2.0
color 0B

:main
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║     小红书笔记管理系统 - 一键修复工具 v2.0               ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║                                                            ║
echo ║  功能列表:                                                ║
echo ║  1. 依赖环境修复 - 安装Python依赖包                       ║
echo ║  2. 数据完整性检查 - 修复数据缺失问题                     ║
echo ║  3. 删除重复文件 - 清理重复的笔记和图片                   ║
echo ║  4. 数据导出修复 - 修复导出失败问题                       ║
echo ║  5. 系统环境优化 - 清理临时文件和缓存                     ║
echo ║  6. 全自动修复 - 执行所有修复操作                         ║
echo ║                                                            ║
echo ║  0. 退出程序                                              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
set /p choice="请选择功能 (0-6): "

if "%choice%"=="1" goto fix_dependencies
if "%choice%"=="2" goto fix_data_integrity
if "%choice%"=="3" goto delete_duplicates
if "%choice%"=="4" goto fix_export
if "%choice%"=="5" goto system_optimize
if "%choice%"=="6" goto full_fix
if "%choice%"=="0" goto end
goto main

:: ============================================================
:: 1. 依赖环境修复
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
python -m pip install --upgrade pip

echo.
echo 正在安装核心依赖包...
echo [1/6] 安装请求库...
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple

echo [2/6] 安装图像处理库...
pip install pillow -i https://pypi.tuna.tsinghua.edu.cn/simple

echo [3/6] 安装PaddleOCR...
pip install paddleocr -i https://pypi.tuna.tsinghua.edu.cn/simple

echo [4/6] 安装paddlepaddle...
pip install paddlepaddle -i https://pypi.tuna.tsinghua.edu.cn/simple

echo [5/6] 安装NCM转换工具...
pip install ncmdump -i https://pypi.tuna.tsinghua.edu.cn/simple

echo [6/6] 安装其他工具...
pip install pyyaml tqdm -i https://pypi.tuna.tsinghua.edu.cn/simple

echo.
echo [√] 依赖安装完成!
echo.
pause
goto main

:: ============================================================
:: 2. 数据完整性检查
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
            # 备份损坏的文件
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
:: 3. 删除重复文件
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

# 查找重复文件 (文件名 (1).ext 格式)
for file in files:
    name = file.stem
    ext = file.suffix.lower()

    # 匹配 文件名 (数字).ext 格式
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
:: 4. 数据导出修复
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

# 读取笔记数据
with open('data/notes.json', 'r', encoding='utf-8') as f:
    notes = json.load(f)

# 生成Markdown文件
with open('export/notes.md', 'w', encoding='utf-8') as f:
    f.write(f'# 小红书笔记导出\n\n')
    f.write(f'导出时间: {datetime.now().strftime(\"%Y-%m-%d %H:%M:%S\")}\n\n')
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

# 生成CSV文件
import csv
with open('export/notes.csv', 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['标题', '内容', '链接', '发布时间', '点赞数', '收藏数'])
    for note in notes:
        writer.writerow([
            note.get('title', ''),
            note.get('content', '')[:100],  # 限制长度
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
:: 5. 系统环境优化
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
echo [√] 系统临时文件已清理

echo [4/5] 清理DNS缓存...
ipconfig /flushdns >nul 2>&1
echo [√] DNS缓存已清理

echo [5/5] 清理浏览器缓存...
del /q /s "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache\*" 2>nul
del /q /s "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache\*" 2>nul
echo [√] 浏览器缓存已清理

echo.
echo [√] 系统优化完成!
echo.
pause
goto main

:: ============================================================
:: 6. 全自动修复
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
echo [步骤 1/5] 依赖环境修复
echo ══════════════════════════════════════════════════════════
call :fix_dependencies_silent

echo.
echo ══════════════════════════════════════════════════════════
echo [步骤 2/5] 数据完整性检查
echo ══════════════════════════════════════════════════════════
call :fix_data_integrity_silent

echo.
echo ══════════════════════════════════════════════════════════
echo [步骤 3/5] 删除重复文件
echo ══════════════════════════════════════════════════════════
call :delete_duplicates_silent

echo.
echo ══════════════════════════════════════════════════════════
echo [步骤 4/5] 数据导出修复
echo ══════════════════════════════════════════════════════════
call :fix_export_silent

echo.
echo ══════════════════════════════════════════════════════════
echo [步骤 5/5] 系统环境优化
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
:fix_dependencies_silent
echo 正在安装依赖...
pip install requests pillow paddleocr paddlepaddle ncmdump pyyaml tqdm -i https://pypi.tuna.tsinghua.edu.cn/simple -q >nul 2>&1
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
echo [√] 完成
goto :eof

:: ============================================================
:: 退出
:: ============================================================
:end
cls
echo.
echo 感谢使用小红书笔记管理系统!
echo.
timeout /t 2 >nul
exit
