import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { generateSKU, generateSlug } from '../utils/helpers';

const router = Router();

type ProductWhereInput = NonNullable<Parameters<typeof prisma.product.findMany>[0]>['where'];
type ProductOrderByInput = NonNullable<Parameters<typeof prisma.product.findMany>[0]>['orderBy'];
type ProductWithRelations = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

const serializeProduct = (product: ProductWithRelations) => ({
  ...product,
  price: Number(product.price),
  costPrice:
    product.costPrice !== null && product.costPrice !== undefined
      ? Number(product.costPrice)
      : null,
  salePrice:
    product.salePrice !== null && product.salePrice !== undefined
      ? Number(product.salePrice)
      : null,
  weight:
    product.weight !== null && product.weight !== undefined
      ? Number(product.weight)
      : null,
});

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page = '1',
      limit = '12',
      category,
      season,
      type,
      search,
      minPrice,
      maxPrice,
      sort = 'newest',
      featured,
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit as string, 10) || 12, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const where: ProductWhereInput = {
      isActive: true,
    };

    if (category && typeof category === 'string') {
      where.category = {
        slug: category,
      };
    }

    if (season && typeof season === 'string') {
      where.season = season as any;
    }

    if (type && typeof type === 'string') {
      where.type = type as any;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      const priceFilter: NonNullable<ProductWhereInput['price']> = {};
      if (minPrice) {
        priceFilter.gte = Number(minPrice);
      }
      if (maxPrice) {
        priceFilter.lte = Number(maxPrice);
      }

      if (Object.keys(priceFilter).length > 0) {
        where.price = priceFilter;
      }
    }

    const orderBy: ProductOrderByInput = (() => {
      switch (sort) {
        case 'price_asc':
          return { price: 'asc' as const };
        case 'price_desc':
          return { price: 'desc' as const };
        case 'popular':
          return { isFeatured: 'desc' as const };
        default:
          return { createdAt: 'desc' as const };
      }
    })();

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy,
        include: {
          category: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      message: 'Products retrieved successfully',
      data: products.map(serializeProduct),
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  })
);

router.get(
  '/filters',
  asyncHandler(async (req: Request, res: Response) => {
    const [seasons, types, widths, rimSizes, brands] = await Promise.all([
      prisma.product.findMany({
        distinct: ['season'],
        select: { season: true },
        where: { isActive: true },
      }),
      prisma.product.findMany({
        distinct: ['type'],
        select: { type: true },
        where: { isActive: true },
      }),
      prisma.product.findMany({
        distinct: ['width'],
        select: { width: true },
        where: { isActive: true },
      }),
      prisma.product.findMany({
        distinct: ['rimSize'],
        select: { rimSize: true },
        where: { isActive: true },
      }),
      prisma.product.findMany({
        distinct: ['brand'],
        select: { brand: true },
        where: { isActive: true },
      }),
    ]);

    res.json({
      message: 'Product filters retrieved successfully',
      data: {
        seasons: seasons.map((s) => s.season),
        types: types.map((t) => t.type),
        widths: widths.map((w) => w.width).filter(Boolean),
        rimSizes: rimSizes.map((r) => r.rimSize).filter(Boolean),
        brands: brands.map((b) => b.brand),
      },
    });
  })
);

router.get(
  '/featured',
  asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(parseInt((req.query.limit as string) || '8', 10), 20);
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    res.json({
      message: 'Featured products retrieved successfully',
      data: products.map(serializeProduct),
    });
  })
);

router.get(
  '/:idOrSlug',
  asyncHandler(async (req: Request, res: Response) => {
    const { idOrSlug } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
          { sku: idOrSlug },
        ],
        isActive: true,
      },
      include: {
        category: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({
        error: 'Product not found',
        message: `No product found with identifier ${idOrSlug}`,
      });
      return;
    }

    res.json({
      message: 'Product retrieved successfully',
      data: serializeProduct(product),
    });
  })
);

router.post(
  '/',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      description,
      shortDescription,
      categoryId,
      brand,
      model,
      size,
      width,
      profile,
      rimSize,
      loadIndex,
      speedRating,
      season,
      type,
      price,
      costPrice,
      salePrice,
      stock,
      minStock,
      weight,
      features = [],
      images = [],
      metaTitle,
      metaDescription,
      metaKeywords = [],
    } = req.body;

    if (!name || !description || !categoryId || !brand || !model || !size) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Name, description, categoryId, brand, model, and size are required',
      });
      return;
    }

    const sku = await generateSKU(brand, model, size);
    const slug = generateSlug(name);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        categoryId,
        brand,
        model,
        size,
        width,
        profile,
        rimSize,
        loadIndex,
        speedRating,
        season,
        type,
        price,
        costPrice,
        salePrice,
        stock,
        minStock,
        weight,
        features,
        images,
        sku,
        specifications: {
          loadIndex,
          speedRating,
          season,
          type,
        },
        dimensions: {
          width,
          profile,
          rimSize,
        },
        metaTitle: metaTitle || `${name} - ${brand}`,
        metaDescription: metaDescription || shortDescription,
        metaKeywords: metaKeywords.length ? metaKeywords : [brand, model, season, type].filter(Boolean),
      },
    });

    res.status(201).json({
      message: 'Product created successfully',
      data: serializeProduct(product),
    });
  })
);

router.patch(
  '/:id',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    if (data.name) {
      data.slug = generateSlug(data.name);
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    res.json({
      message: 'Product updated successfully',
      data: serializeProduct(product),
    });
  })
);

router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({
      message: 'Product deleted successfully',
    });
  })
);

export default router;

