import { OrderStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";


const createOrderForCashOnDeliveryValidation = z.object({
    body: z.object({
        products: z.array(
            z.object({
                productId: z.string(),
                quantity: z.number(),
            })
        ),
        clientInfo: z.object({
            name: z.string(),
            phoneNumber: z.string(),
            email: z.string(),
            address: z.string(),
        }),
        deliveryCharge: z.number(),
    }).strict(),
});

const updateOrderValidation = z.object({
    body: z.object({
        products: z.array(
            z.object({
                productId: z.string(),
                quantity: z.number(),
            })
        ).optional(),
        clientInfo: z.object({
            name: z.string(),
            phoneNumber: z.string(),
            email: z.string(),
            address: z.string(),
        }).optional(),
        deliveryCharge: z.number().optional(),
    }).strict(),
});

const updateOrderStatusValidation = z.object({
    body: z.object({
        status: z.enum(OrderStatus),
    }).strict(),
});

const updatePaymentStatusValidation = z.object({
    body: z.object({
        status: z.enum(PaymentStatus),
    }).strict(),
});


export const OrderValidation = {
    createOrderForCashOnDeliveryValidation,
    updateOrderValidation,
    updateOrderStatusValidation,
    updatePaymentStatusValidation,
};
