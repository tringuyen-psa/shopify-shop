import { Client } from 'pg';

// Parse DATABASE_URL if available, otherwise use individual variables
function parseDatabaseUrl(url: string) {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 5432,
      database: urlObj.pathname.substring(1), // Remove leading slash
      user: urlObj.username,
      password: urlObj.password,
      ssl: urlObj.searchParams.get('sslmode') === 'require' ? { rejectUnauthorized: false } : false
    };
  } catch (error) {
    console.error('❌ Failed to parse DATABASE_URL:', error);
    return null;
  }
}

// Database connection configuration
let dbConfig;

if (process.env.DATABASE_URL) {
  console.log('🔗 Using DATABASE_URL from environment');
  dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
  if (!dbConfig) {
    throw new Error('Invalid DATABASE_URL format');
  }
} else {
  console.log('🔧 Using individual database environment variables');
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'shopify_shop',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
}

async function migrateShopId() {
  console.log('🚀 Starting simple shop ID migration...');
  console.log('📊 Database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    passwordSet: !!dbConfig.password,
    ssl: dbConfig.ssl
  });

  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Check if the products table exists
    console.log('🔍 Checking products table...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'products'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Products table does not exist');
      return;
    }

    console.log('✅ Products table found');

    // Check columns
    console.log('📋 Checking columns in products table...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'products'
      AND column_name IN ('shop_id', 'shopId')
      ORDER BY column_name;
    `);

    console.log('📄 Columns found:', columnsResult.rows);

    // Check current data - use double quotes for column names with mixed case
    console.log('🔍 Checking current data...');
    const currentData = await client.query(`
      SELECT id, name, "shop_id", "shopId"
      FROM products
      LIMIT 5;
    `);

    console.log('📄 Sample current data:', currentData.rows);

    // Count total records
    const totalRecords = await client.query(`
      SELECT COUNT(*) as count FROM products
    `);
    console.log(`📊 Total records in products table: ${totalRecords.rows[0].count}`);

    // Check for mismatches - cast shopId to UUID for comparison
    const mismatchedQuery = await client.query(`
      SELECT COUNT(*) as count
      FROM products
      WHERE "shop_id" IS DISTINCT FROM "shopId"::uuid
    `);
    const mismatchedCount = parseInt(mismatchedQuery.rows[0].count);
    console.log(`🔢 Found ${mismatchedCount} records with different shop_id and shopId values`);

    if (mismatchedCount > 0) {
      console.log('🔄 Updating shop_id from shopId values...');

      const updateResult = await client.query(`
        UPDATE products
        SET "shop_id" = "shopId"::uuid
        WHERE "shop_id" IS DISTINCT FROM "shopId"::uuid
      `);

      console.log(`✅ Updated ${updateResult.rowCount} records`);
    } else {
      console.log('✅ All records already have consistent shop_id and shopId values');
    }

    // Verify migration
    console.log('🔍 Verifying migration results...');
    const verificationData = await client.query(`
      SELECT id, name, "shop_id", "shopId"
      FROM products
      LIMIT 5;
    `);
    console.log('📄 Sample data after migration:', verificationData.rows);

    // Check remaining mismatches - cast shopId to UUID for comparison
    const remainingMismatches = await client.query(`
      SELECT COUNT(*) as count
      FROM products
      WHERE "shop_id" IS DISTINCT FROM "shopId"::uuid
    `);

    if (parseInt(remainingMismatches.rows[0].count) === 0) {
      console.log('✅ Migration completed successfully - no mismatches found');
    } else {
      console.log(`⚠️  Warning: ${remainingMismatches.rows[0].count} records still have mismatches`);
    }

    // Check for null values
    const nullShopId = await client.query(`
      SELECT COUNT(*) as count
      FROM products
      WHERE "shop_id" IS NULL
    `);

    if (parseInt(nullShopId.rows[0].count) > 0) {
      console.log(`⚠️  Warning: ${nullShopId.rows[0].count} records have NULL shop_id`);
    }

    console.log('\n🎉 Shop ID migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Check if environment variables are set
if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
  console.log('⚠️  Warning: Neither DATABASE_URL nor DB_PASSWORD environment variable is set');
  console.log('💡 Please set either DATABASE_URL or the following environment variables:');
  console.log('   - DB_HOST (default: localhost)');
  console.log('   - DB_PORT (default: 5432)');
  console.log('   - DB_NAME (default: shopify_shop)');
  console.log('   - DB_USER (default: postgres)');
  console.log('   - DB_PASSWORD (required)');
  console.log('   - DB_SSL (default: false)');
  console.log('');
  console.log('Example:');
  console.log('export DATABASE_URL=postgresql://user:password@host:port/database');
  console.log('npm run migrate:shop-id');
  process.exit(1);
}

// Run the migration
migrateShopId()
  .then(() => {
    console.log('✨ Migration finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });