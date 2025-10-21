"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("typeorm");
async function migrateShopId() {
    console.log('🚀 Starting shop ID migration...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log']
    });
    try {
        const dataSource = app.get(typeorm_1.DataSource);
        if (!dataSource.isInitialized) {
            throw new Error('Database connection is not initialized');
        }
        console.log('📊 Database connected successfully');
        console.log('🔍 Checking current products table structure...');
        const tableInfo = await dataSource.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'products'
      AND column_name IN ('shop_id', 'shopId')
      ORDER BY column_name;
    `);
        console.log('📋 Columns found:', tableInfo);
        const currentData = await dataSource.query(`
      SELECT id, name, shop_id, shopId
      FROM products
      LIMIT 5;
    `);
        console.log('📄 Sample current data:', currentData);
        const mismatchedData = await dataSource.query(`
      SELECT COUNT(*) as count
      FROM products
      WHERE shop_id IS DISTINCT FROM shopId
    `);
        console.log(`🔢 Found ${mismatchedData[0].count} records with different shop_id and shopId values`);
        if (mismatchedData[0].count > 0) {
            console.log('🔄 Updating shop_id from shopId values...');
            const updateResult = await dataSource.query(`
        UPDATE products
        SET shop_id = shopId
        WHERE shop_id IS DISTINCT FROM shopId
      `);
            console.log(`✅ Updated ${updateResult.affectedRows || updateResult[1]} records`);
        }
        else {
            console.log('✅ All records already have consistent shop_id and shopId values');
        }
        console.log('🔍 Verifying migration results...');
        const verificationData = await dataSource.query(`
      SELECT id, name, shop_id, shopId
      FROM products
      LIMIT 5;
    `);
        console.log('📄 Sample data after migration:', verificationData);
        const remainingMismatches = await dataSource.query(`
      SELECT COUNT(*) as count
      FROM products
      WHERE shop_id IS DISTINCT FROM shopId
    `);
        if (remainingMismatches[0].count === 0) {
            console.log('✅ Migration completed successfully - no mismatches found');
        }
        else {
            console.log(`⚠️  Warning: ${remainingMismatches[0].count} records still have mismatches`);
        }
        const nullShopId = await dataSource.query(`
      SELECT COUNT(*) as count
      FROM products
      WHERE shop_id IS NULL
    `);
        if (nullShopId[0].count > 0) {
            console.log(`⚠️  Warning: ${nullShopId[0].count} records have NULL shop_id`);
        }
        console.log('\n🎉 Shop ID migration completed!');
    }
    catch (error) {
        console.error('❌ Error during migration:', error);
        throw error;
    }
    finally {
        await app.close();
    }
}
migrateShopId()
    .then(() => {
    console.log('✨ Migration finished successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
});
//# sourceMappingURL=migrate-shop-id.js.map