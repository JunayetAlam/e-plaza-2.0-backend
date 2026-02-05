import { nanoid } from "nanoid";
import { prisma } from "../../utils/prisma";
import { OrderedProduct } from "@prisma/client";


export const createOrderSessionId = (): string => {
    return `ORD-SESSION-${nanoid(8).toUpperCase()}`;
};


export const createOrderTransactionId = (): string => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    return `TXN-${datePart}-${nanoid(8).toUpperCase()}`;
};

export const analyzeProduct = async (products: { productId: string, quantity: number }[]) => {
    const allProducts = await prisma.product.findMany({
        where: {
            id: {
                in: products.map(p => p.productId)
            },
            isDeleted: false,
        }
    });

    let err: { productId: string, title: string, message: string }[] = [];
    let totalPrice = 0;
    let orderProducts: OrderedProduct[] = [];

    for (let index = 0; index < products.length; index++) {
        const element = products[index];
        const product = allProducts.find(p => p.id === element.productId);
        if (!product) {
            err.push({
                productId: element.productId,
                title: 'Product not found',
                message: 'Product not found',
            });
        } else if (product?.stocks < element.quantity) {
            err.push({
                productId: element.productId,
                title: product?.title || '',
                message: 'Product out of stock',
            });
        } else {
            const price = element.quantity * product.price.discounted;
            totalPrice += price;
            orderProducts.push({
                productId: element.productId,
                quantity: element.quantity,
                mainImage: product.mainImage,
                slug: product.slug,
                title: product.title,
                price: product.price,
                totalPrice: price
            });
        }
    }

    return { err, totalPrice, orderProducts }
}

