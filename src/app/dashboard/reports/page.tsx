"use client";

import Link from "next/link";
import { useApi } from "@/hooks/useApi";

export default function ReportsPage() {
  // Buscar dados reais
  const { data: stats, loading: statsLoading } = useApi<any>({
    url: "/api/dashboard/stats",
  });

  const { data: loanStats, loading: loanStatsLoading } = useApi<any>({
    url: "/api/reports/loans?period=mes",
  });

  const { data: bookStats, loading: bookStatsLoading } = useApi<any>({
    url: "/api/reports/books",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Monthly Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl p-6 animate-pulse"
              >
                <div className="h-12 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <StatCard
              icon="📚"
              label="Total de Livros"
              value={stats.totalBooks}
              color="from-blue-400 to-blue-600"
            />
            <StatCard
              icon="✅"
              label="Livros Disponíveis"
              value={stats.availableBooks}
              color="from-green-400 to-green-600"
            />
            <StatCard
              icon="📖"
              label="Empréstimos Ativos"
              value={stats.activeLoans}
              color="from-purple-400 to-purple-600"
            />
            <StatCard
              icon="⚠️"
              label="Em Atraso"
              value={stats.overdueBooks}
              color="from-red-400 to-red-600"
            />
            <StatCard
              icon="👥"
              label="Total de Alunos"
              value={stats.totalStudents}
              color="from-orange-400 to-orange-600"
            />
          </div>
        ) : null}

        {/* Reports Grid */}
        {loanStatsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-300 rounded mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-16 bg-gray-300 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : loanStats ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Books */}
            <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-indigo-700 mb-6">
                Livros Mais Emprestados
              </h2>
              <div className="space-y-4">
                {loanStats.topLoanedBooks?.map((book: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {book.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {book.code} • {book.loans} empréstimos
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {book.loans}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Students */}
            <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-indigo-700 mb-6">
                Alunos Mais Ativos
              </h2>
              <div className="space-y-4">
                {loanStats.topBorrowers?.map((student: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.grade} • {student.loans} empréstimos
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {student.loans}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Additional Stats */}
        {bookStatsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-300 rounded mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-16 bg-gray-300 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : bookStats ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Top Books by Genre */}
            <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-indigo-700 mb-6">
                Livros por Gênero
              </h2>
              <div className="space-y-4">
                {bookStats.booksByGenre?.map((genre: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {genre.genre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {genre.available} disponíveis
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {genre.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Export Options */}
        
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg p-6 flex items-center gap-4 min-h-[120px]`}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/30 text-3xl">
        {icon}
      </div>
      <div>
        <div className="text-white/90 text-sm font-medium mb-1">{label}</div>
        <div className="text-white text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
