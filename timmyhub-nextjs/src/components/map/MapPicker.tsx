'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Text, Group, ActionIcon, Loader } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';

interface LatLng { lat: number; lng: number; }

interface Props {
    center?: LatLng;
    searchAddress?: string; // e.g. "Hoàn Kiếm, Hà Nội" — auto geocode & pan
    onLocationSelect?: (latlng: LatLng, address?: string) => void;
    height?: number;
    readonly?: boolean;
}

const DEFAULT_CENTER: LatLng = { lat: 21.0285, lng: 105.8542 };

export function MapPicker({ center, searchAddress, onLocationSelect, height = 220, readonly = false }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<import('leaflet').Map | null>(null);
    const markerRef = useRef<import('leaflet').Marker | null>(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<LatLng | null>(center ?? null);

    // Geocode helper
    const geocode = useCallback(async (query: string): Promise<LatLng | null> => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=vn`,
                { headers: { 'Accept-Language': 'vi' } }
            );
            const data = await res.json() as Array<{ lat: string; lon: string }>;
            if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        } catch { /* ignore */ }
        return null;
    }, []);

    const moveMarker = useCallback((L: typeof import('leaflet'), latlng: LatLng) => {
        if (!mapRef.current) return;
        if (markerRef.current) {
            markerRef.current.setLatLng([latlng.lat, latlng.lng]);
        } else {
            markerRef.current = L.marker([latlng.lat, latlng.lng]).addTo(mapRef.current);
        }
        mapRef.current.setView([latlng.lat, latlng.lng], 15, { animate: true });
        setSelected(latlng);
    }, []);

    // Init map once
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Prevent double-init (React StrictMode)
        if (mapRef.current) return;

        void import('leaflet').then(L => {
            if (!container || mapRef.current) return;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            const map = L.map(container, {
                center: [center?.lat ?? DEFAULT_CENTER.lat, center?.lng ?? DEFAULT_CENTER.lng],
                zoom: 13,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            if (center) {
                markerRef.current = L.marker([center.lat, center.lng]).addTo(map);
                setSelected(center);
            }

            if (!readonly) {
                map.on('click', async (e: import('leaflet').LeafletMouseEvent) => {
                    const { lat, lng } = e.latlng;
                    moveMarker(L, { lat, lng });
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                            { headers: { 'Accept-Language': 'vi' } }
                        );
                        const data = await res.json() as { display_name?: string };
                        onLocationSelect?.({ lat, lng }, data.display_name);
                    } catch {
                        onLocationSelect?.({ lat, lng });
                    }
                });
            }

            mapRef.current = map;
            setLoading(false);
        });

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Pan to searchAddress when it changes (province/district/ward selected)
    useEffect(() => {
        if (!searchAddress || !mapRef.current) return;
        void import('leaflet').then(async L => {
            const latlng = await geocode(searchAddress);
            if (latlng) moveMarker(L, latlng);
        });
    }, [searchAddress, geocode, moveMarker]);

    // Pan to explicit center prop
    useEffect(() => {
        if (!center || !mapRef.current) return;
        void import('leaflet').then(L => moveMarker(L, center));
    }, [center?.lat, center?.lng, moveMarker]);

    const handleLocateMe = () => {
        if (!navigator.geolocation || !mapRef.current) return;
        navigator.geolocation.getCurrentPosition(pos => {
            const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            void import('leaflet').then(L => {
                moveMarker(L, latlng);
                onLocationSelect?.(latlng);
            });
        });
    };

    return (
        <Box style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--mantine-color-default-border)' }}>
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

            {loading && (
                <Box style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--mantine-color-gray-1)', zIndex: 10, height }}>
                    <Loader size="sm" />
                </Box>
            )}

            <div ref={containerRef} style={{ height, width: '100%' }} />

            {!readonly && (
                <Box pos="absolute" top={8} right={8} style={{ zIndex: 1000 }}>
                    <ActionIcon size={32} radius="md" variant="white"
                        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                        onClick={handleLocateMe} title="Vị trí của tôi">
                        <Iconify icon="solar:target-bold" width={18} />
                    </ActionIcon>
                </Box>
            )}

            {selected && (
                <Box pos="absolute" bottom={8} left={8} style={{ zIndex: 1000 }}>
                    <Group gap={4} p="xs" style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 6, backdropFilter: 'blur(4px)' }}>
                        <Iconify icon="solar:map-point-bold" width={14} color="var(--mantine-color-blue-6)" />
                        <Text size="xs" c="dimmed">{selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}</Text>
                    </Group>
                </Box>
            )}
        </Box>
    );
}
