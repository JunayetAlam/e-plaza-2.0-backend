import z from "zod";

const createSubCategoryValidation = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        categoryId: z.string().min(1, "Category Id is required"),
    })
});

const updateSubCategoryValidation = z.object({
    body: z.object({
        title: z.string().optional(),
        categoryId: z.string().optional(),
    })
});

export const SubCategoryValidation = {
    createSubCategoryValidation,
    updateSubCategoryValidation
};
