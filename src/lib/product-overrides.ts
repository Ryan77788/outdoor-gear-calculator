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

export function applyProductOverride<T extends ProductTemplate | Product>(product: T, override?: ProductOverride): T {
  if (!override) return product;

  const next = {
    ...product,
    ...(override.buyUrl !== undefined ? { buyUrl: override.buyUrl } : {}),
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
