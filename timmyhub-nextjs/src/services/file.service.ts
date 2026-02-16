import axiosClient from '../libs/axios';

export const fileService = {
    upload: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        
        return axiosClient.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};
