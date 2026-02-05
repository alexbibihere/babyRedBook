@echo off
chcp 65001 >nul
echo ============================================
echo PaddleOCR 批量识别进度监控
echo ============================================
echo.

:loop
cls
echo 当前时间: %time%
echo.

if exist "data\ocr-progress.txt" (
    echo 进度文件存在,读取中...
    echo.
    powershell -Command "Get-Content data\ocr-progress.txt | ConvertFrom-Json"
) else (
    echo 进度文件不存在,等待初始化...
)

echo.
echo ============================================
echo 按 Ctrl+C 退出
echo ============================================
echo.

timeout /t 5 /nobreak >nul
goto loop
