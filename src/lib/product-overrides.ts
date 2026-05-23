import type { Product, ProductLinkType, ProductReviewStatus, ProductTemplate } from "@/data/products";

export type ProductOverrideFields = {
  buyUrl?: string;
  affiliateLink?: string;
  linkType?: ProductLinkType;
  reviewStatus?: ProductReviewStatus;
  image?: string;
};

export type ProductOverride = ProductOverrideFields & {
  id: string;
  updatedAt?: string;
};

export type ProductOverrideInput = ProductOverrideFields & {
  id: string;
};

export function sanitizeProductOverride(input: ProductOverrideInput): ProductOverrideInput {
  return {
    id: input.id.trim(),
    buyUrl: input.buyUrl?.trim(),
    affiliateLink: input.affiliateLink?.trim(),
    linkType: input.linkType,
    reviewStatus: input.reviewStatus,
    image: input.image?.trim(),
  };
}

function amazonSearchUrl(product: ProductTemplate | Product) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(`${product.brand} ${product.nameEn ?? product.name}`)}`;
}

function isReiUrl(value: string | undefined) {
  return Boolean(value && /^https?:\/\/([^/]+\.)?rei\.com\//i.test(value));
}

export function applyProductOverride<T extends ProductTemplate | Product>(product: T, override?: ProductOverride): T {
  const fallbackBuyUrl = product.merchant === "REI" && isReiUrl(product.buyUrl) ? amazonSearchUrl(product) : product.buyUrl;
  const fallbackSearchLink =
    product.merchant === "REI" && isReiUrl(product.searchLink) ? amazonSearchUrl(product) : product.searchLink;
  const fallbackSourceUrl =
    product.merchant === "REI" && isReiUrl(product.sourceUrl) ? amazonSearchUrl(product) : product.sourceUrl;
  const overrideBuyUrl =
    product.merchant === "REI" && isReiUrl(override?.buyUrl) ? amazonSearchUrl(product) : override?.buyUrl;

  if (!override) {
    return {
      ...product,
      buyUrl: fallbackBuyUrl,
      searchLink: fallbackSearchLink,
      sourceUrl: fallbackSourceUrl,
    };
  }

  const next = {
    ...product,
    buyUrl: overrideBuyUrl ?? fallbackBuyUrl,
    searchLink: fallbackSearchLink,
    sourceUrl: fallbackSourceUrl,
    ...(override.affiliateLink !== undefined ? { affiliateLink: override.affiliateLink } : {}),
    ...(override.linkType !== undefined ? { linkType: override.linkType } : {}),
    ...(override.reviewStatus !== undefined ? { reviewStatus: override.reviewStatus } : {}),
    ...(override.image !== undefined ? { image: override.image } : {}),
  } as T & { productUrl?: string };

  if ("productUrl" in next) {
    next.productUrl = override.affiliateLink || override.buyUrl || next.productUrl;
  }

  return next as T;
}

export function applyProductOverrides<T extends ProductTemplate | Product>(
  products: T[],
  overrides: ProductOverride[],
): T[] {
  const overrideById = new Map(overrides.map((override) => [override.id, override]));

  return products.map((product) => applyProductOverride(product, overrideById.get(product.id)));
}
