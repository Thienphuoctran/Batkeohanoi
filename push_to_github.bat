@echo off
chcp 65001 >nul
echo =======================================================
echo   TIEN HANH PUSH CODE LEN GITHUB: Batkeohanoi
echo =======================================================
cd /d "%~dp0"

echo [1/3] Dang them tat ca file thay doi (git add .)...
git add .

echo [2/3] Dang tao commit...
git commit -m "fix(realtime-sync): chuan hoa 3 buoc RLS, timezone GMT+7 va loading state chong lech du lieu May B"

echo [3/3] Dang push len nhanh main cua GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo   [THANH CONG] Code da duoc push len GitHub thanh cong!
    echo =======================================================
) else (
    echo.
    echo =======================================================
    echo   [CANH BAO] Neu can dang nhap hoac nhap token, vui long kiem tra.
    echo =======================================================
)

pause
