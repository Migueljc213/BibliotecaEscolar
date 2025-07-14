import Link from "next/link";

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <div className="mt-10 bg-white/80 backdrop-blur shadow rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-indigo-700 mb-6">
          Relatórios Detalhados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
          <Link
            href="/dashboard/reports/"
            className="bg-indigo-900 hover:bg-indigo-900 text-white px-6 py-3 rounded-lg font-semibold shadow transition-colors text-center"
          >
            📊 Relatório Geral
          </Link>
          <Link
            href="/dashboard/reports/books"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition-colors text-center"
          >
            📚 Relatório de Livros
          </Link>

          <Link
            href="/dashboard/reports/loans"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition-colors text-center"
          >
            📋 Relatório de Empréstimos
          </Link>
          <Link
            href="/dashboard/reports/history"
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition-colors text-center"
          >
            📝 Histórico de Livros
          </Link>
        </div> 
      </div>
    </div>
  );
}
