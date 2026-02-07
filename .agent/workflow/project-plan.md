# ============================================================
# TIMMYHUB - SÀN THƯƠNG MẠI ĐIỆN TỬ
# COMPLETE AI DEVELOPMENT PLAN
# Version: 1.0
# ============================================================

# ============================================================
# PHẦN 1: RULES BẮT BUỘC
# ============================================================

## IDENTITY
- Tên dự án: TimmyHub
- Slogan: "Tìm mọi thứ"
- Mô tả: Sàn TMĐT đa vai trò (Shopee-like) enterprise-level
- Vai trò: CUSTOMER, SELLER, BRAND, SHIPPER, ADMIN, SUPER_ADMIN
- Ngôn ngữ: vi (mặc định), en, zh, ko, ja
- Tiền tệ: VND (mặc định), USD

## TECH STACK
- Frontend: Next.js 14+ (App Router), TypeScript strict
- UI: Mantine + Styled Components
- Data: React Query (TanStack Query), Zustand (client state)
- Table: AG Grid
- Backend: NestJS, TypeScript strict
- Database: PostgreSQL + Prisma ORM
- Cache: Redis (ioredis)
- Search: Elasticsearch
- Realtime: Socket.io
- Storage: Supabase Storage
- Payment: Stripe, VNPay
- Auth: JWT trong HTTPOnly Cookie, Helmet.js, RBAC
- i18n: nestjs-i18n (backend), react-i18next (frontend)
- QR: qrcode (backend), qrcode.react (frontend)
- AI: OpenAI API
- Monitoring: Sentry
- CI/CD: GitHub Actions, Docker

## CODING RULES (BẮT BUỘC)
1. TUYỆT ĐỐI KHÔNG dùng `any` → Dùng `unknown`, generic, hoặc type cụ thể
2. TUYỆT ĐỐI KHÔNG dùng `@ts-ignore` hoặc `@ts-expect-error`
3. Mọi function PHẢI có return type rõ ràng
4. Mọi parameter PHẢI có type rõ ràng
5. Dùng `interface` cho object shape, `type` cho union/intersection
6. Dùng `enum` từ Prisma, KHÔNG tạo enum TS riêng trừ khi cần
7. Mọi API response theo chuẩn `ResponseDto<T>`
8. Mọi error throw NestJS Exception (BadRequestException, NotFoundException...)
9. Mọi input validate bằng class-validator
10. Mọi query DB phải có error handling
11. Mọi file có comment mô tả ở đầu
12. KHÔNG console.log → Dùng NestJS Logger
13. KHÔNG hardcode → Dùng ConfigService / env
14. Mọi string hiển thị PHẢI qua i18n
15. Tên biến/hàm tiếng Anh, comment tiếng Việt khi cần giải thích
16. Style: Mantine components + Styled Components cho custom
17. Server state: React Query | Client state: Zustand
18. API call PHẢI qua service layer, KHÔNG gọi trực tiếp trong component
19. Mọi API endpoint phải có Swagger decorator
20. Password hash bằng bcryptjs (salt rounds = 12)

## BACKEND CHECKLIST (Mỗi service method)
- [ ] Return type rõ ràng
- [ ] Parameter types rõ ràng
- [ ] Error handling với NestJS exceptions
- [ ] Input validation qua DTO
- [ ] Permission check qua @Permissions decorator
- [ ] Audit log cho hành động quan trọng
- [ ] Cache invalidation khi data thay đổi
- [ ] Notification trigger khi cần
- [ ] Transaction cho multi-step operations
- [ ] Pagination cho list endpoints

## FRONTEND CHECKLIST (Mỗi component)
- [ ] TypeScript interface cho props (KHÔNG any)
- [ ] Loading state (Skeleton)
- [ ] Error state
- [ ] Empty state
- [ ] Responsive (Mobile first)
- [ ] i18n cho text
- [ ] Accessibility (ARIA)
- [ ] React Query cho fetching
- [ ] Mantine + Styled Components

## AG GRID CHECKLIST (Mỗi table)
- [ ] Column defs với types
- [ ] Server-side pagination, sort, filter
- [ ] Custom cell renderers
- [ ] Row selection
- [ ] Export CSV/Excel
- [ ] Loading/Empty overlay

# ============================================================
# PHẦN 2: PROJECT STRUCTURE
# ============================================================

