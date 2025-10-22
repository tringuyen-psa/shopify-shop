# Kế hoạch Multi-Vendor E-commerce Platform (Shopify Clone)

## Mô tả tổng quan

Xây dựng nền tảng thương mại điện tử đa nhà cung cấp cho phép nhiều Shop bán sản phẩm (physical & digital) với checkout flow chuẩn Shopify, tích hợp Stripe Connect cho từng shop với KYC độc lập, hỗ trợ subscription và one-time payment.

## 3 Loại User trong hệ thống

### 1. Platform Admin (Chủ nền tảng)

- **Quyền hạn:**
  - Quản lý tất cả shops (approve/reject/suspend)
  - Xem toàn bộ doanh thu, đơn hàng
  - Cấu hình platform settings (phí, payment methods)
  - Quản lý users
- **Đăng ký:** Không cho phép đăng ký public (tạo bằng seed data hoặc CLI)
- **Số lượng:** 1-3 admin accounts

### 2. Shop Owner (Người bán hàng)

- **Quyền hạn:**
  - Tạo và quản lý shop của mình
  - Đăng/sửa/xóa products
  - Xem orders của shop mình
  - Quản lý subscriptions của shop
  - Hoàn tất KYC với Stripe Connect
- **Đăng ký:** Cho phép đăng ký public
- **Số lượng:** Không giới hạn

### 3. Customer (Người mua hàng)

- **Quyền hạn:**
  - Xem tất cả shops và products
  - Checkout và mua hàng
  - Xem order history của mình
  - Quản lý subscriptions của mình
- **Đăng ký:** Cho phép đăng ký public hoặc guest checkout
- **Số lượng:** Không giới hạn

## Kiến trúc hệ thống

```
┌──────────────────────────────────────────┐
│   PLATFORM (Master Account)              │
│   - Quản lý Shops                        │
│   - Stripe Connect Platform Account      │
│   - Thu platform fee (10-20%)            │
│   - Quản lý shipping carriers            │
└──────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│   Shop A     │        │   Shop B     │
│ + Products   │        │ + Products   │
│ + KYC Done   │        │ + KYC Done   │
│ + Stripe     │        │ + Stripe     │
│   Connected  │        │   Connected  │
│   Account    │        │   Account    │
│ + Shipping   │        │ + Shipping   │
│   Settings   │        │   Settings   │
└──────────────┘        └──────────────┘
```

## Luồng chính của hệ thống

### 1. Tạo Checkout URL

```
Shop Owner nhập:
  - Tên sản phẩm
  - Giá sản phẩm
  - Loại sản phẩm (physical/digital)
  - Cài đặt shipping (nếu physical)

→ Hệ thống tạo:
  - Checkout Session
  - Checkout URL unique: /checkout/{sessionId}

→ Shop Owner share URL cho khách hàng
```

### 2. Checkout Flow (Giống Shopify)

```
┌─────────────────────────────────────────┐
│  Step 1: INFORMATION                    │
│  - Email                                │
│  - Họ tên                               │
│  - Địa chỉ giao hàng                    │
│  - Số điện thoại                        │
│  - Ghi chú                              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Step 2: SHIPPING (nếu physical)        │
│  - Chọn phương thức vận chuyển          │
│    • Standard (3-5 days) - $5           │
│    • Express (1-2 days) - $15           │
│  - Hệ thống tự tính phí ship            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Step 3: PAYMENT                        │
│  - Stripe Credit Card (Connect)         │
│  - Xem order summary                    │
│  - Nhập thông tin thẻ                   │
│  - Xử lý thanh toán                     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Step 4: CONFIRMATION                   │
│  - Hiển thị order number                │
│  - Email confirmation                   │
│  - Tracking info (nếu physical)         │
└─────────────────────────────────────────┘
```

### 3. Stripe Connect + KYC cho mỗi Shop

Mỗi shop phải hoàn tất KYC để nhận tiền:

```
Shop Owner → Đăng ký shop
         ↓
Platform tạo Stripe Connected Account
         ↓
Shop Owner điền thông tin KYC
         ↓
Stripe xác minh (2-5 ngày)
         ↓
Shop active, có thể nhận thanh toán
```

---

## Authentication & Authorization System

### Authentication Flow

#### 1. Đăng ký Account

**Shop Owner Registration:**

```
User → Click "Đăng ký bán hàng"
     ↓
Form đăng ký:
- Email
- Password
- Full Name
- Phone (optional)
- [x] Tôi đồng ý với điều khoản
     ↓
POST auth/register
{
  email: "seller@example.com",
  password: "Password123!",
  name: "Nguyễn Văn A",
  role: "shop_owner"  // Frontend tự set
}
     ↓
Backend:
1. Validate email chưa tồn tại
2. Hash password (bcrypt)
3. Tạo User với role="shop_owner"
4. Gửi email xác nhận
5. Return JWT token
     ↓
Response:
{
  user: { id, email, name, role: "shop_owner" },
  accessToken: "eyJhbGc...",
  refreshToken: "eyJhbGc..."
}
     ↓
Frontend:
- Lưu tokens vào localStorage/cookies
- Redirect to /dashboard/shop/onboarding
```

**Customer Registration:**

```
User → Click "Đăng ký"
     ↓
Form đơn giản:
- Email
- Password
- Name
     ↓
POST auth/register
{
  email: "customer@example.com",
  password: "Password123!",
  name: "Trần Thị B",
  role: "customer"  // Frontend tự set
}
     ↓
Response: { user, accessToken, refreshToken }
     ↓
Redirect to homepage hoặc continue shopping
```

**Admin Account:**

- Không cho phép đăng ký qua UI
- Tạo bằng database seed hoặc CLI command:

```bash
npm run seed:admin -- --email admin@platform.com --password Admin123!
```

#### 2. Đăng nhập

```
User → Nhập email + password
     ↓
POST auth/login
{
  email: "user@example.com",
  password: "Password123!"
}
     ↓
Backend:
1. Tìm user by email
2. Verify password (bcrypt.compare)
3. Generate JWT tokens
4. Return user info + tokens
     ↓
Response:
{
  user: {
    id: "uuid",
    email: "user@example.com",
    name: "User Name",
    role: "customer" | "shop_owner" | "platform_admin"
  },
  accessToken: "eyJhbGc...",
  refreshToken: "eyJhbGc..."
}
     ↓
Frontend redirect based on role:
- customer → Homepage
- shop_owner → /dashboard/shop
- platform_admin → /admin
```

#### 3. Guest Checkout (Không cần đăng nhập)

```
Customer → Vào checkout URL
         ↓
Điền thông tin mà KHÔNG cần tạo account
         ↓
Sau thanh toán thành công:
  → Tự động tạo Customer account
  → Gửi email với password tạm
  → Lần sau có thể login
```

### JWT Token Structure

