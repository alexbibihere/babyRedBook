@echo off
chcp 65001 >nul
title 创建定时任务

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] 需要管理员权限
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit
)

cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║              创建自动定时修复任务                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
set "BATCH_FILE=%SCRIPT_DIR%\综合修复工具.bat"

echo 脚本路径: %BATCH_FILE%
echo.

echo 请选择定时任务频率:
echo 1. 每天运行一次
echo 2. 每周运行一次
echo 3. 每月运行一次
echo 4. 每小时运行一次
echo 5. 自定义间隔
echo 6. 网络监控修复 (每小时检查，仅无网络时修复)
echo.
set /p freq_choice="请选择 (1-6): "

if "%freq_choice%"=="1" (
    set "TRIGGER_FREQ=DAILY"
    set /p trigger_time="请输入执行时间 (格式: HH:mm, 如 02:00): "
    set "SCHTASKS_TRIGGER=/DAILY /ST %trigger_time%"
) else if "%freq_choice%"=="2" (
    set "TRIGGER_FREQ=WEEKLY"
    set /p trigger_day="请输入星期几 (1-7, 1=周一): "
    set /p trigger_time="请输入执行时间 (格式: HH:mm, 如 02:00): "
    set "SCHTASKS_TRIGGER=/WEEKLY /D %trigger_day% /ST %trigger_time%"
) else if "%freq_choice%"=="3" (
    set "TRIGGER_FREQ=MONTHLY"
    set /p trigger_day="请输入日期 (1-31): "
    set /p trigger_time="请输入执行时间 (格式: HH:mm, 如 02:00): "
    set "SCHTASKS_TRIGGER=/MONTHLY /D %trigger_day% /ST %trigger_time%"
) else if "%freq_choice%"=="4" (
    set "TRIGGER_FREQ=HOURLY"
    set "SCHTASKS_TRIGGER=/HOURLY"
) else if "%freq_choice%"=="5" (
    set /p minutes="请输入间隔分钟数 (如: 30 = 每30分钟): "
    set "SCHTASKS_TRIGGER=/MINUTE %minutes%"
) else if "%freq_choice%"=="6" (
    set "TRIGGER_FREQ=NETMONITOR"
    set "SCHTASKS_TRIGGER=/MINUTE 60"
    set "BATCH_FILE=%SCRIPT_DIR%\网络监控修复.bat"
    if not exist "%BATCH_FILE%" (
        echo [!] 错误: 找不到网络监控修复.bat
        echo 请确保该文件存在于同一目录下
        pause
        exit
    )
) else (
    echo [!] 无效选择
    pause
    exit
)

echo.
set /p task_name="请输入任务名称 (默认: 自动系统修复): "
if "%task_name%"=="" set "task_name=自动系统修复"

echo.
echo 正在创建定时任务...
echo.

:: 删除旧任务（如果存在）
schtasks /Delete /TN "%task_name%" /F >nul 2>&1

:: 创建新任务
if "%TRIGGER_FREQ%"=="NETMONITOR" (
    :: 网络监控任务 - 以SYSTEM身份后台运行
    schtasks /Create /TN "%task_name%" /TR "\"%BATCH_FILE%\"" %SCHTASKS_TRIGGER% /RU SYSTEM /RL HIGHEST /F
) else (
    :: 普通定时任务
    schtasks /Create /TN "%task_name%" /TR "\"%BATCH_FILE%\"" %SCHTASKS_TRIGGER% /RU SYSTEM /RL HIGHEST /F
)

if %errorLevel%==0 (
    echo.
    echo [√] 定时任务创建成功!
    echo.
    echo 任务名称: %task_name%
    echo 执行频率: %TRIGGER_FREQ%
    echo 脚本路径: %BATCH_FILE%
    echo.
    echo ═════════════════════════════════════
    echo  管理定时任务:
    echo ═════════════════════════════════════
    echo.
    echo 查看所有任务:
    echo   schtasks
    echo.
    echo 查看任务详情:
    echo   schtasks /Query /TN "%task_name%" /V
    echo.
    echo 立即运行任务:
    echo   schtasks /Run /TN "%task_name%"
    echo.
    echo 删除任务:
    echo   schtasks /Delete /TN "%task_name%" /F
    echo.
    echo 或者在 Windows 任务计划程序中管理:
    echo   taskschd.msc
    echo ═════════════════════════════════════
) else (
    echo.
    echo [!] 任务创建失败
    echo 请检查输入是否正确
)

echo.
pause
