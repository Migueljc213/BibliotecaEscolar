"use client";

import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiTrash2, FiEye, FiPlus } from "react-icons/fi";
import { useApi } from "@/hooks/useApi";
import { useNotifications } from "@/components/ui/notifications";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAlert } from "@/components/ui/alert";

export default function BooksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGenre, setFilterGenre] = useState("todos");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    genre: "",
    quantity: 1,
    isbn: "",
    year: "",
    location: "",
    description: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { addNotification } = useNotifications();
  const { showSuccess, showError, showWarning } = useAlert();

  // Buscar dados reais
  const {
    data: books,
    loading: booksLoading,
    error: booksError,
    refetch: refetchBooks,
  } = useApi<any[]>({
    url: "/api/books",
  });

  const filteredBooks =
    books?.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre =
        filterGenre === "todos" || book.genre === filterGenre;
      return matchesSearch && matchesGenre;
    }) || [];

  const getAvailabilityColor = (currentQuantity: number) => {
    if (currentQuantity === 0) return "bg-red-100 text-red-800";
    if (currentQuantity < 2) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getAvailabilityText = (currentQuantity: number) => {
    if (currentQuantity === 0) return "Indisponível";
    if (currentQuantity < 2) return "Poucos exemplares";
    return "Disponível";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Título é obrigatório";
    }

    if (!formData.author.trim()) {
      errors.author = "Autor é obrigatório";
    }

    if (!formData.publisher.trim()) {
      errors.publisher = "Editora é obrigatória";
    }

    if (!formData.genre) {
      errors.genre = "Gênero é obrigatório";
    }

    if (formData.quantity < 1) {
      errors.quantity = "Quantidade deve ser maior que 0";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateBook = async () => {
    console.log("Iniciando criação de livro:", formData);

    // Validar formulário antes de enviar
    if (!validateForm()) {
      console.log("Validação falhou, erros:", fieldErrors);
      showError("Por favor, corrija os erros no formulário");
      return;
    }

    // Teste: tentar criar um livro sem ISBN primeiro
    if (formData.isbn && formData.isbn.trim()) {
      console.log("ISBN fornecido:", formData.isbn);
      console.log(
        "Livros existentes com ISBN:",
        books
          ?.filter((b) => b.isbn)
          .map((b) => ({ id: b.id, isbn: b.isbn, title: b.title }))
      );
    }

    try {
      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        publisher: formData.publisher.trim(),
        genre: formData.genre,
        entryDate: new Date(),
        quantity: parseInt(formData.quantity.toString()) || 1,
        isbn: formData.isbn.trim() || null,
        year: formData.year ? parseInt(formData.year) : undefined,
        location: formData.location.trim() || undefined,
        description: formData.description.trim() || undefined,
      };

      console.log("Dados do livro a serem enviados:", bookData);

      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });

      console.log("Resposta da API:", response.status, response.statusText);

      if (response.ok) {
        const createdBook = await response.json();
        console.log("Livro criado com sucesso:", createdBook);

        refetchBooks();
        setFormData({
          title: "",
          author: "",
          publisher: "",
          genre: "",
          quantity: 1,
          isbn: "",
          year: "",
          location: "",
          description: "",
        });
        setFieldErrors({});
        setIsCreateModalOpen(false);

        // Adicionar notificação
        addNotification({
          message: `Livro "${formData.title}" cadastrado com sucesso!`,
          type: "success",
          icon: "➕",
        });
        showSuccess(`Livro "${formData.title}" cadastrado com sucesso!`);
      } else {
        const error = await response.json();
        const errorMessage = error.error || "Erro desconhecido";

        console.log("Erro da API:", error);

        // Adicionar notificação de erro
        addNotification({
          message: `Erro ao cadastrar livro: ${errorMessage}`,
          type: "error",
          icon: "❌",
        });
        showError(`Erro ao cadastrar livro: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Erro ao criar livro:", error);

      // Adicionar notificação de erro
      addNotification({
        message: "Erro ao cadastrar livro",
        type: "error",
        icon: "❌",
      });
      showError("Erro ao cadastrar livro. Tente novamente.");
    }
  };

  const handleDeleteBook = async () => {
    if (selectedBook) {
      try {
        console.log(
          "Tentando deletar livro:",
          selectedBook.id,
          selectedBook.title
        );

        const response = await fetch(`/api/books/${selectedBook.id}`, {
          method: "DELETE",
        });

        console.log("Resposta da API:", response.status, response.statusText);

        if (response.ok) {
          refetchBooks();
          setSelectedBook(null);
          setIsDeleteModalOpen(false);

          // Adicionar notificação
          addNotification({
            message: `Livro "${selectedBook.title}" removido com sucesso!`,
            type: "warning",
            icon: "🗑️",
          });
          showWarning(`Livro "${selectedBook.title}" removido com sucesso!`);
        } else {
          const errorData = await response.json();
          console.error("Erro da API:", errorData);

          const errorMessage = errorData.error || "Erro desconhecido";

          // Adicionar notificação de erro
          addNotification({
            message: `Erro ao excluir livro: ${errorMessage}`,
            type: "error",
            icon: "❌",
          });
          showError(`Erro ao excluir livro: ${errorMessage}`);
        }
      } catch (error) {
        console.error("Erro ao excluir livro:", error);

        // Adicionar notificação de erro
        addNotification({
          message: "Erro ao excluir livro",
          type: "error",
          icon: "❌",
        });
        showError("Erro ao excluir livro. Tente novamente.");
      }
    }
  };

  const openDeleteModal = (book: any) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (book: any) => {
    setSelectedBook(book);
    setIsViewModalOpen(true);
  };

  return (
    <div title="Gerenciamento de Livros">
      <TooltipProvider>
        {/* Actions Bar */}
        <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Buscar por código, título, autor ou ISBN..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
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
                <option value="Técnico">Técnico</option>
                <option value="História">História</option>
                <option value="Biografia">Biografia</option>
              </select>
            </div>
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition-colors">
                  <FiPlus className="mr-2 h-4 w-4" />
                  Novo Livro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Livro</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo livro para adicioná-lo ao acervo.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Obra
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className={fieldErrors.title ? "border-red-500" : ""}
                        required
                      />
                      {fieldErrors.title && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldErrors.title}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="author" className="text-right">
                      Autor
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) =>
                          setFormData({ ...formData, author: e.target.value })
                        }
                        className={fieldErrors.author ? "border-red-500" : ""}
                        required
                      />
                      {fieldErrors.author && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldErrors.author}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="publisher" className="text-right">
                      Editora
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="publisher"
                        value={formData.publisher}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            publisher: e.target.value,
                          })
                        }
                        className={
                          fieldErrors.publisher ? "border-red-500" : ""
                        }
                        required
                      />
                      {fieldErrors.publisher && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldErrors.publisher}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="genre" className="text-right">
                      Gênero Literário
                    </Label>
                    <div className="col-span-3">
                      <select
                        id="genre"
                        value={formData.genre}
                        onChange={(e) =>
                          setFormData({ ...formData, genre: e.target.value })
                        }
                        className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          fieldErrors.genre
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      >
                        <option value="">Selecione um gênero</option>
                        <option value="Romance">Romance</option>
                        <option value="Fantasia">Fantasia</option>
                        <option value="Infantil">Infantil</option>
                        <option value="Técnico">Técnico</option>
                        <option value="História">História</option>
                        <option value="Biografia">Biografia</option>
                      </select>
                      {fieldErrors.genre && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldErrors.genre}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      Quantidade
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                        className={fieldErrors.quantity ? "border-red-500" : ""}
                        required
                      />
                      {fieldErrors.quantity && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldErrors.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="button" onClick={handleCreateBook}>
                    Adicionar Livro
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const testData = { ...formData, isbn: "" };
                      setFormData(testData);
                      setTimeout(() => handleCreateBook(), 100);
                    }}
                    className="text-xs"
                  >
                    Teste sem ISBN
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white/80 backdrop-blur shadow rounded-2xl overflow-hidden">
          {booksLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando livros...</p>
            </div>
          ) : booksError ? (
            <div className="p-8 text-center">
              <p className="text-red-600">
                Erro ao carregar livros: {booksError}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Autor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Editora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gênero
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disponível
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empréstimos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {book.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.publisher}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.genre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(
                            book.currentQuantity
                          )}`}
                        >
                          {getAvailabilityText(book.currentQuantity)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.loansCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewModal(book)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <FiEye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver detalhes</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteModal(book)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBooks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum livro encontrado.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o livro "{selectedBook?.title}"?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteBook}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Livro</DialogTitle>
            </DialogHeader>
            {selectedBook && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Código:</Label>
                    <p className="text-gray-700">{selectedBook.code}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Título:</Label>
                    <p className="text-gray-700">{selectedBook.title}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Autor:</Label>
                    <p className="text-gray-700">{selectedBook.author}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Editora:</Label>
                    <p className="text-gray-700">{selectedBook.publisher}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Gênero:</Label>
                    <p className="text-gray-700">{selectedBook.genre}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Data de Entrada:</Label>
                    <p className="text-gray-700">
                      {formatDate(selectedBook.entryDate)}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold">Quantidade Total:</Label>
                    <p className="text-gray-700">{selectedBook.quantity}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Quantidade Atual:</Label>
                    <p className="text-gray-700">
                      {selectedBook.currentQuantity}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold">
                      Total de Empréstimos:
                    </Label>
                    <p className="text-gray-700">{selectedBook.loansCount}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">ISBN:</Label>
                    <p className="text-gray-700">
                      {selectedBook.isbn || "Não informado"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold">Ano:</Label>
                    <p className="text-gray-700">
                      {selectedBook.year || "Não informado"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold">Localização:</Label>
                    <p className="text-gray-700">
                      {selectedBook.location || "Não informado"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="font-semibold">Descrição:</Label>
                    <p className="text-gray-700">
                      {selectedBook.description || "Não informado"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" onClick={() => setIsViewModalOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </div>
  );
}
