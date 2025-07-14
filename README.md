# Sistema de Biblioteca Escolar

Sistema administrativo completo para gestão de biblioteca escolar, desenvolvido com Next.js, Prisma e SQLite.

## 🚀 Funcionalidades

- **Gestão de Livros**: Cadastro, edição e consulta de acervo
- **Gestão de Alunos**: Cadastro e controle de estudantes
- **Gestão de Empréstimos**: Controle de empréstimos e devoluções
- **Controle de Pendências**: Verificação de livros em atraso
- **Dashboard**: Resumos e estatísticas em tempo real
- **Relatórios**: Exportação de dados em PDF
- **Autenticação**: Sistema de login seguro

## 🛠️ Tecnologias

- **Frontend & Backend**: Next.js 14 (App Router)
- **Banco de Dados**: SQLite
- **ORM**: Prisma
- **Autenticação**: bcryptjs
- **Estilização**: Tailwind CSS
- **Geração de PDF**: pdf-lib

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd biblioteca
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# Gera o cliente Prisma
npm run db:generate

# Cria as tabelas no banco
npm run db:push

# Inicializa com dados de exemplo
npm run db:init
```

4. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local` na raiz do projeto:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
```

5. **Execute o projeto**
```bash
npm run dev
```

6. **Acesse o sistema**
Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 👤 Credenciais Padrão

Após executar `npm run db:init`, você pode fazer login com:

- **Email**: admin@biblioteca.com
- **Senha**: admin123

## 📚 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # APIs REST
│   │   ├── auth/          # Autenticação
│   │   └── dashboard/     # Estatísticas
│   ├── dashboard/         # Páginas do dashboard
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de login
├── components/            # Componentes React
├── lib/                   # Utilitários e configurações
│   ├── prisma.ts          # Cliente Prisma
│   └── init-db.ts         # Inicialização do banco
└── types/                 # Tipos TypeScript

prisma/
└── schema.prisma          # Schema do banco de dados

scripts/
└── init-db.js            # Script de inicialização
```

## 🎯 Funcionalidades Principais

### Dashboard
- Resumo de livros disponíveis e emprestados
- Contagem de alunos cadastrados
- Empréstimos ativos e em atraso
- Ações rápidas para operações comuns

### Gestão de Livros
- Cadastro completo com ISBN, autor, categoria
- Controle de quantidade e disponibilidade
- Localização física no acervo
- Busca e filtros

### Gestão de Alunos
- Cadastro com dados completos
- Matrícula única
- Informações de contato
- Histórico de empréstimos

### Gestão de Empréstimos
- Registro de empréstimos com data de devolução
- Controle automático de disponibilidade
- Devolução com confirmação
- Histórico completo

### Controle de Pendências
- Verificação automática de atrasos
- Lista de livros em atraso
- Alertas para devoluções pendentes
- Relatórios de inadimplência

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Validação de dados em todas as operações
- Controle de acesso por autenticação
- Proteção contra SQL injection (Prisma)

## 📊 Relatórios

O sistema permite gerar relatórios em PDF para:
- Lista de livros por categoria
- Empréstimos por período
- Alunos com pendências
- Estatísticas gerais

## 🚀 Deploy

Para fazer deploy em produção:

1. **Configure as variáveis de ambiente**
2. **Execute o build**
```bash
npm run build
npm start
```

3. **Configure o banco de dados de produção**
4. **Configure um servidor web (Nginx, Apache)**

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Consulte a documentação do Prisma e Next.js

---

**Desenvolvido com ❤️ para bibliotecas escolares** 