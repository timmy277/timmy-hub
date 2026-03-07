export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/quicktime', // .mov + iPhone
    'video/webm',
    'video/x-m4v',
];

export const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
export const MAX_MEDIA_SIZE = 50 * 1024 * 1024; // 50MB
