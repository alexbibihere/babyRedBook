@echo off
chcp 65001 >nul
title 一键修复工具 v1.0
color 0B

cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    一键修复工具 v1.0                       ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║                                                            ║
echo ║  本工具将自动执行以下修复操作:                            ║
echo ║  1. 删除重复文件                                          ║
echo ║  2. 清理临时文件                                          ║
echo ║  3. 转换NCM为MP3                                          ║
echo ║  4. 修复Python环境                                        ║
echo ║  5. 优化系统性能                                          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause

:: ============================================================
:: 第1步: 删除重复文件
:: ============================================================
cls
echo [1/5] 正在删除重复文件...
echo.

set /p target_dir="请输入要清理的目录 (留空跳过): "

if not "%target_dir%"=="" (
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
                except:
                    pass
            else:
                base_names[base_name] = True
    
    print(f'已删除 {dup_count} 个重复文件')"
)

echo.
pause

:: ============================================================
:: 第2步: 清理临时文件
:: ============================================================
cls
echo [2/5] 正在清理临时文件...
echo.

del /q /s "%TEMP%\*" 2>nul
del /q /s "%LOCALAPPDATA%\Temp\*" 2>nul

powershell -Command "Clear-RecycleBin -Force" 2>nul

echo 临时文件清理完成!
echo.
pause

:: ============================================================
:: 第3步: NCM转MP3
:: ============================================================
cls
echo [3/5] NCM转MP3转换
echo.

set /p music_dir="请输入音乐目录 (留空跳过): "

if not "%music_dir%"=="" (
    echo 正在转换NCM文件...
    python -c "from pathlib import Path; from ncmdump import dump; d = Path(r'%music_dir%'); out = d / 'converted_mp3'; out.mkdir(exist_ok=True); ncm = list(d.glob('*.ncm')); 
    count = 0
    for f in ncm:
        try:
            output = out / f'{f.stem}.mp3'
            if not output.exists():
                dump(str(f), str(output))
            count += 1
        except:
            pass
    print(f'已转换 {count} 个文件')"
)

echo.
pause

:: ============================================================
:: 第4步: 修复Python环境
:: ============================================================
cls
echo [4/5] 正在修复Python环境...
echo.

echo 升级pip...
python -m pip install --upgrade pip

echo 安装常用包...
pip install paddleocr ncmdump pillow requests

echo Python环境修复完成!
echo.
pause

:: ============================================================
:: 第5步: 系统优化
:: ============================================================
cls
echo [5/5] 正在优化系统...
echo.

echo 清理DNS缓存...
ipconfig /flushdns

echo 优化系统性能...
powershell -Command "Optimize-Volume -DriveLetter C -Defrag -Verbose"

echo.
echo ═════════════════════════════════════════
echo    所有修复操作已完成!
echo ═════════════════════════════════════════
echo.
pause
