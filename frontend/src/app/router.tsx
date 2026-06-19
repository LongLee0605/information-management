import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '@/components/templates/AppLayout';
import { ApiStatusProvider, SelectedUserProvider } from '@/context';
import { LazyPage } from '@/app/LazyPage';
import { AccountPage, AllAccountsPage, AllTransactionsPage, HomePage, MoneyFlowTracePage, ReportsPage, TransferPage, UserProfilePage, UserTransactionsPage, } from '@/app/lazyPages';
import { ROUTES } from '@/constants';
export const router = createBrowserRouter([
    {
        element: (<ApiStatusProvider>
        <SelectedUserProvider>
          <Outlet />
        </SelectedUserProvider>
      </ApiStatusProvider>),
        children: [
            {
                path: ROUTES.HOME,
                element: <AppLayout />,
                children: [
                    {
                        index: true,
                        element: (<LazyPage>
                <HomePage />
              </LazyPage>),
                    },
                    {
                        path: 'accounts',
                        element: (<LazyPage>
                <AllAccountsPage />
              </LazyPage>),
                    },
                    {
                        path: 'transactions',
                        element: (<LazyPage>
                <AllTransactionsPage />
              </LazyPage>),
                    },
                    {
                        path: 'transactions/transfer',
                        element: (<LazyPage>
                <TransferPage />
              </LazyPage>),
                    },
                    {
                        path: 'money-trace',
                        element: (<LazyPage>
                <MoneyFlowTracePage />
              </LazyPage>),
                    },
                    {
                        path: 'users/:id',
                        element: (<LazyPage>
                <AccountPage />
              </LazyPage>),
                    },
                    {
                        path: 'users/:id/profile',
                        element: (<LazyPage>
                <UserProfilePage />
              </LazyPage>),
                    },
                    {
                        path: 'users/:id/transactions',
                        element: (<LazyPage>
                <UserTransactionsPage />
              </LazyPage>),
                    },
                    {
                        path: 'users/:id/transactions/transfer',
                        element: (<LazyPage>
                <TransferPage />
              </LazyPage>),
                    },
                    {
                        path: 'users/:id/reports',
                        element: (<LazyPage>
                <ReportsPage />
              </LazyPage>),
                    },
                    {
                        path: '*',
                        element: <Navigate to={ROUTES.HOME} replace />,
                    },
                ],
            },
        ],
    },
]);
