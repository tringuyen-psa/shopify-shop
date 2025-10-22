-- Setup shipping zones and rates for active shops

-- First, let's see which shops are active
SELECT id, name, slug FROM shops WHERE is_active = true AND shipping_enabled = true;

-- Clear existing shipping zones to avoid duplicates
DELETE FROM shipping_rates WHERE zone_id IN (
    SELECT id FROM shipping_zones WHERE shop_id IN (
        SELECT id FROM shops WHERE is_active = true AND shipping_enabled = true
    )
);

DELETE FROM shipping_zones WHERE shop_id IN (
    SELECT id FROM shops WHERE is_active = true AND shipping_enabled = true
);

-- Create shipping zones for each active shop
INSERT INTO shipping_zones (id, name, shop_id, countries, is_active, created_at, updated_at)
VALUES
    -- Fashion Boutique (6a623f29-6f45-46b0-8909-719959d83693)
    (gen_random_uuid(), 'Domestic Shipping', '6a623f29-6f45-46b0-8909-719959d83693', '["US"]', true, NOW(), NOW()),
    (gen_random_uuid(), 'International Shipping', '6a623f29-6f45-46b0-8909-719959d83693', '["CA", "MX", "GB", "FR", "DE", "IT", "ES", "JP", "AU", "VN", "TH", "SG", "MY", "PH", "ID"]', true, NOW(), NOW()),

    -- Tech Gadgets Store (c64f27a7-fe49-4ad4-a895-4f08d2c28a80)
    (gen_random_uuid(), 'Domestic Shipping', 'c64f27a7-fe49-4ad4-a895-4f08d2c28a80', '["US"]', true, NOW(), NOW()),
    (gen_random_uuid(), 'International Shipping', 'c64f27a7-fe49-4ad4-a895-4f08d2c28a80', '["CA", "MX", "GB", "FR", "DE", "IT", "ES", "JP", "AU", "VN", "TH", "SG", "MY", "PH", "ID"]', true, NOW(), NOW()),

    -- Other active shops
    (gen_random_uuid(), 'Domestic Shipping', '9043f13b-8ca0-45ad-8ca6-1663c038d2d0', '["US"]', true, NOW(), NOW()),
    (gen_random_uuid(), 'International Shipping', '9043f13b-8ca0-45ad-8ca6-1663c038d2d0', '["CA", "MX", "GB", "FR", "DE", "IT", "ES", "JP", "AU", "VN", "TH", "SG", "MY", "PH", "ID"]', true, NOW(), NOW()),

    (gen_random_uuid(), 'Domestic Shipping', '0ca9baa2-8334-40f7-858d-85afc0d7c3a9', '["US"]', true, NOW(), NOW()),
    (gen_random_uuid(), 'International Shipping', '0ca9baa2-8334-40f7-858d-85afc0d7c3a9', '["CA", "MX", "GB", "FR", "DE", "IT", "ES", "JP", "AU", "VN", "TH", "SG", "MY", "PH", "ID"]', true, NOW(), NOW())
RETURNING id, name, shop_id;