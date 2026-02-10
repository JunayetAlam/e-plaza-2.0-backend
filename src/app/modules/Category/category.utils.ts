import { prisma } from "../../utils/prisma";
import { generateSlug } from "../../utils/generate-slug";
import { nanoid } from "nanoid";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

export const checkTitleAndSlug = async (title: string, id?: string) => {
    const isExist = await prisma.category.findFirst({
        where: {
            title,
            ...(id && { NOT: { id } })
        },
    });
    if (isExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Category already exist');
    }
    const slug = generateSlug(title);
    const isSlugExist = await prisma.category.findFirst({
        where: {
            slug,
            ...(id && { NOT: { id } })
        },
    });
    if (isSlugExist) {
        return slug + nanoid(8);
    } else {
        return slug;
    }
}

export const manageIndex = async () => {
    const lastIndex = await prisma.category.findFirst({
        orderBy: {
            index: 'desc',
        },
    });
    const index = lastIndex?.index ? lastIndex.index + 1 : 1;
    return index;
}