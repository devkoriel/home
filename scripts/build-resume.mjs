import { readFileSync } from "fs";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const resume = JSON.parse(readFileSync(resolve(root, "resume.json"), "utf-8"));

function formatDate(dateStr) {
  if (!dateStr) return "Present";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const { basics, work, education, skills, languages, publications, awards } = resume;

const contactParts = [
  basics.email,
  basics.phone,
  basics.location ? `${basics.location.city}, ${basics.location.countryCode}` : "",
  basics.url ? basics.url.replace(/^https?:\/\//, "") : "",
].filter(Boolean);

const profileLinks = (basics.profiles || [])
  .map((p) => {
    const display = p.url.replace(/^https?:\/\/(www\.)?/, "");
    return `<a href="${escapeHtml(p.url)}">${escapeHtml(display)}</a>`;
  })
  .join("&nbsp; | &nbsp;");

const skillsHtml = skills
  .map((s) => `<div class="skill-row"><strong>${escapeHtml(s.name)}:</strong> ${s.keywords.map(escapeHtml).join(", ")}</div>`)
  .join("");

const workHtml = work
  .map((w) => {
    const dates = `${formatDate(w.startDate)} – ${formatDate(w.endDate)}`;
    const highlights = (w.highlights || [])
      .map((h) => `<li>${escapeHtml(h)}</li>`)
      .join("");
    return `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-title"><strong>${escapeHtml(w.position)}</strong> &middot; ${escapeHtml(w.name || "")}</span>
          <span class="entry-date">${dates}</span>
        </div>
        ${w.summary ? `<div class="entry-sub">${escapeHtml(w.summary)}</div>` : ""}
        ${highlights ? `<ul>${highlights}</ul>` : ""}
      </div>`;
  })
  .join("");

const educationHtml = education
  .map((e) => {
    const dates = `${formatDate(e.startDate)} – ${formatDate(e.endDate)}`;
    const degree = [e.studyType, e.area].filter(Boolean).join(" in ");
    return `
      <div class="entry-row">
        <span><strong>${escapeHtml(e.institution)}</strong>${degree ? ` &middot; ${escapeHtml(degree)}` : ""}</span>
        <span class="entry-date">${dates}</span>
      </div>`;
  })
  .join("");

const langLine = (languages || []).map((l) => `${l.language} (${l.fluency})`).join(", ");

const pubsList = (publications || [])
  .map((p) => {
    const parts = [escapeHtml(p.name)];
    if (p.publisher) parts.push(escapeHtml(p.publisher));
    if (p.releaseDate) parts.push(formatDate(p.releaseDate).split(" ")[1]);
    return `<li>${parts.join(" | ")}</li>`;
  })
  .join("");

const awardsList = (awards || [])
  .map((a) => {
    const parts = [escapeHtml(a.title)];
    if (a.awarder) parts.push(escapeHtml(a.awarder));
    if (a.date) parts.push(formatDate(a.date).split(" ")[1]);
    return `<li>${parts.join(" | ")}</li>`;
  })
  .join("");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    font-family: "Helvetica Neue", Arial, "Segoe UI", sans-serif;
    font-size: 9.5pt;
    color: #222;
    line-height: 1.45;
  }
  a { color: #222; text-decoration: none; }

  /* Header */
  h1 {
    font-size: 22pt;
    font-weight: 700;
    letter-spacing: -0.5pt;
    margin-bottom: 3pt;
  }
  .label {
    font-size: 11pt;
    color: #555;
    margin-bottom: 5pt;
  }
  .contact {
    font-size: 8.5pt;
    color: #666;
    line-height: 1.6;
  }
  .contact a { color: #666; }

  /* Sections */
  .divider {
    border: none;
    border-top: 1.5pt solid #222;
    margin: 12pt 0 10pt;
  }
  .section { margin-bottom: 12pt; }
  h2 {
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8pt;
    color: #222;
    padding-bottom: 4pt;
    border-bottom: 0.75pt solid #ddd;
    margin-bottom: 8pt;
    break-after: avoid;
    page-break-after: avoid;
  }
  .summary {
    line-height: 1.5;
    margin-bottom: 12pt;
  }
  .skills {
    font-size: 8.5pt;
    line-height: 1.5;
  }
  .skill-row {
    margin-bottom: 2pt;
  }

  /* Work entries */
  .entry {
    margin-bottom: 10pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1pt;
  }
  .entry-title { font-size: 9.5pt; }
  .entry-date {
    font-size: 8.5pt;
    color: #666;
    white-space: nowrap;
    flex-shrink: 0;
    margin-left: 12pt;
  }
  .entry-sub {
    font-size: 8.5pt;
    font-style: italic;
    color: #666;
    margin-bottom: 2pt;
  }
  ul {
    margin: 3pt 0 0 16pt;
    padding: 0;
  }
  li {
    font-size: 8.5pt;
    line-height: 1.45;
    margin-bottom: 1.5pt;
    color: #333;
  }

  /* Education rows */
  .entry-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4pt;
    font-size: 9.5pt;
  }

  .extras {
    font-size: 8.5pt;
    line-height: 1.5;
    color: #333;
  }
</style>
</head>
<body>
  <h1>${escapeHtml(basics.name)}</h1>
  <div class="label">${escapeHtml(basics.label)}</div>
  <div class="contact">
    ${contactParts.join(" &middot; ")}
    <br>${profileLinks}
  </div>

  <hr class="divider">

  <div class="summary">${escapeHtml(basics.summary)}</div>

  <div class="section">
    <h2>Technical Skills</h2>
    <div class="skills">${skillsHtml}</div>
  </div>

  <div class="section">
    <h2>Professional Experience</h2>
    ${workHtml}
  </div>

  <div class="section">
    <h2>Education</h2>
    ${educationHtml}
  </div>

  ${pubsList ? `<div class="section"><h2>Publications</h2><ul class="extras">${pubsList}</ul></div>` : ""}

  ${awardsList ? `<div class="section"><h2>Awards</h2><ul class="extras">${awardsList}</ul></div>` : ""}

  ${langLine ? `<div class="section"><h2>Languages</h2><div class="extras">${escapeHtml(langLine)}</div></div>` : ""}
</body>
</html>`;

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle0" });
await page.pdf({
  path: resolve(root, "resume", "resume.pdf"),
  format: "A4",
  margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
  printBackground: true,
});
await browser.close();

console.log("Resume PDF built successfully at resume/resume.pdf");
