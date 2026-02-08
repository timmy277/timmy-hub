import { LoginPage } from '@/features';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | TimmyHub',
    description: 'Login to your TimmyHub account',
};

export default function Page() {
    return <LoginPage />;
}
