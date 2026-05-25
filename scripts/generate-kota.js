const fs = require("fs");
const https = require("https");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const projects = JSON.parse(fs.readFileSync(path.join(ROOT, "_kota-projects.json"), "utf8"));
const DEFAULT_IMG =
  "https://www.vrbgroup.co.in/wp-content/uploads/2024/08/vlcsnap-2024-02-14-14h58m09s043-1024x576.png";
const KOTA_HERO =
  "https://www.vrbgroup.co.in/wp-content/uploads/2025/05/1_5-Photo-1024x576.jpg";

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "MitraanshRealty/1.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetch(res.headers.location).then(resolve).catch(reject);
          return;
        }
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
      })
      .on("error", reject);
  });
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, "&")
    .replace(/&hellip;/g, "…");
}

function pickImg(url) {
  if (!url) return null;
  if (url.includes("-1024x")) return url;
  const ext = url.match(/\.(jpe?g|png|webp)/i);
  if (!ext) return url;
  const base = url.replace(/-scaled\.(jpe?g|png)/i, ".$1").replace(/\.(jpe?g|png|webp)$/i, "");
  return base + "-1024x576" + ext[0].replace("scaled.", "");
}

function extractDetail(html) {
  const ogDesc = html.match(/property="og:description" content="([^"]+)"/);
  const ogImg = html.match(/property="og:image" content="([^"]+)"/);
  const hero =
    html.match(/class="cover-parallax"[^>]*src="([^"]+)"/) ||
    html.match(/cover-parallax[\s\S]{0,80}src="([^"]+)"/);
  const gallery = [
    ...new Set(
      [
        ...html.matchAll(/gallery-item[\s\S]*?href=['"](https:\/\/www\.vrbgroup\.co\.in\/wp-content\/uploads\/[^'"]+)['"]/g),
      ].map((m) => pickImg(m[1]) || m[1])
    ),
  ].slice(0, 12);
  const paras = [...html.matchAll(/description_box"><p>([\s\S]*?)<\/p>/gi)].map((x) =>
    decodeEntities(x[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
  );
  const reraM =
    html.match(/RERA No\.?\s*([A-Z0-9/]+)/i) || html.match(/(RAJ\/P\/\d{4}\/\d+)/);
  const layoutM = html.match(
    /(?:layout|master)[\s\S]{0,200}?href=['"](https:\/\/www\.vrbgroup\.co\.in\/wp-content\/uploads\/[^'"]+)['"]/i
  );
  const amenityTitles = [...html.matchAll(/elementor-icon-box-title[^>]*>[\s\S]*?<span[^>]*>([^<]+)</g)].map(
    (m) => m[1].trim()
  );
  return {
    gallery,
    layout: layoutM ? layoutM[1] : null,
    connectivity: [],
    amenities: amenityTitles.filter((t) => t.length > 2 && t.length < 50).slice(0, 16),
    rera: reraM ? reraM[1] || reraM[0] : null,
    banner: pickImg(hero && hero[1]) || pickImg(ogImg && ogImg[1]) || (ogImg && ogImg[1]),
    descFull: ogDesc ? decodeEntities(ogDesc[1]) : paras[0] || "",
    extraParas: paras.slice(0, 4),
  };
}

function cardHtml(p) {
  const img = pickImg(p.img) || p.img || DEFAULT_IMG;
  const file = `kota-${p.slug}.html`;
  const short =
    p.desc && p.desc !== "Ongoing"
      ? p.desc.length > 160
        ? p.desc.slice(0, 157) + "…"
        : p.desc
      : (p.descFull || "Premium plotted township in Kota by VRB Group.").slice(0, 160) + "…";
  return `        <article class="project-card">
          <img class="project-card__img" src="${img}" alt="${esc(p.name)}" loading="lazy">
          <div class="project-card__body">
            <span class="project-card__tag">Ongoing</span>
            <h3>${esc(p.name)}</h3>
            <p class="project-card__location">Kota, Rajasthan</p>
            <p>${esc(short)}</p>
            <a href="${file}" class="btn btn--primary">View Project</a>
          </div>
        </article>`;
}

function detailHtml(p, detail) {
  const img = detail.banner || pickImg(p.img) || p.img || DEFAULT_IMG;
  const file = `kota-${p.slug}.html`;
  const rera = detail.rera || p.rera || "";
  const reraLine = rera ? ` · ${esc(rera)}` : "";
  const paras = detail.extraParas.length
    ? detail.extraParas
    : [detail.descFull || p.desc].filter(Boolean);
  const uniqueParas = [...new Set(paras)].slice(0, 3);
  const bodyParas = uniqueParas.map((t) => `          <p>${esc(t)}</p>`).join("\n");
  const amenities =
    detail.amenities.length > 0
      ? detail.amenities
      : [
          "Gated Township",
          "Wide Internal Roads",
          "Parks & Green Areas",
          "24/7 Security",
          "NA Residential Plots",
          "KDA / RERA Approved",
        ];
  const amenGrid = amenities.map((a) => `        <div class="amenity-item">${esc(a)}</div>`).join("\n");
  const gallery =
    detail.gallery.length > 0 ? detail.gallery : img ? [img] : [];
  const galleryHtml = gallery
    .map((u, i) => `        <img src="${u}" alt="${esc(p.name)} gallery ${i + 1}" loading="lazy">`)
    .join("\n");
  const layoutSection = detail.layout
    ? `
      <h3 class="section__title" style="margin-top:3rem">Layout Plan</h3>
      <div class="project-layout">
        <img src="${detail.layout}" alt="${esc(p.name)} layout plan" loading="lazy">
      </div>`
    : "";
  const contactName = encodeURIComponent(p.name.replace(/\s+/g, "+"));
  const metaDesc = esc((detail.descFull || p.desc || p.name).slice(0, 155));

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(p.name)} Kota | VRB Group Township | Mitraansh Realty</title>
  <meta name="description" content="${metaDesc}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#0f2744">
  <link rel="canonical" href="https://mitraanshrealty.com/${file}">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <meta property="og:title" content="${esc(p.name)} | Kota">
  <meta property="og:image" content="${img}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-page="kota-${p.slug}">
  <div id="site-header"></div>

  <section class="project-hero project-hero--img">
    <div class="project-hero__bg" style="background-image:url('${img}')"></div>
    <div class="project-hero__overlay"></div>
    <div class="container project-hero__content">
      <p class="project-hero__tag">Kota · Ongoing Project</p>
      <h1>${esc(p.name)}</h1>
      <p class="project-hero__meta">Kota, Rajasthan${reraLine}</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <p><a href="kota.html#projects">← All Kota Projects</a></p>
      <div class="project-detail-grid">
        <img src="${img}" alt="${esc(p.name)}" loading="lazy">
        <div>
          <h2 class="section__title">About Project</h2>
${bodyParas}
          <ul class="feature-list">
            <li>Residential NA plots & townships</li>
            <li>KDA / RERA approved development</li>
            <li>By VRB Group of Companies</li>
          </ul>
          <a href="contact.html?project=${contactName}" class="btn btn--primary">Enquire Now</a>
        </div>
      </div>

      <h3 class="section__title" style="margin-top:3rem">Amenities</h3>
      <div class="amenities-grid">
${amenGrid}
      </div>
${layoutSection}

      <h3 class="section__title" style="margin-top:3rem">Gallery</h3>
      <div class="project-gallery">
${galleryHtml}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="cta-banner">
      <h2>Interested in ${esc(p.name)}?</h2>
      <a href="contact.html?project=${contactName}" class="btn btn--primary">Contact Us</a>
    </div>
  </section>

  <div id="site-footer"></div>
  <script src="js/site.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
`;
}

async function main() {
  console.log("Generating", projects.length, "Kota detail pages...");
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    let detail = {
      gallery: [],
      layout: null,
      connectivity: [],
      amenities: [],
      rera: null,
      banner: null,
      descFull: "",
      extraParas: [],
    };
    if (p.link) {
      try {
        const html = await fetch(p.link);
        detail = extractDetail(html);
        if (detail.descFull && (!p.desc || p.desc === "Ongoing")) {
          p.desc = detail.descFull.slice(0, 200);
          p.descFull = detail.descFull;
        }
        if (detail.banner && !p.img) p.img = detail.banner;
        if (detail.rera) p.rera = detail.rera;
        process.stdout.write(`\r  ${i + 1}/${projects.length} ${p.slug}          `);
      } catch (e) {
        process.stdout.write(`\r  ${i + 1}/${projects.length} ${p.slug} (skip)     `);
      }
    }
    fs.writeFileSync(path.join(ROOT, `kota-${p.slug}.html`), detailHtml(p, detail));
  }
  console.log("\n");

  const listing = `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kota Real Estate Projects | ${projects.length} Ongoing VRB | Mitraansh Realty</title>
  <meta name="description" content="Ongoing Kota projects by VRB Group — ${projects.length} premium townships with KDA & RERA approvals. NA plots in Kota, Rajasthan.">
  <meta name="keywords" content="Kota plots, VRB Group Kota, Shri Balaji Nagar, VRB Raghavam, real estate Kota Rajasthan">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#0f2744">
  <link rel="canonical" href="https://mitraanshrealty.com/kota.html">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="favicon.svg">
  <meta property="og:title" content="Kota Projects | Mitraansh Realty">
  <meta property="og:description" content="Premium residential townships and NA plots in Kota by VRB Group.">
  <meta property="og:url" content="https://mitraanshrealty.com/kota.html">
  <meta property="og:image" content="${KOTA_HERO}">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
    {"@type":"ListItem","position":1,"name":"Home","item":"https://mitraanshrealty.com/"},
    {"@type":"ListItem","position":2,"name":"Kota Projects","item":"https://mitraanshrealty.com/kota.html"}
  ]}
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-page="kota">
  <div id="site-header"></div>

  <section class="city-hero">
    <div class="city-hero__bg" style="background-image:url('${KOTA_HERO}')"></div>
    <div class="city-hero__overlay"></div>
    <div class="container city-hero__content">
      <h1 class="city-hero__title">Kota</h1>
      <p class="city-hero__text">${projects.length} ongoing townships by VRB Group — KDA & RERA approved NA plots in Kota, Rajasthan.</p>
    </div>
  </section>

  <section class="section" id="projects" style="padding-top:0">
    <div class="container">
      <span class="section__label">Rajasthan</span>
      <h2 class="section__title">Ongoing Projects</h2>
      <p class="section__subtitle">${projects.length} premium projects — content & images from VRB Group.</p>
      <div class="projects-grid projects-grid--nm city-grid">
${projects.map(cardHtml).join("\n")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="cta-banner">
      <h2>Looking to Buy, Sell or Invest?</h2>
      <p>Let our experts help you make the right decision.</p>
      <a href="contact.html" class="btn btn--primary">Contact Us</a>
    </div>
  </section>

  <div id="site-footer"></div>
  <script src="js/site.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
`;

  fs.writeFileSync(path.join(ROOT, "kota.html"), listing);
  fs.writeFileSync(path.join(ROOT, "_kota-projects.json"), JSON.stringify(projects, null, 2));

  const sitemapEntries = projects
    .map(
      (p) => `  <url>
    <loc>https://mitraanshrealty.com/kota-${p.slug}.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n");
  fs.writeFileSync(path.join(ROOT, "_kota-sitemap-snippet.xml"), sitemapEntries);
  console.log("Done:", projects.length, "pages + kota.html");
}

main().catch(console.error);