```
timmyhub/
├── apps/
│   ├── api/                         # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/            # Xác thực
│   │   │   │   ├── users/           # Người dùng
│   │   │   │   ├── rbac/            # Phân quyền
│   │   │   │   ├── categories/      # Danh mục
│   │   │   │   ├── products/        # Sản phẩm
│   │   │   │   ├── cart/            # Giỏ hàng
│   │   │   │   ├── orders/          # Đơn hàng
│   │   │   │   ├── payments/        # Thanh toán
│   │   │   │   ├── shipping/        # Vận chuyển
│   │   │   │   ├── chat/            # Chat realtime
│   │   │   │   ├── notifications/   # Thông báo
│   │   │   │   ├── email/           # Email service
│   │   │   │   ├── seller/          # Shop management
│   │   │   │   ├── reviews/         # Đánh giá
│   │   │   │   ├── search/          # Elasticsearch
│   │   │   │   ├── vouchers/        # Mã giảm giá
│   │   │   │   ├── flash-sales/     # Flash sale
│   │   │   │   ├── posts/           # TikTok-style posts
│   │   │   │   ├── campaigns/       # Brand campaigns
│   │   │   │   ├── wallet/          # Ví & đối soát
│   │   │   │   ├── disputes/        # Tranh chấp
│   │   │   │   ├── loyalty/         # Tích điểm
│   │   │   │   ├── affiliate/       # Tiếp thị liên kết
│   │   │   │   ├── shipper/         # Quản lý shipper
│   │   │   │   ├── digital/         # Sản phẩm số
│   │   │   │   ├── ar/              # AR try-on
│   │   │   │   ├── forecast/        # Dự báo nhu cầu
│   │   │   │   ├── live/            # Live stream
│   │   │   │   ├── group-buy/       # Mua chung
│   │   │   │   ├── gift-cards/      # Thẻ quà tặng
│   │   │   │   ├── subscriptions/   # Đơn định kỳ
│   │   │   │   ├── b2b/             # Bán sỉ
│   │   │   │   ├── ai-chatbot/      # AI bot
│   │   │   │   ├── analytics/       # Phân tích
│   │   │   │   ├── ab-testing/      # A/B test
│   │   │   │   ├── fraud/           # Chống gian lận
│   │   │   │   ├── audit/           # Nhật ký
│   │   │   │   ├── system-config/   # Cấu hình
│   │   │   │   ├── reports/         # Báo cáo vi phạm
│   │   │   │   ├── upload/          # File upload
│   │   │   │   ├── qr/              # QR code
│   │   │   │   ├── i18n/            # Đa ngôn ngữ
│   │   │   │   ├── seo/             # SEO
│   │   │   │   └── health/          # Health check
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── permissions.decorator.ts
│   │   │   │   │   └── current-user.decorator.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   ├── rbac.guard.ts
│   │   │   │   │   └── ws-jwt.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── response.interceptor.ts
│   │   │   │   │   └── audit.interceptor.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   ├── pipes/
│   │   │   │   │   └── validation.pipe.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── response.dto.ts
│   │   │   │   │   └── pagination.dto.ts
│   │   │   │   └── types/
│   │   │   │       └── index.ts
│   │   │   ├── config/
│   │   │   ├── database/
│   │   │   │   └── prisma.service.ts
│   │   │   ├── redis/
│   │   │   │   └── redis.service.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── test/
│   │   └── package.json
│   │
│   └── web/                         # Next.js Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   ├── login/page.tsx
│       │   │   │   ├── register/page.tsx
│       │   │   │   ├── forgot-password/page.tsx
│       │   │   │   └── verify-email/page.tsx
│       │   │   ├── (main)/
│       │   │   │   ├── page.tsx                    # Trang chủ
│       │   │   │   ├── products/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── [slug]/page.tsx
│       │   │   │   ├── categories/[slug]/page.tsx
│       │   │   │   ├── search/page.tsx
│       │   │   │   ├── cart/page.tsx
│       │   │   │   ├── checkout/page.tsx
│       │   │   │   ├── flash-sale/page.tsx
│       │   │   │   ├── shop/[slug]/page.tsx
│       │   │   │   ├── brand/[slug]/page.tsx
│       │   │   │   ├── posts/page.tsx
│       │   │   │   ├── live/page.tsx
│       │   │   │   └── group-buy/page.tsx
│       │   │   ├── (customer)/
│       │   │   │   ├── profile/page.tsx
│       │   │   │   ├── orders/page.tsx
│       │   │   │   ├── orders/[id]/page.tsx
│       │   │   │   ├── addresses/page.tsx
│       │   │   │   ├── wishlist/page.tsx
│       │   │   │   ├── wallet/page.tsx
│       │   │   │   ├── vouchers/page.tsx
│       │   │   │   ├── chat/page.tsx
│       │   │   │   ├── notifications/page.tsx
│       │   │   │   ├── loyalty/page.tsx
│       │   │   │   ├── reviews/page.tsx
│       │   │   │   ├── digital-library/page.tsx
│       │   │   │   ├── subscriptions/page.tsx
│       │   │   │   └── settings/page.tsx
│       │   │   ├── (seller)/
│       │   │   │   ├── dashboard/page.tsx
│       │   │   │   ├── products/page.tsx
│       │   │   │   ├── products/new/page.tsx
│       │   │   │   ├── products/[id]/edit/page.tsx
│       │   │   │   ├── orders/page.tsx
│       │   │   │   ├── orders/[id]/page.tsx
│       │   │   │   ├── inventory/page.tsx
│       │   │   │   ├── analytics/page.tsx
│       │   │   │   ├── vouchers/page.tsx
│       │   │   │   ├── flash-sales/page.tsx
│       │   │   │   ├── posts/page.tsx
│       │   │   │   ├── live/page.tsx
│       │   │   │   ├── chat/page.tsx
│       │   │   │   ├── reviews/page.tsx
│       │   │   │   ├── wallet/page.tsx
│       │   │   │   ├── settings/page.tsx
│       │   │   │   └── marketing/page.tsx
│       │   │   ├── (admin)/
│       │   │   │   ├── dashboard/page.tsx
│       │   │   │   ├── users/page.tsx
│       │   │   │   ├── users/[id]/page.tsx
│       │   │   │   ├── sellers/page.tsx
│       │   │   │   ├── products/page.tsx
│       │   │   │   ├── orders/page.tsx
│       │   │   │   ├── categories/page.tsx
│       │   │   │   ├── vouchers/page.tsx
│       │   │   │   ├── flash-sales/page.tsx
│       │   │   │   ├── brands/page.tsx
│       │   │   │   ├── disputes/page.tsx
│       │   │   │   ├── reports/page.tsx
│       │   │   │   ├── settlements/page.tsx
│       │   │   │   ├── analytics/page.tsx
│       │   │   │   ├── rbac/roles/page.tsx
│       │   │   │   ├── rbac/permissions/page.tsx
│       │   │   │   ├── system/config/page.tsx
│       │   │   │   ├── system/audit-log/page.tsx
│       │   │   │   ├── system/ab-tests/page.tsx
│       │   │   │   ├── system/feature-flags/page.tsx
│       │   │   │   ├── fraud/page.tsx
│       │   │   │   └── forecast/page.tsx
│       │   │   ├── (brand)/
│       │   │   │   ├── dashboard/page.tsx
│       │   │   │   ├── products/page.tsx
│       │   │   │   ├── campaigns/page.tsx
│       │   │   │   ├── authorized-sellers/page.tsx
│       │   │   │   ├── fake-reports/page.tsx
│       │   │   │   └── analytics/page.tsx
│       │   │   ├── payment/
│       │   │   │   ├── success/page.tsx
│       │   │   │   ├── failed/page.tsx
│       │   │   │   └── vnpay/return/page.tsx
│       │   │   ├── ar/[productId]/page.tsx
│       │   │   ├── layout.tsx
│       │   │   ├── not-found.tsx
│       │   │   ├── error.tsx
│       │   │   └── sitemap.ts
│       │   ├── components/
│       │   │   ├── common/           # Logo, SearchBar, LoadingSpinner, EmptyState...
│       │   │   ├── layouts/          # MainLayout, DashboardLayout, Header, Footer, Sidebar
│       │   │   ├── products/         # ProductCard, ProductGrid, ProductDetail, ProductForm
│       │   │   ├── cart/             # CartDrawer, CartItem, CartSummary
│       │   │   ├── checkout/         # CheckoutForm, AddressPicker, PaymentMethodPicker
│       │   │   ├── orders/           # OrderList, OrderDetail, OrderTimeline
│       │   │   ├── chat/             # ChatBox, ChatList, MessageBubble, AIChatbot
│       │   │   ├── posts/            # PostFeed, PostItem, PostCreator
│       │   │   ├── live/             # LivePlayer, LiveChat, PinnedProduct
│       │   │   ├── tables/           # BaseDataTable, UserTable, ProductTable, OrderTable...
│       │   │   ├── charts/           # RevenueChart, OrderChart, ForecastChart...
│       │   │   ├── dashboard/        # StatCard, RecentOrders, TopProducts
│       │   │   ├── rbac/             # RoleManager, PermissionTree
│       │   │   ├── ar/               # ARScene, ModelViewer, TryOnOverlay
│       │   │   └── forecast/         # ForecastDashboard, DemandChart
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── useSocket.ts
│       │   │   ├── useOrderTracking.ts
│       │   │   ├── useChat.ts
│       │   │   ├── useNotifications.ts
│       │   │   ├── useCart.ts
│       │   │   ├── usePermission.ts
│       │   │   ├── useDebounce.ts
│       │   │   ├── useInfiniteScroll.ts
│       │   │   ├── useTheme.ts
│       │   │   ├── useI18n.ts
│       │   │   ├── useAR.ts
│       │   │   └── useForecast.ts
│       │   ├── services/
│       │   │   ├── api.ts            # Axios instance
│       │   │   ├── auth.service.ts
│       │   │   ├── user.service.ts
│       │   │   ├── product.service.ts
│       │   │   ├── cart.service.ts
│       │   │   ├── order.service.ts
│       │   │   ├── payment.service.ts
│       │   │   ├── chat.service.ts
│       │   │   ├── notification.service.ts
│       │   │   ├── voucher.service.ts
│       │   │   ├── review.service.ts
│       │   │   ├── search.service.ts
│       │   │   ├── upload.service.ts
│       │   │   ├── wallet.service.ts
│       │   │   ├── seller.service.ts
│       │   │   ├── admin.service.ts
│       │   │   ├── analytics.service.ts
│       │   │   ├── post.service.ts
│       │   │   ├── live.service.ts
│       │   │   ├── dispute.service.ts
│       │   │   ├── loyalty.service.ts
│       │   │   ├── affiliate.service.ts
│       │   │   ├── shipper.service.ts
│       │   │   ├── rbac.service.ts
│       │   │   ├── digital.service.ts
│       │   │   ├── ar.service.ts
│       │   │   ├── forecast.service.ts
│       │   │   ├── group-buy.service.ts
│       │   │   ├── subscription.service.ts
│       │   │   ├── gift-card.service.ts
│       │   │   └── b2b.service.ts
│       │   ├── store/               # Zustand stores
│       │   ├── types/               # Frontend-specific types
│       │   ├── utils/
│       │   ├── styles/
│       │   └── i18n/
│       │       ├── vi.json
│       │       └── en.json
│       └── package.json
│
├── packages/
│   ├── shared-types/                # Shared TypeScript types
│   ├── shared-utils/                # Shared utilities
│   └── config/                      # Shared ESLint, TSConfig
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── nginx/
├── .github/workflows/
├── turbo.json
├── package.json
└── README.md
```

