import { lazy } from 'react';

export const HomePage = lazy(() => import('@/pages/HomePage'));
export const AccountPage = lazy(() => import('@/pages/AccountPage'));
export const AllAccountsPage = lazy(() => import('@/pages/AllAccountsPage'));
export const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'));
export const AllTransactionsPage = lazy(() => import('@/pages/AllTransactionsPage'));
export const UserTransactionsPage = lazy(() => import('@/pages/UserTransactionsPage'));
export const TransferPage = lazy(() => import('@/pages/TransferPage'));
export const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
export const MoneyFlowTracePage = lazy(() => import('@/pages/MoneyFlowTracePage'));
