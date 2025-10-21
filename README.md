# Multi-Vendor E-commerce Platform

A comprehensive e-commerce platform built with NestJS backend and Next.js frontend, supporting multiple vendors, subscription-based billing, and Stripe Connect integration.

## 🏗️ Architecture

- **Backend**: NestJS with TypeScript, PostgreSQL, TypeORM
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Database**: PostgreSQL with Neon
- **Payment**: Stripe with Connect for vendor payouts
- **Authentication**: JWT-based with role-based access control

## 📋 Features

### ✅ Implemented
- ✅ PostgreSQL database setup with complete schema
- ✅ NestJS backend with TypeORM
- ✅ JWT authentication system
- ✅ User management (3 roles: customer, shop_owner, platform_admin)
- ✅ Shop management with Stripe Connect integration
- ✅ Product management (physical & digital, subscription support)
- ✅ Order management system
- ✅ Shipping zones and rates
- ✅ Subscription management
- ✅ Platform settings management
- ✅ Seed data for testing

### 🚧 In Progress
- 🚧 Creating comprehensive documentation

### 📋 Planned Features
- ⏳ Stripe Connect onboarding flow
- ⏳ 3-step checkout system
- ⏳ Next.js frontend with role-based auth
- ⏳ Customer, Shop Owner, and Admin dashboards
- ⏳ Subscription management interface
- ⏳ Real-time notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or use provided Neon database)

### Backend Setup

1. **Clone and setup**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Database setup**:
   ```bash
   # Run the application (auto-creates tables)
   npm run start:dev

   # Seed test data in another terminal
   npm run seed
   ```

4. **API Testing**:
   ```bash
   # Register a new user
   curl -X POST http://localhost:3001/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "Test123!", "name": "Test User"}'

   # Login
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "Test123!"}'
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Test Accounts

After running `npm run seed`, you'll have these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Platform Admin | admin@platform.com | Admin123! |
| Shop Owner 1 | shop1@example.com | ShopOwner123! |
| Shop Owner 2 | shop2@example.com | ShopOwner123! |
| Customer 1 | customer1@example.com | Customer123! |
| Customer 2 | customer2@example.com | Customer123! |

### Test Data

- **Shops**: Fashion Boutique, Tech Gadgets Store
- **Products**:
  - Premium Leather Jacket ($299.99 or $29.99/month)
  - Designer Sunglasses ($89.99)
  - Wireless Headphones Pro ($199.99 or $19.99/month)
  - Software License Basic ($29.99/month or $299.99/year)

## 📊 Database Schema

The platform includes these main entities:

- **Users**: Customer, Shop Owner, Platform Admin roles
- **Shops**: Vendor stores with Stripe Connect accounts
- **Products**: Physical/Digital items with subscription options
- **Orders**: One-time and subscription orders
- **Checkout Sessions**: 3-step checkout flow
- **Shipping Zones & Rates**: Configurable shipping
- **Subscriptions**: Active subscription management
- **Platform Settings**: Configuration management

## 🔧 Development

### Backend Commands
```bash
# Development
npm run start:dev

# Build for production
npm run build

# Start production
npm run start:prod

# Seed database
npm run seed

# Run tests
npm test
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_ACCOUNT_ID=acct_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
PORT=3001
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

## 🛣️ API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/me` - Get current user profile

### Users (Protected)
- `GET /users` - List users (admin only)
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user

### Shops (Protected)
- `GET /shops` - List shops
- `POST /shops` - Create shop
- `GET /shops/:id` - Get shop details
- `PUT /shops/:id` - Update shop

### Products (Protected)
- `GET /products` - List products
- `POST /products` - Create product
- `GET /products/:id` - Get product details
- `PUT /products/:id` - Update product

### Orders (Protected)
- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id` - Update order status

## 🚧 Next Steps

1. **Frontend Development**: Setup Next.js with TypeScript
2. **Stripe Connect**: Complete vendor onboarding flow
3. **Checkout System**: Implement 3-step checkout
4. **Dashboards**: Build role-specific admin interfaces
5. **Real-time Features**: Add WebSocket for notifications

## 📄 License

MIT License - see LICENSE file for details.