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
    const shareBackground = backgrounds.getShareCardBackground(activity).image;

    assert.ok(background.startsWith("/"), `${activity} background should be a public path`);
    assert.ok(fs.existsSync(path.join(rootDir, "public", background)), `${activity} background file should exist`);
    assert.ok(shareBackground.startsWith("/"), `${activity} share background should be a public path`);
    assert.ok(fs.existsSync(path.join(rootDir, "public", shareBackground)), `${activity} share background file should exist`);
  }

  assert.equal(backgrounds.getActivityBackground("沙漠徒步").image, "/activity/desert-hiking.jpg");
  assert.equal(backgrounds.getActivityBackground("Desert Hiking").image, "/activity/desert-hiking.jpg");
  assert.equal(backgrounds.getActivityBackground("desert-hiking").image, "/activity/desert-hiking.jpg");
  assert.equal(backgrounds.getShareCardBackground("沙漠徒步").image, "/activity/desert-hiking.jpg");
  assert.equal(backgrounds.getShareCardBackground("roadtrip").image, "/activity/road-trip.jpg");
  assert.equal(backgrounds.getShareCardBackground("self-driving").image, "/activity/road-trip.jpg");
  assert.equal(backgrounds.getShareCardBackground("unknown-activity").image, "/neutral-outdoor.jpg");
  assert.notEqual(backgrounds.getShareCardBackground("unknown-activity").image, "/share-hiking.jpg");
  assert.equal(backgrounds.getGuideImage("hiking-gear-checklist"), "/activity/hiking.jpg");
  assert.equal(backgrounds.getGuideImage("road-trip-gear-checklist"), "/activity/road-trip.jpg");
  assert.notEqual(backgrounds.getGuideImage("road-trip-gear-checklist"), backgrounds.getGuideImage("hiking-gear-checklist"));
});

test("share image poster uses real recommendation details instead of fake budget bars", () => {
  const source = fs.readFileSync(path.join(rootDir, "src/app/page.tsx"), "utf8");

  assert.ok(source.includes("getShareCardBackground"), "share image should use dedicated share background mapping");
  assert.ok(source.includes("getShareFeatureTags"), "share image should render real feature tags");
  assert.ok(source.includes("getShareRecommendationReason"), "share image should render a recommendation reason");
  assert.ok(source.includes("brand"), "share image product rows should include product brand");
  assert.ok(source.includes("unitPrice"), "share image product rows should include unit price");
  assert.ok(source.includes("subtotal"), "share image product rows should include subtotal");
  assert.equal(source.includes("shareBudgetBreakdown"), false, "share image should not use fake budget percentage bars");
  assert.equal(source.includes("coreEquipment"), false, "share image should not show fake core equipment percentage");
  assert.equal(source.includes("consumables"), false, "share image should not show fake consumables percentage");
  assert.equal(source.includes("safetyGear"), false, "share image should not show fake safety gear percentage");
});

