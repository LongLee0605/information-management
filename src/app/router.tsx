import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AppLayout } from '@/components/templates/AppLayout';
import { SelectedUserProvider } from '@/context';
import { LazyPage } from '@/app/LazyPage';
import {
  AccountPage,
  AllTransactionsPage,
  HomePage,
  MoneyFlowTracePage,
  ReportsPage,
  TransferPage,
  UserTransactionsPage,
} from '@/app/lazyPages';
import { ROUTES } from '@/constants';

export const router = createBrowserRouter([
  {
    element: (
      <SelectedUserProvider>
        <Outlet />
      </SelectedUserProvider>
    ),
    children: [
      {
        path: ROUTES.HOME,
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: (
              <LazyPage>
                <HomePage />
              </LazyPage>
            ),
          },
          {
            path: 'transactions',
            element: (
              <LazyPage>
                <AllTransactionsPage />
              </LazyPage>
            ),
          },
          {
            path: 'transactions/transfer',
            element: (
              <LazyPage>
                <TransferPage />
              </LazyPage>
            ),
          },
          {
            path: 'money-trace',
            element: (
              <LazyPage>
                <MoneyFlowTracePage />
              </LazyPage>
            ),
          },
          {
            path: 'users/:id',
            element: (
              <LazyPage>
                <AccountPage />
              </LazyPage>
            ),
          },
          {
            path: 'users/:id/transactions',
            element: (
              <LazyPage>
                <UserTransactionsPage />
              </LazyPage>
            ),
          },
          {
            path: 'users/:id/transactions/transfer',
            element: (
              <LazyPage>
                <TransferPage />
              </LazyPage>
            ),
          },
          {
            path: 'users/:id/reports',
            element: (
              <LazyPage>
                <ReportsPage />
              </LazyPage>
            ),
          },
        ],
      },
    ],
  },
]);