**Access Token (expires: 15 minutes):**

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "shop_owner",
  "iat": 1729468800,
  "exp": 1729469700
}
```

**Refresh Token (expires: 7 days):**

```json
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1729468800,
  "exp": 1730073600
}
```

### Role-Based Access Control (RBAC)

#### API Endpoints Permission Matrix

| Endpoint                | Customer      | Shop Owner     | Admin   |
| ----------------------- | ------------- | -------------- | ------- |
| GET products            | ✅ Public     | ✅             | ✅      |
| POST shops/:id/products | ❌            | ✅ Own shop    | ✅      |
| GET orders              | ✅ Own orders | ✅ Shop orders | ✅ All  |
| POST checkout/\*        | ✅            | ✅             | ✅      |
| GET admin/\*            | ❌            | ❌             | ✅ Only |
| PUT shops/:id           | ❌            | ✅ Own shop    | ✅      |

#### Guards Implementation (NestJS)

```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some(role => user.role === role);
  }
}

// Usage in controller:
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('shop_owner', 'platform_admin')
@Post('shops/:shopId/products')
createProduct() { ... }
```

### Frontend Route Protection

```typescript
// middleware.ts (Next.js)
export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken");
  const user = decodeToken(token);

  // Admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (user?.role !== "platform_admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Shop owner routes
  if (request.nextUrl.pathname.startsWith("/dashboard/shop")) {
    if (user?.role !== "shop_owner" && user?.role !== "platform_admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Customer routes
  if (request.nextUrl.pathname.startsWith("/dashboard/customer")) {
    if (!user || user.role !== "customer") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
}
```

---

## Database Schema (PostgreSQL)

### 1. Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'customer' | 'shop_owner' | 'platform_admin'
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Shops Table

```sql
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo VARCHAR(500),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  website VARCHAR(500),

  -- Stripe Connect
  stripe_account_id VARCHAR(255) UNIQUE,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  stripe_charges_enabled BOOLEAN DEFAULT FALSE,
  stripe_payouts_enabled BOOLEAN DEFAULT FALSE,

  -- Platform settings
  platform_fee_percent DECIMAL(5,2) DEFAULT 15.00,
  is_active BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'active' | 'suspended' | 'rejected'

  -- Shipping settings (default cho shop)
  shipping_enabled BOOLEAN DEFAULT TRUE,
  free_shipping_threshold DECIMAL(10,2), -- Free ship nếu đơn >= giá này

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shops_slug ON shops(slug);
CREATE INDEX idx_shops_owner ON shops(owner_id);
```

### 3. Products Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL, -- One-time price
  compare_at_price DECIMAL(10,2), -- Giá gốc (để show discount)

  -- Subscription pricing
  weekly_price DECIMAL(10,2),
  monthly_price DECIMAL(10,2),
  yearly_price DECIMAL(10,2),

  -- Product type
  product_type VARCHAR(50) NOT NULL, -- 'physical' | 'digital'

  -- Physical product fields
  weight DECIMAL(10,2), -- kg, cho tính phí ship
  requires_shipping BOOLEAN DEFAULT TRUE,

  -- Digital product fields
  download_url VARCHAR(500),
  download_limit INT, -- Số lần download tối đa

  -- Inventory (cho physical)
  track_inventory BOOLEAN DEFAULT FALSE,
  inventory_quantity INT DEFAULT 0,
  allow_backorder BOOLEAN DEFAULT FALSE,

  -- Media
  images JSONB, -- ["url1", "url2", ...]

  -- Categorization
  category VARCHAR(100),
  tags JSONB, -- ["tag1", "tag2"]

  -- Subscription settings
  is_subscription BOOLEAN DEFAULT FALSE,
  trial_days INT DEFAULT 0,

  -- Features
  features JSONB, -- ["Feature 1", "Feature 2"]

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(shop_id, slug)
);

CREATE INDEX idx_products_shop ON products(shop_id);
CREATE INDEX idx_products_slug ON products(shop_id, slug);
CREATE INDEX idx_products_type ON products(product_type);
```

### 4. Shipping Zones Table

```sql
CREATE TABLE shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- "Domestic", "International", etc.
  countries JSONB NOT NULL, -- ["VN", "US", "JP"]
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shipping_zones_shop ON shipping_zones(shop_id);
```

### 5. Shipping Rates Table

```sql
CREATE TABLE shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- "Standard Shipping"
  description TEXT,

  -- Pricing
  price DECIMAL(10,2) NOT NULL,

  -- Conditions
  min_order_amount DECIMAL(10,2), -- Áp dụng khi đơn >= amount này
  max_weight DECIMAL(10,2), -- kg, áp dụng khi đơn <= weight này

  -- Delivery time
  min_delivery_days INT, -- 3 days
  max_delivery_days INT, -- 5 days

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shipping_rates_zone ON shipping_rates(zone_id);
```

### 6. Checkout Sessions Table

```sql
CREATE TABLE checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL, -- Public ID
  product_id UUID NOT NULL REFERENCES products(id),
  shop_id UUID NOT NULL REFERENCES shops(id),

  -- Customer info
  email VARCHAR(255),
  customer_name VARCHAR(255),
  phone VARCHAR(50),

  -- Shipping address
  shipping_address_line1 VARCHAR(255),
  shipping_address_line2 VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_country VARCHAR(2), -- Country code
  shipping_postal_code VARCHAR(20),

  -- Shipping method
  shipping_rate_id UUID REFERENCES shipping_rates(id),
  shipping_method_name VARCHAR(255),
  shipping_cost DECIMAL(10,2) DEFAULT 0,

  -- Notes
  customer_note TEXT,

  -- Pricing
  billing_cycle VARCHAR(50), -- 'one_time' | 'weekly' | 'monthly' | 'yearly'
  product_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL, -- product_price + shipping_cost - discount
  discount_amount DECIMAL(10,2) DEFAULT 0,

  -- Stripe
  stripe_checkout_session_id VARCHAR(255),

  -- Current step
  current_step INT DEFAULT 1, -- 1: Info, 2: Shipping, 3: Payment

  status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'completed' | 'expired' | 'abandoned'
  expires_at TIMESTAMP NOT NULL,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_checkout_sessions_session_id ON checkout_sessions(session_id);
CREATE INDEX idx_checkout_sessions_product ON checkout_sessions(product_id);
CREATE INDEX idx_checkout_sessions_shop ON checkout_sessions(shop_id);
CREATE INDEX idx_checkout_sessions_status ON checkout_sessions(status);
```

### 7. Orders Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- #1001
  checkout_session_id UUID REFERENCES checkout_sessions(id),

  shop_id UUID NOT NULL REFERENCES shops(id),
  product_id UUID NOT NULL REFERENCES products(id),
  customer_id UUID REFERENCES users(id), -- NULL nếu guest checkout

  -- Customer info (snapshot)
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),

  -- Shipping address
  shipping_address_line1 VARCHAR(255),
  shipping_address_line2 VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_country VARCHAR(2),
  shipping_postal_code VARCHAR(20),

  -- Shipping info
  shipping_method_name VARCHAR(255),
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tracking_number VARCHAR(255),
  carrier VARCHAR(100), -- 'USPS', 'FedEx', etc.
  estimated_delivery DATE,

  -- Pricing breakdown
  product_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,

  -- Platform fee
  platform_fee DECIMAL(10,2) NOT NULL,
  shop_revenue DECIMAL(10,2) NOT NULL, -- Amount shop receives

  -- Payment
  billing_cycle VARCHAR(50), -- 'one_time' | 'weekly' | 'monthly' | 'yearly'
  payment_method VARCHAR(50) DEFAULT 'stripe',
  payment_intent_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'

  -- Subscription (if applicable)
  subscription_id UUID REFERENCES subscriptions(id),

  -- Order status
  fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled', -- 'unfulfilled' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled'

  -- Notes
  customer_note TEXT,
  internal_note TEXT,

  -- Timestamps
  paid_at TIMESTAMP,
  fulfilled_at TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_shop ON orders(shop_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(fulfillment_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
```

### 8. Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  shop_id UUID NOT NULL REFERENCES shops(id),
  customer_id UUID NOT NULL REFERENCES users(id),

  -- Stripe
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,

  -- Billing
  billing_cycle VARCHAR(50) NOT NULL, -- 'weekly' | 'monthly' | 'yearly'
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  shop_revenue DECIMAL(10,2) NOT NULL,

  -- Shipping (for physical subscriptions)
  shipping_address_line1 VARCHAR(255),
  shipping_address_line2 VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_country VARCHAR(2),
  shipping_postal_code VARCHAR(20),
  shipping_cost DECIMAL(10,2) DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trialing'
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  -- Renewal count
  renewal_count INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP
);

CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_shop ON subscriptions(shop_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### 9. Order Items Table (for future: multiple products per order)

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),

  product_name VARCHAR(255) NOT NULL, -- Snapshot
  product_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,

  total_price DECIMAL(10,2) NOT NULL, -- product_price * quantity

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### 10. Platform Settings Table

```sql
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default settings
INSERT INTO platform_settings (key, value, description) VALUES
('default_platform_fee', '15', 'Default platform fee percentage'),
('min_platform_fee', '10', 'Minimum platform fee percentage'),
('max_platform_fee', '30', 'Maximum platform fee percentage'),
('stripe_platform_account_id', '', 'Stripe Platform Account ID'),
('checkout_session_expiry_hours', '24', 'Hours before checkout session expires');
```

---

## API Endpoints

### Authentication & Authorization

```
# Registration
POST   auth/register
Body: {
  email: string,
  password: string,
  name: string,
  role: "customer" | "shop_owner",  // Không cho phép tạo admin
  phone?: string
}
Response: {
  user: User,
  accessToken: string,
  refreshToken: string
}

# Login
POST   auth/login
Body: {
  email: string,
  password: string
}
Response: {
  user: User,
  accessToken: string,
  refreshToken: string
}

# Logout
POST   auth/logout
Headers: Authorization: Bearer {accessToken}
Body: {
  refreshToken: string
}

# Refresh Token
POST   auth/refresh
Body: {
  refreshToken: string
}
Response: {
  accessToken: string,
  refreshToken: string
}

# Get Current User
GET    auth/me
Headers: Authorization: Bearer {accessToken}
Response: {
  user: User
}

# Update Profile
PUT    auth/profile
Headers: Authorization: Bearer {accessToken}
Body: {
  name?: string,
  phone?: string,
  avatar?: string
}

# Change Password
POST   auth/change-password
Headers: Authorization: Bearer {accessToken}
Body: {
  currentPassword: string,
  newPassword: string
}

# Forgot Password
POST   auth/forgot-password
Body: {
  email: string
}
Response: {
  message: "Reset link sent to email"
}

# Reset Password
POST   auth/reset-password
Body: {
  token: string,
  newPassword: string
}

# Verify Email
GET    auth/verify-email/:token
```

### 1. Shops

```
POST   shops                          # Tạo shop mới
GET    shops                          # Danh sách shops
GET    shops/:slug                    # Chi tiết shop
PUT    shops/:id                      # Cập nhật shop
DELETE shops/:id                      # Xóa shop

# Stripe Connect Onboarding
POST   shops/:id/connect/onboard      # Bắt đầu KYC
GET    shops/:id/connect/status       # Kiểm tra KYC status
POST   shops/:id/connect/refresh      # Refresh onboarding link
GET    shops/:id/dashboard            # Stripe Dashboard link
```

### 2. Products

```
GET    products                       # Tất cả products
GET    products/:id                   # Chi tiết product
GET    shops/:shopSlug/products       # Products của shop

# Shop owner only
POST   shops/:shopId/products         # Tạo product
PUT    products/:id                   # Cập nhật product
DELETE products/:id                   # Xóa product
```

### 3. Shipping

```
# Shipping Zones
GET    shops/:shopId/shipping/zones         # Danh sách zones
POST   shops/:shopId/shipping/zones         # Tạo zone
PUT    shipping/zones/:id                   # Cập nhật zone
DELETE shipping/zones/:id                   # Xóa zone

# Shipping Rates
GET    shipping/zones/:zoneId/rates         # Danh sách rates
POST   shipping/zones/:zoneId/rates         # Tạo rate
PUT    shipping/rates/:id                   # Cập nhật rate
DELETE shipping/rates/:id                   # Xóa rate

# Calculate shipping
POST   shipping/calculate
Body: {
  shopId: string,
  productId: string,
  country: string,
  weight?: number
}
Response: {
  rates: [{
    id: string,
    name: string,
    price: number,
    deliveryTime: string
  }]
}
```

### 4. Checkout (QUAN TRỌNG)

```
# Tạo checkout session
POST   checkout/create-session
Body: {
  productId: string,
  billingCycle: "one_time" | "weekly" | "monthly" | "yearly",
  quantity?: number
}
Response: {
  sessionId: string,
  checkoutUrl: string  # /checkout/:sessionId
}

# Load checkout session
GET    checkout/sessions/:sessionId

# Step 1: Save customer info
POST   checkout/sessions/:sessionId/information
Body: {
  email: string,
  name: string,
  phone?: string,
  shippingAddress: {
    line1: string,
    line2?: string,
    city: string,
    state: string,
    country: string,
    postalCode: string
  },
  note?: string
}

# Step 2: Select shipping method
POST   checkout/sessions/:sessionId/shipping
Body: {
  shippingRateId: string
}

# Step 3: Create payment
POST   checkout/sessions/:sessionId/payment
Body: {
  paymentMethod: "stripe"
}
Response: {
  stripeCheckoutUrl: string
}
```

### 5. Orders

```
GET    orders                         # User's orders
GET    orders/:orderNumber            # Order details
GET    shops/:shopId/orders           # Shop's orders (owner only)

# Order management (shop owner)
PUT    orders/:id/fulfill             # Mark as fulfilled
PUT    orders/:id/ship                # Add tracking info
Body: {
  trackingNumber: string,
  carrier: string,
  estimatedDelivery?: string
}
PUT    orders/:id/cancel              # Cancel order

# Admin
GET    admin/orders                   # All orders
```

### 6. Subscriptions

```
GET    subscriptions                  # User's subscriptions
GET    subscriptions/:id              # Subscription details
POST   subscriptions/:id/cancel       # Cancel subscription
POST   subscriptions/:id/resume       # Resume subscription
PUT    subscriptions/:id/change-plan  # Change billing cycle
PUT    subscriptions/:id/update-address  # Update shipping address

# Shop owner
GET    shops/:shopId/subscriptions    # Shop's subscriptions
```

### 7. Payments (Webhooks)

```
POST   webhooks/stripe                # Stripe webhook
POST   webhooks/stripe-connect        # Stripe Connect webhook
```

---

## Luồng hoạt động chi tiết

### Flow 1: Shop Owner Onboarding

```typescript
// Step 1: Shop Owner đăng ký
POST shops
{
  name: "My Fashion Store",
  email: "owner@example.com",
  description: "Selling premium fashion items"
}

Response: {
  id: "shop-uuid",
  slug: "my-fashion-store",
  status: "pending",
  stripeOnboardingComplete: false
}

// Step 2: Bắt đầu KYC với Stripe Connect
POST shops/{shopId}/connect/onboard

Backend logic:
1. Create Stripe Connected Account (type: 'express')
2. Save stripeAccountId to database
3. Create Account Link for onboarding
4. Return onboarding URL

Response: {
  onboardingUrl: "https://connect.stripe.com/setup/..."
}

// Step 3: Shop Owner hoàn tất KYC trên Stripe
// Stripe webhook: account.updated → charges_enabled: true

// Step 4: Platform cập nhật shop status
UPDATE shops
SET status = 'active',
    stripe_charges_enabled = true,
    stripe_payouts_enabled = true
WHERE id = shopId
```

### Flow 2: Tạo Product và Checkout URL

```typescript
// Shop Owner tạo product
POST shops/{shopId}/products
{
  name: "Premium Leather Jacket",
  basePrice: 199.99,
  monthlyPrice: 29.99,  // Optional subscription
  productType: "physical",
  weight: 1.2,  // kg
  requiresShipping: true,
  inventoryQuantity: 50,
  trackInventory: true,
  images: ["url1.jpg", "url2.jpg"],
  description: "High quality leather jacket"
}

Response: {
  id: "product-uuid",
  slug: "premium-leather-jacket"
}

// Tạo Checkout URL
POST checkout/create-session
{
  productId: "product-uuid",
  billingCycle: "one_time"  // or "monthly" for subscription
}

Response: {
  sessionId: "cs_abc123xyz",
  checkoutUrl: "https://yourplatform.com/checkout/cs_abc123xyz"
}
```

### Flow 3: Customer Checkout (3 Steps)

#### Step 1: Information

```typescript
// Customer mở checkout URL
GET checkout/sessions/cs_abc123xyz

Response: {
  sessionId: "cs_abc123xyz",
  product: {
    name: "Premium Leather Jacket",
    price: 199.99,
    images: ["url1.jpg"],
    shop: {
      name: "My Fashion Store",
      logo: "logo.jpg"
    }
  },
  currentStep: 1,
  requiresShipping: true
}

// Customer điền thông tin
POST checkout/sessions/cs_abc123xyz/information
{
  email: "customer@example.com",
  name: "John Doe",
  phone: "+1234567890",
  shippingAddress: {
    line1: "123 Main St",
    city: "New York",
    state: "NY",
    country: "US",
    postalCode: "10001"
  },
  note: "Please call before delivery"
}

Response: {
  success: true,
  nextStep: 2,
  redirectUrl: "/checkout/cs_abc123xyz?step=2"
}
```

#### Step 2: Shipping

```typescript
// Load available shipping methods
GET shipping/calculate?sessionId=cs_abc123xyz

Backend logic:
1. Get checkout session
2. Find shipping zone by country
3. Get applicable rates based on weight/amount
4. Return available options

Response: {
  rates: [
    {
      id: "rate-1",
      name: "Standard Shipping",
      description: "Delivery in 3-5 business days",
      price: 5.99,
      deliveryTime: "3-5 days"
    },
    {
      id: "rate-2",
      name: "Express Shipping",
      description: "Delivery in 1-2 business days",
      price: 15.99,
      deliveryTime: "1-2 days"
    }
  ]
}

// Customer chọn shipping method
POST checkout/sessions/cs_abc123xyz/shipping
{
  shippingRateId: "rate-1"
}

Response: {
  success: true,
  shippingCost: 5.99,
  totalAmount: 205.98,  // 199.99 + 5.99
  nextStep: 3,
  redirectUrl: "/checkout/cs_abc123xyz?step=3"
}
```

#### Step 3: Payment

```typescript
// Create Stripe Checkout
POST checkout/sessions/cs_abc123xyz/payment
{
  paymentMethod: "stripe"
}

Backend logic:
const session = await getCheckoutSession(sessionId);
const shop = await getShop(session.shopId);

// Calculate platform fee
const platformFee = session.totalAmount * (shop.platformFeePercent / 100);
const shopRevenue = session.totalAmount - platformFee;

// Create Stripe Checkout Session
const stripeSession = await stripe.checkout.sessions.create({
  mode: session.billingCycle === 'one_time' ? 'payment' : 'subscription',

  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: session.product.name,
        images: session.product.images,
      },
      unit_amount: Math.round(session.productPrice * 100),
      recurring: session.billingCycle !== 'one_time' ? {
        interval: session.billingCycle
      } : undefined
    },
    quantity: 1,
  }, {
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'Shipping',
      },
      unit_amount: Math.round(session.shippingCost * 100),
    },
    quantity: 1,
  }],

  // STRIPE CONNECT: Split payment
  payment_intent_data: session.billingCycle === 'one_time' ? {
    application_fee_amount: Math.round(platformFee * 100),
    transfer_data: {
      destination: shop.stripeAccountId,  // Shop's connected account
    },
  } : undefined,

  subscription_data: session.billingCycle !== 'one_time' ? {
    application_fee_percent: shop.platformFeePercent,
    transfer_data: {
      destination: shop.stripeAccountId,
    },
  } : undefined,

  customer_email: session.email,

  success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${frontendUrl}/checkout/${sessionId}?step=3`,

  metadata: {
    checkoutSessionId: sessionId,
    productId: session.productId,
    shopId: session.shopId,
  }
});

Response: {
  stripeCheckoutUrl: stripeSession.url
}
```

