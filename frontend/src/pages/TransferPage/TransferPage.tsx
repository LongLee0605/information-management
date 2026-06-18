import { useParams } from 'react-router-dom';
import { TransferFlow } from '@/components/organisms/TransferFlow';
import { ROUTES, userTransactionsPath } from '@/constants';
import { useActiveUserId, useCanonicalUserRoute } from '@/hooks';
import { resolveUserIdFromRouteParam } from '@/utils/userRoute';

export default function TransferPage() {
  const { id: routeParam } = useParams<{ id?: string }>();
  useCanonicalUserRoute();
  const activeUserId = useActiveUserId();
  const userId = resolveUserIdFromRouteParam(routeParam) ?? activeUserId ?? undefined;
  const returnPath = userId ? userTransactionsPath(userId) : ROUTES.TRANSACTIONS;

  return <TransferFlow defaultUserId={userId} returnPath={returnPath} />;
}
