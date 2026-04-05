import axios from '@/libs/axios';
import type { Post, PostFeedResponse, CreatePostInput, PostComment } from '@/types/post';
import type { ApiResponse } from '@/types/api';

export const postService = {
    getFeed: (params?: {
        cursor?: string;
        limit?: number;
        sellerId?: string;
        hashtag?: string;
    }): Promise<PostFeedResponse> => axios.get('/posts', { params }) as Promise<PostFeedResponse>,

    getMyPosts: (params?: { cursor?: string; limit?: number }): Promise<PostFeedResponse> =>
        axios.get('/posts/mine', { params }) as Promise<PostFeedResponse>,

    getOne: (id: string): Promise<ApiResponse<Post>> =>
        axios.get(`/posts/${id}`) as Promise<ApiResponse<Post>>,

    create: (data: CreatePostInput): Promise<ApiResponse<Post>> =>
        axios.post('/posts', data) as Promise<ApiResponse<Post>>,

    update: (
        id: string,
        data: Partial<CreatePostInput> & { isPinned?: boolean },
    ): Promise<ApiResponse<Post>> =>
        axios.patch(`/posts/${id}`, data) as Promise<ApiResponse<Post>>,

    delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
        axios.delete(`/posts/${id}`) as Promise<ApiResponse<{ message: string }>>,

    toggleLike: (id: string): Promise<{ liked: boolean }> =>
        axios.post(`/posts/${id}/like`) as Promise<{ liked: boolean }>,

    addComment: (
        id: string,
        content: string,
        parentId?: string,
    ): Promise<ApiResponse<PostComment>> =>
        axios.post(`/posts/${id}/comments`, { content, parentId }) as Promise<
            ApiResponse<PostComment>
        >,

    getComments: (id: string): Promise<ApiResponse<PostComment[]>> =>
        axios.get(`/posts/${id}/comments`) as Promise<ApiResponse<PostComment[]>>,
};