#### Step 4: Confirmation

```typescript
// Stripe Webhook: checkout.session.completed
POST webhooks/stripe
{
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_stripe_123",
      payment_intent: "pi_123",
      customer: "cus_123",
      metadata: {
        checkoutSessionId: "cs_abc123xyz",
        productId: "product-uuid",
        shopId: "shop-uuid"
      }
    }
  }
}

Backend webhook handler:
async handleCheckoutCompleted(stripeSession) {
  const checkoutSession = await getCheckoutSession(
    stripeSession.metadata.checkoutSessionId
  );

  // Generate order number
  const orderNumber = await generateOrderNumber(); // #1001

  // Create order
  const order = await createOrder({
    orderNumber,
    checkoutSessionId: checkoutSession.id,
    shopId: checkoutSession.shopId,
    productId: checkoutSession.productId,
    customerEmail: checkoutSession.email,
    customerName: checkoutSession.customerName,
    shippingAddress: checkoutSession.shippingAddress,
    shippingMethodName: checkoutSession.shippingMethodName,
    shippingCost: checkoutSession.shippingCost,
    productPrice: checkoutSession.productPrice,
    totalAmount: checkoutSession.totalAmount,
    platformFee: calculatePlatformFee(checkoutSession.totalAmount),
    shopRevenue: calculateShopRevenue(checkoutSession.totalAmount),
    paymentIntentId: stripeSession.payment_intent,
    paymentStatus: 'paid',
    billingCycle: checkoutSession.billingCycle,
    paidAt: new Date()
  });

  // If subscription
  if (checkoutSession.billingCycle !== 'one_time') {
    await createSubscription({
      orderId: order.id,
      stripeSubscriptionId: stripeSession.subscription,
      stripeCustomerId: stripeSession.customer,
      // ... other fields
    });
  }

  // Update checkout session
  await updateCheckoutSession(checkoutSession.id, {
    status: 'completed'
  });

  // Send confirmation emails
  await sendCustomerConfirmation(order);
  await sendShopOwnerNotification(order);

  return order;
}
```

