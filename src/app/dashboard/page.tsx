"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";


export default function Dashboard() {
  const router = useRouter();

  const {
    data: stats,
    loading,
    error,
  } = useApi<{
    totalBooks: number;
    availableBooks: number;
    borrowedBooks: number;
    totalStudents: number;
    activeLoans: number;
    overdueLoans: number;
  }>({
    url: "/api/stats",
  });

  const { data: activities, loading: activitiesLoading } = useApi<any[]>({
    url: "/api/activities?limit=6",
  });

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "newLoan":
        router.push("/dashboard/loans");
        break;
      case "newBook":
        router.push("/dashboard/books");
        break;
      case "newStudent":
        router.push("/dashboard/students");
        break;
      case "reports":
        router.push("/dashboard/reports");
        break;
      case "logout":
        router.push("/");
        break;
      default:
        break;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return "Agora mesmo";
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000)
      return `Há ${Math.floor(diffInSeconds / 86400)} dias`;
    return `Há ${Math.floor(diffInSeconds / 2592000)} meses`;
  };

  return (
    <div title="Dashboard - Biblioteca Escolar">
      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 rounded-2xl p-6 animate-pulse">
              <div className="h-12 bg-gray-300 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon="📚"
            label="Total de Livros"
            value={stats?.totalBooks ?? 0}
            color="from-indigo-400 to-indigo-600"
          />
          <StatCard
            icon="✅"
            label="Livros Disponíveis"
            value={stats?.availableBooks ?? 0}
            color="from-green-400 to-green-600"
          />
          <StatCard
            icon="📖"
            label="Empréstimos Ativos"
            value={stats?.activeLoans ?? 0}
            color="from-yellow-400 to-yellow-500"
          />
          <StatCard
            icon="⚠️"
            label="Empréstimos em Atraso"
            value={stats?.overdueLoans ?? 0}
            color="from-rose-400 to-rose-500"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-8">
        <h2 className="text-lg font-semibold text-indigo-700 mb-6">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => handleQuickAction("newLoan")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-center font-semibold shadow transition-colors"
          >
            Novo Empréstimo
          </button>
          <button
            onClick={() => handleQuickAction("newBook")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-center font-semibold shadow transition-colors"
          >
            Cadastrar Livro
          </button>
          <button
            onClick={() => handleQuickAction("newStudent")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-center font-semibold shadow transition-colors"
          >
            Cadastrar Aluno
          </button>
          <button
            onClick={() => handleQuickAction("reports")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-center font-semibold shadow transition-colors"
          >
            Ver Relatórios
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-8 mt-8">
        <h2 className="text-lg font-semibold text-indigo-700 mb-6">
          Atividade Recente
        </h2>
        {activitiesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-48"></div>
                </div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  activity.color === "green"
                    ? "bg-green-50"
                    : activity.color === "blue"
                    ? "bg-blue-50"
                    : activity.color === "yellow"
                    ? "bg-yellow-50"
                    : activity.color === "red"
                    ? "bg-red-50"
                    : activity.color === "purple"
                    ? "bg-purple-50"
                    : activity.color === "indigo"
                    ? "bg-indigo-50"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      activity.color === "green"
                        ? "bg-green-500"
                        : activity.color === "blue"
                        ? "bg-blue-500"
                        : activity.color === "yellow"
                        ? "bg-yellow-500"
                        : activity.color === "red"
                        ? "bg-red-500"
                        : activity.color === "purple"
                        ? "bg-purple-500"
                        : activity.color === "indigo"
                        ? "bg-indigo-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="text-lg">{activity.icon}</span>
                    {activity.message}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhuma atividade recente</p>
          </div>
        )}
      </div>
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
