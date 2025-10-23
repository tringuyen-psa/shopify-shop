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
            'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80',
            'https://images.unsplash.com/photo-1578912698612-d2ba433f3816?w=800&q=80',
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
            'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80',
            'https://images.unsplash.com/photo-1506904828346-6b244b6c8555?w=800&q=80',
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
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
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
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
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
    const product5 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Classic Denim Jeans',
        slug: 'classic-denim-jeans',
        description: 'Comfortable and stylish denim jeans for everyday wear',
        basePrice: 79.99,
        compareAtPrice: 99.99,
        productType: 'physical',
        weight: 0.5,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 200,
        images: [
            'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
        ],
        category: 'Clothing',
        tags: ['denim', 'jeans', 'casual', 'classic'],
        isSubscription: false,
        features: [
            'Premium denim fabric',
            'Classic fit',
            'Durable construction',
            'Machine washable',
        ],
        isActive: true,
        sku: 'DJ005',
        shopId: shop1.id,
    });
    await productRepository.save(product5);
    const product6 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Silk Scarf Collection',
        slug: 'silk-scarf-collection',
        description: 'Luxurious silk scarves with elegant patterns',
        basePrice: 49.99,
        compareAtPrice: 69.99,
        productType: 'physical',
        weight: 0.1,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 80,
        images: [
            'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80',
            'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
        ],
        category: 'Accessories',
        tags: ['silk', 'scarf', 'luxury', 'elegant'],
        isSubscription: false,
        features: [
            '100% pure silk',
            'Hand-printed patterns',
            'Luxury packaging',
            'Multiple colors available',
        ],
        isActive: true,
        sku: 'SS006',
        shopId: shop1.id,
    });
    await productRepository.save(product6);
    const product7 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Smart Watch Pro',
        slug: 'smart-watch-pro',
        description: 'Advanced fitness and health tracking smartwatch',
        basePrice: 249.99,
        compareAtPrice: 349.99,
        monthlyPrice: 24.99,
        productType: 'physical',
        weight: 0.3,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 120,
        images: [
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        ],
        category: 'Electronics',
        tags: ['smartwatch', 'fitness', 'health', 'technology'],
        isSubscription: true,
        trialDays: 0,
        features: [
            'Heart rate monitoring',
            'GPS tracking',
            'Water resistant',
            '7-day battery life',
            'Sleep tracking',
            'Mobile notifications',
        ],
        isActive: true,
        sku: 'SW007',
        shopId: shop2.id,
    });
    await productRepository.save(product7);
    const product8 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Wireless Charging Pad',
        slug: 'wireless-charging-pad',
        description: 'Fast wireless charging pad for all Qi-enabled devices',
        basePrice: 39.99,
        compareAtPrice: 59.99,
        productType: 'physical',
        weight: 0.2,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 150,
        images: [
            'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
        ],
        category: 'Electronics',
        tags: ['wireless', 'charging', 'Qi-enabled', 'fast charging'],
        isSubscription: false,
        features: [
            '15W fast charging',
            'LED indicator',
            'Non-slip surface',
            'Universal compatibility',
        ],
        isActive: true,
        sku: 'WC008',
        shopId: shop2.id,
    });
    await productRepository.save(product8);
    const product9 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Premium Yoga Mat',
        slug: 'premium-yoga-mat',
        description: 'Eco-friendly non-slip yoga mat with carrying strap',
        basePrice: 34.99,
        compareAtPrice: 49.99,
        productType: 'physical',
        weight: 1.2,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 90,
        images: [
            'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
        ],
        category: 'Sports & Fitness',
        tags: ['yoga', 'fitness', 'eco-friendly', 'exercise'],
        isSubscription: false,
        features: [
            '6mm thickness for comfort',
            'Non-slip surface',
            'Eco-friendly materials',
            'Includes carrying strap',
            'Easy to clean',
        ],
        isActive: true,
        sku: 'YM009',
        shopId: shop1.id,
    });
    await productRepository.save(product9);
    const product10 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Ebook Reader Premium',
        slug: 'ebook-reader-premium',
        description: 'High-resolution e-ink reader with built-in lighting',
        basePrice: 149.99,
        compareAtPrice: 199.99,
        monthlyPrice: 14.99,
        productType: 'physical',
        weight: 0.6,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 60,
        images: [
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        ],
        category: 'Electronics',
        tags: ['ebook', 'reader', 'e-ink', 'digital books'],
        isSubscription: true,
        trialDays: 30,
        features: [
            '300 DPI e-ink display',
            'Adjustable warm light',
            '8GB storage (thousands of books)',
            'Weeks of battery life',
            'Waterproof design',
            'Access to ebook store',
        ],
        isActive: true,
        sku: 'ER010',
        shopId: shop2.id,
    });
    await productRepository.save(product10);
    const product11 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Vintage Leather Backpack',
        slug: 'vintage-leather-backpack',
        description: 'Handcrafted vintage-style leather backpack with multiple compartments',
        basePrice: 129.99,
        compareAtPrice: 179.99,
        productType: 'physical',
        weight: 1.8,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 45,
        images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
            'https://images.unsplash.com/photo-1548199973-0330d4384e9c?w=800&q=80',
        ],
        category: 'Accessories',
        tags: ['backpack', 'leather', 'vintage', 'handmade'],
        isSubscription: false,
        features: [
            'Genuine leather',
            'Multiple compartments',
            'Laptop sleeve fits 15" laptop',
            'Adjustable shoulder straps',
            'Vintage brass hardware',
        ],
        isActive: true,
        sku: 'LB011',
        shopId: shop1.id,
    });
    await productRepository.save(product11);
    const product12 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Bluetooth Speaker Waterproof',
        slug: 'bluetooth-speaker-waterproof',
        description: 'Portable waterproof Bluetooth speaker with 360° sound',
        basePrice: 69.99,
        compareAtPrice: 89.99,
        productType: 'physical',
        weight: 0.8,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 110,
        images: [
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
            'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80',
        ],
        category: 'Electronics',
        tags: ['bluetooth', 'speaker', 'waterproof', 'portable'],
        isSubscription: false,
        features: [
            'IPX7 waterproof rating',
            '12-hour battery life',
            '360° surround sound',
            'Built-in microphone',
            'RGB LED lights',
        ],
        isActive: true,
        sku: 'BS012',
        shopId: shop2.id,
    });
    await productRepository.save(product12);
    const product13 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Organic Skincare Set',
        slug: 'organic-skincare-set',
        description: 'Complete organic skincare routine with natural ingredients',
        basePrice: 89.99,
        compareAtPrice: 119.99,
        productType: 'physical',
        weight: 0.6,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 75,
        images: [
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
        ],
        category: 'Beauty',
        tags: ['skincare', 'organic', 'natural', 'beauty'],
        isSubscription: true,
        monthlyPrice: 29.99,
        trialDays: 14,
        features: [
            '100% organic ingredients',
            'Cruelty-free',
            'Suitable for all skin types',
            'Includes cleanser, toner, moisturizer',
            'Anti-aging properties',
        ],
        isActive: true,
        sku: 'OS013',
        shopId: shop1.id,
    });
    await productRepository.save(product13);
    const product14 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Professional Camera Lens',
        slug: 'professional-camera-lens',
        description: 'High-quality 50mm prime lens for professional photography',
        basePrice: 399.99,
        compareAtPrice: 549.99,
        productType: 'physical',
        weight: 0.5,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 30,
        images: [
            'https://images.unsplash.com/photo-1516035069379-279e36156f69?w=800&q=80',
            'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=800&q=80',
        ],
        category: 'Electronics',
        tags: ['camera', 'lens', 'photography', 'professional'],
        isSubscription: false,
        features: [
            '50mm focal length',
            'f/1.8 aperture',
            'Auto focus',
            'Multi-coated glass',
            'Compatible with major camera brands',
        ],
        isActive: true,
        sku: 'CL014',
        shopId: shop2.id,
    });
    await productRepository.save(product14);
    const product15 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Ceramic Plant Pot Set',
        slug: 'ceramic-plant-pot-set',
        description: 'Set of 3 handmade ceramic plant pots with drainage',
        basePrice: 45.99,
        compareAtPrice: 64.99,
        productType: 'physical',
        weight: 2.5,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 95,
        images: [
            'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80',
            'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
        ],
        category: 'Home & Garden',
        tags: ['plant', 'pot', 'ceramic', 'home decor'],
        isSubscription: false,
        features: [
            'Handmade ceramic',
            'Set of 3 different sizes',
            'Drainage holes included',
            'Saucers included',
            'Modern minimalist design',
        ],
        isActive: true,
        sku: 'CP015',
        shopId: shop1.id,
    });
    await productRepository.save(product15);
    const product16 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Running Shoes Pro',
        slug: 'running-shoes-pro',
        description: 'Professional running shoes with advanced cushioning technology',
        basePrice: 119.99,
        compareAtPrice: 159.99,
        productType: 'physical',
        weight: 0.8,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 130,
        images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
            'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
        ],
        category: 'Sports & Fitness',
        tags: ['running', 'shoes', 'athletic', 'performance'],
        isSubscription: false,
        features: [
            'Advanced cushioning technology',
            'Breathable mesh upper',
            'Durable rubber outsole',
            'Lightweight design',
            'Enhanced arch support',
        ],
        isActive: true,
        sku: 'RS016',
        shopId: shop2.id,
    });
    await productRepository.save(product16);
    const product17 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Coffee Maker Deluxe',
        slug: 'coffee-maker-deluxe',
        description: 'Programmable coffee maker with thermal carafe',
        basePrice: 149.99,
        compareAtPrice: 199.99,
        productType: 'physical',
        weight: 3.2,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 55,
        images: [
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
        ],
        category: 'Home & Kitchen',
        tags: ['coffee', 'maker', 'kitchen', 'appliance'],
        isSubscription: false,
        features: [
            '12-cup capacity',
            'Thermal carafe',
            '24-hour programmable',
            'Auto shut-off',
            'Brew strength selector',
        ],
        isActive: true,
        sku: 'CM017',
        shopId: shop1.id,
    });
    await productRepository.save(product17);
    const product18 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Wireless Earbuds Pro',
        slug: 'wireless-earbuds-pro',
        description: 'Premium true wireless earbuds with noise cancellation',
        basePrice: 179.99,
        compareAtPrice: 229.99,
        monthlyPrice: 17.99,
        productType: 'physical',
        weight: 0.1,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 140,
        images: [
            'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80',
            'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&q=80',
        ],
        category: 'Electronics',
        tags: ['earbuds', 'wireless', 'noise cancellation', 'audio'],
        isSubscription: true,
        trialDays: 7,
        features: [
            'Active noise cancellation',
            '30-hour battery life with case',
            'IPX5 water resistance',
            'Touch controls',
            'Wireless charging case',
        ],
        isActive: true,
        sku: 'WE018',
        shopId: shop2.id,
    });
    await productRepository.save(product18);
    const product19 = productRepository.create({
        id: (0, uuid_1.v4)(),
        name: 'Essential Oil Diffuser',
        slug: 'essential-oil-diffuser',
        description: 'Ultrasonic aromatherapy diffuser with LED mood lighting',
        basePrice: 35.99,
        compareAtPrice: 49.99,
        productType: 'physical',
        weight: 0.7,
        requiresShipping: true,
        trackInventory: true,
        inventoryQuantity: 160,
        images: [
            'https://images.unsplash.com/photo-1571847140471-1d7766e8f40d?w=800&q=80',
        ],
        category: 'Home & Wellness',
        tags: ['diffuser', 'essential oils', 'aromatherapy', 'wellness'],
        isSubscription: true,
        monthlyPrice: 14.99,
        trialDays: 0,
        features: [
            'Ultrasonic technology',
            '7 LED color options',
            '4 timer settings',
            '300ml water capacity',
            'Whisper quiet operation',
        ],
        isActive: true,
        sku: 'ED019',
        shopId: shop1.id,
    });
    await productRepository.save(product19);
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
    console.log('\n📦 Created 19 products with real images:');
    console.log('🔹 Premium Leather Jacket - $299.99 or $29.99/month');
    console.log('🔹 Designer Sunglasses - $89.99');
    console.log('🔹 Wireless Headphones Pro - $199.99 or $19.99/month');
    console.log('🔹 Software License Basic - $29.99/month or $299.99/year');
    console.log('🔹 Classic Denim Jeans - $79.99');
    console.log('🔹 Silk Scarf Collection - $49.99');
    console.log('🔹 Smart Watch Pro - $249.99 or $24.99/month');
    console.log('🔹 Wireless Charging Pad - $39.99');
    console.log('🔹 Premium Yoga Mat - $34.99');
    console.log('🔹 Ebook Reader Premium - $149.99 or $14.99/month');
    console.log('🔹 Vintage Leather Backpack - $129.99');
    console.log('🔹 Bluetooth Speaker Waterproof - $69.99');
    console.log('🔹 Organic Skincare Set - $89.99 or $29.99/month');
    console.log('🔹 Professional Camera Lens - $399.99');
    console.log('🔹 Ceramic Plant Pot Set - $45.99');
    console.log('🔹 Running Shoes Pro - $119.99');
    console.log('🔹 Coffee Maker Deluxe - $149.99');
    console.log('🔹 Wireless Earbuds Pro - $179.99 or $17.99/month');
    console.log('🔹 Essential Oil Diffuser - $35.99 or $14.99/month');
    await app.close();
}
seed().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map