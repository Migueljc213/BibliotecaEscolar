"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiSearch, FiDownload, FiFilter } from "react-icons/fi";
import { useNotifications } from "@/components/ui/notifications";

interface Book {
  id: string;
  code: string;
  title: string;
  author: string;
  publisher: string;
  genre: string;
  quantity: number;
  currentQuantity: number;
  loansCount: number;
  isbn?: string;
  year?: number;
  location?: string;
  description?: string;
}

interface BookStats {
  totalBooks: number;
  availableBooks: number;
  totalQuantity: number;
  borrowedBooks: number;
  booksByGenre: Array<{
    genre: string;
    count: number;
    available: number;
  }>;
  topLoanedBooks: Book[];
  booksByLocation: Array<{
    location: string;
    count: number;
  }>;
  allBooks: Book[];
}

export default function BooksReportPage() {
  const [bookStats, setBookStats] = useState<BookStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGenre, setFilterGenre] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const { addNotification } = useNotifications();

  const loadBookStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterGenre !== "todos") params.append("genre", filterGenre);
      if (filterStatus !== "todos") params.append("status", filterStatus);

      const response = await fetch(`/api/reports/books?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBookStats(data);

        // Adicionar notificação de sucesso
        addNotification({
          message: "Relatório de livros carregado com sucesso!",
          type: "success",
          icon: "📊",
        });
      } else {
        console.error("Erro ao carregar dados dos livros");

        // Adicionar notificação de erro
        addNotification({
          message: "Erro ao carregar relatório de livros",
          type: "error",
          icon: "❌",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados dos livros:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookStats();
  }, [filterGenre, filterStatus]);

  const filteredBooks =
    bookStats?.allBooks?.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.code.includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }) || [];

  const getStatusColor = (book: Book) => {
    if (book.currentQuantity === 0) return "bg-red-100 text-red-800";
    if (book.currentQuantity < book.quantity)
      return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (book: Book) => {
    if (book.currentQuantity === 0) return "Indisponível";
    if (book.currentQuantity < book.quantity) return "Parcialmente disponível";
    return "Disponível";
  };

  const exportBooksReport = () => {
    if (!bookStats) return;

    try {
      const csvContent = [
        "Código,Título,Autor,Editora,Gênero,Quantidade Total,Quantidade Disponível,Empréstimos Realizados,ISBN,Ano,Localização,Status",
        ...filteredBooks.map((book) =>
          [
            book.code,
            book.title,
            book.author,
            book.publisher,
            book.genre,
            book.quantity,
            book.currentQuantity,
            book.loansCount,
            book.isbn || "",
            book.year || "",
            book.location || "",
            getStatusText(book),
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `relatorio_livros_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Adicionar notificação de sucesso
      addNotification({
        message: "Relatório exportado com sucesso!",
        type: "success",
        icon: "📥",
      });
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);

      // Adicionar notificação de erro
      addNotification({
        message: "Erro ao exportar relatório",
        type: "error",
        icon: "❌",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
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
        ) : bookStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg p-6 flex items-center gap-4 min-h-[120px]">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/30 text-3xl">
                📚
              </div>
              <div>
                <div className="text-white/90 text-sm font-medium mb-1">
                  Total de Livros
                </div>
                <div className="text-white text-2xl font-bold">
                  {bookStats.totalBooks}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg p-6 flex items-center gap-4 min-h-[120px]">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/30 text-3xl">
                ✅
              </div>
              <div>
                <div className="text-white/90 text-sm font-medium mb-1">
                  Disponíveis
                </div>
                <div className="text-white text-2xl font-bold">
                  {bookStats.availableBooks}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-lg p-6 flex items-center gap-4 min-h-[120px]">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/30 text-3xl">
                📖
              </div>
              <div>
                <div className="text-white/90 text-sm font-medium mb-1">
                  Emprestados
                </div>
                <div className="text-white text-2xl font-bold">
                  {bookStats.borrowedBooks}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg p-6 flex items-center gap-4 min-h-[120px]">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/30 text-3xl">
                📊
              </div>
              <div>
                <div className="text-white/90 text-sm font-medium mb-1">
                  Total de Exemplares
                </div>
                <div className="text-white text-2xl font-bold">
                  {bookStats.totalQuantity}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Buscar por título, código ou autor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
              >
                <option value="todos">Todos os gêneros</option>
                <option value="Romance">Romance</option>
                <option value="Fantasia">Fantasia</option>
                <option value="Infantil">Infantil</option>
                <option value="Ficção">Ficção</option>
                <option value="Não-ficção">Não-ficção</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="todos">Todos os status</option>
                <option value="disponivel">Disponível</option>
                <option value="emprestado">Emprestado</option>
              </select>
            </div>
            <Button
              onClick={exportBooksReport}
              className="bg-green-600 hover:bg-green-700"
            >
              <FiDownload className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white/80 backdrop-blur shadow rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Livro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gênero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empréstimos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
    
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {book.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {book.code} • {book.author}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.genre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.currentQuantity}/{book.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.loansCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          book
                        )}`}
                      >
                        {getStatusText(book)}
                      </span>
                    </td>
              
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredBooks.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum livro encontrado
            </h3>
            <p className="text-gray-500">
              Não há livros que correspondam aos filtros selecionados.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