test("home page exposes site navigation and activity guide entries", () => {
  const source = fs.readFileSync(path.join(rootDir, "src/app/page.tsx"), "utf8");
  const guideClientSource = fs.readFileSync(path.join(rootDir, "src/app/gear-checklist-landing-client.tsx"), "utf8");
  const footerSource = fs.existsSync(path.join(rootDir, "src/app/site-footer.tsx"))
    ? fs.readFileSync(path.join(rootDir, "src/app/site-footer.tsx"), "utf8")
    : "";

  for (const token of [
    "Gear Planner",
    "Activity Guides",
    "Saved Plans",
    "装备规划",
    "活动指南",
    "已保存方案",
    "activity-guides",
    "saved-plans",
    "View guide",
    "查看指南",
  ]) {
    assert.ok(source.includes(token), `home page should include navigation or guide copy ${token}`);
  }

  for (const href of [
    "/hiking-gear-checklist",
    "/camping-gear-checklist",
    "/skiing-gear-checklist",
    "/fishing-gear-checklist",
    "/kayaking",
    "/desert-hiking",
    "/climbing",
    "/road-trip-gear-checklist",
  ]) {
    assert.ok(source.includes(`href: "${href}"`), `activity guide card should link to ${href}`);
  }

  assert.ok(source.includes('localStorage.setItem(LANGUAGE_STORAGE_KEY, language)'), "home language should persist to localStorage");
  assert.ok(source.includes("localizedSectionHref"), "home section navigation should preserve the current language");
  assert.ok(source.includes('`/?lang=${language}#${sectionId}`'), "home section anchors should keep lang before hash");
  assert.ok(source.includes('`${window.location.origin}/plan/${planId}?lang=${language}`'), "copied saved-plan links should include current language");
  assert.ok(source.includes('window.open(`/plan/${planId}?lang=${language}`'), "opened saved-plan links should include current language");
  assert.ok(source.includes('href={`${guide.href}?lang=${language}`}'), "activity guide links should carry the current language");
  assert.ok(guideClientSource.includes("new URLSearchParams(window.location.search).get(\"lang\")"), "guide pages should prefer URL lang");
  assert.ok(guideClientSource.includes("window.localStorage.getItem(LANGUAGE_STORAGE_KEY)"), "guide pages should read localStorage language");
  assert.ok(guideClientSource.includes('href={plannerHref}'), "guide planner button should preserve language");
  assert.ok(guideClientSource.includes("`/?activity=${activitySlug}&lang=${language}`"), "guide planner link should return home with activity and lang");
  assert.ok(guideClientSource.includes("activitySlugByActivity"), "guide planner links should include activity slug mapping");
  assert.ok(guideClientSource.includes("activity="), "guide planner links should include activity query parameter");
  assert.ok(guideClientSource.includes("fishing"), "guide planner mapping should support fishing");
  assert.ok(guideClientSource.includes("roadtrip"), "guide planner mapping should support roadtrip");
  assert.ok(source.includes("activityByUrlParam"), "home should map activity URL params to activities");
  assert.ok(source.includes('urlParams.get("activity")'), "home should read activity search param");
  assert.ok(source.includes("scrollIntoView"), "home should scroll to Gear Planner after activity param is applied");
  assert.ok(source.includes('document.getElementById("gear-planner")'), "home should scroll to gear planner section");
  assert.ok(guideClientSource.includes("适合场景"), "guide pages should include Chinese scenarios label");
  assert.ok(guideClientSource.includes("核心装备清单"), "guide pages should include Chinese core gear label");
  assert.ok(guideClientSource.includes("风险提示"), "guide pages should include Chinese risk notes label");
  assert.ok(guideClientSource.includes("Packing Strategy"), "guide pages should include packing strategy section");
  assert.ok(guideClientSource.includes("Common Mistakes"), "guide pages should include common mistakes section");
  assert.ok(guideClientSource.includes("Budget Tips"), "guide pages should include budget tips section");
  assert.ok(guideClientSource.includes("FAQ"), "guide pages should include FAQ section");
  assert.ok(guideClientSource.includes("Related Guides"), "guide pages should include related guides section");
  assert.ok(guideClientSource.includes("装备准备策略"), "guide pages should include Chinese packing strategy label");
  assert.ok(guideClientSource.includes("常见错误"), "guide pages should include Chinese common mistakes label");
  assert.ok(guideClientSource.includes("预算建议"), "guide pages should include Chinese budget tips label");
  assert.ok(guideClientSource.includes("常见问题"), "guide pages should include Chinese FAQ label");
  assert.ok(guideClientSource.includes("相关指南"), "guide pages should include Chinese related guides label");
  assert.ok(guideClientSource.includes("relatedGuideKeysBySlug"), "guide pages should map related guides by current slug");
  assert.ok(source.includes("getGuideImage(guide.href.replace"), "home activity guide cards should use guide image mapping");
  assert.ok(source.includes("grid gap-4 md:grid-cols-2 lg:grid-cols-4"), "home activity guides should use 1/2/4 responsive columns");
  assert.ok(source.includes("flex min-h-64 flex-col justify-between"), "home activity guide cards should use vertical content flow");
  assert.ok(source.includes("self-start rounded-lg"), "home activity guide CTA should be a small rounded button");
  assert.ok(!source.includes("mt-4 inline-flex w-fit items-center rounded-full border border-white/25"), "home activity guide CTA should not use the old large pill overlay style");
  for (const trustToken of [
    "How it works",
    "Choose your activity",
    "Set weather, trip length and budget",
    "Get a tailored gear plan",
    "Why it helps",
    "Avoid missing essential gear",
    "Balance budget and safety",
    "Share plans with your group",
    "工作原理",
    "为什么有用",
    "选择活动类型",
    "避免遗漏关键装备",
  ]) {
    assert.ok(source.includes(trustToken), `home trust module should include ${trustToken}`);
  }
  assert.ok(source.indexOf("id=\"gear-planner\"") < source.indexOf("aria-labelledby=\"trust-how-it-works\""), "trust module should appear below the gear planner form");
  assert.ok(source.indexOf("aria-labelledby=\"trust-how-it-works\"") < source.indexOf("{showResult &&"), "trust module should appear above the result area");
  for (const useCaseToken of [
    "Use Cases",
    "Weekend camping trips",
    "Ski trips with friends",
    "Family road trips",
    "Fishing day trips",
    "Desert hiking planning",
    "Kayaking and water activities",
    "Start planning",
    "适用场景",
    "周末露营",
    "朋友滑雪出行",
    "家庭自驾游",
    "一日钓鱼",
    "沙漠徒步规划",
    "皮划艇和水上活动",
    "开始规划",
  ]) {
    assert.ok(source.includes(useCaseToken), `home use cases module should include ${useCaseToken}`);
  }
  assert.ok(source.includes("handleStartUseCase"), "use case cards should have a start-planning handler");
  assert.ok(source.includes('updateField("activity", activity)'), "use case buttons should select the matching activity");
  assert.ok(source.includes('document.getElementById("gear-planner")?.scrollIntoView'), "use case buttons should scroll to the planner");
  assert.ok(source.indexOf("aria-labelledby=\"trust-how-it-works\"") < source.indexOf("aria-labelledby=\"use-cases\""), "use cases should appear below the How it works module");
  assert.ok(source.indexOf("aria-labelledby=\"use-cases\"") < source.indexOf("{showResult &&"), "use cases should appear above the result area");
  for (const bottomCtaToken of [
    "Ready to build your outdoor gear plan?",
    "Choose your activity, weather, group size and budget. Get a practical gear checklist in seconds.",
    "准备生成你的户外装备方案了吗？",
    "选择活动、天气、人数和预算，快速生成更贴近真实出行场景的装备清单。",
  ]) {
    assert.ok(source.includes(bottomCtaToken), `home bottom CTA should include ${bottomCtaToken}`);
  }
  assert.ok(source.includes("bottomCta"), "home should define localized bottom CTA copy");
  assert.ok(source.includes("handleBottomCtaClick"), "bottom CTA should have a planner scroll handler");
  assert.ok(source.indexOf("{showResult &&") < source.indexOf("aria-labelledby=\"bottom-cta\""), "bottom CTA should be near the footer after main content");
  assert.ok(source.indexOf("aria-labelledby=\"bottom-cta\"") < source.indexOf("<SiteFooter language={language} />"), "bottom CTA should appear before the footer");
  assert.ok(source.includes("<SiteFooter language={language} />"), "home page should render the shared localized footer");
  assert.ok(guideClientSource.includes("<SiteFooter language={language} />"), "guide pages should render the shared localized footer");
  assert.ok(footerSource.includes("Outdoor AI"), "footer should include Outdoor AI brand copy");
  assert.ok(footerSource.includes("Outdoor Gear Calculator"), "footer should include Outdoor Gear Calculator brand copy");
  assert.ok(footerSource.includes("Plan smarter. Pack lighter. Go further."), "footer should include the requested slogan");
  assert.ok(footerSource.includes("function withLanguage"), "footer should build localized internal links");
  assert.ok(footerSource.includes('`/?lang=${language}${hash}`'), "footer hash links should preserve language before the section hash");
  assert.ok(footerSource.includes('`${href}?lang=${language}`'), "footer page links should preserve language as a query parameter");
  for (const footerToken of [
    "Quick Links",
    "Activity Guides",
    "Legal",
    "Gear Planner",
    "Saved Plans",
    "Privacy Policy",
    "Terms",
    "Affiliate Disclosure",
    "快速链接",
    "法律信息",
  ]) {
    assert.ok(footerSource.includes(footerToken), `footer should include localized copy ${footerToken}`);
  }
  for (const href of [
    "/#gear-planner",
    "/#activity-guides",
    "/#saved-plans",
    "/hiking-gear-checklist",
    "/camping-gear-checklist",
    "/skiing-gear-checklist",
    "/fishing-gear-checklist",
    "/kayaking",
    "/road-trip-gear-checklist",
    "/privacy",
    "/terms",
    "/affiliate-disclosure",
  ]) {
    assert.ok(footerSource.includes(`href: "${href}"`) || footerSource.includes(`href="${href}"`), `footer should link to ${href}`);
  }
  assert.ok(guideClientSource.includes("getGuideImage(page.slug)"), "SEO guide hero should use guide image mapping");
  assert.ok(guideClientSource.includes("getGuideImage(guide.slug)"), "related guide cards should use guide image mapping");
  assert.ok(guideClientSource.includes('href={`/${guide.slug}?lang=${language}`}'), "related guide links should preserve language");
  assert.ok(guideClientSource.includes("hover:-translate-y-1"), "related guide cards should animate on hover");
  assert.ok(guideClientSource.includes("Kayaking Gear Checklist"), "fishing related guides should include kayaking");
  assert.ok(guideClientSource.includes("Climbing Gear Checklist"), "desert hiking related guides should include climbing");
  assert.ok(guideClientSource.includes("What gear do I need for hiking?"), "hiking guide should include search-oriented FAQ");
  assert.ok(guideClientSource.includes("What should I pack for rainy fishing?"), "fishing guide should include rain-specific FAQ");
  assert.ok(guideClientSource.includes("How do I prepare for a remote road trip?"), "road trip guide should include remote route FAQ");
  assert.ok(guideClientSource.includes("沙漠徒步需要准备哪些装备？"), "desert hiking guide should include Chinese FAQ");
  assert.ok(guideClientSource.includes("water type, target species"), "fishing guide should have activity-specific content");
  assert.ok(guideClientSource.includes("water capacity first"), "desert hiking guide should have activity-specific content");
  assert.ok(guideClientSource.includes("Prepare the vehicle first"), "road trip guide should have activity-specific content");
  assert.ok(guideClientSource.includes("打开装备规划器"), "guide pages should include Chinese planner button");
});