# ============================================================
# PHẦN 3: DATABASE SCHEMA (Prisma)
# ============================================================

```prisma
// apps/api/prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

// ==================== ENUMS ====================

enum UserRole {
  CUSTOMER
  SELLER
  BRAND
  SHIPPER
  ADMIN
  SUPER_ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  PACKED
  SHIPPING
  DELIVERED
  COMPLETED
  CANCELLED
  RETURN_REQUESTED
  RETURNED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum PaymentMethod {
  COD
  STRIPE
  VNPAY
  WALLET
}

enum ShipperStatus {
  ONLINE
  BUSY
  OFFLINE
}

enum VoucherType {
  PERCENTAGE
  FIXED_AMOUNT
  FREE_SHIPPING
}

enum DisputeType {
  DEFECTIVE_PRODUCT
  FAKE_PRODUCT
  NOT_RECEIVED
  WRONG_PRODUCT
  MISSING_PRODUCT
  POOR_QUALITY
  OTHER
}

enum DisputeStatus {
  OPEN
  SELLER_RESPONDED
  ADMIN_REVIEWING
  AWAITING_EVIDENCE
  RESOLVED
  CLOSED
  ESCALATED
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  PAYMENT
  REFUND
  SALE_INCOME
  COMMISSION
  REWARD
  FEE
}

enum NotificationType {
  ORDER
  PAYMENT
  SHIPPING
  PROMOTION
  SYSTEM
  CHAT
  REVIEW
  FLASH_SALE
  VOUCHER
  DISPUTE
}

enum DigitalProductType {
  EBOOK
  COURSE
  SOFTWARE
  MUSIC
  VIDEO
  TEMPLATE
  OTHER
}

enum MemberTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
  DIAMOND
}

// ==================== USER & AUTH ====================

model User {
  id                String      @id @default(cuid())
  email             String      @unique
  phone             String?     @unique
  passwordHash      String
  role              UserRole    @default(CUSTOMER)
  isEmailVerified   Boolean     @default(false)
  isPhoneVerified   Boolean     @default(false)
  isActive          Boolean     @default(true)
  isBanned          Boolean     @default(false)
  banReason         String?
  twoFactorEnabled  Boolean     @default(false)
  twoFactorSecret   String?
  lastLoginAt       DateTime?
  lastLoginIp       String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  deletedAt         DateTime?

  profile           Profile?
  addresses         Address[]
  orders            Order[]
  reviews           Review[]
  cart              Cart?
  wishlists         Wishlist[]
  sellerProfile     SellerProfile?
  brandProfile      BrandProfile?
  shipperProfile    ShipperProfile?
  userPermissions   UserPermission[]
  sentMessages      Message[]        @relation("SentMessages")
  notifications     Notification[]
  chatSessions      ChatParticipant[]
  wallet            Wallet?
  loyaltyAccount    LoyaltyAccount?
  loginHistory      LoginHistory[]
  refreshTokens     RefreshToken[]
  affiliateAccount  AffiliateAccount?
  subscriptions     Subscription[]
  digitalPurchases  DigitalPurchase[]
  postLikes         PostLike[]
  postComments      PostComment[]
  reportsMade       Report[]         @relation("Reporter")
  businessAccount   BusinessAccount?

  @@index([email])
  @@index([phone])
  @@index([role])
  @@index([isActive, isBanned])
  @@index([createdAt])
}

model Profile {
  id          String    @id @default(cuid())
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName   String
  lastName    String
  displayName String?
  avatar      String?
  coverImage  String?
  dateOfBirth DateTime?
  gender      String?
  bio         String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model LoginHistory {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ipAddress   String
  userAgent   String
  device      String?
  location    String?
  success     Boolean
  createdAt   DateTime @default(now())
  @@index([userId, createdAt])
}

model RefreshToken {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token       String   @unique
  expiresAt   DateTime
  deviceInfo  String?
  ipAddress   String?
  isRevoked   Boolean  @default(false)
  createdAt   DateTime @default(now())
  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}

// ==================== RBAC ====================

model SystemRole {
  id          String           @id @default(cuid())
  name        String           @unique
  displayName String
  description String?
  isSystem    Boolean          @default(false)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  permissions RolePermission[]
}

model Permission {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  description String?
  module      String
  action      String
  createdAt   DateTime @default(now())
  rolePermissions RolePermission[]
  userPermissions UserPermission[]
  @@index([module, action])
  @@index([module])
}

model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  permissionId String
  role         SystemRole @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@unique([roleId, permissionId])
}

model UserPermission {
  id           String     @id @default(cuid())
  userId       String
  permissionId String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  grantedAt    DateTime   @default(now())
  grantedBy    String?
  @@unique([userId, permissionId])
}

// ==================== ADDRESS ====================

model Address {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  label        String?
  fullName     String
  phone        String
  addressLine1 String
  addressLine2 String?
  ward         String
  district     String
  city         String
  postalCode   String?
  latitude     Float?
  longitude    Float?
  isDefault    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  orders       Order[]
  @@index([userId])
}

// ==================== SELLER ====================

model SellerProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  shopName        String
  shopSlug        String   @unique
  shopLogo        String?
  shopBanner      String?
  description     String?
  businessLicense String?
  taxCode         String?
  isVerified      Boolean  @default(false)
  verifiedAt      DateTime?
  rating          Float    @default(0)
  totalSold       Int      @default(0)
  totalProducts   Int      @default(0)
  totalFollowers  Int      @default(0)
  responseRate    Float    @default(0)
  responseTime    Int?
  openTime        String?
  closeTime       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  products        Product[]
  orders          Order[]
  warehouses      Warehouse[]
  shopCategories  ShopCategory[]
  posts           Post[]
  liveStreams      LiveStream[]
  flashSales      FlashSale[]
  settlements     Settlement[]
  disputes        Dispute[]
  @@index([shopSlug])
  @@index([isVerified])
}

model Warehouse {
  id          String        @id @default(cuid())
  sellerId    String
  seller      SellerProfile @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  name        String
  address     String
  city        String
  district    String
  phone       String
  isDefault   Boolean       @default(false)
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  @@index([sellerId])
}

model ShopCategory {
  id          String        @id @default(cuid())
  sellerId    String
  seller      SellerProfile @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  name        String
  slug        String
  position    Int           @default(0)
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  @@unique([sellerId, slug])
}

// ==================== BRAND ====================

model BrandProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  brandName       String   @unique
  brandSlug       String   @unique
  brandLogo       String?
  brandBanner     String?
  description     String?
  website         String?
  country         String?
  foundedYear     Int?
  isVerified      Boolean  @default(false)
  verifiedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  products        Product[]
  campaigns       Campaign[]
  authorizedSellers AuthorizedSeller[]
  fakeReports     FakeReport[]
  @@index([brandSlug])
}

model AuthorizedSeller {
  id          String        @id @default(cuid())
  brandId     String
  brand       BrandProfile  @relation(fields: [brandId], references: [id], onDelete: Cascade)
  sellerId    String
  status      String        @default("PENDING")
  approvedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime      @default(now())
  @@unique([brandId, sellerId])
}

model FakeReport {
  id          String       @id @default(cuid())
  brandId     String
  brand       BrandProfile @relation(fields: [brandId], references: [id])
  productId   String
  product     Product      @relation(fields: [productId], references: [id])
  reason      String
  evidence    String[]
  status      String       @default("PENDING")
  createdAt   DateTime     @default(now())
  @@index([brandId])
}

// ==================== SHIPPER ====================

model ShipperProfile {
  id              String        @id @default(cuid())
  userId          String        @unique
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  licensePlate    String?
  vehicleType     String?
  idCard          String
  driverLicense   String?
  idCardVerified  Boolean       @default(false)
  licenseVerified Boolean       @default(false)
  status          ShipperStatus @default(OFFLINE)
  currentLocation Json?
  rating          Float         @default(0)
  totalDeliveries Int           @default(0)
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deliveries      Delivery[]
  locationHistory LocationHistory[]
  @@index([status])
  @@index([isActive])
}

model Delivery {
  id            String         @id @default(cuid())
  orderId       String         @unique
  order         Order          @relation(fields: [orderId], references: [id])
  shipperId     String
  shipper       ShipperProfile @relation(fields: [shipperId], references: [id])
  acceptedAt    DateTime?
  pickedUpAt    DateTime?
  deliveredAt   DateTime?
  distance      Float?
  fee           Float
  note          String?
  proofImages   String[]
  status        String         @default("ASSIGNED")
  failReason    String?
  createdAt     DateTime       @default(now())
  @@index([shipperId])
  @@index([status])
}

model LocationHistory {
  id        String         @id @default(cuid())
  shipperId String
  shipper   ShipperProfile @relation(fields: [shipperId], references: [id])
  latitude  Float
  longitude Float
  accuracy  Float?
  speed     Float?
  heading   Float?
  timestamp DateTime       @default(now())
  @@index([shipperId, timestamp])
}

// ==================== CATEGORY ====================

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  image       String?
  icon        String?
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  level       Int        @default(0)
  position    Int        @default(0)
  isActive    Boolean    @default(true)
  isFeatured  Boolean    @default(false)
  metaTitle   String?
  metaDesc    String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  products    Product[]
  attributes  CategoryAttribute[]
  @@index([slug])
  @@index([parentId])
  @@index([isActive])
}

model CategoryAttribute {
  id         String   @id @default(cuid())
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name       String
  type       String
  options    String[]
  required   Boolean  @default(false)
  position   Int      @default(0)
  @@index([categoryId])
}

// ==================== PRODUCT ====================

model Product {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  description     String
  shortDesc       String?
  price           Float
  comparePrice    Float?
  costPrice       Float?
  sku             String?   @unique
  barcode         String?
  trackInventory  Boolean   @default(true)
  stock           Int       @default(0)
  lowStockAlert   Int       @default(10)
  weight          Float?
  length          Float?
  width           Float?
  height          Float?
  rating          Float     @default(0)
  reviewCount     Int       @default(0)
  soldCount       Int       @default(0)
  viewCount       Int       @default(0)
  wishlistCount   Int       @default(0)
  isActive        Boolean   @default(true)
  isFeatured      Boolean   @default(false)
  isDigital       Boolean   @default(false)
  arEnabled       Boolean   @default(false)
  arModelUrl      String?
  metaTitle       String?
  metaDesc        String?
  tags            String[]
  attributes      Json?
  sellerId        String?
  seller          SellerProfile? @relation(fields: [sellerId], references: [id])
  brandId         String?
  brand           BrandProfile?  @relation(fields: [brandId], references: [id])
  categoryId      String
  category        Category       @relation(fields: [categoryId], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?
  images          ProductImage[]
  videos          ProductVideo[]
  variants        ProductVariant[]
  reviews         Review[]
  orderItems      OrderItem[]
  cartItems       CartItem[]
  wishlists       Wishlist[]
  flashSaleItems  FlashSaleItem[]
  fakeReports     FakeReport[]
  digitalContent  DigitalContent?
  wholesalePrices WholesalePrice[]
  inventoryLogs   InventoryLog[]
  campaignItems   CampaignItem[]
  arModels        ARModel[]
  @@index([slug])
  @@index([sellerId])
  @@index([brandId])
  @@index([categoryId])
  @@index([isActive])
  @@index([price])
  @@index([rating])
  @@index([soldCount])
  @@index([createdAt])
  @@index([isDigital])
  @@index([arEnabled])
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  altText   String?
  position  Int     @default(0)
  @@index([productId])
}

model ProductVideo {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  thumbnail String?
  duration  Int?
  position  Int     @default(0)
  @@index([productId])
}

model ProductVariant {
  id         String   @id @default(cuid())
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  name       String
  sku        String?  @unique
  price      Float?
  stock      Int      @default(0)
  image      String?
  attributes Json
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  orderItems OrderItem[]
  cartItems  CartItem[]
  @@index([productId])
}

model InventoryLog {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  variantId   String?
  type        String
  quantity    Int
  stockBefore Int
  stockAfter  Int
  reason      String?
  reference   String?
  createdBy   String?
  createdAt   DateTime @default(now())
  @@index([productId, createdAt])
}

model WholesalePrice {
  id         String  @id @default(cuid())
  productId  String
  product    Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  minQty     Int
  maxQty     Int
  price      Float
  @@unique([productId, minQty])
  @@index([productId])
}

// ==================== DIGITAL PRODUCTS ====================

model DigitalContent {
  id               String             @id @default(cuid())
  productId        String             @unique
  product          Product            @relation(fields: [productId], references: [id], onDelete: Cascade)
  type             DigitalProductType
  fileUrl          String?
  fileSize         Int?
  fileType         String?
  previewUrl       String?
  maxDownloads     Int?               @default(5)
  accessDuration   Int?
  drm              Boolean            @default(false)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  chapters         DigitalChapter[]
  purchases        DigitalPurchase[]
}

model DigitalChapter {
  id               String         @id @default(cuid())
  digitalContentId String
  digitalContent   DigitalContent @relation(fields: [digitalContentId], references: [id], onDelete: Cascade)
  title            String
  description      String?
  contentUrl       String
  duration         Int?
  position         Int            @default(0)
  isFree           Boolean        @default(false)
  createdAt        DateTime       @default(now())
  @@index([digitalContentId])
}

model DigitalPurchase {
  id               String         @id @default(cuid())
  userId           String
  user             User           @relation(fields: [userId], references: [id])
  digitalContentId String
  digitalContent   DigitalContent @relation(fields: [digitalContentId], references: [id])
  orderId          String
  downloadCount    Int            @default(0)
  accessExpiresAt  DateTime?
  lastAccessedAt   DateTime?
  createdAt        DateTime       @default(now())
  @@unique([userId, digitalContentId])
  @@index([userId])
}

// ==================== CART ====================

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  items     CartItem[]
}

model CartItem {
  id        String          @id @default(cuid())
  cartId    String
  cart      Cart            @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  variantId String?
  variant   ProductVariant? @relation(fields: [variantId], references: [id])
  quantity  Int             @default(1)
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
  @@unique([cartId, productId, variantId])
  @@index([cartId])
}

model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([userId, productId])
  @@index([userId])
}

// ==================== ORDER ====================

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  sellerId        String?
  seller          SellerProfile? @relation(fields: [sellerId], references: [id])
  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  paymentMethod   PaymentMethod
  subtotal        Float
  shippingFee     Float         @default(0)
  tax             Float         @default(0)
  discount        Float         @default(0)
  total           Float
  addressId       String
  address         Address       @relation(fields: [addressId], references: [id])
  voucherId       String?
  voucher         Voucher?      @relation(fields: [voucherId], references: [id])
  note            String?
  cancelReason    String?
  ipAddress       String?
  userAgent       String?
  isHeld          Boolean       @default(false)
  holdReason      String?
  isSettled       Boolean       @default(false)
  isSubscription  Boolean       @default(false)
  riskScore       Int?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  items           OrderItem[]
  payment         Payment?
  delivery        Delivery?
  statusHistory   OrderStatusHistory[]
  reviews         Review[]
  disputes        Dispute[]
  affiliateOrder  AffiliateOrder?
  @@index([userId])
  @@index([sellerId])
  @@index([orderNumber])
  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt])
  @@index([isSettled])
}

model OrderItem {
  id          String          @id @default(cuid())
  orderId     String
  order       Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  product     Product         @relation(fields: [productId], references: [id])
  variantId   String?
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  name        String
  sku         String?
  image       String?
  price       Float
  quantity    Int
  subtotal    Float
  createdAt   DateTime        @default(now())
  @@index([orderId])
}

model OrderStatusHistory {
  id         String       @id @default(cuid())
  orderId    String
  order      Order        @relation(fields: [orderId], references: [id], onDelete: Cascade)
  fromStatus OrderStatus?
  toStatus   OrderStatus
  note       String?
  changedBy  String?
  createdAt  DateTime     @default(now())
  @@index([orderId])
}

// ==================== PAYMENT ====================

model Payment {
  id              String        @id @default(cuid())
  orderId         String        @unique
  order           Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  method          PaymentMethod
  status          PaymentStatus @default(PENDING)
  amount          Float
  currency        String        @default("VND")
  stripePaymentId String?       @unique
  vnpayTxnRef     String?       @unique
  vnpayTransNo    String?
  paidAt          DateTime?
  refundedAt      DateTime?
  refundAmount    Float?
  metadata        Json?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  @@index([status])
}

// ==================== VOUCHER ====================

model Voucher {
  id             String      @id @default(cuid())
  code           String      @unique
  type           VoucherType
  value          Float
  minOrderValue  Float?
  maxDiscount    Float?
  usageLimit     Int?
  usedCount      Int         @default(0)
  perUserLimit   Int         @default(1)
  isActive       Boolean     @default(true)
  startDate      DateTime
  endDate        DateTime
  description    String?
  sellerId       String?
  categoryIds    String[]
  productIds     String[]
  paymentMethods String[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  orders         Order[]
  usageLogs      VoucherUsageLog[]
  @@index([code])
  @@index([isActive])
  @@index([startDate, endDate])
}

model VoucherUsageLog {
  id        String   @id @default(cuid())
  voucherId String
  voucher   Voucher  @relation(fields: [voucherId], references: [id])
  userId    String
  orderId   String
  discount  Float
  usedAt    DateTime @default(now())
  @@unique([voucherId, userId, orderId])
  @@index([voucherId])
  @@index([userId])
}

// ==================== REVIEW ====================

model Review {
  id                 String   @id @default(cuid())
  userId             String
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId          String
  product            Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  orderId            String
  order              Order    @relation(fields: [orderId], references: [id])
  rating             Int
  title              String?
  comment            String
  images             String[]
  videos             String[]
  isVerifiedPurchase Boolean  @default(true)
  sellerResponse     String?
  sellerRespondedAt  DateTime?
  helpfulCount       Int      @default(0)
  isHidden           Boolean  @default(false)
  hideReason         String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  @@unique([userId, orderId, productId])
  @@index([productId])
  @@index([rating])
}

// ==================== CHAT ====================

model ChatSession {
  id           String            @id @default(cuid())
  type         String            @default("DIRECT")
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  participants ChatParticipant[]
  messages     Message[]
}

model ChatParticipant {
  id        String      @id @default(cuid())
  sessionId String
  session   ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  joinedAt  DateTime    @default(now())
  leftAt    DateTime?
  isMuted   Boolean     @default(false)
  @@unique([sessionId, userId])
  @@index([userId])
}

model Message {
  id          String      @id @default(cuid())
  sessionId   String
  session     ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  senderId    String
  sender      User        @relation("SentMessages", fields: [senderId], references: [id])
  content     String
  type        String      @default("TEXT")
  attachments String[]
  metadata    Json?
  isRead      Boolean     @default(false)
  readAt      DateTime?
  isDeleted   Boolean     @default(false)
  createdAt   DateTime    @default(now())
  @@index([sessionId, createdAt])
  @@index([senderId])
}

// ==================== NOTIFICATION ====================

model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  message   String
  data      Json?
  imageUrl  String?
  actionUrl String?
  isRead    Boolean          @default(false)
  readAt    DateTime?
  channels  String[]
  priority  String           @default("NORMAL")
  createdAt DateTime         @default(now())
  @@index([userId, isRead])
  @@index([type])
  @@index([createdAt])
}

// ==================== WALLET & SETTLEMENT ====================

model Wallet {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  balance         Float    @default(0)
  pendingBalance  Float    @default(0)
  totalDeposited  Float    @default(0)
  totalWithdrawn  Float    @default(0)
  isFrozen        Boolean  @default(false)
  frozenReason    String?
  pin             String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  transactions    WalletTransaction[]
  bankAccounts    BankAccount[]
  withdrawRequests WithdrawRequest[]
}

model WalletTransaction {
  id            String          @id @default(cuid())
  walletId      String
  wallet        Wallet          @relation(fields: [walletId], references: [id])
  type          TransactionType
  amount        Float
  balanceBefore Float
  balanceAfter  Float
  description   String
  reference     String?
  status        String          @default("COMPLETED")
  createdAt     DateTime        @default(now())
  @@index([walletId, createdAt])
  @@index([type])
}

model BankAccount {
  id          String   @id @default(cuid())
  walletId    String
  wallet      Wallet   @relation(fields: [walletId], references: [id])
  bankName    String
  bankCode    String
  accountNo   String
  accountName String
  branch      String?
  isDefault   Boolean  @default(false)
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())
  @@index([walletId])
}

model WithdrawRequest {
  id            String   @id @default(cuid())
  walletId      String
  wallet        Wallet   @relation(fields: [walletId], references: [id])
  amount        Float
  bankAccountId String
  status        String   @default("PENDING")
  processedBy   String?
  processedAt   DateTime?
  note          String?
  createdAt     DateTime @default(now())
  @@index([walletId])
  @@index([status])
}

model Settlement {
  id           String        @id @default(cuid())
  sellerId     String
  seller       SellerProfile @relation(fields: [sellerId], references: [id])
  period       String
  startDate    DateTime
  endDate      DateTime
  totalRevenue Float
  commission   Float
  shippingFee  Float
  tax          Float
  netAmount    Float
  orderCount   Int
  status       String        @default("PENDING")
  approvedBy   String?
  approvedAt   DateTime?
  createdAt    DateTime      @default(now())
  @@index([sellerId])
  @@index([period])
  @@index([status])
}

// ==================== FLASH SALE ====================

model FlashSale {
  id         String         @id @default(cuid())
  sellerId   String?
  seller     SellerProfile? @relation(fields: [sellerId], references: [id])
  name       String
  banner     String?
  startTime  DateTime
  endTime    DateTime
  isActive   Boolean        @default(true)
  isPlatform Boolean        @default(false)
  createdAt  DateTime       @default(now())
  items      FlashSaleItem[]
  @@index([startTime, endTime])
  @@index([isActive])
}

model FlashSaleItem {
  id           String    @id @default(cuid())
  flashSaleId  String
  flashSale    FlashSale @relation(fields: [flashSaleId], references: [id], onDelete: Cascade)
  productId    String
  product      Product   @relation(fields: [productId], references: [id])
  flashPrice   Float
  stock        Int
  soldCount    Int       @default(0)
  limitPerUser Int       @default(1)
  @@unique([flashSaleId, productId])
  @@index([flashSaleId])
}

// ==================== CAMPAIGN ====================

model Campaign {
  id          String       @id @default(cuid())
  brandId     String
  brand       BrandProfile @relation(fields: [brandId], references: [id])
  name        String
  description String?
  banner      String?
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean      @default(true)
  budget      Float?
  spent       Float        @default(0)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  items       CampaignItem[]
  @@index([brandId])
  @@index([isActive])
}

model CampaignItem {
  id           String   @id @default(cuid())
  campaignId   String
  campaign     Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  specialPrice Float?
  stock        Int?
  @@unique([campaignId, productId])
}

// ==================== POST (TikTok-style) ====================

model Post {
  id           String        @id @default(cuid())
  sellerId     String
  seller       SellerProfile @relation(fields: [sellerId], references: [id])
  content      String
  videoUrl     String?
  images       String[]
  hashtags     String[]
  productIds   String[]
  viewCount    Int           @default(0)
  likeCount    Int           @default(0)
  commentCount Int           @default(0)
  shareCount   Int           @default(0)
  isVisible    Boolean       @default(true)
  isPinned     Boolean       @default(false)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  likes        PostLike[]
  comments     PostComment[]
  @@index([sellerId])
  @@index([createdAt])
  @@index([hashtags])
}

model PostLike {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  @@unique([postId, userId])
}

model PostComment {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  content   String
  parentId  String?
  createdAt DateTime @default(now())
  @@index([postId])
}

// ==================== LIVE STREAM ====================

model LiveStream {
  id             String        @id @default(cuid())
  sellerId       String
  seller         SellerProfile @relation(fields: [sellerId], references: [id])
  title          String
  description    String?
  thumbnail      String?
  streamKey      String        @unique
  streamUrl      String?
  playbackUrl    String?
  status         String        @default("SCHEDULED")
  startedAt      DateTime?
  endedAt        DateTime?
  scheduledAt    DateTime?
  viewerCount    Int           @default(0)
  peakViewers    Int           @default(0)
  totalHearts    Int           @default(0)
  recordingUrl   String?
  createdAt      DateTime      @default(now())
  pinnedProducts LiveStreamProduct[]
  @@index([sellerId])
  @@index([status])
}

model LiveStreamProduct {
  id        String     @id @default(cuid())
  liveId    String
  live      LiveStream @relation(fields: [liveId], references: [id], onDelete: Cascade)
  productId String
  livePrice Float?
  position  Int        @default(0)
  isPinned  Boolean    @default(false)
  @@unique([liveId, productId])
}

// ==================== DISPUTE ====================

model Dispute {
  id             String        @id @default(cuid())
  disputeNumber  String        @unique
  orderId        String
  order          Order         @relation(fields: [orderId], references: [id])
  openedById     String
  sellerId       String
  seller         SellerProfile @relation(fields: [sellerId], references: [id])
  type           DisputeType
  reason         String
  description    String
  evidence       String[]
  status         DisputeStatus @default(OPEN)
  priority       String        @default("NORMAL")
  assignedToId   String?
  resolution     String?
  refundAmount   Float?
  deadline       DateTime
  escalatedAt    DateTime?
  resolvedAt     DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  responses      DisputeResponse[]
  @@index([status])
  @@index([sellerId])
  @@index([deadline])
}

model DisputeResponse {
  id          String   @id @default(cuid())
  disputeId   String
  dispute     Dispute  @relation(fields: [disputeId], references: [id], onDelete: Cascade)
  userId      String
  content     String
  attachments String[]
  isAdmin     Boolean  @default(false)
  createdAt   DateTime @default(now())
  @@index([disputeId])
}

// ==================== LOYALTY ====================

model LoyaltyAccount {
  id            String     @id @default(cuid())
  userId        String     @unique
  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  points        Int        @default(0)
  totalEarned   Int        @default(0)
  totalSpent    Int        @default(0)
  tier          MemberTier @default(BRONZE)
  tierExpiresAt DateTime?
  referralCode  String     @unique
  referredBy    String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  pointHistory  PointHistory[]
  referrals     Referral[]
  @@index([tier])
  @@index([referralCode])
}

model PointHistory {
  id          String         @id @default(cuid())
  accountId   String
  account     LoyaltyAccount @relation(fields: [accountId], references: [id])
  type        String
  points      Int
  description String
  reference   String?
  expiresAt   DateTime?
  createdAt   DateTime       @default(now())
  @@index([accountId, createdAt])
}

model Referral {
  id             String         @id @default(cuid())
  referrerId     String
  referrer       LoyaltyAccount @relation(fields: [referrerId], references: [id])
  referredUserId String
  status         String         @default("PENDING")
  rewardPoints   Int?
  createdAt      DateTime       @default(now())
  @@unique([referrerId, referredUserId])
}

// ==================== AFFILIATE ====================

model AffiliateAccount {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  affiliateCode     String   @unique
  website           String?
  channel           String?
  totalClicks       Int      @default(0)
  totalOrders       Int      @default(0)
  totalRevenue      Float    @default(0)
  totalCommission   Float    @default(0)
  pendingCommission Float    @default(0)
  commissionRate    Float    @default(5)
  tier              String   @default("BRONZE")
  isVerified        Boolean  @default(false)
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  links             AffiliateLink[]
  orders            AffiliateOrder[]
  @@index([affiliateCode])
}

model AffiliateLink {
  id          String           @id @default(cuid())
  affiliateId String
  affiliate   AffiliateAccount @relation(fields: [affiliateId], references: [id])
  productId   String?
  categoryId  String?
  shortCode   String           @unique
  originalUrl String
  shortUrl    String
  totalClicks Int              @default(0)
  totalOrders Int              @default(0)
  createdAt   DateTime         @default(now())
  @@index([shortCode])
}

model AffiliateOrder {
  id             String           @id @default(cuid())
  affiliateId    String
  affiliate      AffiliateAccount @relation(fields: [affiliateId], references: [id])
  orderId        String           @unique
  order          Order            @relation(fields: [orderId], references: [id])
  orderValue     Float
  commissionRate Float
  commission     Float
  status         String           @default("PENDING")
  createdAt      DateTime         @default(now())
  @@index([affiliateId])
}

// ==================== SUBSCRIPTION ====================

model Subscription {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  productId     String
  variantId     String?
  quantity      Int
  frequency     String
  nextDelivery  DateTime
  discount      Float    @default(0)
  status        String   @default("ACTIVE")
  addressId     String
  paymentMethod PaymentMethod
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  history       SubscriptionHistory[]
  @@index([userId])
  @@index([nextDelivery])
  @@index([status])
}

model SubscriptionHistory {
  id             String       @id @default(cuid())
  subscriptionId String
  subscription   Subscription @relation(fields: [subscriptionId], references: [id])
  orderId        String?
  status         String
  createdAt      DateTime     @default(now())
  @@index([subscriptionId])
}

// ==================== GROUP BUY ====================

model GroupBuy {
  id              String   @id @default(cuid())
  productId       String
  sellerId        String
  retailPrice     Float
  minParticipants Int
  maxParticipants Int
  currentCount    Int      @default(0)
  startTime       DateTime
  endTime         DateTime
  status          String   @default("OPEN")
  createdAt       DateTime @default(now())
  tiers           GroupBuyTier[]
  participants    GroupBuyParticipant[]
  @@index([status])
  @@index([endTime])
}

model GroupBuyTier {
  id         String   @id @default(cuid())
  groupBuyId String
  groupBuy   GroupBuy @relation(fields: [groupBuyId], references: [id], onDelete: Cascade)
  minCount   Int
  maxCount   Int
  price      Float
  @@index([groupBuyId])
}

model GroupBuyParticipant {
  id         String   @id @default(cuid())
  groupBuyId String
  groupBuy   GroupBuy @relation(fields: [groupBuyId], references: [id], onDelete: Cascade)
  userId     String
  quantity   Int      @default(1)
  createdAt  DateTime @default(now())
  @@unique([groupBuyId, userId])
}

// ==================== GIFT CARD ====================

model GiftCard {
  id               String   @id @default(cuid())
  code             String   @unique
  denomination     Float
  balance          Float
  purchasedById    String
  recipientEmail   String?
  recipientMessage String?
  templateId       String?
  isActivated      Boolean  @default(false)
  activatedAt      DateTime?
  expiresAt        DateTime
  createdAt        DateTime @default(now())
  @@index([code])
}

// ==================== B2B ====================

model BusinessAccount {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  companyName    String
  taxCode        String   @unique
  companyAddress String
  contactPerson  String
  companyPhone   String
  creditLimit    Float    @default(0)
  currentDebt    Float    @default(0)
  paymentTerms   Int      @default(30)
  isVerified     Boolean  @default(false)
  createdAt      DateTime @default(now())
  rfqs           RFQ[]
  @@index([taxCode])
}

model RFQ {
  id               String          @id @default(cuid())
  businessId       String
  business         BusinessAccount @relation(fields: [businessId], references: [id])
  items            Json
  note             String?
  status           String          @default("PENDING")
  quotes           Json?
  selectedSellerId String?
  createdAt        DateTime        @default(now())
  @@index([businessId])
}

// ==================== A/B TESTING ====================

model ABTest {
  id           String    @id @default(cuid())
  name         String
  description  String?
  type         String
  variantA     Json
  variantB     Json
  trafficA     Int       @default(50)
  trafficB     Int       @default(50)
  startDate    DateTime
  endDate      DateTime?
  isActive     Boolean   @default(true)
  samplesA     Int       @default(0)
  samplesB     Int       @default(0)
  conversionsA Int       @default(0)
  conversionsB Int       @default(0)
  winner       String?
  createdAt    DateTime  @default(now())
}

model FeatureFlag {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isEnabled   Boolean  @default(false)
  percentage  Int      @default(0)
  roles       String[]
  userIds     String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ==================== DEMAND FORECASTING ====================

model DemandForecast {
  id           String   @id @default(cuid())
  productId    String
  categoryId   String?
  period       String
  periodType   String
  predicted    Float
  actual       Float?
  confidence   Float?
  factors      Json?
  modelVersion String?
  createdAt    DateTime @default(now())
  @@unique([productId, period, periodType])
  @@index([productId])
  @@index([period])
}

model SalesTrend {
  id         String   @id @default(cuid())
  productId  String?
  categoryId String?
  date       DateTime
  quantity   Int
  revenue    Float
  avgPrice   Float
  createdAt  DateTime @default(now())
  @@index([productId, date])
  @@index([categoryId, date])
  @@index([date])
}

// ==================== AR/VR TRY-ON ====================

model ARModel {
  id           String   @id @default(cuid())
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  modelType    String
  modelUrl     String
  iosUrl       String?
  androidUrl   String?
  thumbnailUrl String?
  scale        Float    @default(1.0)
  position     Json?
  rotation     Json?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  tryOnLogs    ARTryOnLog[]
  @@index([productId])
  @@index([modelType])
}

model ARTryOnLog {
  id         String   @id @default(cuid())
  arModelId  String
  arModel    ARModel  @relation(fields: [arModelId], references: [id])
  userId     String?
  sessionId  String
  duration   Int?
  screenshot String?
  addedToCart Boolean  @default(false)
  purchased  Boolean  @default(false)
  device     String?
  createdAt  DateTime @default(now())
  @@index([arModelId])
  @@index([createdAt])
}

// ==================== REPORT / MODERATION ====================

model Report {
  id          String   @id @default(cuid())
  reporterId  String
  reporter    User     @relation("Reporter", fields: [reporterId], references: [id])
  targetType  String
  targetId    String
  reason      String
  description String?
  evidence    String[]
  status      String   @default("PENDING")
  resolvedBy  String?
  resolvedAt  DateTime?
  resolution  String?
  createdAt   DateTime @default(now())
  @@index([targetType, targetId])
  @@index([status])
}

// ==================== SYSTEM ====================

model SystemConfig {
  id          String   @id @default(cuid())
  group       String
  key         String   @unique
  value       String
  type        String   @default("STRING")
  description String?
  updatedAt   DateTime @updatedAt
  updatedBy   String?
  @@index([group])
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String
  module      String
  description String?
  oldData     Json?
  newData     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  @@index([userId])
  @@index([action])
  @@index([module])
  @@index([createdAt])
}
```

