"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const user_entity_1 = require("../modules/users/entities/user.entity");
const shop_entity_1 = require("../modules/shops/entities/shop.entity");
const product_entity_1 = require("../modules/products/entities/product.entity");
const platform_setting_entity_1 = require("../modules/platform/entities/platform-setting.entity");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userRepository = app.get('UserRepository');
    const shopRepository = app.get('ShopRepository');
    const productRepository = app.get('ProductRepository');
    const platformSettingRepository = app.get('PlatformSettingRepository');
    console.log('🌱 Starting database seeding...');
    await platformSettingRepository.createQueryBuilder()
        .delete()
        .from(platform_setting_entity_1.PlatformSetting)
        .execute();
    await productRepository.createQueryBuilder()
        .delete()
        .from(product_entity_1.Product)
        .execute();
    await shopRepository.createQueryBuilder()
        .delete()
        .from(shop_entity_1.Shop)
        .execute();
    await userRepository.createQueryBuilder()
        .delete()
        .from(user_entity_1.User)
        .execute();
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = userRepository.create({
        id: (0, uuid_1.v4)(),
        email: 'admin@platform.com',
        passwordHash: adminPassword,
        name: 'Platform Admin',
        role: 'platform_admin',
        emailVerified: true,
    });
    await userRepository.save(admin);
    console.log('✅ Created platform admin');
    const shopOwnerPassword = await bcrypt.hash('ShopOwner123!', 10);
    const shopOwner1 = userRepository.create({
        id: (0, uuid_1.v4)(),
        email: 'shop1@example.com',
        passwordHash: shopOwnerPassword,
        name: 'John Shop Owner',
        role: 'shop_owner',
        phone: '+1234567890',
        emailVerified: true,
    });
    await userRepository.save(shopOwner1);
    const shopOwner2 = userRepository.create({
        id: (0, uuid_1.v4)(),
        email: 'shop2@example.com',
        passwordHash: shopOwnerPassword,
        name: 'Jane Store Owner',
        role: 'shop_owner',
        phone: '+0987654321',
        emailVerified: true,
    });
    await userRepository.save(shopOwner2);
    console.log('✅ Created shop owners');
    const shop1 = shopRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Fashion Boutique',
        slug: 'fashion-boutique',
        description: 'Premium fashion items and accessories',
        email: 'contact@fashionboutique.com',
        phone: '+1234567890',
        website: 'https://fashionboutique.com',
        ownerId: shopOwner1.id,
        platformFeePercent: 15.00,
        isActive: true,
        status: 'active',
        shippingEnabled: true,
        freeShippingThreshold: 100.00,
        addressLine1: '123 Fashion Street',
        city: 'New York',
        state: 'NY',
        country: 'US',
        postalCode: '10001',
    });
    await shopRepository.save(shop1);
    const shop2 = shopRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Tech Gadgets Store',
        slug: 'tech-gadgets-store',
        description: 'Latest technology and electronic gadgets',
        email: 'info@techgadgets.com',
        phone: '+0987654321',
        website: 'https://techgadgets.com',
        ownerId: shopOwner2.id,
        platformFeePercent: 12.00,
        isActive: true,
        status: 'active',
        shippingEnabled: true,
        freeShippingThreshold: 50.00,
        addressLine1: '456 Tech Avenue',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        postalCode: '94102',
    });
    await shopRepository.save(shop2);
    console.log('✅ Created shops');
    const product1 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Premium Leather Jacket',
        slug: 'premium-leather-jacket',
        description: 'High quality genuine leather jacket with modern design',
        basePrice: 299.99,
        compareAtPrice: 399.99,
        monthlyPrice: 29.99,
        productType: 'physical',
        weight: 1.5,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 50,
        images: [
            'https://example.com/jacket1.jpg',
            'https://example.com/jacket2.jpg',
        ],
        category: 'Clothing',
        tags: ['leather', 'jacket', 'fashion', 'premium'],
        isSubscription: true,
        trialDays: 0,
        features: [
            'Genuine leather',
            'Premium quality',
            'Modern design',
            '1 year warranty',
        ],
        isActive: true,
        sku: 'LJ001',
        shopId: shop1.id,
    });
    await productRepository.save(product1);
    const product2 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Designer Sunglasses',
        slug: 'designer-sunglasses',
        description: 'Stylish UV protection sunglasses',
        basePrice: 89.99,
        compareAtPrice: 129.99,
        productType: 'physical',
        weight: 0.2,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 100,
        images: [
            'https://example.com/sunglasses1.jpg',
        ],
        category: 'Accessories',
        tags: ['sunglasses', 'UV protection', 'fashion'],
        isSubscription: false,
        features: [
            'UV400 protection',
            'Polarized lenses',
            'Designer frame',
            'Protective case included',
        ],
        isActive: true,
        sku: 'SG002',
        shopId: shop1.id,
    });
    await productRepository.save(product2);
    const product3 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Wireless Headphones Pro',
        slug: 'wireless-headphones-pro',
        description: 'Premium noise-cancelling wireless headphones',
        basePrice: 199.99,
        compareAtPrice: 249.99,
        monthlyPrice: 19.99,
        productType: 'physical',
        weight: 0.8,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 75,
        images: [
            'https://example.com/headphones1.jpg',
            'https://example.com/headphones2.jpg',
        ],
        category: 'Electronics',
        tags: ['wireless', 'headphones', 'noise cancelling', 'bluetooth'],
        isSubscription: true,
        trialDays: 7,
        features: [
            'Active noise cancellation',
            '40-hour battery life',
            'Premium sound quality',
            'Comfortable fit',
            'Bluetooth 5.0',
        ],
        isActive: true,
        sku: 'WH003',
        shopId: shop2.id,
    });
    await productRepository.save(product3);
    const product4 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Software License - Basic Plan',
        slug: 'software-license-basic',
        description: 'Monthly subscription to our premium software suite',
        basePrice: 29.99,
        monthlyPrice: 29.99,
        yearlyPrice: 299.99,
        productType: 'digital',
        requiresShipping: false,
        downloadUrl: 'https://software.example.com/download',
        downloadLimit: 5,
        images: [
            'https://example.com/software-icon.png',
        ],
        category: 'Software',
        tags: ['software', 'subscription', 'digital'],
        isSubscription: true,
        trialDays: 14,
        features: [
            'Full access to all features',
            'Cloud storage',
            'Priority support',
            'Regular updates',
            'Multi-device usage',
        ],
        isActive: true,
        sku: 'SL004',
        shopId: shop2.id,
    });
    await productRepository.save(product4);
    console.log('✅ Created products');
    const defaultSettings = [
        { key: 'default_platform_fee', value: '15', description: 'Default platform fee percentage' },
        { key: 'min_platform_fee', value: '10', description: 'Minimum platform fee percentage' },
        { key: 'max_platform_fee', value: '30', description: 'Maximum platform fee percentage' },
        { key: 'stripe_platform_account_id', value: 'acct_1SE01SGvqAVA71Vq', description: 'Stripe Platform Account ID' },
        { key: 'checkout_session_expiry_hours', value: '24', description: 'Hours before checkout session expires' },
        { key: 'platform_name', value: 'Shopify Clone Platform', description: 'Platform display name' },
        { key: 'support_email', value: 'support@platform.com', description: 'Platform support email' },
    ];
    for (const setting of defaultSettings) {
        const platformSetting = platformSettingRepository.create({
            id: (0, uuid_1.v4)(),
            ...setting,
        });
        await platformSettingRepository.save(platformSetting);
    }
    console.log('✅ Created platform settings');
    const customerPassword = await bcrypt.hash('Customer123!', 10);
    const customer1 = userRepository.create({
        id: (0, uuid_1.v4)(),
        email: 'customer1@example.com',
        passwordHash: customerPassword,
        name: 'Alice Customer',
        role: 'customer',
        phone: '+1111111111',
        emailVerified: true,
    });
    await userRepository.save(customer1);
    const customer2 = userRepository.create({
        id: (0, uuid_1.v4)(),
        email: 'customer2@example.com',
        passwordHash: customerPassword,
        name: 'Bob Shopper',
        role: 'customer',
        phone: '+2222222222',
        emailVerified: true,
    });
    await userRepository.save(customer2);
    console.log('✅ Created customers');
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Created accounts:');
    console.log('🔹 Platform Admin: admin@platform.com / Admin123!');
    console.log('🔹 Shop Owner 1: shop1@example.com / ShopOwner123!');
    console.log('🔹 Shop Owner 2: shop2@example.com / ShopOwner123!');
    console.log('🔹 Customer 1: customer1@example.com / Customer123!');
    console.log('🔹 Customer 2: customer2@example.com / Customer123!');
    console.log('\n🏪 Created shops:');
    console.log('🔹 Fashion Boutique (fashion-boutique)');
    console.log('🔹 Tech Gadgets Store (tech-gadgets-store)');
    console.log('\n📦 Created products:');
    console.log('🔹 Premium Leather Jacket - $299.99 or $29.99/month');
    console.log('🔹 Designer Sunglasses - $89.99');
    console.log('🔹 Wireless Headphones Pro - $199.99 or $19.99/month');
    console.log('🔹 Software License Basic - $29.99/month or $299.99/year');
    await app.close();
}
seed().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map