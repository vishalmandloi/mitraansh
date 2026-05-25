const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "_vrb-list.html"), "utf8");

const articles = html.split(/<article id="post-/).slice(1);
const projects = [];

for (const block of articles) {
  if (!block.includes("project_category-ongoing")) continue;
  const id = block.match(/^(\d+)/);
  const img =
    block.match(/src="(https:\/\/www\.vrbgroup\.co\.in\/wp-content\/uploads\/[^"]+1024x[^"]+)"/) ||
    block.match(/src="(https:\/\/www\.vrbgroup\.co\.in\/wp-content\/uploads\/[^"]+\.jpg)"/);
  const link = block.match(/href="(https:\/\/www\.vrbgroup\.co\.in\/project\/[^"]+)"/);
  const title = block.match(/<h2[^>]*><a[^>]*>([^<]+)<\/a><\/h2>/i) || block.match(/class="title"[^>]*>([^<]+)</);
  const excerpt =
    block.match(/<p class="excerpt"[^>]*>([\s\S]*?)<\/p>/i) ||
    block.match(/<div class="content_box"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/i);
  if (!title) continue;
  const name = title[1].trim();
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let desc = excerpt ? excerpt[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";
  projects.push({
    id: id ? id[1] : null,
    name,
    slug,
    link: link ? link[1] : null,
    img: img ? img[1] : null,
    desc,
  });
}

const outPath = path.join(__dirname, "..", "_kota-projects.json");
fs.writeFileSync(outPath, JSON.stringify(projects, null, 2));
console.log("Wrote", projects.length, "projects to", outPath);