test("legal placeholder pages exist with concise English content and footer", () => {
  const legalClientSource = fs.existsSync(path.join(rootDir, "src/app/legal-page-client.tsx"))
    ? fs.readFileSync(path.join(rootDir, "src/app/legal-page-client.tsx"), "utf8")
    : "";

  assert.ok(legalClientSource.includes('"use client"'), "legal pages should use a client component for localStorage language fallback");
  assert.ok(legalClientSource.includes('new URLSearchParams(window.location.search).get("lang")'), "legal pages should prefer URL language");
  assert.ok(legalClientSource.includes('window.localStorage.getItem("language")'), "legal pages should read stored language when URL language is absent");
  assert.ok(legalClientSource.includes('setLanguage("en")'), "legal pages should default to English");
  assert.ok(legalClientSource.includes("隐私政策"), "legal client should include Chinese privacy title");
  assert.ok(legalClientSource.includes("服务条款"), "legal client should include Chinese terms title");
  assert.ok(legalClientSource.includes("联盟披露"), "legal client should include Chinese affiliate disclosure title");

  for (const [route, heading] of [
    ["privacy", "Privacy Policy"],
    ["terms", "Terms"],
    ["affiliate-disclosure", "Affiliate Disclosure"],
  ]) {
    const pagePath = path.join(rootDir, "src/app", route, "page.tsx");
    assert.ok(fs.existsSync(pagePath), `${route} page should exist`);

    const source = fs.readFileSync(pagePath, "utf8");
    assert.ok(source.includes(heading), `${route} page should include heading`);
    assert.ok(source.includes("<LegalPageClient"), `${route} page should render localized legal content`);
  }
});

