import { ProfileLayoutContent } from '@/features/profile/ProfileLayoutContent';

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProfileLayoutContent>{children}</ProfileLayoutContent>;
}
