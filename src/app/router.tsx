import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/templates/AppLayout';
import { LazyPage } from '@/app/LazyPage';
import { HomePage, UserDetailPage } from '@/app/lazyPages';
import { ROUTES } from '@/constants';

export const router = createBrowserRouter([
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
        path: 'users/:id',
        element: (
          <LazyPage>
            <UserDetailPage />
          </LazyPage>
        ),
      },
    ],
  },
]);
