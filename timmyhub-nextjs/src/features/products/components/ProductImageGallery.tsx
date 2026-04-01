'use client';

import { useState, useRef, useCallback } from 'react';
import { Box, Image, ActionIcon, Modal, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Iconify from '@/components/iconify/Iconify';

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
}

const ZOOM_SCALE = 2.5;
const THUMB_SIZE = 72;
const THUMB_GAP = 8;

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [zoomOpened, { open: openZoom, close: closeZoom }] = useDisclosure(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [isHovering, setIsHovering] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);

    const displayImages = images.length > 0 ? images : ['/placeholder-product.jpg'];
    const mainImage = displayImages[selectedIndex];

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = mainRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    }, []);

    return (
        <>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Main image */}
                <Box
                    ref={mainRef}
                    pos="relative"
                    style={{
                        aspectRatio: '1',
                        borderRadius: 'var(--mantine-radius-lg)',
                        overflow: 'hidden',
                        border: '1px solid var(--mantine-color-default-border)',
                        cursor: isHovering ? 'crosshair' : 'zoom-in',
                        background: 'var(--mantine-color-gray-0)',
                    }}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onMouseMove={handleMouseMove}
                    onClick={openZoom}
                >
                    <Image
                        src={mainImage}
                        alt={productName}
                        fit="cover"
                        style={{
                            width: '100%',
                            height: '100%',
                            transition: 'transform 0.1s ease',
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                            transform: isHovering ? `scale(${ZOOM_SCALE})` : 'scale(1)',
                            display: 'block',
                        }}
                    />

                    {/* Expand button */}
                    {!isHovering && (
                        <ActionIcon
                            variant="white"
                            size="md"
                            radius="md"
                            pos="absolute"
                            bottom={10}
                            right={10}
                            style={{ opacity: 0.85, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                            onClick={(e) => { e.stopPropagation(); openZoom(); }}
                        >
                            <Iconify icon="solar:maximize-square-bold" width={18} />
                        </ActionIcon>
                    )}

                    {/* Image counter badge */}
                    {displayImages.length > 1 && !isHovering && (
                        <Box
                            pos="absolute"
                            bottom={10}
                            left={10}
                            style={{
                                background: 'rgba(0,0,0,0.45)',
                                color: '#fff',
                                fontSize: 12,
                                padding: '2px 8px',
                                borderRadius: 20,
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            {selectedIndex + 1} / {displayImages.length}
                        </Box>
                    )}
                </Box>

                {/* Thumbnail strip */}
                {displayImages.length > 1 && (
                    <ScrollArea
                        type="never"
                        style={{ width: '100%' }}
                    >
                        <Box
                            style={{
                                display: 'flex',
                                gap: THUMB_GAP,
                                paddingBottom: 4,
                                width: 'max-content',
                            }}
                        >
                            {displayImages.map((img, index) => {
                                const isActive = selectedIndex === index;
                                return (
                                    <Box
                                        key={`${img}-${index}`}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        onClick={() => setSelectedIndex(index)}
                                        style={{
                                            width: THUMB_SIZE,
                                            height: THUMB_SIZE,
                                            flexShrink: 0,
                                            borderRadius: 'var(--mantine-radius-md)',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: isActive
                                                ? '2px solid var(--mantine-color-blue-5)'
                                                : '2px solid transparent',
                                            outline: isActive
                                                ? '1px solid var(--mantine-color-blue-3)'
                                                : '1px solid var(--mantine-color-default-border)',
                                            opacity: isActive ? 1 : 0.65,
                                            transition: 'opacity 0.15s, border-color 0.15s, transform 0.15s',
                                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) e.currentTarget.style.opacity = '0.65';
                                        }}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${productName} ${index + 1}`}
                                            fit="cover"
                                            style={{ width: '100%', height: '100%', display: 'block' }}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>
                    </ScrollArea>
                )}
            </Box>

            {/* Lightbox modal */}
            <Modal
                opened={zoomOpened}
                onClose={closeZoom}
                size="xl"
                centered
                withCloseButton={false}
                padding={0}
                styles={{ body: { padding: 0 }, content: { overflow: 'hidden' } }}
            >
                <Box pos="relative" bg="dark.9">
                    {/* Close */}
                    <ActionIcon
                        variant="filled"
                        color="dark"
                        size="lg"
                        radius="md"
                        pos="absolute"
                        top={10}
                        right={10}
                        style={{ zIndex: 10 }}
                        onClick={closeZoom}
                    >
                        <Iconify icon="solar:close-circle-bold" width={20} />
                    </ActionIcon>

                    {/* Prev / Next */}
                    {displayImages.length > 1 && (
                        <>
                            <ActionIcon
                                variant="filled"
                                color="dark"
                                size="lg"
                                radius="xl"
                                pos="absolute"
                                left={10}
                                top="50%"
                                style={{ zIndex: 10, transform: 'translateY(-50%)' }}
                                onClick={() => setSelectedIndex(i => (i - 1 + displayImages.length) % displayImages.length)}
                            >
                                <Iconify icon="solar:arrow-left-bold" width={18} />
                            </ActionIcon>
                            <ActionIcon
                                variant="filled"
                                color="dark"
                                size="lg"
                                radius="xl"
                                pos="absolute"
                                right={10}
                                top="50%"
                                style={{ zIndex: 10, transform: 'translateY(-50%)' }}
                                onClick={() => setSelectedIndex(i => (i + 1) % displayImages.length)}
                            >
                                <Iconify icon="solar:arrow-right-bold" width={18} />
                            </ActionIcon>
                        </>
                    )}

                    <Image
                        src={mainImage}
                        alt={productName}
                        fit="contain"
                        style={{ maxHeight: '75vh', width: '100%' }}
                    />

                    {/* Thumbnail strip in modal */}
                    {displayImages.length > 1 && (
                        <ScrollArea
                            type="never"
                            p="sm"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <Box style={{ display: 'flex', gap: 8, justifyContent: 'center', width: 'max-content', margin: '0 auto' }}>
                                {displayImages.map((img, index) => {
                                    const isActive = selectedIndex === index;
                                    return (
                                        <Box
                                            key={`modal-${img}-${index}`}
                                            onClick={() => setSelectedIndex(index)}
                                            style={{
                                                width: 56,
                                                height: 56,
                                                flexShrink: 0,
                                                borderRadius: 6,
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: isActive ? '2px solid var(--mantine-color-blue-4)' : '2px solid rgba(255,255,255,0.15)',
                                                opacity: isActive ? 1 : 0.5,
                                                transition: 'opacity 0.15s, border-color 0.15s',
                                            }}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${productName} ${index + 1}`}
                                                fit="cover"
                                                style={{ width: '100%', height: '100%', display: 'block' }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Box>
                        </ScrollArea>
                    )}
                </Box>
            </Modal>
        </>
    );
}
