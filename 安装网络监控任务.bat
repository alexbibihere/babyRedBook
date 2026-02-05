@echo off
chcp 65001 >nul
title 安装网络监控定时任务

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] 需要管理员权限
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit
)

cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║          安装网络监控自动修复任务                       ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║                                                            ║
echo ║  功能说明:                                                ║
echo ║  每小时自动检查网络连接                                  ║
echo ║  检测到网络故障时自动运行修复                            ║
echo ║  网络正常时不执行任何操作                                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
set "BATCH_FILE=%SCRIPT_DIR%\网络监控修复.bat"

echo 监控脚本: %BATCH_FILE%
echo.

:: 检查监控脚本是否存在
if not exist "%BATCH_FILE%" (
    echo [!] 错误: 找不到网络监控修复.bat
    echo 请确保两个文件在同一目录下
    pause
    exit
)

echo 请选择配置:
echo.
echo 1. 安装为系统服务（推荐）
echo    - 后台运行，不显示窗口
echo    - 开机自动启动
echo    - 需要管理员权限
echo.
echo 2. 安装为定时任务（测试用）
echo    - 可能看到窗口闪烁
echo    - 可以手动停止
echo.
set /p install_choice="请选择 (1-2): "

if "%install_choice%"=="1" (
    goto install_service
) else if "%install_choice%"=="2" (
    goto install_task
) else (
    echo [!] 无效选择
    pause
    exit
)

:: ============================================================
:: 安装为系统服务
:: ============================================================
:install_service
cls
echo ══════════════════════════════════════════════════════════
echo              安装为系统服务
echo ══════════════════════════════════════════════════════════
echo.

:: 删除旧任务
schtasks /Delete /TN "网络监控修复" /F >nul 2>&1

:: 创建新任务（后台运行）
schtasks /Create /TN "网络监控修复" /TR "\"%BATCH_FILE%\"" /SC MINUTE /MO 60 /RU SYSTEM /RL HIGHEST /F

if %errorLevel%==0 (
    echo.
    echo [√] 安装成功!
    echo.
    echo 任务信息:
    echo   名称: 网络监控修复
    echo   频率: 每60分钟检查一次
    echo   运行身份: SYSTEM（后台运行）
    echo   脚本: %BATCH_FILE%
    echo.
    echo ═════════════════════════════════════
    echo  管理命令:
    echo ═════════════════════════════════════
    echo.
    echo 查看任务状态:
    echo   schtasks /Query /TN "网络监控修复" /V
    echo.
    echo 立即运行一次:
    echo   schtasks /Run /TN "网络监控修复"
    echo.
    echo 停止任务:
    echo   schtasks /End /TN "网络监控修复"
    echo.
    echo 删除任务:
    echo   schtasks /Delete /TN "网络监控修复" /F
    echo.
    echo 或打开任务计划程序:
    echo   taskschd.msc
    echo ═════════════════════════════════════
    echo.
    echo 查看运行日志:
    echo   日志会显示在每次检查时
    echo   如需保存日志，可以修改脚本添加日志文件
    echo.
) else (
    echo.
    echo [!] 安装失败
    pause
    exit
)

pause
exit

:: ============================================================
:: 安装为定时任务
:: ============================================================
:install_task
cls
echo ══════════════════════════════════════════════════════════
echo              安装为定时任务
echo ══════════════════════════════════════════════════════════
echo.

:: 删除旧任务
schtasks /Delete /TN "网络监控修复" /F >nul 2>&1

:: 创建新任务（交互运行）
schtasks /Create /TN "网络监控修复" /TR "\"%BATCH_FILE%\"" /SC MINUTE /MO 60 /RL HIGHEST /F

if %errorLevel%==0 (
    echo.
    echo [√] 安装成功!
    echo.
    echo 任务信息:
    echo   名称: 网络监控修复
    echo   频率: 每60分钟检查一次
    echo   脚本: %BATCH_FILE%
    echo.
    echo 注意: 任务以当前用户身份运行
    echo       如需后台运行，请选择选项1
    echo.
) else (
    echo.
    echo [!] 安装失败
    pause
    exit
)

pause
exit
