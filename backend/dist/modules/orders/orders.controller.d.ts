import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FulfillOrderDto } from './dto/fulfill-order.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getCustomerOrders(req: any, page?: number, limit?: number, status?: string): Promise<{
        success: boolean;
        data: {
            orders: import("./entities/order.entity").Order[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getOrderByNumber(req: any, orderNumber: string): Promise<{
        success: boolean;
        data: import("./entities/order.entity").Order;
    }>;
    getShopOrders(req: any, shopId: string, page?: number, limit?: number, status?: string): Promise<{
        success: boolean;
        data: {
            orders: import("./entities/order.entity").Order[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getShopOrderByNumber(req: any, shopId: string, orderNumber: string): Promise<{
        success: boolean;
        data: import("./entities/order.entity").Order;
    }>;
    fulfillOrder(req: any, id: string, fulfillOrderDto: FulfillOrderDto): Promise<{
        success: boolean;
        data: import("./entities/order.entity").Order;
    }>;
    shipOrder(req: any, id: string, shipOrderDto: ShipOrderDto): Promise<{
        success: boolean;
        data: import("./entities/order.entity").Order;
    }>;
    deliverOrder(req: any, id: string): Promise<{
        success: boolean;
        data: import("./entities/order.entity").Order;
    }>;
    cancelOrder(req: any, id: string, cancelOrderDto: CancelOrderDto): Promise<{
        success: boolean;
        data: import("./entities/order.entity").Order;
    }>;
    updateInternalNote(req: any, id: string, body: {
        internalNote: string;
    }): Promise<{
        success: boolean;
        data: import("./entities/order.entity").Order;
    }>;
    getAllOrders(page?: number, limit?: number, status?: string, shopId?: string, customerId?: string): Promise<{
        success: boolean;
        data: {
            orders: import("./entities/order.entity").Order[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getOrderStats(period?: string): Promise<{
        success: boolean;
        data: {
            totalOrders: number;
            totalRevenue: number;
            totalPlatformFee: number;
            ordersByStatus: {
                pending: number;
                fulfilled: number;
                shipped: number;
                delivered: number;
                cancelled: number;
            };
            ordersByPaymentStatus: {
                pending: number;
                paid: number;
                failed: number;
                refunded: number;
            };
            topShops: {
                name: string;
                revenue: number;
                orders: number;
                shopId: string;
            }[];
        };
    }>;
    createOrder(createOrderDto: CreateOrderDto): Promise<{
        success: boolean;
        data: import("./entities/order.entity").Order;
    }>;
    getOrderTracking(orderNumber: string, email: string): Promise<{
        success: boolean;
        data: {
            orderNumber: string;
            customerName: string;
            customerEmail: string;
            shopName: string;
            productName: string;
            productImage: string;
            fulfillmentStatus: "cancelled" | "unfulfilled" | "fulfilled" | "shipped" | "delivered";
            paymentStatus: "pending" | "paid" | "failed" | "refunded";
            trackingNumber: string;
            carrier: string;
            estimatedDelivery: Date;
            createdAt: Date;
            shippedAt: Date;
            deliveredAt: Date;
            cancelledAt: Date;
        };
    }>;
    requestRefund(req: any, id: string, body: {
        reason: string;
        description?: string;
    }): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
    processRefund(req: any, id: string, body: {
        approve: boolean;
        reason?: string;
        refundAmount?: number;
    }): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
}
