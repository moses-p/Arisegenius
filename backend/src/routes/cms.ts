import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAdmin } from '../middleware/auth';
import { sanitizeHtml, generateSlug } from '../utils/helpers';
import { SettingType } from '@prisma/client';

const router = Router();

router.get(
  '/pages',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      status = 'PUBLISHED',
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [pages, total] = await prisma.$transaction([
      prisma.page.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.page.count({ where }),
    ]);

    res.json({
      message: 'Pages retrieved successfully',
      data: pages,
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
  '/pages/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      res.status(404).json({
        error: 'Page not found',
        message: `No page found with slug ${slug}`,
      });
      return;
    }

    res.json({
      message: 'Page retrieved successfully',
      data: page,
    });
  })
);

router.get(
  '/blog',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      status = 'PUBLISHED',
      search,
      page = '1',
      limit = '10',
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit as string, 10) || 10, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json({
      message: 'Blog posts retrieved successfully',
      data: posts,
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
  '/blog/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({
        error: 'Post not found',
        message: `No blog post found with slug ${slug}`,
      });
      return;
    }

    await prisma.blogPost.update({
      where: { slug },
      data: {
        views: { increment: 1 },
      },
    });

    res.json({
      message: 'Blog post retrieved successfully',
      data: post,
    });
  })
);

router.get(
  '/settings/public',
  asyncHandler(async (req: Request, res: Response) => {
    const settings = await prisma.setting.findMany({
      where: { isPublic: true },
      select: {
        key: true,
        value: true,
        type: true,
      },
    });

    res.json({
      message: 'Public settings retrieved successfully',
      data: settings,
    });
  })
);

router.use(requireAdmin);

router.post(
  '/pages',
  asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;

    const page = await prisma.page.create({
      data: {
        ...data,
        content: data.content ? sanitizeHtml(data.content) : '',
      },
    });

    res.status(201).json({
      message: 'Page created successfully',
      data: page,
    });
  })
);

router.put(
  '/pages/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    const page = await prisma.page.update({
      where: { id },
      data: {
        ...data,
        content: data.content ? sanitizeHtml(data.content) : undefined,
      },
    });

    res.json({
      message: 'Page updated successfully',
      data: page,
    });
  })
);

router.delete(
  '/pages/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.page.delete({
      where: { id },
    });

    res.json({
      message: 'Page deleted successfully',
    });
  })
);

router.post(
  '/blog',
  asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const slug = data.slug || generateSlug(data.title);

    const post = await prisma.blogPost.create({
      data: {
        ...data,
        slug,
        content: data.content ? sanitizeHtml(data.content) : '',
        authorId: data.authorId || req.user?.user.id,
      },
    });

    res.status(201).json({
      message: 'Blog post created successfully',
      data: post,
    });
  })
);

router.put(
  '/blog/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        slug: data.slug || (data.title ? generateSlug(data.title) : undefined),
        content: data.content ? sanitizeHtml(data.content) : undefined,
      },
    });

    res.json({
      message: 'Blog post updated successfully',
      data: post,
    });
  })
);

router.delete(
  '/blog/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.blogPost.delete({
      where: { id },
    });

    res.json({
      message: 'Blog post deleted successfully',
    });
  })
);

router.post(
  '/settings',
  asyncHandler(async (req: Request, res: Response) => {
    const settings = req.body.settings;

    if (!Array.isArray(settings) || !settings.length) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Settings array is required',
      });
      return;
    }

    await prisma.$transaction(
      settings.map((setting: any) => {
        return prisma.setting.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            type: setting.type as SettingType,
            description: setting.description,
            isPublic: setting.isPublic,
          },
          create: {
            key: setting.key,
            value: setting.value,
            type: setting.type as SettingType,
            description: setting.description,
            isPublic: setting.isPublic,
          },
        });
      })
    );

    res.json({
      message: 'Settings saved successfully',
    });
  })
);

export default router;

