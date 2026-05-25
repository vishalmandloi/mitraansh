const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const re = /\s*<link rel="manifest" href="site\.webmanifest">\s*\n?/g;

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f === "node_modules" || f === ".git") continue;
      walk(p);
    } else if (f.endsWith(".html")) {
      const t = fs.readFileSync(p, "utf8");
      const next = t.replace(re, "\n");
      if (next !== t) {
        fs.writeFileSync(p, next);
        console.log("stripped:", path.relative(ROOT, p));
      }
    }
  }
}

walk(ROOT);
