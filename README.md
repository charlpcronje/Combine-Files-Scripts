# File Combiner

Simple batch / Bash Script for combining multiple files into a single Markdown file with proper code block formatting.  
A Deno 2 app version (`combine.ts`) is now also available, offering improved performance and cross-platform compilation to a standalone executable.

## Features

- Combines multiple files into a single Markdown document
- Filters by file extensions
- Excludes specified paths (folders or specific files)
- Maintains proper code formatting with language-specific code blocks
- Handles file naming conflicts automatically
- Cross-platform support (Windows, Linux, macOS, and Deno 2 standalone executables)
- Improved performance by bypassing entire directories when excluded

## Installation

### Windows (Batch Script)

1. Copy `combine.bat` to `C:\Windows\System32\`
2. Now you can run `combine` from any directory

### Linux / macOS (Bash Script)

1. Copy the `combine` script to `/usr/local/bin/` (Linux) or `~/bin/` (macOS):
   ```bash
   sudo cp combine /usr/local/bin/
   sudo chmod +x /usr/local/bin/combine
   ```
2. Now you can run `combine` from any directory

### Deno 2 App

1. Ensure you have [Deno](https://deno.land/) installed (version 2+ recommended).
2. Download `combine.ts` to your preferred directory.
3. To compile the Deno app into a standalone executable, run:
   ```bash
   deno compile --allow-read --allow-write combine.ts
   ```
   This will generate an executable (`combine` on Linux/macOS or `combine.exe` on Windows) that you can run from any directory.

## Usage

### Command-Line Syntax

```bash
# Batch / Bash Script (Windows, Linux, macOS)
combine [folder] [extensions] [exclusions]

# Deno 2 App
./combine [folder] [extensions] [exclusions]
```

### Parameters

- **folder**: The folder to scan (default: current directory)
- **extensions**: Space-separated list of file extensions to include (e.g., "js json html")
- **exclusions**: Space-separated list of tokens to match for exclusion (e.g., "node_modules .history build")

### Examples

```bash
# Windows Batch Script
combine . "js json html" ".history"
combine "C:\my-project" "ts tsx css" "node_modules"

# Linux / macOS Bash Script
combine . "js json html" ".history"
combine ~/my-project "py md txt" "venv"

# Deno 2 App (compiled executable)
./combine . "js json html" ".history"
./combine ~/my-project "ts tsx css" "node_modules build"
```

## Output

- Creates a file named `combined_project_files.md`
- If the file exists, prompts to overwrite or create a new numbered version
- Each file is formatted as a Markdown code block with appropriate syntax highlighting
- Files are organized with clear headings showing their relative paths

## Format

The combined file follows this format:

````markdown
# Combined Project Files

## path/to/file1.js
```js
[file1 content]
```

## path/to/file2.json
```json
[file2 content]
```
````

## Notes

- The script automatically excludes the output file from processing.
- Relative paths are maintained in the output file.
- Files are processed in alphabetical order.
- The script will prompt before overwriting existing files.
- The Deno 2 app efficiently bypasses entire directories (e.g., `node_modules`) to improve performance.

## Troubleshooting

### macOS Permission Issues
If you get a permission denied error when trying to run the script:
1. Ensure the script is executable: `chmod +x ~/bin/combine` (or your Deno executable)
2. Make sure your PATH includes `~/bin` (or the directory containing the Deno executable): `echo $PATH`
3. If using Terminal, make sure it has Full Disk Access (System Preferences → Security & Privacy → Privacy → Full Disk Access)

### Windows Issues
If you get "combine_files is not recognized as a command":
1. Make sure you copied the file to the correct System32 directory (for the batch script)
2. Try running the command prompt as Administrator when copying the file

### Linux Issues
If the command isn't found:
1. Verify the script is in `/usr/local/bin/` (for the Bash script) or the Deno executable’s directory
2. Check if `/usr/local/bin` (or the relevant directory) is in your PATH: `echo $PATH`
3. Make sure the script/executable has execute permissions: `ls -l /usr/local/bin/combine`
