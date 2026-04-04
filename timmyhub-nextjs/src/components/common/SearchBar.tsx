'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, Paper, Stack, Text, Box, Loader, Group, Image, Badge } from '@mantine/core';
import { useDebouncedValue, useClickOutside } from '@mantine/hooks';
import Iconify from '@/components/iconify/Iconify';
import { searchService } from '@/services/search.service';
import { useQuery } from '@tanstack/react-query';
import { formatVND } from '@/utils/currency';
import Link from 'next/link';

export function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const [debouncedQuery] = useDebouncedValue(query, 280);
    const ref = useClickOutside(() => setFocused(false));
    const inputRef = useRef<HTMLInputElement>(null);

    const isActive = focused && debouncedQuery.trim().length >= 2;

    const { data, isFetching } = useQuery({
        queryKey: ['search-preview', debouncedQuery],
        queryFn: () => searchService.search({ q: debouncedQuery, limit: 6 }),
        enabled: isActive,
        staleTime: 30_000,
    });

    const products = data?.data ?? [];

    const handleSearch = useCallback((q: string) => {
        if (!q.trim()) return;
        setFocused(false);
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }, [router]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch(query);
        if (e.key === 'Escape') { setFocused(false); inputRef.current?.blur(); }
    };

    const showDropdown = focused && query.trim().length >= 2;

    return (
        <Box ref={ref} style={{ position: 'relative', flex: 1, maxWidth: 520 }}>
            <TextInput
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                placeholder="Tìm kiếm sản phẩm..."
                radius="md"
                size="sm"
                bg="gray.1"
                styles={{
                    input: {
                        backgroundColor: 'var(--mantine-color-gray-1)',
                        border: focused
                            ? '1px solid var(--mantine-primary-color-filled)'
                            : '1px solid var(--mantine-color-default-border)',
                        transition: 'border-color 0.15s',
                    },
                }}
                leftSection={
                    isFetching
                        ? <Loader size={14} />
                        : <Iconify icon="solar:magnifer-linear" width={16} style={{ opacity: 0.5 }} />
                }
                rightSection={
                    query ? (
                        <Iconify
                            icon="solar:close-circle-bold"
                            width={16}
                            style={{ cursor: 'pointer', opacity: 0.4 }}
                            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                        />
                    ) : null
                }
            />

            {/* Dropdown */}
            {showDropdown && (
                <Paper
                    shadow="xl"
                    radius="md"
                    withBorder
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        overflow: 'hidden',
                        maxHeight: 420,
                        overflowY: 'auto',
                    }}
                >
                    <Stack gap={0}>
                        {/* Loading */}
                        {isFetching && products.length === 0 && (
                            <Box px="md" py="sm">
                                <Text size="sm" c="dimmed">Đang tìm kiếm...</Text>
                            </Box>
                        )}

                        {/* Product results */}
                        {products.map(p => (
                            <Box
                                key={p.id}
                                component={Link}
                                href={`/product/${p.slug}`}
                                onClick={() => setFocused(false)}
                                px="md"
                                py="xs"
                                style={{
                                    display: 'block',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--mantine-color-gray-0)')}
                                onMouseLeave={e => (e.currentTarget.style.background = '')}
                            >
                                <Group gap="sm" wrap="nowrap">
                                    <Image
                                        src={p.images?.[0] ?? '/placeholder-product.jpg'}
                                        w={40} h={40} radius="sm" fit="cover"
                                        alt={p.name}
                                        style={{ flexShrink: 0 }}
                                    />
                                    <Box style={{ flex: 1, minWidth: 0 }}>
                                        <Text size="sm" fw={500} truncate="end"
                                            dangerouslySetInnerHTML={{
                                                __html: p.highlight?.name?.[0] ?? p.name
                                            }}
                                        />
                                        <Group gap="xs">
                                            <Text size="xs" c="blue" fw={700}>{formatVND(p.price)}</Text>
                                            {p.discount > 0 && (
                                                <Badge size="xs" color="red" variant="light">-{p.discount}%</Badge>
                                            )}
                                        </Group>
                                    </Box>
                                </Group>
                            </Box>
                        ))}

                        {/* No results */}
                        {!isFetching && products.length === 0 && (
                            <Box px="md" py="sm">
                                <Text size="sm" c="dimmed">Không tìm thấy sản phẩm nào</Text>
                            </Box>
                        )}

                        {/* View all */}
                        {products.length > 0 && (
                            <Box
                                px="md"
                                py="sm"
                                style={{
                                    borderTop: '1px solid var(--mantine-color-default-border)',
                                    cursor: 'pointer',
                                    background: 'var(--mantine-color-gray-0)',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--mantine-color-blue-0)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'var(--mantine-color-gray-0)')}
                                onClick={() => handleSearch(query)}
                            >
                                <Group gap="xs" justify="center">
                                    <Iconify icon="solar:magnifer-bold" width={14} color="var(--mantine-color-blue-6)" />
                                    <Text size="sm" c="blue" fw={500}>
                                        Xem tất cả kết quả cho &quot;{query}&quot;
                                    </Text>
                                </Group>
                            </Box>
                        )}
                    </Stack>
                </Paper>
            )}
        </Box>
    );
}