### Flow 4: Order Fulfillment (Physical Products)

```typescript
// Shop owner marks order as fulfilled
PUT orders/{orderId}/fulfill

// Shop owner adds tracking info
PUT orders/{orderId}/ship
{
  trackingNumber: "1Z999AA10123456784",
  carrier: "UPS",
  estimatedDelivery: "2025-10-25"
}

Backend:
await updateOrder(orderId, {
  fulfillmentStatus: 'shipped',
  trackingNumber: body.trackingNumber,
  carrier: body.carrier,
  estimatedDelivery: body.estimatedDelivery,
  shippedAt: new Date()
});

// Send tracking email to customer
await sendShippingNotification(order);
```

### Flow 5: Subscription Renewal

```typescript
// Stripe Webhook: invoice.paid
POST webhooks/stripe
{
  type: "invoice.paid",
  data: {
    object: {
      subscription: "sub_123",
      amount_paid: 3599,  // $35.99
      period_start: 1729468800,
      period_end: 1732060800
    }
  }
}

Backend webhook handler:
async handleInvoicePaid(invoice) {
  const subscription = await getSubscription(invoice.subscription);

  // Update subscription period
  await updateSubscription(subscription.id, {
    currentPeriodStart: new Date(invoice.period_start * 1000),
    currentPeriodEnd: new Date(invoice.period_end * 1000),
    renewalCount: subscription.renewalCount + 1,
    status: 'active'
  });

  // Create new order for this renewal
  const order = await createOrder({
    orderNumber: await generateOrderNumber(),
    subscriptionId: subscription.id,
    productId: subscription.productId,
    shopId: subscription.shopId,
    customerId: subscription.customerId,
    // Use saved shipping address
    shippingAddress: subscription.shippingAddress,
    shippingCost: subscription.shippingCost,
    totalAmount: invoice.amount_paid / 100,
    paymentStatus: 'paid',
    billingCycle: subscription.billingCycle,
    paidAt: new Date()
  });

  // If physical product, notify shop owner to fulfill
  if (order.requiresShipping) {
    await sendFulfillmentRequest(order);
  }
}
```

