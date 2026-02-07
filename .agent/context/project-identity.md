# PROJECT IDENTITY

## Thông tin cơ bản
- Tên: TimmyHub
- Slogan: "Tìm mọi thứ"
- Domain: timmyhub.vn
- Mô tả: Sàn TMĐT đa vai trò enterprise-level (Shopee-like)

## Vai trò người dùng
- CUSTOMER (Khách hàng)
- SELLER (Người bán)
- BRAND (Thương hiệu)
- SHIPPER (Người giao hàng)
- ADMIN (Quản trị viên)
- SUPER_ADMIN (Siêu quản trị)

## Tech Stack
### Backend
- NestJS + TypeScript (strict mode)
- PostgreSQL + Prisma ORM
- Redis (ioredis) - Cache, Queue, Session
- Elasticsearch - Full-text search
- Socket.io - Realtime
- Supabase Storage - File upload
- Bull - Job queue

### Frontend
- Next.js 14+ (App Router) + TypeScript (strict)
- Mantine UI + Styled Components
- TanStack React Query (server state)
- Zustand (client state)
- AG Grid (data tables)
- Socket.io Client
- i18next

### Payment
- Stripe (International)
- VNPay (Vietnam)
- Wallet (Internal)
- COD

### Auth & Security
- JWT trong HTTPOnly Cookie
- Refresh Token rotation
- Helmet.js
- RBAC (Role-Based Access Control)
- Rate Limiting
- 2FA (TOTP)

### Others
- QR Code (qrcode + qrcode.react)
- OpenAI API (Chatbot, Recommendation)
- Sentry (Error tracking)
- GitHub Actions (CI/CD)
- Docker + Docker Compose
- Nginx (Reverse proxy)

## Ngôn ngữ: vi (mặc định), en, zh, ko, ja
## Tiền tệ: VND (mặc định), USD