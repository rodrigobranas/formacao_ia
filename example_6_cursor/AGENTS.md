# AGENTS.md — example_6_cursor

Projeto full-stack com backend Express e frontend React (Vite).

## Regras do projeto

Consulte e aplique as rules em `.cursor/rules/` — **não duplique o conteúdo delas aqui**:

| Rule | Arquivo | Quando usar |
|------|---------|-------------|
| Code standards | [code-standards.md](.cursor/rules/code-standards.md) | Ao escrever ou revisar código em `backend/` e `frontend/` |
| Folder structure | [folder-structure.md](.cursor/rules/folder-structure.md) | Ao criar, mover ou organizar arquivos |
| React | [react.md](.cursor/rules/react.md) | Ao escrever ou revisar componentes, pages e hooks |
| Testing | [tests.md](.cursor/rules/tests.md) | Ao implementar features, corrigir bugs ou alterar comportamento |

## Estrutura

```
example_6_cursor/
├── backend/   # API REST (Express + TypeScript)
└── frontend/  # UI (React + Vite + Tailwind + shadcn/ui)
```

## Portas

| Serviço   | Porta | URL                          |
|-----------|-------|------------------------------|
| Backend   | 3000  | http://localhost:3000        |
| Frontend  | 5173  | http://localhost:5173        |

O backend aceita a variável de ambiente `PORT` (padrão: `3000`). O frontend consome a API em `http://localhost:3000/health`.

## Instalação de dependências

Execute em terminais separados ou sequencialmente:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Executar o projeto

Em dois terminais:

```bash
# Terminal 1 — Backend (modo desenvolvimento com hot reload)
cd backend
npm run dev

# Terminal 2 — Frontend (Vite dev server)
cd frontend
npm run dev
```

### Outros comandos úteis

```bash
# Backend — build e produção
cd backend
npm run build
npm start

# Frontend — build, preview, lint e testes
cd frontend
npm run build
npm run preview
npm run lint
npm run typecheck
npm test

# Backend — testes
cd backend
npm test
```

## Principais dependências

### Backend

| Pacote     | Uso                                      |
|------------|------------------------------------------|
| express    | Servidor HTTP e rotas                    |
| cors       | Cross-Origin Resource Sharing            |
| dotenv     | Variáveis de ambiente                    |
| typescript | Tipagem estática                         |
| tsx        | Execução de TypeScript em desenvolvimento|
| nodemon    | Reinício automático do servidor          |
