import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
export declare class OrderItem {
    id: string;
    order: Order;
    orderId: string;
    product: Product;
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    totalPrice: number;
    createdAt: Date;
}