# ============================================================
# PHẦN 4: SHARED TYPES & CONSTANTS
# ============================================================

```typescript
// packages/shared-types/src/index.ts

// ===== API Response =====
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface BaseFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

// ===== Socket Events =====
export interface ChatMessagePayload {
  sessionId: string;
  receiverId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'PRODUCT' | 'ORDER';
  attachments?: string[];
  metadata?: Record<string, unknown>;
}

export interface TypingPayload {
  sessionId: string;
  userId: string;
}

export interface OrderUpdatePayload {
  orderId: string;
  status: string;
  timestamp: string;
  message?: string;
}

export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface LocationPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export interface LiveChatPayload {
  liveId: string;
  content: string;
  userId: string;
  displayName: string;
  avatar?: string;
}

// ===== Permission Constants =====
export const PERMISSIONS = {
  PRODUCT_VIEW: 'product.view',
  PRODUCT_CREATE: 'product.create',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_DELETE: 'product.delete',
  PRODUCT_APPROVE: 'product.approve',
  ORDER_VIEW: 'order.view',
  ORDER_CONFIRM: 'order.confirm',
  ORDER_CANCEL: 'order.cancel',
  ORDER_REFUND: 'order.refund',
  USER_VIEW: 'user.view',
  USER_UPDATE: 'user.update',
  USER_BAN: 'user.ban',
  USER_DELETE: 'user.delete',
  VOUCHER_VIEW: 'voucher.view',
  VOUCHER_CREATE: 'voucher.create',
  VOUCHER_UPDATE: 'voucher.update',
  VOUCHER_DELETE: 'voucher.delete',
  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',
  CONFIG_VIEW: 'config.view',
  CONFIG_UPDATE: 'config.update',
  ROLE_VIEW: 'role.view',
  ROLE_CREATE: 'role.create',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
  PERMISSION_ASSIGN: 'permission.assign',
  DISPUTE_VIEW: 'dispute.view',
  DISPUTE_RESOLVE: 'dispute.resolve',
  SETTLEMENT_VIEW: 'settlement.view',
  SETTLEMENT_APPROVE: 'settlement.approve',
  DELIVERY_VIEW: 'delivery.view',
  DELIVERY_ACCEPT: 'delivery.accept',
  DELIVERY_COMPLETE: 'delivery.complete',
  DELIVERY_REPORT: 'delivery.report',
  POST_CREATE: 'post.create',
  POST_UPDATE: 'post.update',
  POST_DELETE: 'post.delete',
  LIVE_START: 'live.start',
  LIVE_MANAGE: 'live.manage',
  DIGITAL_MANAGE: 'digital.manage',
  AR_MANAGE: 'ar.manage',
  FORECAST_VIEW: 'forecast.view',
  ABTEST_MANAGE: 'abtest.manage',
  FRAUD_VIEW: 'fraud.view',
  FRAUD_ACTION: 'fraud.action',
  AUDIT_VIEW: 'audit.view',
  WALLET_VIEW: 'wallet.view',
  WALLET_MANAGE: 'wallet.manage',
  CATEGORY_VIEW: 'category.view',
  CATEGORY_CREATE: 'category.create',
  CATEGORY_UPDATE: 'category.update',
  CATEGORY_DELETE: 'category.delete',
  BRAND_VIEW: 'brand.view',
  BRAND_MANAGE: 'brand.manage',
  FLASH_SALE_VIEW: 'flashsale.view',
  FLASH_SALE_CREATE: 'flashsale.create',
  FLASH_SALE_MANAGE: 'flashsale.manage',
  LOYALTY_VIEW: 'loyalty.view',
  LOYALTY_MANAGE: 'loyalty.manage',
  AFFILIATE_VIEW: 'affiliate.view',
  AFFILIATE_MANAGE: 'affiliate.manage',
  SHIPPER_VIEW: 'shipper.view',
  SHIPPER_MANAGE: 'shipper.manage',
  SUBSCRIPTION_VIEW: 'subscription.view',
  SUBSCRIPTION_MANAGE: 'subscription.manage',
  GIFT_CARD_VIEW: 'giftcard.view',
  GIFT_CARD_CREATE: 'giftcard.create',
  GROUP_BUY_VIEW: 'groupbuy.view',
  GROUP_BUY_CREATE: 'groupbuy.create',
  B2B_VIEW: 'b2b.view',
  B2B_MANAGE: 'b2b.manage',
  CHATBOT_MANAGE: 'chatbot.manage',
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  NOTIFICATION_SEND: 'notification.send',
  NOTIFICATION_MANAGE: 'notification.manage',
  UPLOAD_FILE: 'upload.file',
  SEO_MANAGE: 'seo.manage',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];
```

