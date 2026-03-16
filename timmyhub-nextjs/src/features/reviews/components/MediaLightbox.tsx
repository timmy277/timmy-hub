'use client';

import { useState } from 'react';
import { Modal, Group, Box } from '@mantine/core';
import Image from 'next/image';

interface MediaItem {
    src: string;
    type: 'image' | 'video';
}

interface MediaLightboxProps {
    items: MediaItem[];
    startIndex: number;
    onClose: () => void;
}

export function MediaLightbox({ items, startIndex, onClose }: MediaLightboxProps) {
    const [idx, setIdx] = useState(startIndex);
    const item = items[idx];

    return (
        <Modal
            opened
            onClose={onClose}
            size="xl"
            centered
            padding={0}
            withCloseButton
            styles={{ body: { padding: 0, background: '#000' } }}
        >
            <Box className="relative bg-black min-h-[360px] flex items-center justify-center">
                {item.type === 'image' ? (
                    <Image
                        src={item.src}
                        alt="Review media"
                        width={800}
                        height={600}
                        className="max-w-full max-h-[70vh] object-contain"
                    />
                ) : (
                    <video
                        src={item.src}
                        controls
                        autoPlay
                        className="max-w-full max-h-[70vh]"
                    />
                )}
            </Box>
            {items.length > 1 && (
                <Group justify="center" p="sm" className="bg-[#111] gap-xs">
                    {items.map((it, i) => (
                        <Box
                            key={i}
                            onClick={() => setIdx(i)}
                            className="w-[52px] h-[52px] rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-orange-500 transition-colors shrink-0"
                            style={{
                                border: i === idx ? '2px solid var(--mantine-color-orange-5)' : '2px solid transparent',
                            }}
                        >
                            {it.type === 'image' ? (
                                <Image
                                    src={it.src}
                                    alt=""
                                    width={52}
                                    height={52}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <video src={it.src} className="w-full h-full object-cover" />
                            )}
                        </Box>
                    ))}
                </Group>
            )}
        </Modal>
    );
}
