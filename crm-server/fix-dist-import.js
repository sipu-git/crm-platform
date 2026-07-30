import fs from "fs";
import path from "path";

const DIST_DIR = "dist";

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith(".js")) {
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
      if (/\.(js|json|css|node)$/.test(importPath)) return match;

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

walk(DIST_DIR);
console.log("Done fixing dist imports.");