---

## Backend Implementation (NestJS)

### Cấu trúc thư mục

```
backend/
├── src/
│   ├── modules/
│   │   ├── shops/
│   │   │   ├── entities/shop.entity.ts
│   │   │   ├── dto/
│   │   │   ├── shops.controller.ts
│   │   │   ├── shops.service.ts
│   │   │   └── shops.module.ts
│   │   ├── products/
│   │   │   ├── entities/product.entity.ts
│   │   │   ├── dto/
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   └── products.module.ts
│   │   ├── shipping/
│   │   │   ├── entities/
│   │   │   │   ├── shipping-zone.entity.ts
│   │   │   │   └── shipping-rate.entity.ts
│   │   │   ├── shipping.controller.ts
│   │   │   ├── shipping.service.ts
│   │   │   └── shipping.module.ts
│   │   ├── checkout/
│   │   │   ├── entities/checkout-session.entity.ts
│   │   │   ├── dto/
│   │   │   ├── checkout.controller.ts
│   │   │   ├── checkout.service.ts
│   │   │   └── checkout.module.ts
│   │   ├── orders/
│   │   │   ├── entities/
│   │   │   │   ├── order.entity.ts
│   │   │   │   └── order-item.entity.ts
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   └── orders.module.ts
│   │   ├── subscriptions/
│   │   │   ├── entities/subscription.entity.ts
│   │   │   ├── subscriptions.controller.ts
│   │   │   ├── subscriptions.service.ts
│   │   │   └── subscriptions.module.ts
│   │   ├── payments/
│   │   │   ├── stripe/
│   │   │   │   ├── stripe.service.ts
│   │   │   │   ├── stripe.controller.ts
│   │   │   │   └── stripe-webhook.controller.ts
│   │   │   ├── stripe-connect/
│   │   │   │   ├── stripe-connect.service.ts
│   │   │   │   └── stripe-connect.controller.ts
│   │   │   └── payments.module.ts
│   │   ├── users/
│   │   │   ├── entities/user.entity.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   └── platform/
│   │       ├── entities/platform-setting.entity.ts
│   │       ├── platform.controller.ts
│   │       ├── platform.service.ts
│   │       └── platform.module.ts
│   ├── common/
│   │   ├── guards/
│   │   ├── decorators/
│   │   └── filters/
│   ├── config/
│   │   ├── database.config.ts
│   │   └── stripe.config.ts
│   ├── app.module.ts
│   └── main.ts
├── package.json
├── .env
└── nest-cli.json
```

### Key Services

#### 1. Checkout Service

```typescript
// checkout.service.ts
@Injectable()
export class CheckoutService {
  // Tạo checkout session
  async createSession(dto: CreateCheckoutSessionDto) {
    const product = await this.productsService.findOne(dto.productId);

    if (!product.shop.stripeChargesEnabled) {
      throw new BadRequestException("Shop chưa hoàn tất KYC");
    }

    const price = this.calculatePrice(product, dto.billingCycle);

    const session = await this.checkoutSessionRepo.save({
      sessionId: this.generateSessionId(),
      productId: dto.productId,
      shopId: product.shopId,
      billingCycle: dto.billingCycle,
      productPrice: price,
      totalAmount: price, // Sẽ cộng shipping sau
      expiresAt: addHours(new Date(), 24),
      currentStep: 1,
      status: "pending",
    });

    return {
      sessionId: session.sessionId,
      checkoutUrl: `${this.configService.get("FRONTEND_URL")}/checkout/${session.sessionId}`,
    };
  }

  // Step 1: Lưu thông tin khách hàng
  async saveInformation(sessionId: string, dto: SaveInformationDto) {
    const session = await this.findBySessionId(sessionId);

    await this.checkoutSessionRepo.update(session.id, {
      email: dto.email,
      customerName: dto.name,
      phone: dto.phone,
      shippingAddressLine1: dto.shippingAddress.line1,
      shippingAddressLine2: dto.shippingAddress.line2,
      shippingCity: dto.shippingAddress.city,
      shippingState: dto.shippingAddress.state,
      shippingCountry: dto.shippingAddress.country,
      shippingPostalCode: dto.shippingAddress.postalCode,
      customerNote: dto.note,
      currentStep: 2,
    });

    return { success: true, nextStep: 2 };
  }

  // Step 2: Chọn phương thức vận chuyển
  async selectShipping(sessionId: string, dto: SelectShippingDto) {
    const session = await this.findBySessionId(sessionId);
    const rate = await this.shippingService.findRate(dto.shippingRateId);

    const totalAmount = session.productPrice + rate.price;

    await this.checkoutSessionRepo.update(session.id, {
      shippingRateId: rate.id,
      shippingMethodName: rate.name,
      shippingCost: rate.price,
      totalAmount,
      currentStep: 3,
    });

    return {
      success: true,
      shippingCost: rate.price,
      totalAmount,
      nextStep: 3,
    };
  }

  // Step 3: Tạo Stripe payment
  async createPayment(sessionId: string) {
    const session = await this.findBySessionId(sessionId, {
      relations: ["product", "shop"],
    });

    const stripeSession = await this.stripeService.createCheckoutSession({
      checkoutSession: session,
      product: session.product,
      shop: session.shop,
    });

    await this.checkoutSessionRepo.update(session.id, {
      stripeCheckoutSessionId: stripeSession.id,
    });

    return { stripeCheckoutUrl: stripeSession.url };
  }
}
```

