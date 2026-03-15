export const QUERY_KEYS = {
    // ── Auth ──────────────────────────────────────────────────────────
    PROFILE: ['profile'] as const,

    // ── Products ──────────────────────────────────────────────────────
    PRODUCTS: ['products'] as const,
    ADMIN_PRODUCTS: ['admin-products'] as const,
    PRODUCT: (id: string) => ['product', id] as const,
    SELLER_PRODUCTS: ['seller-products'] as const,

    // ── Users ─────────────────────────────────────────────────────────
    USERS: ['users'] as const,
    USER: (id: string) => ['users', id] as const,

    // ── RBAC ──────────────────────────────────────────────────────────
    ROLES: ['roles'] as const,
    ROLE: (id: string) => ['roles', id] as const,
    PERMISSIONS: ['permissions'] as const,

    // ── Categories ────────────────────────────────────────────────────
    CATEGORIES: (includeInactive?: boolean) => ['categories', includeInactive] as const,
    CATEGORY: (id: string) => ['category', id] as const,

    // ── Orders ────────────────────────────────────────────────────────
    ADMIN_ORDERS: ['admin-orders'] as const,
    ADMIN_ORDER: (id: string) => ['admin-order', id] as const,
    MY_ORDERS: (status?: string) => ['my-orders', status] as const,
    ORDER: (id: string) => ['order', id] as const,

    // ── Seller ────────────────────────────────────────────────────────
    SELLER_PROFILE_CHECK: ['seller-profile-check'] as const,
    SELLER_PROFILE: ['seller-profile'] as const,
    ADMIN_SELLER_APPLICATIONS: ['admin-seller-applications'] as const,

    // ── Campaigns ──────────────────────────────────────────────────────
    ADMIN_CAMPAIGNS: ['admin-campaigns'] as const,

    // ── Vouchers ────────────────────────────────────────────────────────
    ADMIN_VOUCHERS: ['admin-vouchers'] as const,

    // ── Cart ──────────────────────────────────────────────────────────
    CART: ['cart'] as const,

    // ── System Logs ────────────────────────────────────────────────────
    ADMIN_SYSTEM_LOGS: ['admin-system-logs'] as const,

    // ── Chat ──────────────────────────────────────────────────────────
    CHAT_ADMIN: ['chat-admin'] as const,
    CHAT_CONTACTS: ['chat-contacts'] as const,
    CHAT_MESSAGES: (contactId: string) => ['chat-messages', contactId] as const,
} as const;