test("shared plan page synchronizes language and preserves language links", () => {
  const planPageSource = fs.readFileSync(path.join(rootDir, "src/app/plan/[id]/page.tsx"), "utf8");
  const planLanguageSyncSource = fs.existsSync(path.join(rootDir, "src/app/plan/[id]/PlanLanguageSync.tsx"))
    ? fs.readFileSync(path.join(rootDir, "src/app/plan/[id]/PlanLanguageSync.tsx"), "utf8")
    : "";

  assert.ok(planPageSource.includes("PlanLanguageSync"), "shared plan page should include client language sync");
  assert.ok(planPageSource.includes("<SiteFooter language={language} />"), "shared plan page should render localized footer");
  assert.ok(planPageSource.includes('href={`/plan/${id}?lang=en`}'), "shared plan English switch should preserve explicit lang=en");
  assert.ok(planPageSource.includes('href={`/plan/${id}?lang=zh`}'), "shared plan Chinese switch should preserve explicit lang=zh");
  assert.ok(planPageSource.includes("<SiteFooter language={language} />"), "shared plan footer should follow current language");
  assert.ok(planLanguageSyncSource.includes('"use client"'), "shared plan language fallback should run on the client");
  assert.ok(planLanguageSyncSource.includes('new URLSearchParams(window.location.search).get("lang")'), "shared plan should prefer URL language");
  assert.ok(planLanguageSyncSource.includes('window.localStorage.getItem("language")'), "shared plan should read stored language when URL language is absent");
  assert.ok(planLanguageSyncSource.includes("window.location.replace"), "shared plan should redirect to stored language when URL language is absent");
  assert.ok(planLanguageSyncSource.includes('window.localStorage.setItem("language", urlLanguage)'), "shared plan should persist URL language");
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
  const analyticsApiPath = path.join(rootDir, "src/app/api/admin/analytics/route.ts");
  const plansRouteSource = fs.readFileSync(path.join(rootDir, "src/app/api/plans/route.ts"), "utf8");

  assert.ok(fs.existsSync(analyticsPagePath), "admin analytics page should exist");
  assert.ok(fs.existsSync(analyticsApiPath), "admin analytics API should exist");

  const analyticsSource = fs.readFileSync(analyticsPagePath, "utf8");
  const analyticsApiSource = fs.readFileSync(analyticsApiPath, "utf8");

  for (const token of ["ADMIN_PASSWORD", "localStorage", "type=\"password\"", "密码错误"]) {
    assert.ok(analyticsSource.includes(token), `analytics page should include password gate token ${token}`);
  }

  for (const token of [
    "数据分析后台",
    "今日",
    "最近 7 天",
    "最近 30 天",
    "全部",
    "总生成次数",
    "商品点击次数",
    "保存方案次数",
    "分享图生成次数",
    "分享链接复制次数",
    "平均预算",
    "平均推荐总价",
    "商品点击率",
    "保存率",
    "分享率",
    "热门活动",
    "热门商品",
    "热门商家",
    "热门天气",
    "预算分布",
    "最近行为",
    "活动类型",
    "商品名称",
    "商家",
    "时间",
    "类型",
    "次数",
    "预算区间",
    "数据来自 MongoDB logs 集合",
    "用于观察用户生成方案、点击商品和保存方案行为",
    "刷新数据",
    "暂无数据，先回首页生成一次方案。",
  ]) {
    assert.ok(analyticsSource.includes(token), `analytics page should include Chinese admin copy ${token}`);
  }

  assert.equal(analyticsSource.includes("clientPromise"), false, "analytics page should not fetch MongoDB before password validation");

  for (const token of [
    "logs",
    "calculator",
    "product_click",
    "saved_plan",
    "share_image",
    "share_link_copy",
    "activity",
    "productName",
    "merchant",
    "weather",
    "recentLogs",
    "$gte",
    "$lt",
    "$avg",
    "$limit: 20",
    "0-1000",
    "1000-3000",
    "3000-8000",
    "8000+",
  ]) {
    assert.ok(analyticsApiSource.includes(token), `analytics API should include ${token}`);
  }

  assert.ok(analyticsApiSource.includes("process.env.ADMIN_PASSWORD"), "analytics API should validate ADMIN_PASSWORD");
  assert.ok(analyticsApiSource.includes("401"), "analytics API should reject invalid passwords");
  assert.ok(plansRouteSource.includes('type: "saved_plan"'), "saving a plan should write saved_plan logs");
  assert.ok(plansRouteSource.includes('collection("logs")'), "saved_plan events should go to MongoDB logs collection");

  const homeSource = fs.readFileSync(path.join(rootDir, "src/app/page.tsx"), "utf8");
  const planPageSource = fs.readFileSync(path.join(rootDir, "src/app/plan/[id]/page.tsx"), "utf8");
  const planOpenLoggerSource = fs.readFileSync(path.join(rootDir, "src/app/plan/[id]/PlanOpenLogger.tsx"), "utf8");

  assert.ok(homeSource.includes('"share_image"'), "share image generation should write logs");
  assert.ok(homeSource.includes('"share_link_copy"'), "share link copying should write logs");
  assert.ok(homeSource.includes('"reload_plan"'), "reloading a saved plan should write logs");
  assert.ok(planPageSource.includes("PlanOpenLogger"), "shared plan page should include a plan open logger");
  assert.ok(planOpenLoggerSource.includes('type: "plan_open"'), "shared plan page should write plan_open logs");

  for (const field of ["activity", "weather", "tripDays", "peopleCount", "budget", "language"]) {
    assert.ok(homeSource.includes(field), `share behavior logs should include ${field}`);
  }

  for (const field of ["planId", "activity", "weather", "tripDays", "peopleCount", "budget"]) {
    assert.ok(planOpenLoggerSource.includes(field), `plan_open logs should include ${field}`);
    assert.ok(homeSource.includes(field), `reload/share link logs should include ${field}`);
  }
});
