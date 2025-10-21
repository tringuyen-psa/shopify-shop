"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const shop_entity_1 = require("../src/modules/shops/entities/shop.entity");
const product_entity_1 = require("../src/modules/products/entities/product.entity");
const typeorm_1 = require("typeorm");
const productNames = [
    'Wireless Bluetooth Headphones', 'Smart Watch Series 5', 'Organic Coffee Beans',
    'Yoga Mat Premium', 'USB-C Hub Adapter', 'Portable Phone Charger',
    'LED Desk Lamp', 'Stainless Steel Water Bottle', 'Laptop Stand Adjustable',
    'Mechanical Keyboard RGB', 'Wireless Mouse Ergonomic', '4K Webcam Pro',
    'Bluetooth Speaker Waterproof', 'Smartphone Case Premium', 'Tablet Stand Foldable',
    'Cable Management Kit', 'Monitor Light Bar', 'Desk Organizer Bamboo',
    'Power Bank 20000mAh', 'HDMI Cable 4K', 'Ethernet Cable Cat8',
    'Microfiber Cleaning Cloth', 'Laptop Sleeve Neoprene', 'Office Chair Cushion',
    'Desk Pad Large', 'Monitor Mount Dual', 'Webcam Cover Privacy',
    'Phone Grip Ring', 'Cable Clips Set', 'Screen Cleaning Kit'
];
const productCategories = [
    'Electronics', 'Accessories', 'Office Supplies', 'Computer Accessories',
    'Mobile Accessories', 'Audio Equipment', 'Home Office', 'Gadgets'
];
const productDescriptions = [
    'High-quality product with premium materials and excellent durability',
    'Professional grade equipment suitable for daily use',
    'Ergonomically designed for maximum comfort and efficiency',
    'Sleek and modern design that complements any workspace',
    'Advanced technology with user-friendly features',
    'Compact and portable design perfect for travel',
    'Environmentally friendly materials and sustainable production',
    'Innovative solution for modern lifestyle needs',
    'Premium construction with attention to detail',
    'Multi-functional design with versatile applications'
];
function generateRandomPrice(min = 10, max = 500) {
    return Number((Math.random() * (max - min) + min).toFixed(2));
}
function generateRandomInteger(min = 1, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
function generateImages(productName) {
    const baseImages = [
        `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop`,
        `https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop`,
        `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop`,
        `https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400&h=400&fit=crop`,
        `https://images.unsplash.com/photo-1603092636412-5bd586791d0e?w=400&h=400&fit=crop`
    ];
    const numImages = Math.floor(Math.random() * 3) + 1;
    return baseImages.slice(0, numImages);
}
function generateFeatures(productName, category) {
    const commonFeatures = [
        'High quality materials',
        '1 year warranty',
        'Easy to use',
        'Compact design',
        'Energy efficient'
    ];
    const categoryFeatures = {
        'Electronics': [
            'Bluetooth 5.0 connectivity',
            'Rechargeable battery',
            'Fast charging support',
            'Water resistant design'
        ],
        'Accessories': [
            'Universal compatibility',
            'Adjustable settings',
            'Lightweight construction',
            'Travel friendly'
        ],
        'Office Supplies': [
            'Ergonomic design',
            'Adjustable height/angle',
            'Non-slip base',
            'Cable management'
        ],
        'Computer Accessories': [
            'Plug and play',
            'Universal compatibility',
            'High speed data transfer',
            'Durable construction'
        ]
    };
    const features = [...commonFeatures];
    if (categoryFeatures[category]) {
        features.push(...categoryFeatures[category].slice(0, Math.floor(Math.random() * 2) + 1));
    }
    return features.slice(0, Math.floor(Math.random() * 3) + 3);
}
function generateProductData(shopId, index) {
    const productName = productNames[Math.floor(Math.random() * productNames.length)];
    const category = productCategories[Math.floor(Math.random() * productCategories.length)];
    const basePrice = generateRandomPrice(15, 300);
    const isSubscription = Math.random() > 0.7;
    const isPhysical = Math.random() > 0.2;
    const productData = {
        name: `${productName} - Shop Product ${index}`,
        slug: generateSlug(`${productName}-${shopId}-${index}`),
        description: productDescriptions[Math.floor(Math.random() * productDescriptions.length)],
        basePrice,
        compareAtPrice: Math.random() > 0.5 ? generateRandomPrice(basePrice + 50, basePrice + 200) : null,
        category,
        productType: isPhysical ? 'physical' : 'digital',
        images: generateImages(productName),
        tags: [category.toLowerCase().replace(' ', '-'), 'premium', 'bestseller'],
        sku: `SKU-${shopId.slice(-8)}-${String(index).padStart(3, '0')}`,
        features: generateFeatures(productName, category),
        shopId,
        isSubscription,
        trialDays: isSubscription ? (Math.random() > 0.5 ? 14 : 0) : 0,
    };
    if (isSubscription) {
        productData.weeklyPrice = generateRandomPrice(5, basePrice / 4);
        productData.monthlyPrice = generateRandomPrice(15, basePrice / 2);
        productData.yearlyPrice = generateRandomPrice(100, basePrice * 0.8);
    }
    if (isPhysical) {
        productData.weight = Number((Math.random() * 2 + 0.1).toFixed(2));
        productData.requiresShipping = true;
        productData.inventoryQuantity = generateRandomInteger(10, 100);
        productData.trackInventory = Math.random() > 0.3;
        productData.allowBackorder = Math.random() > 0.7;
    }
    else {
        productData.downloadUrl = `https://downloads.example.com/${productData.slug}`;
        productData.downloadLimit = generateRandomInteger(1, 5);
        productData.requiresShipping = false;
    }
    productData.costPerItem = generateRandomPrice(basePrice * 0.3, basePrice * 0.7);
    return productData;
}
async function seedProducts() {
    console.log('🚀 Starting simple product seeding...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log']
    });
    try {
        const dataSource = app.get(typeorm_1.DataSource);
        const shopRepository = dataSource.getRepository(shop_entity_1.Shop);
        const productRepository = dataSource.getRepository(product_entity_1.Product);
        console.log('📋 Fetching existing shops...');
        const shops = await shopRepository.find({
            relations: ['products']
        });
        if (shops.length === 0) {
            console.log('❌ No shops found in database. Please create shops first.');
            return;
        }
        console.log(`🏪 Found ${shops.length} shops`);
        let totalProductsCreated = 0;
        for (const shop of shops) {
            console.log(`\n📦 Creating products for shop: ${shop.name} (${shop.id})`);
            const existingProductCount = shop.products ? shop.products.length : 0;
            if (existingProductCount >= 10) {
                console.log(`✅ Shop ${shop.name} already has ${existingProductCount} products. Skipping...`);
                continue;
            }
            const productsToCreate = 10 - existingProductCount;
            console.log(`🎯 Need to create ${productsToCreate} products for shop ${shop.name}`);
            const products = [];
            for (let i = existingProductCount + 1; i <= 10; i++) {
                const productData = generateProductData(shop.id, i);
                const product = productRepository.create(productData);
                products.push(product);
            }
            const savedProducts = await productRepository.save(products);
            totalProductsCreated += savedProducts.length;
            console.log(`✅ Created ${savedProducts.length} products for shop ${shop.name}`);
            savedProducts.forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.name} - $${product.basePrice}`);
            });
        }
        console.log(`\n🎉 Product seeding completed successfully!`);
        console.log(`📊 Total products created: ${totalProductsCreated}`);
        const finalProductCount = await productRepository.count();
        console.log(`📈 Total products in database: ${finalProductCount}`);
    }
    catch (error) {
        console.error('❌ Error during product seeding:', error);
        throw error;
    }
    finally {
        await app.close();
    }
}
seedProducts()
    .then(() => {
    console.log('✨ Seeding finished successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
});
//# sourceMappingURL=simple-seed.js.map