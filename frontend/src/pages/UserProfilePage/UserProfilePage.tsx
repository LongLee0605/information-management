import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { EditCustomerModal } from '@/components/organisms/EditCustomerModal';
import { UserProfile } from '@/components/organisms/UserProfile';
import { UserPageShell } from '@/components/templates/UserPageShell';
import { useSelectedUserContext } from '@/context';
import { userAccountPath } from '@/constants';
import { useCanonicalUserRoute, useUser, useUserFinance } from '@/hooks';

export default function UserProfilePage() {
    const { id } = useParams<{
        id: string;
    }>();
    const { setContextUserId } = useSelectedUserContext();
    const [editOpen, setEditOpen] = useState(false);
    useCanonicalUserRoute();
    const { user, userId, loading, error, notFound, refetch } = useUser(id);
    const { summary } = useUserFinance(id);
    useEffect(() => {
        if (userId) {
            setContextUserId(userId);
        }
    }, [userId, setContextUserId]);
    return (
        <>
            <UserPageShell
                user={user}
                loading={loading}
                notFound={notFound}
                error={error}
                title="Hồ Sơ Khách Hàng"
                subtitle={user ? `Chi tiết thông tin · ${user.fullName}` : undefined}
                summary={summary}
                onRetry={refetch}
                toolbarActions={userId ? (
                    <>
                        <Button variant="primary" type="button" onClick={() => setEditOpen(true)}>
                            Cập nhật thông tin
                        </Button>
                        <Link to={userAccountPath(userId)}>
                            <Button variant="secondary" type="button">
                                Quản lý tài khoản
                            </Button>
                        </Link>
                    </>
                ) : undefined}
            >
                {user && <UserProfile user={user} />}
            </UserPageShell>

            <EditCustomerModal
                open={editOpen}
                user={user}
                onClose={() => setEditOpen(false)}
                onSuccess={refetch}
            />
        </>
    );
}
