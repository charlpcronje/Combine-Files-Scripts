// combine.ts
// Deno version: Compile with: deno compile --allow-read --allow-write combine.ts
// This app recursively scans the specified folder, concatenates files with specified extensions
// (ignoring files/directories based on command-line exclusion tokens and .gitignore/.ignore),
// and outputs a Markdown file.

import { walk } from "https://deno.land/std@0.200.0/fs/walk.ts";
import { join, relative } from "https://deno.land/std@0.200.0/path/mod.ts";
import ignore from "https://deno.land/x/ignore@0.2.4/mod.ts";

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

// Create an instance of the ignore parser if a .gitignore or .ignore file exists.
let ig: ReturnType<typeof ignore> | null = null;
try {
  const gitignorePath = join(scanFolder, ".gitignore");
  const statGit = await Deno.stat(gitignorePath);
  if (statGit.isFile) {
    const gitignoreContent = await Deno.readTextFile(gitignorePath);
    ig = ignore().add(gitignoreContent);
    console.log("Using .gitignore rules for filtering.");
  }
} catch (_err) {
  // If .gitignore not found, try .ignore
  try {
    const ignorePath = join(scanFolder, ".ignore");
    const statIgnore = await Deno.stat(ignorePath);
    if (statIgnore.isFile) {
      const ignoreContent = await Deno.readTextFile(ignorePath);
      ig = ignore().add(ignoreContent);
      console.log("Using .ignore rules for filtering.");
    }
  } catch (_err2) {
    // No ignore file found; proceed without gitignore filtering.
  }
}

// Open the output file for writing.
const encoder = new TextEncoder();
const output = await Deno.open(outputFile, { write: true, create: true, truncate: true });

// Write the title and a blank line.
await output.write(encoder.encode("# Combined Project Files\n\n"));

let fileCount = 0;

// Construct skip regex patterns for directories from the command-line exclusion tokens.
const skipPatterns = exclusions.map(token => new RegExp(token, "i"));

// Walk through the scanFolder recursively, skipping directories that match any exclusion token.
for await (const entry of walk(scanFolder, {
  includeFiles: true,
  includeDirs: false,
  skip: skipPatterns, // this efficiently bypasses entire directories (e.g., node_modules)
})) {
  if (!entry.isFile) continue;

  // Compute relative path to apply ignore rules correctly.
  const relPath = relative(scanFolder, entry.path);

  // Check against .gitignore/.ignore rules if available.
  if (ig && ig.ignores(relPath)) {
    console.log(`Skipping (ignored by git rules): ${entry.path}`);
    continue;
  }

  // Check file extension.
  const fileExt = entry.name.split(".").pop()?.toLowerCase() ?? "";
  if (extensions.length > 0 && !extensions.includes(fileExt)) {
    continue;
  }

  // Additional check: exclude files whose full path contains any command-line exclusion token.
  let shouldExclude = false;
  for (const token of exclusions) {
    if (entry.path.toLowerCase().includes(token.toLowerCase())) {
      shouldExclude = true;
      break;
    }
  }
  // Prevent including the output file itself.
  if (entry.path.includes(baseFile)) {
    shouldExclude = true;
  }
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
