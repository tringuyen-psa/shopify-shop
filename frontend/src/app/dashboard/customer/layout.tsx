'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Home,
  ShoppingCart,
  Package,
  CreditCard,
  User,
  Menu,
  X
} from 'lucide-react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/dashboard/customer', icon: Home },
    { name: 'Orders', href: '/dashboard/customer/orders', icon: ShoppingCart },
    { name: 'Subscriptions', href: '/dashboard/customer/subscriptions', icon: CreditCard },
    { name: 'Profile', href: '/dashboard/customer/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-col bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
          <SidebarContent navigation={navigation} pathname={pathname} />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent navigation={navigation} pathname={pathname} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 justify-between px-4 lg:px-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                Customer Dashboard
              </h1>
            </div>

            <div className="ml-4 flex items-center md:ml-6">
              <Link href="/" className="mr-4">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <div className="text-sm text-gray-700 mr-4">
                Welcome, {user?.name}
              </div>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navigation, pathname }: { navigation: any[], pathname: string }) {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r px-6 pb-2">
      <div className="flex h-16 shrink-0 items-center">
        <Package className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">My Account</span>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                        isActive
                          ? 'bg-gray-50 text-blue-600'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}