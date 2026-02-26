import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';

interface Props {
    searchParams: Promise<{ token?: string }>;
}

export default async function ResetPassword({ searchParams }: Props) {
    const { token } = await searchParams;
    return <ResetPasswordPage token={token} />;
}
