@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ================================================
echo        PERSONNEL CONTROL SPA - ЗАПУСК
echo ================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ПОМИЛКА: Node.js не встановлено.
  echo Встановіть LTS-версію з https://nodejs.org/ та запустіть START.bat знову.
  pause
  exit /b 1
)

if not exist package.json (
  echo ПОМИЛКА: Не знайдено package.json.
  echo Переконайтеся, що START.bat лежить у папці personnel-spa.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Перше встановлення бібліотек. Потрібен Інтернет...
  call npm install
  if errorlevel 1 (
    echo ПОМИЛКА під час npm install. Перевірте Інтернет та повідомлення вище.
    pause
    exit /b 1
  )
)

echo.
echo Локальна адреса: http://localhost:5173/
echo Для телефона у тій самій Wi-Fi мережі використайте IPv4-адресу цього ПК та порт 5173.
echo Щоб зупинити сервер, натисніть Ctrl+C.
echo.
call npm run dev
pause
