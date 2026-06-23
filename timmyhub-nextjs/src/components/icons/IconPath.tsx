import React from 'react';
import { rem } from '@mantine/core';
interface IconRenderContext {
    color?: string;
    fill?: string;
    stroke?: string;
}

interface IconConfig {
    viewBox: string;
    defaultSize: number | { width: number; height: number };
    content: React.ReactNode | ((ctx: IconRenderContext) => React.ReactNode);
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    borderRadius?: number;
    label?: string;
}

const icons = {
    'message-circle': {
        viewBox: '0 0 24 24',
        defaultSize: 24,
        content: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        label: 'message',
    },
    x: {
        viewBox: '0 0 24 24',
        defaultSize: 24,
        content: (
            <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </>
        ),
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        label: 'close',
    },
    send: {
        viewBox: '0 0 24 24',
        defaultSize: 24,
        content: (
            <>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </>
        ),
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        label: 'send',
    },
    'flag-vn': {
        viewBox: '0 0 30 20',
        defaultSize: { width: 20, height: 14 },
        content: (
            <>
                <rect width="30" height="20" fill="#da251d" />
                <polygon
                    fill="#ffff00"
                    points="15,4 16.12,8.47 20.75,8.47 17.01,11.23 18.13,15.71 14.39,12.95 10.65,15.71 11.77,11.23 8.03,8.47 12.66,8.47"
                />
            </>
        ),
        borderRadius: 2,
        label: 'Vietnam flag',
    },
    'flag-uk': {
        viewBox: '0 0 60 30',
        defaultSize: { width: 20, height: 14 },
        content: (
            <>
                <clipPath id="uk-clip">
                    <path d="M0,0 v30 h60 v-30 z" />
                </clipPath>
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#012169" strokeWidth="4" />
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
                <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-clip)" stroke="#c8102e" strokeWidth="2" />
            </>
        ),
        borderRadius: 2,
        label: 'UK flag',
    },
} satisfies Record<string, IconConfig>;

export type IconName = keyof typeof icons;

export interface IconPathProps extends Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> {
    name: IconName;
    size?: number | string;
    color?: string;
    decorative?: boolean;
}

export const IconPath = React.memo(({
    name,
    size,
    color,
    decorative,
    style,
    fill,
    stroke,
    'aria-label': ariaLabel,
    ...rest
}: IconPathProps) => {
    const config = icons[name] as IconConfig;

    if (!config) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    let width: string | number;
    let height: string | number;

    if (typeof config.defaultSize === 'number') {
        const finalSize = size ?? config.defaultSize;
        width = typeof finalSize === 'number' ? rem(finalSize) : finalSize;
        height = width;
    } else {
        const { width: defaultWidth, height: defaultHeight } = config.defaultSize;
        const finalSize = size ?? defaultWidth;
        const aspectRatio = defaultHeight / defaultWidth;

        if (typeof finalSize === 'number') {
            width = rem(finalSize);
            height = rem(finalSize * aspectRatio);
        } else {
            width = finalSize;
            height = rem(defaultHeight);
        }
    }

    const mergedStyle: React.CSSProperties = {
        flexShrink: 0,
        ...style,
        width,
        height,
    };

    if (config.borderRadius) {
        mergedStyle.borderRadius = rem(config.borderRadius);
    }

    const finalFill = fill ?? (config.fill === 'currentColor' ? color ?? 'currentColor' : config.fill ?? 'currentColor');
    const finalStroke = stroke ?? (config.stroke === 'currentColor' ? color ?? 'currentColor' : config.stroke);
    const resolvedContent =
        typeof config.content === 'function'
            ? config.content({ color, fill: finalFill, stroke: finalStroke })
            : config.content;

    const a11yProps = decorative
        ? { 'aria-hidden': true as const }
        : { role: 'img' as const, 'aria-label': ariaLabel ?? config.label ?? name };

    return (
        <svg
            viewBox={config.viewBox}
            style={mergedStyle}
            fill={finalFill}
            stroke={finalStroke}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...a11yProps}
            {...rest}
        >
            {resolvedContent}
        </svg>
    );
});

IconPath.displayName = 'IconPath';