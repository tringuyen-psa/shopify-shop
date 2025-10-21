"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("./entities/shop.entity");
let ShopsService = class ShopsService {
    constructor(shopRepository) {
        this.shopRepository = shopRepository;
    }
    async findById(id) {
        return this.shopRepository.findOne({
            where: { id },
            relations: ['owner', 'products'],
        });
    }
    async findBySlug(slug) {
        return this.shopRepository.findOne({
            where: { slug },
            relations: ['owner', 'products'],
        });
    }
    async findProductsBySlug(slug) {
        const shop = await this.shopRepository.findOne({
            where: { slug },
            relations: ['products'],
        });
        if (!shop) {
            throw new common_1.BadRequestException('Shop not found');
        }
        return shop.products.filter(product => product.isActive);
    }
    async findByUserId(userId) {
        const shop = await this.shopRepository.findOne({
            where: { ownerId: userId },
            relations: ['owner', 'products'],
        });
        if (!shop) {
            throw new common_1.BadRequestException('Shop not found for this user');
        }
        return shop;
    }
    async create(shopData, userId) {
        try {
            const shop = this.shopRepository.create({
                ...shopData,
                ownerId: userId,
                slug: this.generateSlugFromName(shopData.name || 'shop'),
                status: 'pending',
                platformFeePercent: 15.00,
                isActive: false,
                stripeOnboardingComplete: false,
                stripeChargesEnabled: false,
                stripePayoutsEnabled: false,
                shippingEnabled: true,
            });
            console.log('Creating shop with data:', shop);
            const savedShop = await this.shopRepository.save(shop);
            const slugWithId = this.generateSlugFromId(savedShop.id, shopData.name || 'shop');
            await this.shopRepository.update(savedShop.id, { slug: slugWithId });
            const result = await this.shopRepository.findOne({ where: { id: savedShop.id } });
            console.log('Shop created successfully:', result);
            return result;
        }
        catch (error) {
            console.error('Error creating shop:', error);
            throw error;
        }
    }
    generateSlugFromName(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 50);
    }
    generateSlugFromId(id, name) {
        const nameSlug = this.generateSlugFromName(name);
        const shortId = id.split('-')[0];
        return `${nameSlug}-${shortId}`;
    }
    async update(id, shopData) {
        await this.shopRepository.update(id, shopData);
        return this.findById(id);
    }
    async findAll(params) {
        const { page = 1, limit = 12, status, search, sortBy = 'createdAt', sortOrder = 'desc', } = params || {};
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.name = (0, typeorm_2.Like)(`%${search}%`);
        }
        const order = {};
        order[sortBy] = sortOrder;
        try {
            const [shops, total] = await this.shopRepository.findAndCount({
                where,
                relations: ['owner'],
                order,
                skip: (page - 1) * limit,
                take: limit,
            });
            return {
                shops,
                total,
                page,
                limit,
            };
        }
        catch (error) {
            console.error('Error in findAll shops:', error);
            throw new common_1.BadRequestException(`Invalid query parameters: ${error.message}`);
        }
    }
    async updateSubscriptionPlan(shopId, planData) {
        const shop = await this.findById(shopId);
        if (!shop) {
            throw new common_1.BadRequestException('Shop not found');
        }
        const updateData = {
            subscriptionPlan: planData.plan,
            subscriptionPrice: planData.price,
            subscriptionPeriod: planData.period,
            subscriptionStartsAt: new Date(),
            subscriptionActive: true,
            stripeSubscriptionId: planData.stripeSubscriptionId || null,
        };
        return this.shopRepository.save({
            ...shop,
            ...updateData,
        });
    }
    async cancelSubscription(shopId) {
        const shop = await this.findById(shopId);
        if (!shop) {
            throw new common_1.BadRequestException('Shop not found');
        }
        return this.shopRepository.save({
            ...shop,
            subscriptionActive: false,
            subscriptionEndsAt: new Date(),
        });
    }
    async getSubscriptionPlans() {
        return [
            {
                id: 'basic',
                name: 'Basic',
                price: 39,
                period: 'monthly',
                targetAudience: 'Cửa hàng nhỏ, mới bắt đầu',
                purpose: 'Bán online cơ bản',
                features: [
                    'Tối đa 100 sản phẩm',
                    'Báo cáo cơ bản',
                    'Phí giao dịch 2.9% + 30¢',
                    'Hỗ trợ email 24/7',
                    'Theme cơ bản',
                    'SSL miễn phí',
                    '1 tài khoản nhân viên'
                ],
                limitations: [
                    'Không có API nâng cao',
                    'Không có tùy chỉnh theme',
                    'Phí giao dịch cao hơn',
                    'Báo cáo giới hạn'
                ]
            },
            {
                id: 'shopify',
                name: 'Shopify',
                price: 105,
                period: 'monthly',
                targetAudience: 'Doanh nghiệp đang phát triển',
                purpose: 'Báo cáo chuyên sâu, nhiều tài khoản nhân viên',
                features: [
                    'Không giới hạn sản phẩm',
                    'Báo cáo nâng cao',
                    'Phí giao dịch 2.7% + 30¢',
                    'Hỗ trợ ưu tiên 24/7',
                    'Tùy chỉnh theme đầy đủ',
                    'Gift cards',
                    'Tối đa 5 tài khoản nhân viên',
                    'Abandoned cart recovery',
                    'Professional reports'
                ],
                limitations: [
                    'Phí giao dịch vẫn có thể tối ưu hơn',
                    'Không có API chuyên nghiệp',
                    'Hỗ trợ không riêng tư'
                ],
                recommended: true
            },
            {
                id: 'advanced',
                name: 'Advanced',
                price: 399,
                period: 'monthly',
                targetAudience: 'Doanh nghiệp lớn',
                purpose: 'Phân tích nâng cao, phí giao dịch thấp',
                features: [
                    'Tất cả tính năng Shopify',
                    'Phí giao dịch 2.4% + 30¢',
                    'Hỗ trợ riêng tư 24/7',
                    'API chuyên nghiệp (Shopify Plus)',
                    'Tối đa 15 tài khoản nhân viên',
                    'Advanced report builder',
                    'Custom checkout',
                    'Fraud analysis',
                    'International domains'
                ],
                limitations: [
                    'Chi phí đầu tư cao',
                    'Phức tạp cho người mới bắt đầu'
                ]
            },
            {
                id: 'shopify_plus',
                name: 'Shopify Plus',
                price: 2000,
                period: 'monthly',
                targetAudience: 'Thương hiệu lớn, volume cao',
                purpose: 'Hỗ trợ riêng, API cao cấp',
                features: [
                    'Tất cả tính năng Advanced',
                    'Phí giao dịch tùy chỉnh',
                    'Dedicated account manager',
                    'Tùy chỉnh API hoàn toàn',
                    'Không giới hạn tài khoản',
                    'Shopify Flow automation',
                    'B2B wholesale',
                    'Launch engineer support',
                    'Performance optimization'
                ],
                limitations: [
                    'Yêu cầu cam đồng tối thiểu 1 năm'
                ]
            }
        ];
    }
};
exports.ShopsService = ShopsService;
exports.ShopsService = ShopsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ShopsService);
//# sourceMappingURL=shops.service.js.map