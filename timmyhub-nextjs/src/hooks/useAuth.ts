import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { LoginInput, LoginData, ApiResponse } from '@/types/auth';

export const useLoginMutation = () => {
    return useMutation<ApiResponse<LoginData>, Error, LoginInput>({
        mutationFn: (data) => authService.login(data),
    });
};
