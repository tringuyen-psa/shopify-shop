import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
export declare class ProductsService {
    private productRepository;
    constructor(productRepository: Repository<Product>);
    findById(id: string): Promise<Product>;
    findBySlug(slug: string): Promise<Product>;
    create(productData: Partial<Product>, shopId?: string): Promise<Product>;
    update(id: string, productData: Partial<Product>): Promise<Product>;
    findAll(): Promise<Product[]>;
    findByShopId(shopId: string): Promise<Product[]>;
}
