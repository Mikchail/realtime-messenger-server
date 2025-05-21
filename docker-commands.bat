@echo off
setlocal enabledelayedexpansion

:: Color codes for Windows
set GREEN=[92m
set BLUE=[94m
set RED=[91m
set NC=[0m

:: Function to print colored messages
:print_message
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:print_command
echo %BLUE%[COMMAND]%NC% %~1
goto :eof

:: Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    call :print_error "Docker is not installed. Please install Docker first."
    exit /b 1
)

where docker-compose >nul 2>&1
if %ERRORLEVEL% neq 0 (
    call :print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit /b 1
)

:: Parse command line arguments
if "%1"=="" goto usage
if "%1"=="start" (
    if "%2"=="dev" (
        call :start_dev
    ) else (
        call :start_prod
    )
) else if "%1"=="stop" (
    if "%2"=="dev" (
        call :stop_dev
    ) else (
        call :stop_prod
    )
) else if "%1"=="logs" (
    if "%2"=="dev" (
        call :logs_dev
    ) else (
        call :logs_prod
    )
) else if "%1"=="rebuild" (
    if "%2"=="dev" (
        call :rebuild_dev
    ) else (
        call :rebuild_prod
    )
) else (
    goto usage
)

goto end

:start_prod
call :print_message "Starting production environment..."
call :print_command "docker-compose up -d"
docker-compose up -d
call :print_message "Production environment started. Access the application at http://localhost"
goto :eof

:start_dev
call :print_message "Starting development environment..."
call :print_command "docker-compose -f docker-compose.dev.yml up"
docker-compose -f docker-compose.dev.yml up
goto :eof

:stop_prod
call :print_message "Stopping production environment..."
call :print_command "docker-compose down"
docker-compose down
goto :eof

:stop_dev
call :print_message "Stopping development environment..."
call :print_command "docker-compose -f docker-compose.dev.yml down"
docker-compose -f docker-compose.dev.yml down
goto :eof

:logs_prod
call :print_message "Showing production logs..."
call :print_command "docker-compose logs -f"
docker-compose logs -f
goto :eof

:logs_dev
call :print_message "Showing development logs..."
call :print_command "docker-compose -f docker-compose.dev.yml logs -f"
docker-compose -f docker-compose.dev.yml logs -f
goto :eof

:rebuild_prod
call :print_message "Rebuilding production environment..."
call :print_command "docker-compose up -d --build"
docker-compose up -d --build
goto :eof

:rebuild_dev
call :print_message "Rebuilding development environment..."
call :print_command "docker-compose -f docker-compose.dev.yml up -d --build"
docker-compose -f docker-compose.dev.yml up -d --build
goto :eof

:usage
echo Usage: %0 {start^|stop^|logs^|rebuild} [dev^|prod]
echo Examples:
echo   %0 start       # Start production environment
echo   %0 start dev   # Start development environment
echo   %0 stop        # Stop production environment
echo   %0 stop dev    # Stop development environment
echo   %0 logs        # Show production logs
echo   %0 logs dev    # Show development logs
echo   %0 rebuild     # Rebuild production containers
echo   %0 rebuild dev # Rebuild development containers
exit /b 1

:end
exit /b 0 