# File Combiner

A utility for combining multiple files into a single Markdown file with proper code block formatting.

## Features

- Combines multiple files into a single Markdown document
- Filters by file extensions
- Excludes specified paths
- Maintains proper code formatting with language-specific code blocks
- Handles file naming conflicts automatically
- Cross-platform support (Windows and Linux)

## Installation

### Windows

1. Copy `combine_files.bat` to `C:\Windows\System32\`
2. Now you can run `combine_files` from any directory

### Linux

1. Copy the `combine` script to `/usr/local/bin/`:
   ```bash
   sudo cp combine /usr/local/bin/
   sudo chmod +x /usr/local/bin/combine
   ```
2. Now you can run `combine` from any directory

## Usage

```bash
# Windows
combine_files [folder] [extensions] [exclusions]

# Linux
combine [folder] [extensions] [exclusions]
```

### Parameters

- `folder`: The folder to scan (default: current directory)
- `extensions`: Space-separated list of file extensions to include (e.g., "js json html")
- `exclusions`: String to match for exclusion (e.g., ".history")

### Examples

```bash
# Combine all .js, .json, and .html files in current directory, excluding .history folder
combine_files . "js json html" ".history"

# Combine specific file types from a different directory
combine_files "C:\my-project" "ts tsx css" "node_modules"

# Linux examples
combine . "js json html" ".history"
combine ~/my-project "py md txt" "venv"
```

## Output

- Creates a file named `combined_project_files.md`
- If the file exists, prompts to overwrite or create a new numbered version
- Each file is formatted as a Markdown code block with appropriate syntax highlighting
- Files are organized with clear headings showing their relative paths

## Format

The combined file follows this format:

```markdown
# Combined Project Files

## path/to/file1.js
```js
[file1 content]
```

## path/to/file2.json
```json
[file2 content]
```
```

## Notes

- The script automatically excludes the output file from processing
- Relative paths are maintained in the output file
- Files are processed in alphabetical order
- The script will prompt before overwriting existing files
