'use client';

/**
 * AppBreadcrumbs - Breadcrumb component nhất quán trên toàn app
 * Style giống admin: IconChevronRight làm separator, item cuối fw={600} c="blue"
 */

import { Breadcrumbs, Anchor, Text, Group } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';

export interface BreadcrumbItem {
    title: string;
    href?: string;
    icon?: React.ReactNode;
}

interface AppBreadcrumbsProps {
    items: BreadcrumbItem[];
    mb?: string | number;
}

export function AppBreadcrumbs({ items, mb = 'xl' }: AppBreadcrumbsProps) {
    return (
        <Breadcrumbs
            separator={<Iconify icon="solar:alt-arrow-right" width={14} opacity={0.5} />}
            mb={mb}
        >
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const isFirst = index === 0;

                // Dùng component="span" để tránh <div> bên trong <p> hay <a>
                const content = (
                    <Group component="span" gap={4} wrap="nowrap">
                        {isFirst && !item.icon && <Iconify icon="solar:home-2-bold" width={14} />}
                        {item.icon}
                        <span>{item.title}</span>
                    </Group>
                );

                if (isLast || !item.href) {
                    return (
                        <Text key={index} component="span" size="sm" fw={600} c="blue">
                            {content}
                        </Text>
                    );
                }

                return (
                    <Anchor
                        key={index}
                        component={Link}
                        href={item.href}
                        size="sm"
                        c="dimmed"
                    >
                        {content}
                    </Anchor>
                );
            })}
        </Breadcrumbs>
    );
}
