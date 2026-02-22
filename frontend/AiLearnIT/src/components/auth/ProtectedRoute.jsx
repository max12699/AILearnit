import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import {AppLayout} from '../layout/AppLayout';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = () => {
    const {isAuthenticated, loading} = useAuth()

    if (loading) {
        return <div>LOADING.....</div>
    }

    return isAuthenticated ? (
        <AppLayout>
            <Outlet />
        </AppLayout>
    ) : (
        <Navigate to='/login' replace />
    )
};
