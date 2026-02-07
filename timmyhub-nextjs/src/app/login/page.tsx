import { LoginPage } from '@/components/features/auth/LoginPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | TimmyHub',
    description: 'Sign in to your TimmyHub account to manage your business and orders.',
};

export default function Page() {
    return <LoginPage />;
}
