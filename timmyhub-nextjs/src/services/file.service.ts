import axiosClient from '../libs/axios';

export const fileService = {
    /** Upload ảnh (max 5MB) */
    upload: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /** Upload ảnh hoặc video review (max 50MB) — trả về { url, type } */
    uploadMedia: async (
        file: File,
        onProgress?: (pct: number) => void,
    ): Promise<{ url: string; type: 'image' | 'video' }> => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post('/files/upload-media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (evt) => {
                if (evt.total && onProgress) {
                    onProgress(Math.round((evt.loaded / evt.total) * 100));
                }
            },
        });
    },
};
