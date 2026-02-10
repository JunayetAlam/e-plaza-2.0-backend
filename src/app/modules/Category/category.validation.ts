import z from "zod";

const createCategoryValidation = z.object({
    body: z.object({
        title: z.string(),
    })
});



export const CategoryValidation = { createCategoryValidation };
