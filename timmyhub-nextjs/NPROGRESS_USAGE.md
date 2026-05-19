# NProgress Usage Guide

NProgress đã được cài đặt và cấu hình để hiển thị thanh loading khi chuyển trang.

## Cách hoạt động

### Tự động (Recommended)

NProgress tự động chạy khi route thay đổi. Không cần thay đổi code, chỉ cần dùng Next.js Link như bình thường:

```tsx
import Link from 'next/link';

<Link href="/products">View Products</Link>;
```

### Thủ công với NProgressLink (Optional)

Nếu muốn control tốt hơn, dùng `NProgressLink`:

```tsx
import { NProgressLink } from '@/components';

<NProgressLink href="/products">View Products</NProgressLink>;
```

## Programmatic Navigation

Nếu dùng `useRouter` để navigate, thêm NProgress thủ công:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';

export function MyComponent() {
    const router = useRouter();

    const handleClick = () => {
        NProgress.start();
        router.push('/products');
        // NProgress.done() sẽ tự động được gọi khi route thay đổi
    };

    return <button onClick={handleClick}>Go to Products</button>;
}
```

## Custom Styling

NProgress đã được style trong `globals.css`:

- Màu: Blue gradient (#228be6 → #1971c2)
- Chiều cao: 3px
- Position: Fixed top
- Z-index: 9999

Để thay đổi màu, edit trong `src/app/globals.css`:

```css
#nprogress .bar {
    background: linear-gradient(90deg, #your-color 0%, #your-color-dark 100%);
}
```

## Configuration

NProgress được config trong `NProgressBar.tsx`:

```tsx
NProgress.configure({
    showSpinner: false, // Ẩn spinner
    trickleSpeed: 200, // Tốc độ tăng dần
    minimum: 0.08, // Giá trị tối thiểu
    easing: 'ease', // Animation easing
    speed: 500, // Tốc độ animation
});
```

## Examples

### Header Navigation

```tsx
import { NProgressLink } from '@/components';

export function Header() {
    return (
        <nav>
            <NProgressLink href="/">Home</NProgressLink>
            <NProgressLink href="/products">Products</NProgressLink>
            <NProgressLink href="/about">About</NProgressLink>
        </nav>
    );
}
```

### Product Card

```tsx
import { NProgressLink } from '@/components';

export function ProductCard({ product }) {
    return (
        <NProgressLink href={`/products/${product.id}`}>
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
        </NProgressLink>
    );
}
```

### Form Submit with Redirect

```tsx
'use client';

import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';

export function CheckoutForm() {
    const router = useRouter();

    const handleSubmit = async e => {
        e.preventDefault();

        // Process form...
        await processCheckout();

        // Navigate with progress
        NProgress.start();
        router.push('/orders/success');
    };

    return <form onSubmit={handleSubmit}>...</form>;
}
```

## Troubleshooting

### Progress bar không hiện

- Kiểm tra `NProgressBar` đã được thêm vào `layout.tsx`
- Kiểm tra CSS đã được import trong `globals.css`

### Progress bar không tắt

- Đảm bảo `usePathname` và `useSearchParams` được dùng trong `NProgressBar`
- Kiểm tra không có lỗi trong navigation

### Progress bar chạy khi click cùng trang

- Dùng `NProgressLink` thay vì `Link` để tự động check same page

## Best Practices

1. ✅ Dùng Next.js `Link` cho navigation thông thường
2. ✅ Dùng `NProgressLink` khi cần custom behavior
3. ✅ Gọi `NProgress.start()` trước khi navigate programmatically
4. ✅ Không cần gọi `NProgress.done()` - tự động xử lý
5. ❌ Không dùng NProgress cho form submission không redirect
6. ❌ Không dùng cho API calls (dùng loading state thay vì)
