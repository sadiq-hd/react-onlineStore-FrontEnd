import { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from './typerScript/useAuth';

interface PrivateRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
    allowGuest?: boolean;
    adminRedirect?: string; // خاصية جديدة للتوجيه
}

const PrivateRoute: FC<PrivateRouteProps> = ({ 
    children, 
    adminOnly = false,
    allowGuest = false,
    adminRedirect
}) => {
    const location = useLocation();
    const { isAuthenticated, isAdmin, isLoading, isGuest } = useAuth();
    console.log('PrivateRoute Debug:', {
        path: location.pathname,
        isAdmin,
        adminOnly,
        adminRedirect,
        user: JSON.parse(localStorage.getItem('currentUser') || 'null'),
        role: JSON.parse(localStorage.getItem('currentUser') || 'null')?.role
    });
    console.log('PrivateRoute Props:', { adminOnly, allowGuest, adminRedirect });
    console.log('User Auth Status:', { isAuthenticated, isAdmin, isGuest });
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // توجيه المسؤول إلى صفحة مخصصة إذا تم تحديدها
    if (adminRedirect && isAdmin) {
        return <Navigate to={adminRedirect} replace />;
    }

    // السماح للزوار بمشاهدة السلة
    if (allowGuest && isGuest) {
        return <>{children}</>;
    }

    // للصفحات التي تتطلب تسجيل الدخول
    if (!isAuthenticated && !allowGuest) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }
    console.log('Should redirect admin?', { adminRedirect, isAdmin, shouldRedirect: adminRedirect && isAdmin });

    // للصفحات التي تتطلب صلاحيات المشرف
    if (adminOnly && !isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        غير مصرح بالوصول
                    </h1>
                    <p className="text-gray-600 mb-8">
                        عذراً، ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        العودة للخلف
                    </button>
                </div>
            </div>
            
        );
    }

    return <>{children}</>;
};

export default PrivateRoute;