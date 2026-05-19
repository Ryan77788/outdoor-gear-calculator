import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const moduleCache = new Map();

function loadTsModule(relativePath) {
  const filename = path.join(rootDir, relativePath);
  const cached = moduleCache.get(filename);

  if (cached) return cached.exports;

  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  });
  const mod = new Module(filename);
  const originalRequire = mod.require.bind(mod);

  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  moduleCache.set(filename, mod);
  mod.require = (request) => {
    if (request.startsWith("@/")) {
      const aliased = path.join("src", request.slice(2));
      const candidates = [`${aliased}.ts`, `${aliased}.tsx`, path.join(aliased, "index.ts"), path.join(aliased, "index.tsx")];
      const match = candidates.find((candidate) => fs.existsSync(path.join(rootDir, candidate)));

      if (match) return loadTsModule(match);
    }

    return originalRequire(request);
  };
  mod._compile(outputText, filename);

  return mod.exports;
}

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(value);
}

const products = loadTsModule("src/data/products.ts");
const recommendation = loadTsModule("src/lib/recommendation.ts");
const backgrounds = loadTsModule("src/lib/activity-backgrounds.ts");
const checklistPages = loadTsModule("src/app/gear-checklist-pages.tsx");
const i18n = loadTsModule("src/lib/i18n.ts");
const sitemapModule = loadTsModule("src/app/sitemap.ts");

test("every activity can generate a complete plan without duplicate recommended products", () => {
  for (const activity of products.activityOptions) {
    const gearList = recommendation.buildGearList(activity, "2-3天", "晴天", 2, 5000);
    const plan = recommendation.getProductPlan(activity, 5000, 2, "2-3天", "晴天");

    assert.ok(gearList.length > 0, `${activity} should generate gear list items`);
    assert.ok(plan.selectedProducts.length > 0, `${activity} should generate recommended products`);

    const productIds = plan.selectedProducts.map((product) => product.id);
    assert.equal(new Set(productIds).size, productIds.length, `${activity} should not repeat product ids`);

    const productNames = plan.selectedProducts.map((product) => product.nameEn ?? product.name);
    assert.equal(new Set(productNames).size, productNames.length, `${activity} should not repeat product names`);
  }
});

test("share backgrounds resolve to existing activity-specific assets", () => {
  for (const activity of products.activityOptions) {
    const background = backgrounds.getActivityBackground(activity).image;

    assert.ok(background.startsWith("/"), `${activity} background should be a public path`);
    assert.ok(fs.existsSync(path.join(rootDir, "public", background)), `${activity} background file should exist`);
  }

  assert.equal(backgrounds.getActivityBackground("沙漠徒步").image, "/activity/desert-hiking.jpg");
  assert.equal(backgrounds.getActivityBackground("Desert Hiking").image, "/activity/desert-hiking.jpg");
  assert.equal(backgrounds.getActivityBackground("desert-hiking").image, "/activity/desert-hiking.jpg");
});

test("specialized activity background assets are not accidental duplicate placeholders", () => {
  const imageNames = [
    "trail-running.jpg",
    "backpacking.jpg",
    "climbing.jpg",
    "kayaking.jpg",
    "snowboarding.jpg",
    "desert-hiking.jpg",
    "winter-camping.jpg",
    "beach-camping.jpg",
  ];
  const hashes = imageNames.map((imageName) => {
    const file = fs.readFileSync(path.join(rootDir, "public/activity", imageName));

    return crypto.createHash("sha256").update(file).digest("hex");
  });

  assert.equal(new Set(hashes).size, hashes.length, "specialized activity backgrounds should not reuse the same file");
});

test("sitemap includes every SEO activity page", () => {
  const urls = new Set(sitemapModule.default().map((entry) => entry.url));

  for (const page of Object.values(checklistPages.gearChecklistPages)) {
    assert.ok(urls.has(`https://outdoor-gear-calculator.com/${page.slug}`), `sitemap should include ${page.slug}`);
  }
});

test("english labels for activity, weather, and trip values do not leave Chinese text", () => {
  const values = [...products.activityOptions, ...recommendation.weatherOptions, ...recommendation.tripDayOptions];

  for (const value of values) {
    const label = i18n.localizeValue(value, "en");

    assert.notEqual(label, value, `${value} should be localized in English`);
    assert.equal(hasCjk(label), false, `${value} English label should not contain Chinese characters`);
  }
});

test("shared plan page avoids fixed Chinese separators in localized summary rows", () => {
  const source = fs.readFileSync(path.join(rootDir, "src/app/plan/[id]/page.tsx"), "utf8");

  assert.equal(source.includes(" 路"), false, "shared plan page should not use fixed Chinese separator text");
});

test("product links include searchable product keywords", () => {
  for (const catalog of Object.values(products.productCatalog)) {
    for (const product of catalog) {
      const decodedUrl = decodeURIComponent(product.buyUrl).toLowerCase();

      assert.match(product.buyUrl, /^https:\/\//, `${product.id} should use an https product search link`);
      assert.ok(decodedUrl.includes(product.brand.toLowerCase()), `${product.id} link should include brand keyword`);
      assert.ok(
        decodedUrl.includes((product.nameEn ?? product.name).toLowerCase()),
        `${product.id} link should include product keyword`,
      );
    }
  }
});
