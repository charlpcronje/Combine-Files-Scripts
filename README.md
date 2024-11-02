# File Combiner

A utility for combining multiple files into a single Markdown file with proper code block formatting.

## Features

- Combines multiple files into a single Markdown document
- Filters by file extensions
- Excludes specified paths
- Maintains proper code formatting with language-specific code blocks
- Handles file naming conflicts automatically
- Cross-platform support (Windows, Linux, and macOS)

## Installation

### Windows

1. Copy `combine.bat` to `C:\Windows\System32\`
2. Now you can run `combine` from any directory

### Linux

1. Copy the `combine` script to `/usr/local/bin/`:
   ```bash
   sudo cp combine /usr/local/bin/
   sudo chmod +x /usr/local/bin/combine
   ```
2. Now you can run `combine` from any directory

### macOS

1. Create a bin directory in your home folder if it doesn't exist:
   ```bash
   mkdir -p ~/bin
   ```

2. Copy the `combine` script to `~/bin/`:
   ```bash
   cp combine ~/bin/
   chmod +x ~/bin/combine
   ```

3. Add the bin directory to your PATH. Add this line to your `~/.zshrc` file (for newer macOS versions) or `~/.bash_profile` (for older versions):
   ```bash
   export PATH="$HOME/bin:$PATH"
   ```

4. Apply the changes:
   ```bash
   # For newer macOS (Catalina and later)
   source ~/.zshrc
   
   # For older macOS versions
   source ~/.bash_profile
   ```

5. Now you can run `combine` from any directory

## Usage

```bash
# Windows
combine [folder] [extensions] [exclusions]

# Linux/macOS
combine [folder] [extensions] [exclusions]
```

### Parameters

- `folder`: The folder to scan (default: current directory)
- `extensions`: Space-separated list of file extensions to include (e.g., "js json html")
- `exclusions`: String to match for exclusion (e.g., ".history")

### Examples

```bash
# Windows
combine . "js json html" ".history"
combine "C:\my-project" "ts tsx css" "node_modules"

# Linux/macOS
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

## Notes

- The script automatically excludes the output file from processing
- Relative paths are maintained in the output file
- Files are processed in alphabetical order
- The script will prompt before overwriting existing files
- On macOS and Linux, the same bash script is used, but the installation locations differ
- For macOS users: The script requires basic command line tools, which are typically pre-installed. If you get any errors, you may need to install the Command Line Tools by running `xcode-select --install` in Terminal.

## Troubleshooting

### macOS Permission Issues
If you get a permission denied error when trying to run the script:
1. Ensure the script is executable: `chmod +x ~/bin/combine`
2. Make sure your PATH includes ~/bin: `echo $PATH`
3. If using Terminal, make sure it has Full Disk Access (System Preferences → Security & Privacy → Privacy → Full Disk Access)

### Windows Issues
If you get "combine_files is not recognized as a command":
1. Make sure you copied the file to the correct System32 directory
2. Try running the command prompt as Administrator when copying the file

### Linux Issues
If the command isn't found:
1. Verify the script is in `/usr/local/bin/`: `ls -l /usr/local/bin/combine`
2. Check if `/usr/local/bin` is in your PATH: `echo $PATH`
3. Make sure the script has execute permissions: `ls -l /usr/local/bin/combine`
