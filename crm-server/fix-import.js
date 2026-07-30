import fs from "fs";
import path from "path";

const SRC_DIRS = ["src", "."];
const exts = [".ts"];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
      walk(fullPath);
    } else if (exts.includes(path.extname(entry.name))) {
      fixFile(fullPath);
    }
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;
  const dir = path.dirname(filePath);

  content = content.replace(
    /((?:from|import)\s*\(?\s*["'])(\.\.?\/[^"']+)(["'])/gs,
    (match, prefix, importPath, suffix) => {
      if (/\.(js|json|css|node|ts)$/.test(importPath)) return match;

      const asTs = path.resolve(dir, importPath + ".ts");
      const asDir = path.resolve(dir, importPath);
      const isDirectory = fs.existsSync(asDir) && fs.statSync(asDir).isDirectory();

      const fixedPath = isDirectory ? `${importPath}/index.js` : `${importPath}.js`;
      return `${prefix}${fixedPath}${suffix}`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Fixed: ${filePath}`);
  }
}

for (const dir of SRC_DIRS) {
  if (fs.existsSync(dir)) walk(dir);
}

console.log("Done.");