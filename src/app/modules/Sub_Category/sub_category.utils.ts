import { prisma } from "../../utils/prisma";
import { generateSlug } from "../../utils/generate-slug";
import { nanoid } from "nanoid";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

export const checkSubCategoryTitleAndSlug = async (title: string, id?: string) => {
    const isExist = await prisma.subCategory.findFirst({
        where: {
            title,
            ...(id && { NOT: { id } })
        },
    });
    if (isExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'SubCategory already exist');
    }
    const slug = generateSlug(title);
    const isSlugExist = await prisma.subCategory.findFirst({
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
