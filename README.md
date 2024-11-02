# Combine Files

These scripts allow you to specify the folder to scan, the extensions to include, and files/folders to exclude. If no extensions or exclusions are specified, the scripts will include all files.

### Batch Script (combine.bat)

Save this as `combine.bat`:

```batch
@echo off
setlocal enabledelayedexpansion

:: Get input arguments
set "scanFolder=%1"
set "extensions=%2"
set "exclusions=%3"

:: Default to current folder if no folder is specified
if "%scanFolder%"=="" set "scanFolder=."
if "%scanFolder%"=="." set "scanFolder=%cd%"

set outputFile=combined_project_files.md
echo # Combined Project Files > %outputFile%

:: Convert comma-separated extensions to a list of patterns (if specified)
if not "%extensions%"=="" (
    set "extPatterns="
    for %%x in (%extensions%) do set "extPatterns=!extPatterns! %%x"
) else (
    set "extPatterns=*.js *.html *.json *.py *.md *.*"
)

:: Loop through files with specified extensions in the given folder
for %%f in (%extPatterns%) do (
    set "includeFile=true"
    set "relativePath=%%f"
    set "extension=%%~xf"
    set "extension=!extension:~1!"  :: Remove leading dot

    :: Check if file matches any exclusions
    if not "%exclusions%"=="" (
        for %%e in (%exclusions%) do (
            if "!relativePath:%%e=!" neq "!relativePath!" set "includeFile=false"
        )
    )

    if "!includeFile!"=="true" (
        echo. >> %outputFile%
        echo ## !relativePath! >> %outputFile%
        echo ```!extension! >> %outputFile%
        for /F "usebackq delims=" %%a in ("!relativePath!") do (
            echo %%a >> %outputFile%
        )
        echo ``` >> %outputFile%
        echo. >> %outputFile%
        echo. >> %outputFile%
    )
)

echo Combined files into %outputFile%
```

### Bash Script (combine.sh)

Save this as `combine.sh`:

```bash
#!/bin/bash

# Get input arguments
scan_folder="${1:-.}"
extensions="${2}"
exclusions="${3}"

# Default output file
output_file="combined_project_files.md"
echo "# Combined Project Files" > "$output_file"

# Handle extension filtering (convert comma-separated list to find patterns)
if [ -n "$extensions" ]; then
    IFS=',' read -ra ext_array <<< "$extensions"
    ext_patterns=()
    for ext in "${ext_array[@]}"; do
        ext_patterns+=("-name *.$ext")
    done
else
    ext_patterns=("-name *.js" "-name *.html" "-name *.json" "-name *.py" "-name *.md" "-name *.*")
fi

# Handle exclusion patterns (convert comma-separated list)
if [ -n "$exclusions" ]; then
    IFS=',' read -ra exclude_array <<< "$exclusions"
else
    exclude_array=()
fi

# Find and filter files
find "$scan_folder" \( "${ext_patterns[@]}" \) -type f | while read -r file; do
    include_file=true
    relative_path="${file#./}"
    extension="${file##*.}"

    # Check against exclusions
    for exclude in "${exclude_array[@]}"; do
        if [[ "$relative_path" == *"$exclude"* ]]; then
            include_file=false
            break
        fi
    done

    # Add file content if not excluded
    if [ "$include_file" = true ]; then
        echo -e "\n## $relative_path" >> "$output_file"
        echo "```$extension" >> "$output_file"
        cat "$file" >> "$output_file"
        echo "```" >> "$output_file"
        echo -e "\n\n" >> "$output_file"
    fi
done

echo "Combined files into $output_file"
```

### Usage

With these scripts saved to a directory in your PATH, you can run the command from anywhere:

```bash
# Usage format:
combine <folder_to_scan> <comma_separated_extensions> <comma_separated_exclusions>

# Examples:
combine .             # Combine all files in the current directory, no exclusions
combine my_project js,html,md .git,node_modules # Combine .js, .html, .md files, exclude .git and node_modules
combine /path/to/dir  # Combine all files in /path/to/dir
```

### Explanation of Changes

- **Batch Script**:
  - Uses the `%1`, `%2`, and `%3` arguments to specify the folder, extensions, and exclusions.
  - Converts extensions and exclusions to patterns for filtering files.
- **Bash Script**:
  - `scan_folder`, `extensions`, and `exclusions` are read as input arguments.
  - If extensions are specified, the script builds patterns for each extension.
  - Filters out files that match any of the specified exclusions.
