'use client';

/**
 * Hook subscribe Socket.io namespace /reviews để nhận review mới real-time
 * và cập nhật ratingAvg khi có thay đổi
 */
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Review } from '@/types/review';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface UseReviewSocketOptions {
    productId: string;
    onNewReview: (review: Review) => void;
    onRatingUpdated: (data: { ratingAvg: number; ratingCount: number }) => void;
}

export function useReviewSocket({ productId, onNewReview, onRatingUpdated }: UseReviewSocketOptions) {
    const socketRef = useRef<Socket | null>(null);
    const onNewReviewRef = useRef(onNewReview);
    const onRatingUpdatedRef = useRef(onRatingUpdated);

    // Giữ callbacks luôn mới nhất mà không trigger reconnect
    useEffect(() => {
        onNewReviewRef.current = onNewReview;
        onRatingUpdatedRef.current = onRatingUpdated;
    });

    const connect = useCallback(() => {
        const socket = io(`${SOCKET_URL}/reviews`, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            socket.emit('join:product', productId);
        });

        socket.on('review:new', (review: Review) => {
            onNewReviewRef.current(review);
        });

        socket.on('rating:updated', (data: { ratingAvg: number; ratingCount: number }) => {
            onRatingUpdatedRef.current(data);
        });

        socketRef.current = socket;
        return socket;
    }, [productId]);

    useEffect(() => {
        const socket = connect();

        return () => {
            socket.emit('leave:product', productId);
            socket.disconnect();
        };
    }, [connect, productId]);
}
