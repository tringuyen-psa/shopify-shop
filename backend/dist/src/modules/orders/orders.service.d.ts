import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Shop } from '../shops/entities/shop.entity';
import { CheckoutSession } from '../checkout/entities/checkout-session.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { FulfillOrderDto } from './dto/fulfill-order.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly orderItemRepository;
    private readonly checkoutSessionRepository;
    private readonly userRepository;
    private readonly shopRepository;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, checkoutSessionRepository: Repository<CheckoutSession>, userRepository: Repository<User>, shopRepository: Repository<Shop>);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    findById(id: string, relations?: string[]): Promise<Order>;
    getOrderByNumber(orderNumber: string, user?: User): Promise<Order>;
    getCustomerOrders(customerId: string, page?: number, limit?: number, status?: string): Promise<{
        orders: Order[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getShopOrders(shopId: string, page?: number, limit?: number, status?: string): Promise<{
        orders: Order[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getShopOrderByNumber(shopId: string, orderNumber: string): Promise<Order>;
    getAllOrders(page?: number, limit?: number, status?: string, shopId?: string, customerId?: string): Promise<{
        orders: Order[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    canUserAccessShop(userId: string, shopId: string): Promise<boolean>;
    fulfillOrder(id: string, user: User, fulfillOrderDto: FulfillOrderDto): Promise<Order>;
    shipOrder(id: string, user: User, shipOrderDto: ShipOrderDto): Promise<Order>;
    deliverOrder(id: string, user: User): Promise<Order>;
    cancelOrder(id: string, user: User, cancelOrderDto: CancelOrderDto): Promise<Order>;
    updateInternalNote(id: string, user: User, internalNote: string): Promise<Order>;
    getOrderStats(period?: string): Promise<{
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
    }>;
    getOrderTracking(orderNumber: string, email: string): Promise<{
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
    }>;
    requestRefund(orderId: string, user: User, reason: string, description?: string): Promise<{
        message: string;
    }>;
    processRefund(orderId: string, user: User, approve: boolean, reason?: string, refundAmount?: number): Promise<{
        message: string;
    }>;
    private generateOrderNumber;
    private calculatePlatformFee;
    private getTopShops;
}
