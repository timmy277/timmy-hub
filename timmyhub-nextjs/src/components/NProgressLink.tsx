'use client';

import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import { MouseEvent, ReactNode } from 'react';

interface NProgressLinkProps extends LinkProps {
    children: ReactNode;
    className?: string;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function NProgressLink({ children, href, onClick, ...props }: NProgressLinkProps) {
    const router = useRouter();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        // Call custom onClick if provided
        if (onClick) {
            onClick(e);
        }

        // Don't start progress if default is prevented or it's a new tab
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) {
            return;
        }

        // Don't start progress for same page navigation
        const currentPath = window.location.pathname + window.location.search;
        const targetPath = typeof href === 'string' ? href : href.pathname || '';
        if (currentPath === targetPath) {
            return;
        }

        e.preventDefault();
        NProgress.start();

        // Navigate programmatically
        if (typeof href === 'string') {
            router.push(href);
        } else {
            router.push(href.pathname || '/');
        }
    };

    return (
        <Link href={href} onClick={handleClick} {...props}>
            {children}
        </Link>
    );
}
