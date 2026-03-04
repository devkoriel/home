module.exports = {
  ci: {
    collect: {
      staticDistDir: ".",
      url: ["http://localhost/"],
      numberOfRuns: 5,
      settings: {
        emulatedFormFactor: "mobile",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        screenEmulation: {
          mobile: true,
          width: 360,
          height: 640,
          deviceScaleFactor: 2,
          disabled: false
        },
        chromeFlags: "--no-sandbox --disable-dev-shm-usage"
      }
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 1 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 1 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.01 }]
      }
    },
    upload: {
      target: "temporary-public-storage"
    }
  }
};
