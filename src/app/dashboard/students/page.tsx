"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FiEdit2, FiTrash2, FiEye, FiPlus } from "react-icons/fi";
import { useNotifications } from "@/components/ui/notifications";

interface Student {
  id: string;
  name: string;
  registration: string;
  grade: string; // garantir que grade existe
  class?: string;
  createdAt: string;
  updatedAt: string;
  loans?: any[];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    name: "",
    registration: "",
    grade: "",
    class: "",
  });

  // Carregar alunos da API
  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error("Erro ao carregar alunos");
      }
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration.includes(searchTerm);
    return matchesSearch;
  });

  const getStatusColor = (student: Student) => {
    const hasActiveLoans = student.loans && student.loans.length > 0;
    return hasActiveLoans
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const getStatusText = (student: Student) => {
    const hasActiveLoans = student.loans && student.loans.length > 0;
    return hasActiveLoans ? "Ativo" : "Inativo";
  };

  const handleCreateStudent = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          registration: formData.registration,
          grade: formData.grade,
          class: formData.class || undefined,
        }),
      });

      if (response.ok) {
        const newStudent = await response.json();
        setStudents([...students, newStudent]);
        setFormData({ name: "", registration: "", grade: "", class: "" });
        setIsCreateModalOpen(false);

        // Adicionar notificação
        addNotification({
          message: `Aluno "${formData.name}" cadastrado com sucesso!`,
          type: "success",
          icon: "👤",
        });
      } else {
        const error = await response.json();
        alert(`Erro ao cadastrar aluno: ${error.error || "Erro desconhecido"}`);

        // Adicionar notificação de erro
        addNotification({
          message: `Erro ao cadastrar aluno: ${
            error.error || "Erro desconhecido"
          }`,
          type: "error",
          icon: "❌",
        });
      }
    } catch (error) {
      console.error("Erro ao criar aluno:", error);
      alert("Erro ao cadastrar aluno");
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async () => {
    if (!selectedStudent) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          registration: formData.registration,
          grade: formData.grade,
          class: formData.class || undefined,
        }),
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        const updatedStudents = students.map((student) =>
          student.id === selectedStudent.id ? updatedStudent : student
        );
        setStudents(updatedStudents);
        setFormData({ name: "", registration: "", grade: "", class: "" });
        setSelectedStudent(null);
        setIsEditModalOpen(false);

        // Adicionar notificação
        addNotification({
          message: `Aluno "${formData.name}" atualizado com sucesso!`,
          type: "success",
          icon: "✏️",
        });
      } else {
        const error = await response.json();
        alert(`Erro ao atualizar aluno: ${error.error || "Erro desconhecido"}`);

        // Adicionar notificação de erro
        addNotification({
          message: `Erro ao atualizar aluno: ${
            error.error || "Erro desconhecido"
          }`,
          type: "error",
          icon: "❌",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar aluno:", error);
      alert("Erro ao atualizar aluno");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedStudents = students.filter(
          (student) => student.id !== selectedStudent.id
        );
        setStudents(updatedStudents);
        setSelectedStudent(null);
        setIsDeleteModalOpen(false);

        // Adicionar notificação
        addNotification({
          message: `Aluno "${selectedStudent.name}" removido com sucesso!`,
          type: "warning",
          icon: "🗑️",
        });
      } else {
        const error = await response.json();
        alert(`Erro ao excluir aluno: ${error.error || "Erro desconhecido"}`);

        // Adicionar notificação de erro
        addNotification({
          message: `Erro ao excluir aluno: ${
            error.error || "Erro desconhecido"
          }`,
          type: "error",
          icon: "❌",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
      alert("Erro ao excluir aluno");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (student: Student) => {
    setFormData({
      name: student.name,
      registration: student.registration,
      class: student.class || "",
      grade: student.grade || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          {/* Actions Bar */}
          <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Buscar por nome ou matrícula..."
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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="todos">Todos os status</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="suspenso">Suspenso</option>
                </select>
              </div>
              <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition-colors">
                    <FiPlus className="mr-2 h-4 w-4" />
                    Novo Aluno
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo aluno para cadastrá-lo no
                      sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nome
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="registration" className="text-right">
                        Matrícula
                      </Label>
                      <Input
                        id="registration"
                        value={formData.registration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registration: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="grade" className="text-right">
                        Série
                      </Label>
                      <select
                        id="grade"
                        value={formData.grade}
                        onChange={(e) =>
                          setFormData({ ...formData, grade: e.target.value })
                        }
                        className="col-span-3 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecione a série</option>
                        <option value="6º">6º</option>
                        <option value="8º">8º</option>
                        <option value="1º Médio">1º Médio</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="class" className="text-right">
                        Turma
                      </Label>
                      <Input
                        id="class"
                        value={formData.class}
                        onChange={(e) =>
                          setFormData({ ...formData, class: e.target.value })
                        }
                        className="col-span-3"
                        placeholder="Ex: A, B, C"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateStudent} disabled={loading}>
                      {loading ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white/80 backdrop-blur shadow rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matrícula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empréstimos Ativos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.registration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.class || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.loans?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            student
                          )}`}
                        >
                          {getStatusText(student)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                                onClick={() => openEditModal(student)}
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar dados do aluno</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                onClick={() => openDeleteModal(student)}
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir aluno do sistema</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Aluno</DialogTitle>
              <DialogDescription>
                Altere os dados do aluno selecionado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-registration" className="text-right">
                  Matrícula
                </Label>
                <Input
                  id="edit-registration"
                  value={formData.registration}
                  onChange={(e) =>
                    setFormData({ ...formData, registration: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-grade" className="text-right">
                  Série
                </Label>
                <select
                  id="edit-grade"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                  className="col-span-3 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione a série</option>
                  <option value="6º">6º</option>
                  <option value="8º">8º</option>
                  <option value="1º Médio">1º Médio</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-class" className="text-right">
                  Turma
                </Label>
                <Input
                  id="edit-class"
                  value={formData.class}
                  onChange={(e) =>
                    setFormData({ ...formData, class: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Ex: A, B, C"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleEditStudent} disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Exclusão */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o aluno{" "}
                <strong>{selectedStudent?.name}</strong>? Esta ação não pode ser
                desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteStudent}
                disabled={loading}
              >
                {loading ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
