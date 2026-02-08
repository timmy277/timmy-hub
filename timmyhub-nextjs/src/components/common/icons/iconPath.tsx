import { rem } from '@mantine/core';

interface IconProps {
    w?: number | string;
    h?: number | string;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const FlagVN = ({ w = 20, h = 14, style, ...others }: IconProps) => (
    <svg
        viewBox="0 0 30 20"
        style={{
            width: typeof w === 'number' ? rem(w) : w,
            height: typeof h === 'number' ? rem(h) : h,
            borderRadius: rem(2),
            ...style
        }}
        {...others}
    >
        <rect width="30" height="20" fill="#da251d" />
        <polygon
            fill="#ffff00"
            points="15,4 16.12,8.47 20.75,8.47 17.01,11.23 18.13,15.71 14.39,12.95 10.65,15.71 11.77,11.23 8.03,8.47 12.66,8.47"
        />
    </svg>
);

export const FlagUK = ({ w = 20, h = 14, style, ...others }: IconProps) => (
    <svg
        viewBox="0 0 60 30"
        style={{
            width: typeof w === 'number' ? rem(w) : w,
            height: typeof h === 'number' ? rem(h) : h,
            borderRadius: rem(2),
            ...style
        }}
        {...others}
    >
        <clipPath id="s">
            <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#012169" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#s)" stroke="#c8102e" strokeWidth="2" />
    </svg>
);