#### 2. Stripe Service

```typescript
// stripe.service.ts
@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get("STRIPE_SECRET_KEY"), {
      apiVersion: "2023-10-16",
    });
  }

  async createCheckoutSession(params: {
    checkoutSession: CheckoutSession;
    product: Product;
    shop: Shop;
  }) {
    const { checkoutSession, product, shop } = params;

    const platformFee =
      checkoutSession.totalAmount * (shop.platformFeePercent / 100);

    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
            images: product.images,
          },
          unit_amount: Math.round(checkoutSession.productPrice * 100),
          recurring:
            checkoutSession.billingCycle !== "one_time"
              ? {
                  interval: this.mapBillingCycleToInterval(
                    checkoutSession.billingCycle
                  ),
                }
              : undefined,
        },
        quantity: 1,
      },
    ];

    // Add shipping as line item
    if (checkoutSession.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: checkoutSession.shippingMethodName || "Shipping",
          },
          unit_amount: Math.round(checkoutSession.shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode:
        checkoutSession.billingCycle === "one_time"
          ? "payment"
          : "subscription",
      line_items: lineItems,
      customer_email: checkoutSession.email,

      success_url: `${this.configService.get("FRONTEND_URL")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get("FRONTEND_URL")}/checkout/${checkoutSession.sessionId}?step=3`,

      metadata: {
        checkoutSessionId: checkoutSession.sessionId,
        productId: product.id,
        shopId: shop.id,
      },

      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "VN"], // Configure as needed
      },
    };

    // One-time payment: Use payment_intent_data for Connect
    if (checkoutSession.billingCycle === "one_time") {
      sessionParams.payment_intent_data = {
        application_fee_amount: Math.round(platformFee * 100),
        transfer_data: {
          destination: shop.stripeAccountId,
        },
      };
    } else {
      // Subscription: Use subscription_data
      sessionParams.subscription_data = {
        application_fee_percent: shop.platformFeePercent,
        transfer_data: {
          destination: shop.stripeAccountId,
        },
        trial_period_days: product.trialDays || 0,
      };
    }

    return await this.stripe.checkout.sessions.create(sessionParams);
  }

  private mapBillingCycleToInterval(cycle: string): "week" | "month" | "year" {
    const map = {
      weekly: "week",
      monthly: "month",
      yearly: "year",
    };
    return map[cycle] as any;
  }
}
```

#### 3. Stripe Webhook Handler

```typescript
// stripe-webhook.controller.ts
@Controller("webhooks/stripe")
export class StripeWebhookController {
  constructor(
    private stripeService: StripeService,
    private ordersService: OrdersService,
    private subscriptionsService: SubscriptionsService
  ) {}

  @Post()
  async handleWebhook(
    @Req() req: RawBodyRequest,
    @Headers("stripe-signature") signature: string
  ) {
    const event = this.stripeService.constructWebhookEvent(
      req.rawBody,
      signature
    );

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "invoice.paid":
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "account.updated":
        await this.handleAccountUpdated(event.data.object as Stripe.Account);
        break;
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata;
    const checkoutSession = await this.checkoutSessionRepo.findOne({
      where: { sessionId: metadata.checkoutSessionId },
      relations: ["product", "shop"],
    });

    const orderNumber = await this.generateOrderNumber();

    const platformFee =
      checkoutSession.totalAmount *
      (checkoutSession.shop.platformFeePercent / 100);
    const shopRevenue = checkoutSession.totalAmount - platformFee;

    const order = await this.ordersService.create({
      orderNumber,
      checkoutSessionId: checkoutSession.id,
      shopId: checkoutSession.shopId,
      productId: checkoutSession.productId,
      customerEmail: checkoutSession.email,
      customerName: checkoutSession.customerName,
      customerPhone: checkoutSession.phone,
      shippingAddressLine1: checkoutSession.shippingAddressLine1,
      shippingAddressLine2: checkoutSession.shippingAddressLine2,
      shippingCity: checkoutSession.shippingCity,
      shippingState: checkoutSession.shippingState,
      shippingCountry: checkoutSession.shippingCountry,
      shippingPostalCode: checkoutSession.shippingPostalCode,
      shippingMethodName: checkoutSession.shippingMethodName,
      shippingCost: checkoutSession.shippingCost,
      productPrice: checkoutSession.productPrice,
      totalAmount: checkoutSession.totalAmount,
      platformFee,
      shopRevenue,
      billingCycle: checkoutSession.billingCycle,
      paymentIntentId: session.payment_intent as string,
      paymentStatus: "paid",
      paidAt: new Date(),
    });

    // If subscription
    if (checkoutSession.billingCycle !== "one_time") {
      await this.subscriptionsService.create({
        orderId: order.id,
        productId: order.productId,
        shopId: order.shopId,
        customerId: order.customerId,
        stripeSubscriptionId: session.subscription as string,
        stripeCustomerId: session.customer as string,
        billingCycle: order.billingCycle,
        amount: order.totalAmount,
        platformFee,
        shopRevenue,
        shippingAddress: {
          line1: order.shippingAddressLine1,
          line2: order.shippingAddressLine2,
          city: order.shippingCity,
          state: order.shippingState,
          country: order.shippingCountry,
          postalCode: order.shippingPostalCode,
        },
        shippingCost: order.shippingCost,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.calculateNextBillingDate(order.billingCycle),
      });
    }

    // Update checkout session
    await this.checkoutSessionRepo.update(checkoutSession.id, {
      status: "completed",
    });

    // Send emails
    await this.emailService.sendOrderConfirmation(order);
    await this.emailService.sendShopOwnerNotification(order);
  }
}
```

---

## Frontend Implementation (Next.js)

