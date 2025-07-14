"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";

export default function LoansReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("mes");

  // Buscar dados de empréstimos por período
  const {
    data: loansData,
    loading,
    error,
    refetch,
  } = useApi<{
    totalLoans: number;
    activeLoans: number;
    returnedLoans: number;
    overdueLoans: number;
    monthlyLoans: Array<{ month: string; loans: number; returns: number }>;
    topLoanedBooks: Array<{ title: string; loans: number; returns: number }>;
    topBorrowers: Array<{
      name: string;
      grade: string;
      loans: number;
      returns: number;
    }>;
    loanTrends: Array<{ period: string; loans: number; returns: number }>;
  }>({
    url: `/api/reports/loans?period=${selectedPeriod}`,
    dependencies: [selectedPeriod],
  });

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
        {/* Period Selector */}
        <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Período:
            </label>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
            >
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Último Ano</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl p-6 animate-pulse"
              >
                <div className="h-12 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-10">
            <p className="text-red-600">Erro ao carregar dados: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              icon="📚"
              label="Total de Empréstimos"
              value={loansData!.totalLoans!}
              color="from-blue-400 to-blue-600"
            />
            <StatCard
              icon="✅"
              label="Devoluções"
              value={loansData!.returnedLoans!}
              color="from-green-400 to-green-600"
            />
            <StatCard
              icon="📖"
              label="Empréstimos Ativos"
              value={loansData!.activeLoans!}
              color="from-yellow-400 to-yellow-600"
            />
            <StatCard
              icon="⚠️"
              label="Em Atraso"
              value={loansData!.overdueLoans!}
              color="from-red-400 to-red-600"
            />
          </div>
        )}

        {/* Charts Grid */}
        {!loading && !error && loansData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Monthly Trends */}
            <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-indigo-700 mb-6">
                Tendência Mensal
              </h2>
              <div className="space-y-4">
                {loansData.monthlyLoans.map((month: any, index: number) => (
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
                          {month.month}
                        </div>
                        <div className="text-sm text-gray-500">
                          {month.loans} empréstimos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">
                        {month.loans}
                      </div>
                      <div className="text-sm text-green-600">
                        {month.returns} devoluções
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Trends */}
            <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-indigo-700 mb-6">
                Tendência Semanal
              </h2>
              <div className="space-y-4">
                {loansData.loanTrends.map((week: any, index: number) => (
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
                          {week.period}
                        </div>
                        <div className="text-sm text-gray-500">
                          {week.loans} empréstimos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {week.loans}
                      </div>
                      <div className="text-sm text-blue-600">
                        {week.returns} devoluções
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Books and Borrowers */}
        {!loading && !error && loansData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Top Loaned Books */}
            <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-indigo-700 mb-6">
                Livros Mais Emprestados
              </h2>
              <div className="space-y-4">
                {loansData.topLoanedBooks.map((book: any, index: number) => (
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
                          {book.loans} empréstimos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">
                        {book.loans}
                      </div>
                      <div className="text-sm text-green-600">
                        {book.returns} devoluções
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Borrowers */}
            <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-indigo-700 mb-6">
                Maiores Usuários
              </h2>
              <div className="space-y-4">
                {loansData.topBorrowers.map((borrower: any, index: number) => (
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
                          {borrower.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {borrower.grade}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {borrower.loans}
                      </div>
                      <div className="text-sm text-blue-600">
                        {borrower.returns} devoluções
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {!loading && !error && loansData && (
          <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-indigo-700 mb-6">
              Resumo dos Empréstimos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {loansData.totalLoans}
                </div>
                <div className="text-sm text-blue-700">
                  Total de Empréstimos
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {loansData.returnedLoans}
                </div>
                <div className="text-sm text-green-700">
                  Devoluções Realizadas
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {loansData.activeLoans}
                </div>
                <div className="text-sm text-yellow-700">
                  Empréstimos Ativos
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {loansData.overdueLoans}
                </div>
                <div className="text-sm text-red-700">Em Atraso</div>
              </div>
            </div>
          </div>
        )}
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
