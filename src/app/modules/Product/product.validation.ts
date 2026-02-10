import z from "zod";

const priceSchema = z.object({
    original: z.number().min(0, "Original price must be >= 0"),
    discounted: z.number().min(0, "Discounted price must be >= 0"),
});

const createProductValidation = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        brand: z.string().min(1, "Brand is required"),
        price: priceSchema,
        stocks: z.number().int().min(0, "Stocks must be >= 0"),
        description: z.string().min(1, "Description is required"),
        specifications: z.string().optional(),
        categoryId: z.string().optional(),
        subCategoryId: z.string().optional(),
    })
});

const updateProductValidation = z.object({
    body: z.object({
        title: z.string().min(1).optional(),
        brand: z.string().min(1).optional(),
        price: priceSchema.optional(),
        stocks: z.number().int().min(0).optional(),
        description: z.string().min(1).optional(),
        specifications: z.string().optional(),
        categoryId: z.string().optional(),
        subCategoryId: z.string().optional(),
    })
});

const urlsSchema = z.object({
    body: z.object({
        images: z.array(z.string()),
    })
});

export const ProductValidation = {
    createProductValidation,
    updateProductValidation,
    urlsSchema
};
