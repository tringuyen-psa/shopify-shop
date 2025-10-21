import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
export declare class ShopsService {
    private shopRepository;
    constructor(shopRepository: Repository<Shop>);
    findById(id: string): Promise<Shop>;
    findBySlug(slug: string): Promise<Shop>;
    create(shopData: Partial<Shop>): Promise<Shop>;
    update(id: string, shopData: Partial<Shop>): Promise<Shop>;
    findAll(): Promise<Shop[]>;
}
