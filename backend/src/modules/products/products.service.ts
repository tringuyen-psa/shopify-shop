import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findById(id: string): Promise<Product> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['shop'],
    });
  }

  async findBySlug(slug: string): Promise<Product> {
    return this.productRepository.findOne({
      where: { slug },
      relations: ['shop'],
    });
  }

  async create(productData: Partial<Product>, shopId?: string): Promise<Product> {
    // If shopId is provided as separate parameter, add it to productData
    if (shopId) {
      productData.shopId = shopId;
    }
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    await this.productRepository.update(id, productData);
    return this.findById(id);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['shop'],
      where: { isActive: true },
    });
  }

  async findByShopId(shopId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: {
        shopId,
        isActive: true
      },
      relations: ['shop'],
      order: { createdAt: 'DESC' },
    });
  }
}