### Cấu trúc thư mục

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx              # Login page
│   │   │   ├── register/
│   │   │   │   ├── page.tsx              # Registration choice page
│   │   │   │   ├── customer/
│   │   │   │   │   └── page.tsx          # Customer registration
│   │   │   │   └── shop-owner/
│   │   │   │       └── page.tsx          # Shop owner registration
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── reset-password/
│   │   │       └── page.tsx
│   │   ├── (public)/
│   │   │   ├── page.tsx                  # Homepage (public)
│   │   │   └── shops/
│   │   │       └── [slug]/
│   │   │           ├── page.tsx          # Shop storefront
│   │   │           └── products/
│   │   │               └── [productSlug]/
│   │   │                   └── page.tsx  # Product detail
│   │   ├── checkout/
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx              # Checkout page (guest allowed)
│   │   ├── checkout/
│   │   │   └── success/
│   │   │       └── page.tsx              # Success page
│   │   ├── dashboard/
│   │   │   ├── shop/                     # Shop Owner Dashboard (protected)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx              # Overview
│   │   │   │   ├── onboarding/
│   │   │   │   │   └── page.tsx          # KYC onboarding
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx          # Product list
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx      # Create product
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx  # Edit product
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx          # Order list
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx      # Order detail
│   │   │   │   ├── subscriptions/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   └── customer/                 # Customer Dashboard (protected)
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx              # Overview
│   │   │       ├── orders/
│   │   │       │   ├── page.tsx          # Order history
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx      # Order detail
│   │   │       ├── subscriptions/
│   │   │       │   └── page.tsx
│   │   │       └── settings/
│   │   │           └── page.tsx
│   │   └── admin/                        # Platform Admin (protected)
│   │       ├── layout.tsx
│   │       ├── page.tsx                  # Dashboard overview
│   │       ├── shops/
│   │       │   ├── page.tsx              # All shops
│   │       │   └── [id]/
│   │       │       └── page.tsx          # Shop detail & approval
│   │       ├── orders/
│   │       │   └── page.tsx              # All orders
│   │       ├── users/
│   │       │   └── page.tsx              # User management
│   │       ├── revenue/
│   │       │   └── page.tsx              # Platform revenue
│   │       └── settings/
│   │           └── page.tsx              # Platform settings
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── UserMenu.tsx
│   │   ├── checkout/
│   │   │   ├── CheckoutLayout.tsx
│   │   │   ├── StepIndicator.tsx
│   │   │   ├── InformationStep.tsx
│   │   │   ├── ShippingStep.tsx
│   │   │   ├── PaymentStep.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── shop/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── ShopHeader.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── OrderTable.tsx
│   │   └── ui/                           # Shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── shops.ts
│   │   │   ├── products.ts
│   │   │   ├── checkout.ts
│   │   │   ├── orders.ts
│   │   │   └── subscriptions.ts
│   │   ├── auth/
│   │   │   ├── auth-context.tsx          # Auth context provider
│   │   │   └── auth-utils.ts             # Token management
│   │   ├── stripe.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   └── useRole.ts
│   └── middleware.ts                     # Route protection
├── public/
│   └── ...
└── package.json
```

### Key Frontend Components

#### 1. Login Page

```typescript
// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await login(formData.email, formData.password);

      // Redirect based on role
      switch (user.role) {
        case 'platform_admin':
          router.push('/admin');
          break;
        case 'shop_owner':
          router.push('/dashboard/shop');
          break;
        case 'customer':
          router.push('/');
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Đăng nhập</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mật khẩu</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 2. Registration Choice Page

```typescript
// app/(auth)/register/page.tsx
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full p-8">
        <h1 className="text-4xl font-bold text-center mb-12">Đăng ký tài khoản</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Registration */}
          <Link href="/register/customer">
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-5xl mb-4 text-center">🛍️</div>
              <h2 className="text-2xl font-bold text-center mb-4">Mua sắm</h2>
              <p className="text-gray-600 text-center mb-6">
                Tạo tài khoản để mua hàng, theo dõi đơn hàng và quản lý subscriptions
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Mua hàng nhanh chóng
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Theo dõi đơn hàng
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Quản lý subscriptions
                </li>
              </ul>
              <div className="text-center">
                <span className="text-blue-600 font-semibold">
                  Đăng ký miễn phí →
                </span>
              </div>
            </div>
          </Link>

          {/* Shop Owner Registration */}
          <Link href="/register/shop-owner">
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-5xl mb-4 text-center">🏪</div>
              <h2 className="text-2xl font-bold text-center mb-4">Bán hàng</h2>
              <p className="text-gray-600 text-center mb-6">
                Mở shop và bắt đầu bán hàng trên nền tảng của chúng tôi
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Tạo shop miễn phí
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Quản lý sản phẩm dễ dàng
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Nhận tiền qua Stripe Connect
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Phí chỉ 15% mỗi giao dịch
                </li>
              </ul>
              <div className="text-center">
                <span className="text-blue-600 font-semibold">
                  Bắt đầu bán hàng →
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 3. Shop Owner Registration

```typescript
// app/(auth)/register/shop-owner/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ShopOwnerRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        role: 'shop_owner'
      });

      // Redirect to shop onboarding
      router.push('/dashboard/shop/onboarding');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Đăng ký Shop Owner</h2>
          <p className="text-gray-600 text-center mt-2">
            Tạo tài khoản để bắt đầu bán hàng
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Họ và tên *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Số điện thoại</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mật khẩu *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Tối thiểu 8 ký tự</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Xác nhận mật khẩu *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              className="mt-1 mr-2"
            />
            <label className="text-sm text-gray-600">
              Tôi đồng ý với{' '}
              <a href="/terms" className="text-blue-600 hover:underline">điều khoản sử dụng</a>
              {' '}và{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">chính sách bảo mật</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 4. Auth Context Provider

```typescript
// lib/auth/auth-context.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '@/libauth';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'shop_owner' | 'platform_admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User }>;
  register: (data: any) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await authApi.login(email, password);
    setUser(response.user);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response;
  }

  async function register(data: any) {
    const response = await authApi.register(data);
    setUser(response.user);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response;
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    }
  }

  async function refreshUser() {
    const userData = await authApi.getCurrentUser();
    setUser(userData);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

#### 5. Route Protection Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const path = request.nextUrl.pathname;

  // Public paths
  const publicPaths = ["/", "/login", "/register", "/shops", "/checkout"];
  const isPublicPath = publicPaths.some((p) => path.startsWith(p));

  // Auth pages
  const authPaths = ["/login", "/register"];
  const isAuthPath = authPaths.some((p) => path.startsWith(p));

  // If logged in and trying to access auth pages, redirect to appropriate dashboard
  if (token && isAuthPath) {
    // Decode token to get role (simplified, use proper JWT decode)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload.role;

    if (role === "platform_admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else if (role === "shop_owner") {
      return NextResponse.redirect(new URL("/dashboard/shop", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If not logged in and trying to access protected routes
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based protection
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload.role;

    // Admin routes
    if (path.startsWith("/admin") && role !== "platform_admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Shop owner routes
    if (
      path.startsWith("/dashboard/shop") &&
      !["shop_owner", "platform_admin"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Customer routes
    if (path.startsWith("/dashboard/customer") && role !== "customer") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### Checkout Page Component

```typescript
// app/checkout/[sessionId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { InformationStep } from '@/components/checkout/InformationStep';
import { ShippingStep } from '@/components/checkout/ShippingStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';

export default function CheckoutPage({ params }: { params: { sessionId: string } }) {
  const searchParams = useSearchParams();
  const [session, setSession] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    const step = parseInt(searchParams.get('step') || '1');
    setCurrentStep(step);
  }, [searchParams]);

  async function loadSession() {
    const response = await fetch(`checkout/sessions/${params.sessionId}`);
    const data = await response.json();
    setSession(data);
    setCurrentStep(data.currentStep);
    setLoading(false);
  }

  if (loading) return <div>Loading...</div>;
  if (!session) return <div>Session not found</div>;

  return (
    <CheckoutLayout session={session}>
      {currentStep === 1 && (
        <InformationStep
          session={session}
          onComplete={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && session.product.requiresShipping && (
        <ShippingStep
          session={session}
          onComplete={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 3 && (
        <PaymentStep session={session} />
      )}
    </CheckoutLayout>
  );
}
```

### Information Step Component

```typescript
// components/checkout/InformationStep.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function InformationStep({ session, onComplete }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    shippingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: 'US',
      postalCode: ''
    },
    note: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`checkout/sessions/${session.sessionId}/information`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      router.push(`/checkout/${session.sessionId}?step=2`);
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded"
          />

          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded"
          />

          <input
            type="tel"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Shipping Address</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Address Line 1"
            value={formData.shippingAddress.line1}
            onChange={(e) => setFormData({
              ...formData,
              shippingAddress: { ...formData.shippingAddress, line1: e.target.value }
            })}
            required
            className="w-full px-4 py-2 border rounded"
          />

          <input
            type="text"
            placeholder="Address Line 2 (optional)"
            value={formData.shippingAddress.line2}
            onChange={(e) => setFormData({
              ...formData,
              shippingAddress: { ...formData.shippingAddress, line2: e.target.value }
            })}
            className="w-full px-4 py-2 border rounded"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              value={formData.shippingAddress.city}
              onChange={(e) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, city: e.target.value }
              })}
              required
              className="px-4 py-2 border rounded"
            />

            <input
              type="text"
              placeholder="State"
              value={formData.shippingAddress.state}
              onChange={(e) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, state: e.target.value }
              })}
              required
              className="px-4 py-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.shippingAddress.country}
              onChange={(e) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, country: e.target.value }
              })}
              required
              className="px-4 py-2 border rounded"
            >
              <option value="US">United States</option>
              <option value="VN">Vietnam</option>
              <option value="GB">United Kingdom</option>
              {/* Add more countries */}
            </select>

            <input
              type="text"
              placeholder="Postal Code"
              value={formData.shippingAddress.postalCode}
              onChange={(e) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, postalCode: e.target.value }
              })}
              required
              className="px-4 py-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <textarea
          placeholder="Order notes (optional)"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        Continue to Shipping
      </button>
    </form>
  );
}
```

### Shipping Step Component

```typescript
// components/checkout/ShippingStep.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ShippingStep({ session, onComplete }) {
  const router = useRouter();
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShippingRates();
  }, []);

  async function loadShippingRates() {
    const response = await fetch(`shipping/calculate?sessionId=${session.sessionId}`);
    const data = await response.json();
    setShippingRates(data.rates);
    setLoading(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRate) {
      alert('Please select a shipping method');
      return;
    }

    const response = await fetch(`checkout/sessions/${session.sessionId}/shipping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shippingRateId: selectedRate.id })
    });

    if (response.ok) {
      router.push(`/checkout/${session.sessionId}?step=3`);
      onComplete();
    }
  };

  if (loading) return <div>Loading shipping options...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold">Shipping Method</h2>

      <div className="space-y-4">
        {shippingRates.map((rate) => (
          <label
            key={rate.id}
            className={`
              flex items-center justify-between p-4 border rounded-lg cursor-pointer
              ${selectedRate?.id === rate.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}
            `}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="shipping"
                value={rate.id}
                checked={selectedRate?.id === rate.id}
                onChange={() => setSelectedRate(rate)}
                className="mr-4"
              />
              <div>
                <div className="font-semibold">{rate.name}</div>
                <div className="text-sm text-gray-600">{rate.description}</div>
                <div className="text-sm text-gray-500">{rate.deliveryTime}</div>
              </div>
            </div>
            <div className="font-semibold">${rate.price.toFixed(2)}</div>
          </label>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.push(`/checkout/${session.sessionId}?step=1`)}
          className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
        >
          Back
        </button>

        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  );
}
```

### Payment Step Component

```typescript
// components/checkout/PaymentStep.tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export function PaymentStep({ session }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    // Create Stripe Checkout Session
    const response = await fetch(`checkout/sessions/${session.sessionId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod: 'stripe' })
    });

    const { stripeCheckoutUrl } = await response.json();

    // Redirect to Stripe Checkout
    window.location.href = stripeCheckoutUrl;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Payment</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          You'll be redirected to Stripe's secure checkout to complete your payment.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Product</span>
          <span className="font-semibold">${session.productPrice.toFixed(2)}</span>
        </div>

        {session.shippingCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold">${session.shippingCost.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${session.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Pay with Stripe'}
      </button>
    </div>
  );
}
```

---

## Dependencies

### Backend (package.json)

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "stripe": "^14.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "uuid": "^9.0.0",
    "nodemailer": "^6.9.0"
  }
}
```

