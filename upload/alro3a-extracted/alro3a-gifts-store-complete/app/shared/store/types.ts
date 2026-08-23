export type InternalProduct = {
  id: number;
  categoryId: number | null;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
  sortOrder: number;
};

export type CatalogProduct = {
  product: InternalProduct;
  categorySlug: string | null;
  categoryTitleAr: string | null;
  categoryTitleEn: string | null;
};
