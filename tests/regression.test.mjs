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

test("product catalog exposes future-ready commerce metadata", () => {
  const productIds = [];
  const supportedActivitySlugs = ["hiking", "desert-hiking", "skiing", "camping", "fishing", "kayaking"];
  const allowedCommerceHosts = ["amazon.com", "rei.com", "decathlon.com"];
  const supportedAffiliateProviders = ["amazon", "decathlon", "backcountry", "evo", "basspro", "none"];

  for (const catalog of Object.values(products.productCatalog)) {
    for (const product of catalog) {
      productIds.push(product.id);

      for (const field of [
        "id",
        "brand",
        "activity",
        "currency",
        "buyUrl",
        "rating",
        "tags",
        "difficulty",
        "weather",
        "affiliate",
        "description",
        "affiliateProvider",
        "affiliateUrl",
        "merchant",
        "sourceUrl",
        "isAffiliateReady",
      ]) {
        assert.ok(product[field] !== undefined, `${product.id} should include ${field}`);
      }

      assert.equal(product.currency, "CNY", `${product.id} should use CNY currency`);
      assert.ok([4.2, 4.5, 4.8].includes(product.rating), `${product.id} should use supported rating values`);
      assert.equal(Array.isArray(product.tags), true, `${product.id} should expose tags as an array`);
      assert.ok(product.tags.length > 0, `${product.id} should include at least one tag`);
      assert.ok(["easy", "moderate", "technical"].includes(product.difficulty), `${product.id} should include difficulty`);
      assert.equal(product.affiliate, false, `${product.id} should default affiliate to false`);
      assert.ok(supportedAffiliateProviders.includes(product.affiliateProvider), `${product.id} should include affiliate provider`);
      assert.equal(product.affiliateUrl, "", `${product.id} should default affiliateUrl to an empty string`);
      assert.equal(product.isAffiliateReady, false, `${product.id} should default isAffiliateReady to false`);
      assert.equal(typeof product.merchant, "string", `${product.id} should include merchant display name`);
      assert.ok(product.merchant.length > 0, `${product.id} should include merchant display name`);
      assert.equal(product.sourceUrl, product.buyUrl, `${product.id} should keep sourceUrl aligned with buyUrl`);
      assert.equal(typeof product.description, "string", `${product.id} should include a description`);
      assert.ok(product.description.length >= 40, `${product.id} should include a realistic description`);
      assert.ok(
        allowedCommerceHosts.some((host) => new URL(product.buyUrl).hostname.endsWith(host)),
        `${product.id} should link to an allowed commerce platform`,
      );
    }
  }

  assert.equal(new Set(productIds).size, productIds.length, "all products should have unique ids");

  for (const slug of supportedActivitySlugs) {
    assert.ok(
      Object.values(products.productCatalog).some((catalog) => catalog.some((product) => product.activity.includes(slug))),
      `product activity should support ${slug}`,
    );
  }
});

test("product cards and click logging are affiliate-ready", () => {
  const source = fs.readFileSync(path.join(rootDir, "src/app/page.tsx"), "utf8");
  const sharedPlanSource = fs.readFileSync(path.join(rootDir, "src/app/plan/[id]/page.tsx"), "utf8");

  assert.ok(
    source.includes("product.affiliateUrl || product.sourceUrl || product.buyUrl"),
    "product click should prefer affiliateUrl, then sourceUrl or buyUrl",
  );

  for (const field of [
    "productId",
    "productName",
    "brand",
    "merchant",
    "affiliateProvider",
    "clickedUrl",
    "activity",
    "budget",
    "timestamp",
  ]) {
    assert.ok(source.includes(field), `product_click payload should include ${field}`);
  }

  assert.ok(source.includes("Available on"), "English product card should display merchant");
  assert.ok(source.includes("来自"), "Chinese product card should display merchant");
  assert.ok(sharedPlanSource.includes("Available on"), "English shared product card should display merchant");
  assert.ok(sharedPlanSource.includes("来自"), "Chinese shared product card should display merchant");
});

test("admin analytics page reads behavior metrics from MongoDB logs", () => {
  const analyticsPagePath = path.join(rootDir, "src/app/admin/analytics/page.tsx");
  const plansRouteSource = fs.readFileSync(path.join(rootDir, "src/app/api/plans/route.ts"), "utf8");

  assert.ok(fs.existsSync(analyticsPagePath), "admin analytics page should exist");

  const analyticsSource = fs.readFileSync(analyticsPagePath, "utf8");

  for (const token of [
    "logs",
    "calculator",
    "product_click",
    "saved_plan",
    "activity",
    "productName",
    "merchant",
    "0-1000",
    "1000-3000",
    "3000-8000",
    "8000+",
  ]) {
    assert.ok(analyticsSource.includes(token), `analytics page should include ${token}`);
  }

  assert.ok(plansRouteSource.includes('type: "saved_plan"'), "saving a plan should write saved_plan logs");
  assert.ok(plansRouteSource.includes('collection("logs")'), "saved_plan events should go to MongoDB logs collection");
});
