'use client';

import { useState } from 'react';
import { Box, Image, Group, ActionIcon, Modal, Stack } from '@mantine/core';
import { IconZoomIn, IconX } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
interface ProductImageGalleryProps {
    images: string[];
    productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [zoomOpened, { open: openZoom, close: closeZoom }] = useDisclosure(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [showZoom, setShowZoom] = useState(false);

    const mainImage = images[selectedIndex] || images[0] || '/placeholder-product.jpg';
    const displayImages = images.length > 0 ? images : ['/placeholder-product.jpg'];

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!showZoom) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };

    return (
        <>
            <Stack gap="md">
                {/* Main Image with Zoom */}
                <Box
                    pos="relative"
                    style={{
                        aspectRatio: '1',
                        borderRadius: 'var(--mantine-radius-md)',
                        overflow: 'hidden',
                        cursor: showZoom ? 'zoom-in' : 'pointer',
                        border: '1px solid var(--mantine-color-default-border)',
                    }}
                    onMouseEnter={() => setShowZoom(true)}
                    onMouseLeave={() => setShowZoom(false)}
                    onMouseMove={handleMouseMove}
                    onClick={openZoom}
                >
                    <Image
                        src={mainImage}
                        alt={productName}
                        fit="cover"
                        style={{ width: '100%', height: '100%' }}
                    />
                    {showZoom && (
                        <Box
                            pos="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            style={{
                                backgroundImage: `url(${mainImage})`,
                                backgroundSize: '200%',
                                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                opacity: 0,
                                pointerEvents: 'none',
                            }}
                        />
                    )}
                    <ActionIcon
                        variant="filled"
                        color="blue"
                        size="lg"
                        radius="md"
                        pos="absolute"
                        top={10}
                        right={10}
                        onClick={(e) => {
                            e.stopPropagation();
                            openZoom();
                        }}
                    >
                        <IconZoomIn size={20} />
                    </ActionIcon>
                </Box>

                {/* Thumbnail Gallery */}
                {displayImages.length > 1 && (
                    <Group gap="xs" justify="center">
                        {displayImages.map((img, index) => (
                            <Box
                                key={img}
                                onClick={() => setSelectedIndex(index)}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 'var(--mantine-radius-sm)',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border:
                                        selectedIndex === index
                                            ? '2px solid var(--mantine-color-blue-6)'
                                            : '1px solid var(--mantine-color-default-border)',
                                    opacity: selectedIndex === index ? 1 : 0.7,
                                    transition: 'opacity 0.2s, border-color 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedIndex !== index) {
                                        e.currentTarget.style.opacity = '0.7';
                                    }
                                }}
                            >
                                <Image
                                    src={img}
                                    alt={`${productName} - ${index + 1}`}
                                    fit="cover"
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </Box>
                        ))}
                    </Group>
                )}
            </Stack>

            {/* Zoom Modal */}
            <Modal
                opened={zoomOpened}
                onClose={closeZoom}
                size="xl"
                centered
                withCloseButton={false}
                padding={0}
            >
                <Box pos="relative">
                    <ActionIcon
                        variant="filled"
                        color="dark"
                        size="lg"
                        radius="md"
                        className="absolute top-[10px] right-[10px] z-10"
                        onClick={closeZoom}
                    >
                        <IconX size={20} />
                    </ActionIcon>
                    <Image
                        src={mainImage}
                        alt={productName}
                        fit="contain"
                        style={{ maxHeight: '80vh', width: '100%' }}
                    />
                    {displayImages.length > 1 && (
                        <Group
                            gap="xs"
                            justify="center"
                            p="md"
                            style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
                        >
                            {displayImages.map((img, index) => (
                                <Box
                                    key={img}
                                    onClick={() => setSelectedIndex(index)}
                                    style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 'var(--mantine-radius-sm)',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border:
                                            selectedIndex === index
                                                ? '2px solid var(--mantine-color-blue-6)'
                                                : '1px solid var(--mantine-color-default-border)',
                                        opacity: selectedIndex === index ? 1 : 0.6,
                                    }}
                                >
                                    <Image
                                        src={img}
                                        alt={`${productName} - ${index + 1}`}
                                        fit="cover"
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </Box>
                            ))}
                        </Group>
                    )}
                </Box>
            </Modal>
        </>
    );
}
