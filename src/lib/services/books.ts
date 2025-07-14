import { prisma } from "../prisma";
import { Book } from "@prisma/client";
import { AuditService } from "./audit";

export interface CreateBookData {
  title: string;
  author: string;
  publisher: string;
  genre: string;
  entryDate: Date;
  quantity: number;
  isbn?: string;
  year?: number;
  location?: string;
  description?: string;
}

export interface UpdateBookData extends Partial<CreateBookData> {}

export class BookService {
  // Gerar código automático para o livro
  private static async generateBookCode(genre: string): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2); // Últimos 2 dígitos do ano

    // Buscar o último código usado para este ano
    const lastBook = await prisma.book.findFirst({
      where: {
        code: {
          contains: `/${currentYear}-`,
        },
        deletedAt: null,
      },
      orderBy: {
        code: "desc",
      },
    });

    let nextNumber = 1;
    if (lastBook) {
      const lastNumber = parseInt(lastBook.code.split("/")[0]);
      nextNumber = lastNumber + 1;
    }

    // Abreviação do gênero (primeiras 3 letras)
    const genreAbbreviation = genre.substring(0, 3).toUpperCase();

    return `${nextNumber
      .toString()
      .padStart(4, "0")}/${currentYear}-${genreAbbreviation}`;
  }

  // Buscar livro por ID (apenas ativos)
  static async getBookById(id: string) {
    return await prisma.book.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  // Buscar livros por filtros (apenas ativos)
  static async getBooksByFilters(filters: {
    search?: string;
    status?: string;
    genre?: string;
  }) {
    const { search, status, genre } = filters;

    return await prisma.book.findMany({
      where: {
        AND: [
          { deletedAt: null },
          search
            ? {
                OR: [
                  { title: { contains: search } },
                  { author: { contains: search } },
                  { code: { contains: search } },
                  { isbn: { contains: search } },
                ],
              }
            : {},
          genre ? { genre } : {},
          status === "disponível" ? { currentQuantity: { gt: 0 } } : {},
          status === "emprestado" ? { currentQuantity: { equals: 0 } } : {},
        ],
      },
      orderBy: { title: "asc" },
    });
  }

  // Criar novo livro
  static async createBook(data: CreateBookData, userId?: string) {
    try {
      const code = await this.generateBookCode(data.genre);
      const book = await prisma.book.create({
        data: {
          ...data,
          code,
          quantity: data.quantity || 1,
          currentQuantity: data.quantity || 1,
          loansCount: 0,
        },
      });
      // Log de auditoria
      await AuditService.logBookCreation(book.id, book, userId);
      return book;
    } catch (error: any) {
      // Verificar se é erro de constraint única
      if (error.code === "P2002") {
        if (error.meta?.target?.includes("isbn")) {
          throw new Error(
            "ISBN já existe no sistema. Por favor, use um ISBN diferente."
          );
        }
        if (error.meta?.target?.includes("code")) {
          throw new Error("Código do livro já existe. Tente novamente.");
        }
        throw new Error("Dados duplicados. Verifique se o livro já existe.");
      }
      throw error;
    }
  }

  // Atualizar livro
  static async updateBook(id: string, data: UpdateBookData, userId?: string) {
    try {
      // Buscar dados atuais do livro para comparação
      const currentBook = await prisma.book.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!currentBook) {
        throw new Error("Livro não encontrado");
      }

      // Realizar a atualização
      const updatedBook = await prisma.book.update({
        where: {
          id,
          deletedAt: null,
        },
        data,
      });

      // Log de auditoria para campos alterados (com try/catch para não falhar a atualização)
      try {
        const changedFields: string[] = [];

        for (const [field, newValue] of Object.entries(data)) {
          // Ignorar campos que não devem gerar logs
          if (
            field === "updatedAt" ||
            field === "createdAt" ||
            field === "deletedAt"
          ) {
            continue;
          }

          const oldValue = currentBook[field as keyof typeof currentBook];

          // Comparar valores convertendo para string para evitar logs desnecessários
          if (String(oldValue) !== String(newValue)) {
            changedFields.push(field);
            await AuditService.logBookUpdate(
              id,
              field,
              oldValue,
              newValue,
              userId
            );
          }
        }

        // Se nenhum campo foi alterado, não criar log
        if (changedFields.length === 0) {
          console.log("Nenhum campo foi alterado no livro:", id);
        }
      } catch (auditError) {
        console.error("Erro ao criar log de auditoria:", auditError);
        // Não falhar a atualização por causa do log
      }

      return updatedBook;
    } catch (error) {
      console.error("Erro no updateBook:", error);
      throw error;
    }
  }

  // Soft delete - marcar como deletado
  static async softDeleteBook(id: string, userId?: string) {
    try {
      // Buscar dados do livro antes da deleção para o log
      const bookData = await prisma.book.findUnique({
        where: { id },
      });

      if (!bookData) {
        throw new Error("Livro não encontrado");
      }

      // Realizar o soft delete
      const deletedBook = await prisma.book.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      // Log de auditoria (com try/catch para não falhar a deleção)
      try {
        await AuditService.logBookDeletion(id, bookData, userId);
      } catch (auditError) {
        console.error("Erro ao criar log de auditoria:", auditError);
        // Não falhar a deleção por causa do log
      }

      return deletedBook;
    } catch (error) {
      console.error("Erro no softDeleteBook:", error);
      throw error;
    }
  }

  // Buscar estatísticas de livros (apenas ativos)
  static async getBookStats() {
    const totalBooks = await prisma.book.count({
      where: { deletedAt: null },
    });
    console.log(totalBooks);
    // Calcular livros disponíveis (soma de todos os exemplares disponíveis)
    const booksWithAvailability = await prisma.book.findMany({
      where: { deletedAt: null },
      select: { currentQuantity: true },
    });
    const availableBooks = booksWithAvailability.reduce(
      (sum, book) => sum + book.currentQuantity,
      0
    );

    // Calcular livros emprestados (empréstimos ativos)
    const activeLoans = await prisma.loan.count({
      where: { status: "ACTIVE" },
    });

    const genres = await prisma.book.groupBy({
      by: ["genre"],
      where: { deletedAt: null },
      _count: { genre: true },
    });

    const booksByYear = await prisma.book.groupBy({
      by: ["year"],
      where: {
        year: { not: null },
        deletedAt: null,
      },
      _count: { year: true },
    });

    return {
      totalBooks,
      availableBooks,
      borrowedBooks: activeLoans,
      genres: genres.map((genre) => ({
        genre: genre.genre,
        count: genre._count.genre,
      })),
      booksByYear: booksByYear.map((year) => ({
        year: year.year,
        count: year._count.year,
      })),
    };
  }

  // Incrementar contador de empréstimos
  static async incrementLoansCount(bookId: string) {
    return await prisma.book.update({
      where: {
        id: bookId,
        deletedAt: null,
      },
      data: {
        loansCount: {
          increment: 1,
        },
        currentQuantity: {
          decrement: 1,
        },
      },
    });
  }

  // Decrementar contador de empréstimos (quando livro é devolvido)
  static async decrementLoansCount(bookId: string) {
    return await prisma.book.update({
      where: {
        id: bookId,
        deletedAt: null,
      },
      data: {
        currentQuantity: {
          increment: 1,
        },
      },
    });
  }
}
