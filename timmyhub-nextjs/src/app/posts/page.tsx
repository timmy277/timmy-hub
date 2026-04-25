import { Suspense } from 'react';
import { PostsPage } from '@/features/posts/PostsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Video & Bài đăng - TimmyHub' };

export default function Page() {
    return (
        <Suspense>
            <PostsPage />
        </Suspense>
    );
}