# ============================================================
# PHẦN 5: MODULE BUILD ORDER
# ============================================================

```
SPRINT 1 (Tuần 1-2): Foundation
  Thực hiện:
  - Khởi tạo monorepo, cài dependencies
  - Docker compose (Postgres, Redis, Elasticsearch)
  - Tạo env files
  - Prisma schema + migrate + seed
  - Shared types package
  - Common module (Guards, Interceptors, Filters, Pipes, Decorators, DTOs)
  - Database module (PrismaService)
  - Redis module (RedisService)
  - Config module

  Files cần tạo:
  - apps/api/src/database/prisma.service.ts
  - apps/api/src/redis/redis.service.ts
  - apps/api/src/common/dto/response.dto.ts
  - apps/api/src/common/dto/pagination.dto.ts
  - apps/api/src/common/guards/jwt-auth.guard.ts
  - apps/api/src/common/guards/rbac.guard.ts
  - apps/api/src/common/guards/ws-jwt.guard.ts
  - apps/api/src/common/decorators/permissions.decorator.ts
  - apps/api/src/common/decorators/current-user.decorator.ts
  - apps/api/src/common/interceptors/response.interceptor.ts
  - apps/api/src/common/interceptors/audit.interceptor.ts
  - apps/api/src/common/filters/http-exception.filter.ts
  - apps/api/src/common/types/index.ts
  - apps/api/src/main.ts (Helmet, CORS, Cookie, Validation, Rate Limit)
  - docker/docker-compose.dev.yml
  - apps/api/prisma/seed.ts

SPRINT 2 (Tuần 3-4): Auth & RBAC & Users
  Modules: auth, users, rbac
  Frontend: Login, Register, Forgot Password, Protected Routes, Auth hooks

SPRINT 3 (Tuần 5-6): Core Commerce
  Modules: categories, products, cart, upload
  Frontend: Home, Product list/detail, Cart, Category, Search bar

SPRINT 4 (Tuần 7-8): Orders & Payment
  Modules: orders, payments, shipping
  Frontend: Checkout, Order tracking, Payment success/fail

SPRINT 5 (Tuần 9-10): Communication
  Modules: chat, notifications, email
  Frontend: Chat UI, Notification bell, Real-time updates

SPRINT 6 (Tuần 11-12): Seller & Reviews
  Modules: seller, reviews, search
  Frontend: Seller dashboard (AG Grid tables), Shop page, Reviews

SPRINT 7 (Tuần 13-14): Marketing
  Modules: vouchers, flash-sales, posts, campaigns
  Frontend: Flash sale page, Post feed (TikTok), Voucher pages

SPRINT 8 (Tuần 15-16): Financial
  Modules: wallet, disputes, loyalty, affiliate
  Frontend: Wallet, Settlement, Dispute center, Loyalty

SPRINT 9 (Tuần 17-18): Delivery & Shipper
  Modules: shipper
  Frontend: Shipper tracking map, Delivery management

SPRINT 10 (Tuần 19-20): Premium Features
  Modules: digital, ar, forecast, live
  Frontend: Digital library, AR try-on, Forecast dashboard, Live stream

SPRINT 11 (Tuần 21-22): More Premium
  Modules: group-buy, gift-cards, subscriptions, b2b
  Frontend: Group buy, Gift cards, Subscriptions, B2B

SPRINT 12 (Tuần 23-24): System & Polish
  Modules: ai-chatbot, analytics, ab-testing, fraud, audit, system-config, reports, qr, i18n, seo, health
  Frontend: Admin dashboard (full), System config, A/B test, Feature flags
  Polish: i18n, SEO, PWA, Dark mode, Accessibility, Testing, CI/CD, Docs
```