### Frontend (package.json)

```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@stripe/stripe-js": "^2.4.0",
    "axios": "^1.6.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.294.0"
  }
}
```

---

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ecommerce_db

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# App
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Kế hoạch triển khai (6 tuần)

### Phase 1: Setup & Core Backend (Tuần 1-2)

- [ ] Setup NestJS + PostgreSQL
- [ ] Tạo entities: User, Shop, Product, Order
- [ ] Authentication & Authorization
- [ ] CRUD APIs cho Shop & Product
- [ ] Shipping zones & rates setup

### Phase 2: Stripe Connect Integration (Tuần 2-3)

- [ ] Tích hợp Stripe Connect
- [ ] KYC onboarding flow
- [ ] Webhook handlers
- [ ] Test với Stripe Test Mode

### Phase 3: Checkout System (Tuần 3-4)

- [ ] Checkout session API
- [ ] 3-step checkout flow
- [ ] Shipping calculation
- [ ] Stripe payment integration
- [ ] Order creation & confirmation

### Phase 4: Subscription (Tuần 4-5)

- [ ] Subscription entity & logic
- [ ] Recurring billing với Stripe
- [ ] Subscription management
- [ ] Auto-renewal system

### Phase 5: Frontend (Tuần 5-6)

- [ ] Checkout page (3 steps)
- [ ] Shop storefront
- [ ] Shop owner dashboard
  - [ ] Product management
  - [ ] Order management
  - [ ] KYC onboarding
- [ ] Customer dashboard
  - [ ] Order history
  - [ ] Subscriptions

### Phase 6: Testing & Deployment (Tuần 6)

- [ ] End-to-end testing
- [ ] Payment flow testing
- [ ] Security audit
- [ ] Deploy to production

---

## Tính năng nâng cao (Future)

- [ ] Multi-currency
- [ ] Discount codes
- [ ] Inventory management
- [ ] Product variants (size, color)
- [ ] Reviews & ratings
- [ ] Analytics dashboard
- [ ] Email marketing
- [ ] Mobile app
