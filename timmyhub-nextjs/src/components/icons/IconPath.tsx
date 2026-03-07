import React from 'react';

const icons = {
    'message-circle': (
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    ),
    x: (
        <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </>
    ),
    send: (
        <>
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </>
    ),
};

export type IconName = keyof typeof icons;

interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: IconName;
    size?: number | string;
    color?: string;
}

export const IconPath = ({
    name,
    size = 24,
    color = 'currentColor',
    ...props
}: IconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {icons[name]}
        </svg>
    );
};
