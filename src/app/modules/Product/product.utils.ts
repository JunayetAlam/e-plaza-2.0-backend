import { nanoid } from "nanoid";
import AppError from "../../errors/AppError";
import { generateSlug } from "../../utils/generate-slug";
import { prisma } from "../../utils/prisma";
import httpStatus from "http-status";
import { uploadMultiple } from "../Asset/asset.utils";
import { Category, SubCategory } from "@prisma/client";

export const checkCategoryAndSubCategory = async (categoryId?: string | null, subCategoryId?: string | null) => {
    let category: Category | null = null;
    let subCategory: SubCategory | null = null;
    if (categoryId) {
        category = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
        });
    }
    if (subCategoryId) {
        subCategory = await prisma.subCategory.findUnique({
            where: {
                id: subCategoryId,
            },
        });
    }

    if (category && subCategory) {
        if (category.id !== subCategory.categoryId) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Mismatched category and subcategory')
        }
    }
}

export const manageProductSlug = async (title: string, id?: string) => {
    let slug = generateSlug(title);
    const existingProduct = await prisma.product.findUnique({
        where: {
            slug,
            ...(id && { NOT: { id } })
        },
    });

    if (existingProduct) {
        slug = generateSlug(title, nanoid(8));
    };
    return slug;
}

export const manageProductImages = async (imageFiles: Express.Multer.File[]) => {
    let mainImage = '';
    let images: string[] = [];


    if (imageFiles && imageFiles.length > 0) {
        const urls = await uploadMultiple(imageFiles);
        mainImage = urls[0]?.url || '';
        images = urls.map(item => item.url);
    }
    return { mainImage, images };
}

export const manageProductIndex = async () => {
    const lastIndex = await prisma.product.findFirst({
        orderBy: {
            index: 'desc',
        },
    });

    const index = lastIndex?.index ? lastIndex.index + 1 : 1;
    return index;
}