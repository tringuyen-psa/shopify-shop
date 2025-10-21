import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
  ) {}

  async findById(id: string): Promise<Shop> {
    return this.shopRepository.findOne({
      where: { id },
      relations: ['owner', 'products'],
    });
  }

  async findBySlug(slug: string): Promise<Shop> {
    return this.shopRepository.findOne({
      where: { slug },
      relations: ['owner', 'products'],
    });
  }

  async create(shopData: Partial<Shop>): Promise<Shop> {
    const shop = this.shopRepository.create(shopData);
    return this.shopRepository.save(shop);
  }

  async update(id: string, shopData: Partial<Shop>): Promise<Shop> {
    await this.shopRepository.update(id, shopData);
    return this.findById(id);
  }

  async findAll(): Promise<Shop[]> {
    return this.shopRepository.find({
      relations: ['owner'],
    });
  }
}