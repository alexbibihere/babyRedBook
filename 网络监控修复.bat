@echo off
chcp 65001 >nul
title 网络监控修复工具

:: ============================================================
:: 网络监控和自动修复脚本
:: 功能: 每小时检查网络，无网络时自动运行修复
:: ============================================================

:check_network
:: 检查网络连接
ping -n 2 223.5.5.5 | findstr "TTL" >nul 2>&1
if %errorLevel%==0 (
    echo [%date% %time%] 网络正常 ✓
    goto sleep
)

:: 再次检查备用DNS
ping -n 2 8.8.8.8 | findstr "TTL" >nul 2>&1
if %errorLevel%==0 (
    echo [%date% %time%] 网络正常 ✓
    goto sleep
)

:: 两次检测都失败，执行修复
echo.
echo ══════════════════════════════════════════════════════════
echo [%date% %time%] 检测到网络故障，开始修复...
echo ══════════════════════════════════════════════════════════
echo.

call :fix_network

echo.
echo [%date% %time%] 修复完成，等待下次检查...
echo.

:sleep
:: 等待1小时（3600秒）
timeout /t 3600 >nul
goto check_network

:: ============================================================
:: 网络修复函数
:: ============================================================
:fix_network
echo [步骤 1/6] 释放IP地址...
ipconfig /release >nul 2>&1

echo [步骤 2/6] 刷新DNS缓存...
ipconfig /flushdns

echo [步骤 3/6] 注册DNS...
ipconfig /registerdns >nul 2>&1

echo [步骤 4/6] 重新获取IP地址...
ipconfig /renew >nul 2>&1

echo [步骤 5/6] 重启WLAN AutoConfig服务...
net stop WlanSvc /y >nul 2>&1
timeout /t 2 >nul
net start WlanSvc >nul 2>&1

echo [步骤 6/6] 重置网络适配器...
powershell -Command "Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | Restart-NetAdapter" >nul 2>&1

echo.
echo 等待网络恢复...
timeout /t 10 >nul

:: 测试修复后的网络
ping -n 2 223.5.5.5 | findstr "TTL" >nul 2>&1
if %errorLevel%==0 (
    echo [√] 网络修复成功！
) else (
    echo [!] 网络仍未恢复，可能需要手动检查
)

goto :eof