# ============================================================
# PHẦN 6: MODULE TEMPLATE
# ============================================================

```
Khi AI tạo mỗi module, PHẢI tạo đủ các file:

modules/{name}/
├── {name}.module.ts
├── {name}.controller.ts
├── {name}.service.ts
├── {name}.gateway.ts          # Nếu cần WebSocket
├── dto/
│   ├── create-{name}.dto.ts
│   ├── update-{name}.dto.ts
│   ├── filter-{name}.dto.ts
│   └── {name}-response.dto.ts
├── interfaces/
│   └── {name}.interface.ts
└── {name}.spec.ts

Mỗi controller method pattern:

@Post()
@UseGuards(JwtAuthGuard, RbacGuard)
@Permissions('module.action')
@HttpCode(HttpStatus.CREATED)
async create(
  @Body() dto: CreateDto,
  @CurrentUser() user: AuthenticatedUser,
): Promise<ApiResponse<ResponseDto>> {
  const result = await this.service.create(dto, user.id);
  return { success: true, data: result };
}
```

# ============================================================
# PHẦN 7: ENVIRONMENT VARIABLES
# ============================================================

```env
# apps/api/.env
DATABASE_URL="postgresql://timmyhub:password@localhost:5432/timmyhub"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=timmyhub-jwt-secret-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=timmyhub-refresh-secret-change-in-production
JWT_REFRESH_EXPIRES_IN=30d
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
ELASTICSEARCH_NODE=http://localhost:9200
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
VNPAY_TMN_CODE=xxx
VNPAY_HASH_SECRET=xxx
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay/return
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=timmyhub@gmail.com
SMTP_PASSWORD=xxx
OPENAI_API_KEY=sk-xxx
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
SENTRY_DSN=
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

```env
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

# ============================================================
# PHẦN 8: DOCKER
# ============================================================

```yaml
# docker/docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: timmyhub
      POSTGRES_USER: timmyhub
      POSTGRES_PASSWORD: password
    volumes: [pg_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redis_data:/data]

  elasticsearch:
    image: elasticsearch:8.12.0
    ports: ["9200:9200"]
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes: [es_data:/usr/share/elasticsearch/data]

  kibana:
    image: kibana:8.12.0
    ports: ["5601:5601"]
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on: [elasticsearch]

volumes:
  pg_data:
  redis_data:
  es_data:
```

# ============================================================
# PHẦN 9: TỔNG KẾT
# ============================================================

```
Tổng modules backend: 45
Tổng Prisma models: 65+
Tổng API endpoints: ~300+
Tổng Frontend pages: ~80+
Tổng Frontend components: ~100+
Tổng chức năng: ~750+

Thời gian ước tính:
- 1 dev: ~12 tháng
- Team 3: ~6 tháng
- Với AI: ~3-4 tháng
- MVP (Sprint 1-4): ~8 tuần
```

# ============================================================
# END OF PLAN
# ============================================================