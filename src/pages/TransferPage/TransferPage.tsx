import { useParams } from 'react-router-dom';
import { TransferFlow } from '@/components/organisms/TransferFlow';
import { ROUTES, userTransactionsPath } from '@/constants';
import { useActiveUserId } from '@/hooks';

export default function TransferPage() {
  const { id: routeUserId } = useParams<{ id?: string }>();
  const activeUserId = useActiveUserId();
  const userId = routeUserId ?? activeUserId ?? undefined;
  const returnPath = userId ? userTransactionsPath(userId) : ROUTES.TRANSACTIONS;

  return <TransferFlow defaultUserId={userId} returnPath={returnPath} />;
}
