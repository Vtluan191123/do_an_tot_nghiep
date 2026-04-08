@echo off
setlocal enabledelayedexpansion

REM Colors
set "GREEN=color 0a"
set "RED=color 0c"
set "YELLOW=color 0e"
set "WHITE=color 0f"

:menu
cls
echo.
echo ======== DATN Application Launcher ========
echo 1. Start Development (Dev)
echo 2. Start Production (Prod)
echo 3. Stop All Services
echo 4. View Backend Logs
echo 5. View Frontend Logs
echo 6. View All Logs
echo 7. Rebuild Images
echo 8. Reset All (Remove containers, networks, volumes)
echo 9. Check Docker Status
echo 10. Exit
echo ==========================================
echo.
set /p choice="Select an option (1-10): "

if "%choice%"=="1" goto start_dev
if "%choice%"=="2" goto start_prod
if "%choice%"=="3" goto stop_all
if "%choice%"=="4" goto view_backend_logs
if "%choice%"=="5" goto view_frontend_logs
if "%choice%"=="6" goto view_all_logs
if "%choice%"=="7" goto rebuild_images
if "%choice%"=="8" goto reset_all
if "%choice%"=="9" goto check_status
if "%choice%"=="10" goto exit_app
echo Invalid option. Please try again.
pause
goto menu

:start_dev
cls
echo [INFO] Starting Development Mode...
if not exist ".env.dev" (
    echo [ERROR] .env.dev file not found!
    pause
    goto menu
)
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d --build
echo [INFO] Development services started!
echo.
echo Access URLs:
echo   Frontend: http://localhost:4200
echo   Backend:  http://localhost:8080
echo.
pause
goto menu

:start_prod
cls
echo [INFO] Starting Production Mode...
if not exist ".env.prod" (
    echo [ERROR] .env.prod file not found!
    pause
    goto menu
)
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
echo [INFO] Production services started!
echo.
echo Access URLs:
echo   Frontend: http://localhost:80
echo   Backend:  http://localhost:8080
echo.
pause
goto menu

:stop_all
cls
echo [INFO] Stopping all services...
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down
echo [INFO] All services stopped!
pause
goto menu

:view_backend_logs
cls
echo [INFO] Viewing Backend Logs (Press Ctrl+C to exit)...
docker-compose -f docker-compose.dev.yml logs -f backend
goto menu

:view_frontend_logs
cls
echo [INFO] Viewing Frontend Logs (Press Ctrl+C to exit)...
docker-compose -f docker-compose.dev.yml logs -f frontend
goto menu

:view_all_logs
cls
echo [INFO] Viewing All Logs (Press Ctrl+C to exit)...
docker-compose -f docker-compose.dev.yml logs -f
goto menu

:rebuild_images
cls
echo [INFO] Rebuilding Docker images...
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.prod.yml build --no-cache
echo [INFO] Images rebuilt successfully!
pause
goto menu

:reset_all
cls
echo [WARNING] This will remove all containers, networks, and volumes!
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    echo [INFO] Resetting all services...
    docker-compose -f docker-compose.dev.yml down -v
    docker-compose -f docker-compose.prod.yml down -v
    echo [INFO] All services reset!
) else (
    echo [INFO] Reset cancelled.
)
pause
goto menu

:check_status
cls
echo [INFO] Checking Docker Status...
echo.
echo Running Containers:
docker ps
echo.
echo All Containers:
docker ps -a
echo.
pause
goto menu

:exit_app
echo [INFO] Exiting...
exit /b 0

