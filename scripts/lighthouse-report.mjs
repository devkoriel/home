import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LHCI_DIR = process.env.LHCI_DIR || ".lighthouseci";
const PRESET = process.env.LIGHTHOUSE_PRESET || "unknown";
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];
const HEADERS = ["Perf", "A11y", "BP", "SEO"];

function main() {
  const manifest = JSON.parse(
    readFileSync(join(LHCI_DIR, "manifest.json"), "utf-8")
  );

  const byUrl = {};
  for (const entry of manifest) {
    const url = entry.url.replace(/http:\/\/localhost:\d+/, "");
    if (!byUrl[url]) byUrl[url] = [];
    byUrl[url].push(entry);
  }

  const results = [];
  for (const [url, entries] of Object.entries(byUrl)) {
    const reports = entries.map(e => {
      const jsonFile = e.jsonPath.split("/").pop();
      const report = JSON.parse(
        readFileSync(join(LHCI_DIR, jsonFile), "utf-8")
      );
      const scores = {};
      for (const cat of CATEGORIES) {
        scores[cat] = Math.round(report.categories[cat].score * 100);
      }
      return scores;
    });

    reports.sort((a, b) => a.performance - b.performance);
    const median = reports[Math.floor(reports.length / 2)];
    results.push({ url, ...median });
  }

  results.sort((a, b) => a.url.localeCompare(b.url));

  const lines = [];
  lines.push(`### Lighthouse (${PRESET})`);
  lines.push("");
  lines.push(`| Page | ${HEADERS.join(" | ")} |`);
  lines.push(`|------|${HEADERS.map(() => "----").join("|")}|`);

  let allPass = true;
  for (const r of results) {
    const p = r.performance;
    const a = r.accessibility;
    const bp = r["best-practices"];
    const s = r.seo;
    if (p < 95 || a < 100 || bp < 100 || s < 100) allPass = false;
    lines.push(`| \`${r.url}\` | ${p} | ${a} | ${bp} | ${s} |`);
  }

  lines.push("");
  lines.push(
    allPass
      ? "All pages pass thresholds (Perf >= 95, others = 100)."
      : "Some pages are below threshold."
  );

  const output = lines.join("\n");
  console.log(output);
  writeFileSync("lighthouse-summary.md", output);
}

main();
