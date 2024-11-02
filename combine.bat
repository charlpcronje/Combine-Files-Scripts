@echo off
setlocal enabledelayedExpansion

:: Get input arguments
set "scanFolder=%~1"
set "extensions=%~2"
set "exclusions=%~3"

:: Default to current folder if no folder is specified
if "%scanFolder%"=="" set "scanFolder=."
if "%scanFolder%"=="." set "scanFolder=%cd%"

:: Initialize base output filename
set "baseFile=combined_project_files"
set "outputFile=%baseFile%.md"

:: Check if file exists and handle naming
if exist "%outputFile%" (
    set /p "overwrite=File %outputFile% already exists. Overwrite? (Y/N): "
    if /i "!overwrite!"=="n" (
        set "outputFile=%baseFile%_1.md"
        set /a counter=1
        
        :findFileName
        if exist "!outputFile!" (
            set /a counter+=1
            set "outputFile=%baseFile%_!counter!.md"
            goto :findFileName
        )
        echo Will use !outputFile! instead.
    ) else (
        echo Will overwrite %outputFile%
    )
)

echo # Combined Project Files > "%outputFile%"

:: Display what will be processed
echo Processing folder: %scanFolder%
echo File types to include: %extensions%
if not "%exclusions%"=="" echo Paths to exclude: %exclusions%

set "fileCount=0"

:: Process each extension separately
for %%x in (%extensions%) do (
    echo Searching for *.%%x files...
    for /r "%scanFolder%" %%f in (*.%%x) do (
        set "includeFile=true"
        set "relativePath=%%~ff"
        
        :: Remove the scan folder prefix to get the relative path
        set "relativePath=!relativePath:%scanFolder%=!"
        if "!relativePath:~0,1!"=="\" set "relativePath=!relativePath:~1!"
        
        :: Always exclude any combined_project_files*.md and check user exclusions
        echo.!relativePath! | findstr /i /L /c:"%baseFile%" >nul
        if not errorlevel 1 (
            set "includeFile=false"
        ) else if not "%exclusions%"=="" (
            echo.!relativePath! | findstr /i /L /c:"%exclusions%" >nul
            if not errorlevel 1 (
                echo Skipping excluded path: !relativePath!
                set "includeFile=false"
            )
        )

        if "!includeFile!"=="true" (
            echo Adding: !relativePath!
            
            :: Add file header and content
            echo.>> "%outputFile%"
            echo ## !relativePath!>> "%outputFile%"
            echo ```%%x>> "%outputFile%"
            type "%%f" >> "%outputFile%"
            echo.>> "%outputFile%"
            echo ```>> "%outputFile%"
            echo.>> "%outputFile%"
            
            set /a "fileCount+=1"
        )
    )
)

echo.
echo Finished! Added %fileCount% files to %outputFile%
endlocal
