# Module Voucher & Chương trình khuyến mãi — Đặc tả chi tiết

**Dự án:** TimmyHub  
**Phiên bản:** 1.0  
**Cập nhật:** 2026-02

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Các tác nhân và vai trò](#2-các-tác-nhân-và-vai-trò-actors)
3. [Mối liên hệ: Voucher vs Chương trình khuyến mãi](#3-phân-tích-mối-liên-hệ-voucher-vs-chương-trình-khuyến-mãi)
4. [Case thực tế cho Voucher](#4-các-case-thực-tế-cho-voucher)
5. [Case thực tế cho Chương trình khuyến mãi](#5-các-case-thực-tế-cho-chương-trình-khuyến-mãi)
6. [Luồng áp dụng voucher khi checkout](#6-luồng-áp-dụng-voucher-khi-checkout)
7. [Mô hình dữ liệu](#7-mô-hình-dữ-liệu-gợi-ý-bổ-sung--mở-rộng)
8. [API & Quyền](#8-api--quyền-gợi-ý)
9. [Tóm tắt triển khai](#9-tóm-tắt-triển-khai-module)
10. [Bảng tra cứu nhanh](#10-bảng-tra-cứu-nhanh--case-thực-tế)

---

## 1. Tổng quan

Tài liệu mô tả **voucher (mã giảm giá)** và **chương trình khuyến mãi**, mối liên hệ giữa chúng, các case thực tế, luật áp dụng và hướng triển khai trong hệ thống TimmyHub.

### 1.1 Thuật ngữ

| Thuật ngữ                                        | Mô tả                                                                                                                      |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Voucher**                                      | Mã giảm giá (code) mà user nhập hoặc được cấp, áp dụng cho đơn hàng (giảm %, giảm tiền, freeship).                         |
| **Chương trình khuyến mãi (Campaign/Promotion)** | Một đợt marketing có thời gian, điều kiện, và có thể gồm nhiều voucher hoặc quy tắc giảm giá (không cần code).             |
| **Promotion Program**                            | Chương trình khuyến mãi (có thể là Flash Sale, Voucher Campaign, Category Sale, v.v.).                                     |
| **Redemption**                                   | Lần user “đổi” / áp dụng voucher (1 voucher có thể được redeem nhiều lần bởi nhiều user, hoặc giới hạn theo perUserLimit). |

---

## 2. Các tác nhân và vai trò (Actors)

Các vai trò trong TimmyHub (UserRole) liên quan trực tiếp đến voucher và chương trình khuyến mãi: **SUPER_ADMIN**, **ADMIN**, **SELLER**, **CUSTOMER**. (BRAND có thể tham gia campaign; SHIPPER không thao tác voucher.)

### 2.1 Bảng tác nhân — Mô tả vai trò

| Vai trò                  | Mô tả trong bối cảnh Voucher & Khuyến mãi                                                                                                                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SUPER_ADMIN / ADMIN**  | Quản trị sàn: tạo/sửa/xóa voucher **sàn** (sellerId = null), tạo/sửa/xóa **chương trình khuyến mãi toàn sàn**, duyệt (nếu có) voucher/campaign do seller đăng ký, xem báo cáo toàn sàn, cấu hình chính sách (stack voucher, hoàn quota khi hủy đơn…).                    |
| **SELLER (Người bán)**   | Quản lý voucher **của shop**: tạo/sửa/xóa voucher có sellerId = shop mình; tham gia hoặc tạo **campaign riêng shop**; xem báo cáo voucher/campaign của shop; có thể đăng ký tham gia campaign sàn (nếu sàn mở). Không sửa/xóa voucher sàn hoặc campaign của seller khác. |
| **CUSTOMER (Người mua)** | Chỉ **sử dụng**: xem danh sách voucher khả dụng (sàn + seller áp cho sản phẩm trong giỏ), nhập code hoặc chọn voucher khi checkout, xem “Voucher của tôi” (đã nhận/sắp hết hạn). Không tạo/sửa voucher hay campaign.                                                     |
| **BRAND**                | Tùy thiết kế: có thể được gắn với campaign (brand campaign), nhận báo cáo voucher áp cho sản phẩm thuộc brand; thường không tạo voucher trực tiếp (do Admin/Seller tạo).                                                                                                 |

### 2.2 Ma trận: Tác nhân × Hành động

| Hành động                                                     | SUPER_ADMIN / ADMIN | SELLER                                | CUSTOMER |
| ------------------------------------------------------------- | ------------------- | ------------------------------------- | -------- |
| Tạo voucher **sàn** (sellerId = null)                         | ✅                  | ❌                                    | ❌       |
| Tạo voucher **seller** (sellerId = shop)                      | ✅ (thay mặt shop)  | ✅ (chỉ shop mình)                    | ❌       |
| Sửa / Xóa voucher sàn                                         | ✅                  | ❌                                    | ❌       |
| Sửa / Xóa voucher seller                                      | ✅                  | ✅ (chỉ shop mình)                    | ❌       |
| Xem danh sách voucher (all / theo shop)                       | ✅ All              | ✅ Của shop + voucher sàn áp cho shop | ❌       |
| Tạo chương trình khuyến mãi **toàn sàn**                      | ✅                  | ❌                                    | ❌       |
| Tạo campaign **riêng seller**                                 | ✅                  | ✅ (chỉ shop mình)                    | ❌       |
| Sửa / Xóa / Kết thúc campaign sàn                             | ✅                  | ❌                                    | ❌       |
| Sửa / Xóa campaign seller                                     | ✅                  | ✅ (chỉ shop mình)                    | ❌       |
| “Tham gia” campaign sàn (opt-in seller)                       | N/A                 | ✅ (nếu sàn cho phép)                 | ❌       |
| Validate voucher (checkout)                                   | N/A                 | N/A                                   | ✅       |
| Áp dụng voucher vào đơn                                       | N/A                 | N/A                                   | ✅       |
| Xem “Voucher của tôi” / khả dụng                              | —                   | —                                     | ✅       |
| Xem báo cáo voucher/campaign (toàn sàn)                       | ✅                  | ❌                                    | ❌       |
| Xem báo cáo voucher/campaign (theo shop)                      | ✅                  | ✅ (chỉ shop mình)                    | ❌       |
| Duyệt voucher/campaign do seller gửi (nếu có quy trình duyệt) | ✅                  | ❌                                    | ❌       |

### 2.3 Vai trò Người bán (SELLER) — Chi tiết

- **Voucher do seller tạo**
    - Luôn gắn `sellerId` = shop của seller. Chỉ áp dụng cho đơn có **ít nhất một sản phẩm** thuộc shop đó.
    - Seller chỉ CRUD voucher của chính shop; không thấy hoặc sửa voucher của seller khác hoặc voucher sàn (trừ khi cần “xem voucher sàn đang áp cho category/sản phẩm của mình” để tránh trùng lặp).

- **Chương trình khuyến mãi của seller**
    - Campaign có `ownerType`: **PLATFORM** (sàn) hoặc **SELLER** (shop). Seller chỉ tạo/sửa/xóa campaign ownerType = SELLER và ownerId = shop mình.
    - Campaign seller có thể chứa nhiều voucher (cùng sellerId), thời gian nằm trong campaign.

- **Tham gia campaign sàn**
    - Sàn tạo campaign toàn sàn (vd: “11/11”), có thể cho phép seller **đăng ký tham gia** (opt-in): seller chọn sản phẩm/category của shop tham gia, voucher sàn áp cho đơn có sản phẩm đó. Hoặc sàn tạo voucher sàn áp toàn sàn, không cần seller opt-in.
    - Nếu có “đăng ký tham gia”: bảng trung gian kiểu `CampaignSeller` (campaignId, sellerId, status, productIds/categoryIds tham gia).

- **Báo cáo & giới hạn**
    - Seller xem: số lần dùng voucher của shop, doanh thu bị giảm (voucher seller), đơn dùng voucher. Không xem dữ liệu seller khác hoặc tổng hợp toàn sàn (trừ khi Admin cấp).
    - Sàn có thể giới hạn: số voucher tối đa mỗi seller đang active, ngân sách giảm tối đa theo tháng (tùy nghiệp vụ).

### 2.4 Luồng tạo voucher / campaign theo vai trò (tóm tắt)

```
[ADMIN]  → Tạo voucher sàn / campaign sàn
         → (Tùy chọn) Duyệt voucher/campaign do seller gửi

[SELLER] → Tạo voucher seller (sellerId = shop)
         → Tạo campaign seller, gán voucher
         → (Nếu có) Đăng ký tham gia campaign sàn

[CUSTOMER] → Chỉ dùng: chọn/nhập voucher khi checkout, xem "Voucher của tôi"
```

### 2.5 Phân bổ chiết khấu (Ai chịu phần giảm giá?)

Khi customer dùng voucher, phần tiền giảm có thể do **sàn** hoặc **seller** chịu (hoặc chia theo tỷ lệ):

| Nguồn voucher                        | Ai chịu chiết khấu (mặc định)                                          | Ghi chú                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Voucher sàn** (sellerId = null)    | Sàn (platform)                                                         | Sàn trừ doanh thu hoặc bù từ commission.                                                            |
| **Voucher seller** (sellerId = shop) | Seller (shop)                                                          | Trừ vào doanh thu đơn của shop khi đối soát.                                                        |
| **Campaign sàn, seller tham gia**    | Cấu hình theo campaign: 100% sàn, 100% seller, hoặc chia % (vd: 50-50) | Cần field kiểu `discountBearer: PLATFORM \| SELLER \| SHARED` và `platformSharePercent` nếu SHARED. |

- Khi tạo đơn: lưu `voucherDiscount` trên Order; nếu cần đối soát chi tiết, có thể thêm `OrderVoucherSplit` (orderId, voucherId, platformDiscount, sellerDiscount) để phân bổ cho từng đơn.
- Báo cáo seller: chỉ hiển thị phần discount **seller chịu** (voucher seller + phần seller trong campaign).

---

## 3. Phân tích mối liên hệ: Voucher vs Chương trình khuyến mãi

### 3.1 Hai khái niệm độc lập nhưng bổ trợ

- **Voucher** = _cơ chế áp dụng giảm giá_ (code, giá trị, điều kiện đơn, giới hạn dùng).
- **Chương trình khuyến mãi** = _bối cảnh marketing_ (tên, thời gian, kênh, mục tiêu, có thể gắn nhiều voucher hoặc quy tắc tự động).

Quan hệ điển hình:

```
Chương trình khuyến mãi (1)
    ├── Voucher A (mã công khai: SALE20)
    ├── Voucher B (mã riêng cho segment VIP)
    └── Quy tắc tự động: “Giảm 10% cho đơn đầu” (không cần code)
```

- Một **voucher** có thể thuộc **0 hoặc 1** chương trình (campaignId).
- Một **chương trình** có **nhiều voucher** và/hoặc **nhiều rule** (rule-based promotion không code).

### 3.2 So sánh nhanh

| Tiêu chí     | Voucher                                                | Chương trình khuyến mãi                                                 |
| ------------ | ------------------------------------------------------ | ----------------------------------------------------------------------- |
| Định danh    | Code (string)                                          | Id + tên chương trình                                                   |
| Cách áp dụng | User nhập code hoặc chọn từ danh sách                  | Tự động theo rule HOẶC qua voucher thuộc chương trình                   |
| Thời hạn     | startDate, endDate trên từng voucher                   | startDate, endDate trên chương trình (+ có thể kế thừa xuống voucher)   |
| Phạm vi      | Sản phẩm/đơn (minOrderValue, categoryIds, productIds…) | Có thể áp dụng cho nhiều voucher + rule (category, seller, flash sale…) |
| Đối tượng    | User (perUserLimit), toàn hệ thống (usageLimit)        | Có thể: toàn sàn, theo segment, theo seller                             |

---

## 4. Các case thực tế cho Voucher

### 4.1 Theo loại giảm giá (VoucherType)

| Loại              | Mô tả                                           | Ví dụ                | Lưu ý tính toán                                                |
| ----------------- | ----------------------------------------------- | -------------------- | -------------------------------------------------------------- |
| **PERCENTAGE**    | Giảm theo % giá trị đơn (thường có maxDiscount) | Giảm 20%, tối đa 50k | discount = min(orderSubTotal \* value/100, maxDiscount)        |
| **FIXED_AMOUNT**  | Giảm cố định số tiền                            | Giảm 30.000đ         | discount = value (không vượt quá orderSubTotal)                |
| **FREE_SHIPPING** | Miễn phí vận chuyển                             | Freeship toàn quốc   | Áp vào shippingFee; value có thể = 0 hoặc = shippingFee tối đa |

### 4.2 Theo nguồn phát hành

| Case                   | Mô tả                                               | Ai tạo       | Đối tượng áp dụng              |
| ---------------------- | --------------------------------------------------- | ------------ | ------------------------------ |
| Voucher sàn (platform) | Admin tạo, áp toàn sàn hoặc theo category/seller    | Admin        | Mọi user / segment             |
| Voucher seller         | Seller tạo cho shop mình                            | Seller       | Đơn có sản phẩm thuộc sellerId |
| Voucher theo campaign  | Tạo trong khuôn khổ 1 campaign (Flash Sale, 11/11…) | Admin/Seller | Theo rule campaign             |

### 4.3 Theo điều kiện áp dụng

- **Đơn tối thiểu (minOrderValue):** Chỉ áp khi tổng đơn (sau các giảm khác hoặc trước tùy quy ước) ≥ minOrderValue.
- **Sản phẩm:** Chỉ đơn có chứa productIds hoặc categoryIds nằm trong danh sách voucher.
- **Phương thức thanh toán (paymentMethods):** Chỉ áp khi user chọn VNPAY, COD, WALLET… (vd: “Chỉ áp dụng khi thanh toán VNPay”).
- **Thời gian:** startDate ≤ now ≤ endDate.
- **Số lần dùng:** usageLimit (toàn hệ thống), perUserLimit (mỗi user).

### 4.4 Case đặc biệt

- **Voucher một lần dùng (single-use):** usageLimit = 1 hoặc code unique per user (mã riêng từng user).
- **Voucher “đơn đầu”:** Điều kiện: user chưa từng có đơn thành công → cần check lịch sử order.
- **Voucher “sinh nhật”:** Điều kiện: tháng/ngày sinh trùng profile user + trong thời gian campaign.
- **Stack voucher:** Cho phép dùng nhiều voucher trong 1 đơn hay không (thường **không**; nếu có cần rule rõ thứ tự ưu tiên và cap tổng giảm).

---

## 5. Các case thực tế cho Chương trình khuyến mãi

### 5.1 Loại chương trình (Promotion Program Type)

| Loại                            | Mô tả                                               | Ví dụ                                     |
| ------------------------------- | --------------------------------------------------- | ----------------------------------------- |
| **Voucher Campaign**            | Tập hợp nhiều mã, cùng thời gian & mục tiêu         | “Tết 2026” — 5 mã SALE10, SALE20, FS50K…  |
| **Flash Sale**                  | Giảm giá theo khung giờ, số lượng (limited stock)   | 9h–12h giảm 50%, 100 sản phẩm đầu         |
| **Category Sale**               | Giảm theo danh mục (không cần code hoặc code chung) | Toàn bộ “Điện tử” giảm 15%                |
| **First Order**                 | Tự động giảm cho đơn đầu (có thể kèm voucher)       | Giảm 10% đơn đầu, code FIRST10            |
| **Loyalty / Tier**              | Giảm theo hạng thành viên                           | Gold: 5%, Platinum: 10%                   |
| **Event (11/11, Black Friday)** | Nhiều voucher + rule + flash sale trong 1 event     | Campaign “11/11” gồm voucher + flash sale |

### 5.2 Mối liên hệ với Voucher

- **Quan hệ 1-n:** Một Campaign có nhiều Voucher (campaignId trên Voucher).
- **Thời gian:** Campaign có start/end; voucher trong campaign nên nằm trong khoảng này (validate khi tạo/sửa).
- **Trạng thái:** Campaign ACTIVE → các voucher con mới được áp; Campaign DRAFT/ENDED → ẩn hoặc không cho áp.
- **Báo cáo:** Thống kê theo campaign (số voucher dùng, doanh thu giảm, đơn dùng voucher).

---

## 6. Luồng áp dụng voucher khi checkout

1. **User nhập code** (hoặc chọn từ danh sách “Voucher của tôi” / “Voucher khả dụng”).
2. **Validate voucher:**
    - Code tồn tại, isActive, startDate ≤ now ≤ endDate.
    - usageLimit: usedCount < usageLimit.
    - perUserLimit: số lần user này đã dùng voucher < perUserLimit.
    - minOrderValue: tổng đơn (đang tính) ≥ minOrderValue.
    - Sản phẩm trong giỏ thuộc productIds/categoryIds (nếu có).
    - Payment method user chọn nằm trong paymentMethods (nếu có).
3. **Tính discount:** Theo type (PERCENTAGE / FIXED_AMOUNT / FREE_SHIPPING), không vượt quá tổng đơn (và maxDiscount với %).
4. **Ghi nhận:** Khi đơn chuyển trạng thái “đã thanh toán” hoặc “confirmed”: tăng usedCount, tạo VoucherUsageLog (voucherId, userId, orderId, discount).

### 6.1 Edge cases

- **Đơn bị hủy / hoàn:** Có hoàn lại “quota” voucher không? (usedCount--, xóa hoặc đánh dấu void UsageLog — tùy chính sách.)
- **Đơn đổi trả một phần:** Giữ nguyên discount đã áp hay tính lại — cần rule rõ.
- **Hai user cùng lúc dùng voucher còn 1 slot:** Optimistic lock hoặc transaction + check usedCount trong DB khi apply.

---

## 7. Mô hình dữ liệu gợi ý (bổ sung / mở rộng)

### 7.1 Voucher (đã có trong plan, bổ sung field)

```prisma
model Voucher {
  id             String      @id @default(cuid())
  code           String      @unique
  type           VoucherType  // PERCENTAGE | FIXED_AMOUNT | FREE_SHIPPING
  value          Float       // % hoặc số tiền (VND), freeship có thể 0
  minOrderValue  Float?
  maxDiscount    Float?      // Cho PERCENTAGE
  usageLimit     Int?       // null = không giới hạn
  usedCount      Int        @default(0)
  perUserLimit   Int        @default(1)
  isActive       Boolean    @default(true)
  startDate      DateTime
  endDate       DateTime
  description    String?
  sellerId       String?    // null = voucher sàn
  categoryIds    String[]
  productIds     String[]
  paymentMethods String[]
  campaignId     String?    // @relation Campaign (nếu có bảng Campaign)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  orders         Order[]
  usageLogs      VoucherUsageLog[]
}
```

### 7.2 Chương trình khuyến mãi (Campaign / PromotionProgram)

```prisma
model PromotionCampaign {
  id          String   @id @default(cuid())
  name        String
  description String?
  type        String   // VOUCHER_CAMPAIGN | FLASH_SALE | CATEGORY_SALE | FIRST_ORDER | EVENT
  ownerType   String   // PLATFORM | SELLER
  ownerId     String?  // null nếu PLATFORM, sellerId nếu SELLER
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean  @default(true)
  createdBy   String?  // userId (admin/seller)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  vouchers    Voucher[]
  // Có thể mở rộng: rules (JSON), segmentIds, discountBearer (PLATFORM|SELLER|SHARED), platformSharePercent
}
```

### 7.3 Order (liên kết voucher)

- Order cần: `voucherId String?`, `voucherDiscount Decimal?` (số tiền đã giảm), quan hệ `voucher Voucher?`.

---

## 8. API & Quyền (gợi ý)

| Endpoint                  | Mô tả                                                   | Quyền                         |
| ------------------------- | ------------------------------------------------------- | ----------------------------- |
| GET /vouchers             | Danh sách voucher (admin: all, seller: của shop)        | voucher:read (admin/seller)   |
| GET /vouchers/me          | Voucher customer có thể dùng (theo giỏ hiện tại)        | User (CUSTOMER)               |
| POST /vouchers/validate   | Validate code + cart → trả về discount                  | User (CUSTOMER)               |
| POST /vouchers            | Tạo voucher (sàn: sellerId=null; seller: sellerId=shop) | voucher:create (admin/seller) |
| PATCH /vouchers/:id       | Sửa voucher (admin: mọi; seller: chỉ của shop)          | voucher:update                |
| DELETE /vouchers/:id      | Xóa / vô hiệu hóa                                       | voucher:delete                |
| GET /promotion-campaigns  | Danh sách campaign (admin: all, seller: của shop)       | campaign:read                 |
| POST /promotion-campaigns | Tạo campaign (admin: PLATFORM; seller: SELLER)          | campaign:create               |
| POST /campaigns/:id/join  | Seller đăng ký tham gia campaign sàn (nếu hỗ trợ)       | campaign:join (seller)        |
| GET /vouchers/report      | Báo cáo dùng voucher (admin: toàn sàn; seller: shop)    | voucher:read + scope          |

---

## 9. Tóm tắt triển khai module

1. **Voucher:**
    - Backend: module `vouchers` (CRUD, validate, apply khi tạo đơn, VoucherUsageLog).
    - Frontend: trang “Voucher của tôi”, ô nhập mã + danh sách khả dụng ở checkout, admin/seller quản lý voucher (AG Grid).

2. **Chương trình khuyến mãi:**
    - Backend: module `promotion-campaigns` hoặc `campaigns`, quan hệ 1-n với Voucher.
    - Frontend: trang quản lý campaign, tạo/sửa campaign và gán voucher.

3. **Order:**
    - Thêm `voucherId`, `voucherDiscount`; khi đặt đơn: validate → tính discount → lưu; khi thanh toán xong: ghi UsageLog, tăng usedCount.

4. **Edge cases:**
    - Hủy/hoàn đơn: chính sách hoàn quota; đồng thời: transaction + check usedCount; stack voucher: cấm hoặc rule rõ.

---

## 10. Bảng tra cứu nhanh — Case thực tế

| #   | Case                            | Thuộc              | Mô tả ngắn                          |
| --- | ------------------------------- | ------------------ | ----------------------------------- |
| 1   | Giảm % có trần                  | Voucher            | PERCENTAGE + maxDiscount            |
| 2   | Giảm tiền cố định               | Voucher            | FIXED_AMOUNT                        |
| 3   | Freeship                        | Voucher            | FREE_SHIPPING, áp vào shippingFee   |
| 4   | Đơn tối thiểu                   | Voucher            | minOrderValue                       |
| 5   | Chỉ áp cho sản phẩm/danh mục    | Voucher            | productIds, categoryIds             |
| 6   | Chỉ áp phương thức thanh toán   | Voucher            | paymentMethods                      |
| 7   | Giới hạn số lần toàn sàn        | Voucher            | usageLimit, usedCount               |
| 8   | Giới hạn số lần mỗi user        | Voucher            | perUserLimit                        |
| 9   | Voucher sàn vs voucher seller   | Voucher            | sellerId null = sàn                 |
| 10  | Voucher trong campaign          | Voucher + Campaign | campaignId                          |
| 11  | Campaign nhiều mã               | Campaign           | 1 campaign → n voucher              |
| 12  | Flash sale (giờ + số lượng)     | Campaign           | FlashSale type, rule riêng          |
| 13  | Giảm theo danh mục không code   | Campaign           | Category Sale, auto-apply           |
| 14  | Đơn đầu tiên                    | Campaign / Voucher | Điều kiện: chưa có đơn thành công   |
| 15  | Hủy/hoàn đơn                    | Edge               | Có hoàn quota voucher hay không     |
| 16  | Stack nhiều voucher             | Edge               | Thường không; nếu có cần rule rõ    |
| 17  | Voucher sàn vs seller (ai tạo)  | Actor              | Admin: sàn; Seller: shop (sellerId) |
| 18  | Campaign sàn vs campaign seller | Actor              | ownerType: PLATFORM \| SELLER       |
| 19  | Seller tham gia campaign sàn    | Actor (Seller)     | Opt-in, bảng CampaignSeller         |
| 20  | Ai chịu chiết khấu              | Actor / Data       | Sàn chịu / Seller chịu / Chia %     |

---

File này dùng làm đặc tả chi tiết cho module voucher và quản lý chương trình khuyến mãi, đồng bộ với cấu trúc trong `project-plan.md` và Prisma (Voucher, VoucherUsageLog, Order).
