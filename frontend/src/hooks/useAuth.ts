import { useAuth as useAuthContext } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const auth = useAuthContext();

  return auth;
}

export function useRequireAuth(allowedRoles?: string[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on role
        switch (user.role) {
          case 'platform_admin':
            router.push('/admin');
            break;
          case 'shop_owner':
            router.push('/dashboard/shop');
            break;
          case 'customer':
            router.push('/dashboard/customer');
            break;
          default:
            router.push('/');
        }
      }
    }
  }, [user, loading, router, allowedRoles]);

  return { user, loading };
}