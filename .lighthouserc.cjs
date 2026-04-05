/** @type {import('@lhci/cli').UserConfig} */
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      settings: {
        chromeFlags: [
          "--no-sandbox",
          "--disable-gpu",
          "--disable-dev-shm-usage",
          "--disable-software-rasterizer",
        ],
        throttlingMethod: "simulate",
        skipAudits: ["uses-http2", "redirects-http"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95, aggregationMethod: "median-run" }],
        "categories:accessibility": ["error", { minScore: 1.0, aggregationMethod: "median-run" }],
        "categories:best-practices": ["error", { minScore: 1.0, aggregationMethod: "median-run" }],
        "categories:seo": ["error", { minScore: 1.0, aggregationMethod: "median-run" }],
        "bf-cache": "off",
        "csp-xss": "off",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
