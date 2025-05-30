// combine.ts
// Deno version: Compile with: deno compile --allow-read --allow-write --no-check combine.ts
// This app recursively scans the specified folder, concatenates files with specified extensions
// (ignoring files/directories based on command-line exclusion tokens and .gitignore/.ignore)
// and outputs a Markdown file.
//
// New features:
// - Checks for an ignore file (.gitignore or .ignore) and displays its name and content.
// - Pauses (prompts for Enter) so you can confirm that the ignore file was loaded.
// - Debugs each path in both the pre-scan and main processing loops, showing which ignore rule (if any)
//   is matching and what ig.ignores returns for each file.

import { walk } from "https://deno.land/std@0.200.0/fs/walk.ts";
import { join, relative } from "https://deno.land/std@0.200.0/path/mod.ts";
// Import the npm 'ignore' package via esm.sh
import ignore from "https://esm.sh/ignore@5.2.0";

// Retrieve command-line arguments
const args = Deno.args;
const scanFolder = args[0] && args[0] !== "."
  ? args[0]
  : Deno.cwd();
const extensions = args[1]
  ? args[1].split(/\s+/).map(ext => ext.toLowerCase())
  : [];
const exclusions = args[2]
  ? args[2].split(/\s+/)
  : [];

const baseFile = "combined_project_files";
let outputFile = `${baseFile}.md`;

// Check if output file exists; if so, prompt for overwrite or auto-generate a new file name.
try {
  await Deno.stat(outputFile);
  const answer = prompt(`File ${outputFile} already exists. Overwrite? (Y/N): `);
  if (answer?.toLowerCase() === "n") {
    let counter = 1;
    while (true) {
      const newOutputFile = `${baseFile}_${counter}.md`;
      try {
        await Deno.stat(newOutputFile);
        counter++;
      } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
          outputFile = newOutputFile;
          break;
        } else {
          throw err;
        }
      }
    }
    console.log(`Will use ${outputFile} instead.`);
  } else {
    console.log(`Will overwrite ${outputFile}`);
  }
} catch (err) {
  if (!(err instanceof Deno.errors.NotFound)) throw err;
}

// Check for ignore files (.gitignore or .ignore) and display their content.
let ig: ReturnType<typeof ignore> | null = null;
let ignoreFileName: string | null = null;
let ignoreFileContent: string | null = null;

try {
  const gitignorePath = join(scanFolder, ".gitignore");
  const statGit = await Deno.stat(gitignorePath);
  if (statGit.isFile) {
    ignoreFileName = ".gitignore";
    ignoreFileContent = await Deno.readTextFile(gitignorePath);
    ig = ignore().add(ignoreFileContent);
    console.log(`Found ${ignoreFileName} with the following rules:\n${ignoreFileContent}`);
  }
} catch (_err) {
  // If .gitignore not found, try .ignore
  try {
    const ignorePath = join(scanFolder, ".ignore");
    const statIgnore = await Deno.stat(ignorePath);
    if (statIgnore.isFile) {
      ignoreFileName = ".ignore";
      ignoreFileContent = await Deno.readTextFile(ignorePath);
      ig = ignore().add(ignoreFileContent);
      console.log(`Found ${ignoreFileName} with the following rules:\n${ignoreFileContent}`);
    }
  } catch (_err2) {
    console.log("No .gitignore or .ignore file found. Proceeding without gitignore rules.");
  }
}

// Wait for user input before proceeding
prompt("\nPress Enter to begin processing...");

// Pre-scan: Walk the folder to list ignored items.
const ignoredFiles: string[] = [];
const ignoredDirs: string[] = [];

