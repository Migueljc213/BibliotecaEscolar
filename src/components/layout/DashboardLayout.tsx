"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { NotificationBell } from "@/components/ui/notifications";
import { AlertSystem, CriticalAlerts } from "@/components/ui/alerts";
import { AlertContainer } from "@/components/ui/alert";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
}

export default function DashboardLayout({
  children,
  title = "Dashboard - Biblioteca Escolar",
  showBackButton = false,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    router.push("/");
  };

  const handleBack = () => {
    router.back();
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <AlertContainer />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg shadow transition-colors text-sm font-semibold"
                >
                  ← Voltar
                </button>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 tracking-tight">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <AlertSystem />
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition-colors text-sm font-semibold"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 py-4 overflow-x-auto">
            <Link
              href="/dashboard"
              className={`whitespace-nowrap font-semibold transition-colors ${
                isActive("/dashboard")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-2"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/books"
              className={`whitespace-nowrap font-semibold transition-colors ${
                isActive("/dashboard/books")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-2"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              Livros
            </Link>
            <Link
              href="/dashboard/students"
              className={`whitespace-nowrap font-semibold transition-colors ${
                isActive("/dashboard/students")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-2"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              Alunos
            </Link>
            <Link
              href="/dashboard/loans"
              className={`whitespace-nowrap font-semibold transition-colors ${
                isActive("/dashboard/loans")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-2"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              Empréstimos
            </Link>
            <Link
              href="/dashboard/reports"
              className={`whitespace-nowrap font-semibold transition-colors ${
                isActive("/dashboard/reports")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-2"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              Relatórios
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
