'use client';

import { Box } from '@mantine/core';

interface RichTextContentProps {
    html: string | null | undefined;
    c?: string;
    size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
};

export function RichTextContent({ html, c, size = 'md' }: RichTextContentProps) {
    if (!html || html === '<p></p>') return null;

    return (
        <Box
            c={c}
            style={{ fontSize: SIZE_MAP[size] }}
            className="rich-text-content"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