for await (const entry of walk(scanFolder, { includeFiles: true, includeDirs: true })) {
  // Compute a relative path and normalize to forward slashes.
  let relPath = relative(scanFolder, entry.path).replace(/\\/g, "/");
  
  // For directories, add a trailing slash for proper matching.
  const isDir = entry.isDirectory;
  if (isDir && !relPath.endsWith("/")) {
    relPath += "/";
  }
  
  // Skip the root directory or empty relative paths.
  if (relPath === "/" || relPath === "." || relPath === "") continue;
  
  // DEBUG: Log each path being checked.
  //console.log("DEBUG: Pre-scan Checking path:", relPath);
  
  // DEBUG: For each rule, print the exact rule text if it matches.
  if (ig && (ig as any)._rules) {
    (ig as any)._rules.forEach((rule: any, idx: number) => {
      if (rule.regex && rule.regex.test(relPath)) {
        console.log(`DEBUG: [Rule ${idx}] "${rule.origin}" matched path: ${relPath}`);
      }
    });
  }
  
  // Check command-line exclusion tokens.
  const excludedByToken = exclusions.some(token => relPath.toLowerCase().includes(token.toLowerCase()));
  
  // Check gitignore/.ignore rules if available.
  const excludedByGitignore = ig ? ig.ignores(relPath) : false;
  
  if (excludedByToken || excludedByGitignore) {
    if (isDir) {
      ignoredDirs.push(relPath);
    } else {
      ignoredFiles.push(relPath);
    }
  }
}

// Display the ignored items.
console.log("\nIgnored Directories:");
if (ignoredDirs.length > 0) {
  ignoredDirs.forEach(dir => console.log("  " + dir));
} else {
  console.log("  (None)");
}

console.log("\nIgnored Files:");
if (ignoredFiles.length > 0) {
  ignoredFiles.forEach(file => console.log("  " + file));
} else {
  console.log("  (None)");
}

// Wait for user input before starting the combination.
prompt("\nPress Enter to start processing files...");

// Open the output file for writing.
const encoder = new TextEncoder();
const output = await Deno.open(outputFile, { write: true, create: true, truncate: true });

// Write the title and a blank line.
await output.write(encoder.encode("# Combined Project Files\n\n"));

let fileCount = 0;

// Construct skip regex patterns for directories from the command-line exclusions.
const skipPatterns = exclusions.map(token => new RegExp(token, "i"));

// Main processing: Walk through the folder recursively.
for await (const entry of walk(scanFolder, {
  includeFiles: true,
  includeDirs: false,
  skip: skipPatterns, // efficiently bypass directories (e.g., node_modules)
})) {
  if (!entry.isFile) continue;

  // Compute a normalized relative path.
  let relPath = relative(scanFolder, entry.path).replace(/\\/g, "/");

  // DEBUG: Print the result of the ignore check.
  if (ig) {
    const ignored = ig.ignores(relPath);
    console.log(`DEBUG: ig.ignores("${relPath}") returns ${ignored}`);
    if (ignored) {
      // console.log(`Skipping (ignored by git rules): ${entry.path}`);
      continue;
    }
  }

  // Check file extension.
  const fileExt = entry.name.split(".").pop()?.toLowerCase() ?? "";
  if (extensions.length > 0 && !extensions.includes(fileExt)) {
    continue;
  }

  // Additional check: exclude files whose path contains any command-line exclusion token.
  const shouldExclude = exclusions.some(token => entry.path.toLowerCase().includes(token.toLowerCase())) ||
                        entry.path.includes(baseFile);
  if (shouldExclude) continue;

  // Log and append the file’s content to the output Markdown.
  console.log(`Adding: ${entry.path}`);
  const header = `## ${entry.path}\n`;
  await output.write(encoder.encode(header));
  const codeBlockStart = `\`\`\`${fileExt}\n`;
  await output.write(encoder.encode(codeBlockStart));
  try {
    const content = await Deno.readTextFile(entry.path);
    await output.write(encoder.encode(content));
  } catch (err) {
    console.error(`Error reading file ${entry.path}: ${err}`);
    continue;
  }
  await output.write(encoder.encode("\n```\n\n"));
  fileCount++;
}

output.close();
console.log(`Finished! Added ${fileCount} files to ${outputFile}`);
