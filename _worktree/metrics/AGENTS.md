# AGENTS.md — example_6_cursor

Projeto full-stack: backend Express + TypeScript, frontend React + Vite + Tailwind + shadcn/ui.

## Design Context

Strategic and visual design specs live at the project root. Read both before UI work:

- **PRODUCT.md** — register (`product`), users, purpose, brand personality ("Atmospheric Glass"), anti-references, design principles, accessibility (WCAG AA on a dark surface)
- **DESIGN.md** — dark-glass tokens, typography, elevation (glass depth), components, do's/don'ts (Stitch-compatible format)

Impeccable commands (`/impeccable craft`, `polish`, `live`, etc.) consume these files automatically.

## Requirements Criticos

- **CRITICO**: Não efetue de maneira alguma comandos de `git restore`, `git rm`, `git stash`, `git checkout`

## Skills (`.claude/skills`)

| ação                                 | domínio           | skill                    |
| ------------------------------------ | ----------------- | ------------------------ |
| escrever/revisar/refatorar           | `backend/`, geral | `code-standards`         |
| componentes/páginas/hooks/UI         | `frontend/`       | `react`                  |
| testes/bugs/mudança de comportamento | ambos             | `tests`                  |
| commit final, PR, encerrar feature   | ambos             | `finalize-implementation` |

## Estrutura de pastas (sempre aplicar)

Ao criar, mover ou revisar arquivos em `backend/` e `frontend/`, respeite as camadas abaixo. Dependências fluem **de cima para baixo** — camadas inferiores **nunca** importam camadas superiores.

### Backend (`backend/src/`)

```
backend/src/
├── index.ts      # bootstrap, middleware, registro de rotas
├── routes/       # HTTP — parse input, chama services, responde
├── services/     # regras de negócio e orquestração
├── data/         # persistência e integrações externas
└── types/        # tipos compartilhados (sem lógica runtime)
```

| Pasta       | Responsabilidade                | Não colocar aqui                         |
| ----------- | ------------------------------- | ---------------------------------------- |
| `routes/`   | HTTP input/output               | regras de negócio, SQL, fetch externo    |
| `services/` | lógica, validação, orquestração | `req`/`res` do Express, SQL, HTTP client |
| `data/`     | banco e APIs externas           | handlers HTTP, decisões de negócio       |
| `types/`    | definições de tipos             | lógica ou side effects                   |

```
routes → services → data
           ↓
        types  (importado por todas as camadas)
```

### Frontend (`frontend/src/`)

```
frontend/src/
├── main.tsx, App.tsx
├── pages/        # telas (compõem hooks + components)
├── components/   # UI reutilizável (incl. ui/ do shadcn)
├── hooks/        # estado, effects, lógica de UI
├── services/     # chamadas HTTP e mapeamento de API
├── types/        # tipos compartilhados
├── lib/          # utilitários genéricos (ex.: cn)
└── assets/       # imagens, ícones
```

| Pasta         | Responsabilidade   | Não colocar aqui                         |
| ------------- | ------------------ | ---------------------------------------- |
| `pages/`      | telas completas    | fetch direto, primitivos genéricos de UI |
| `components/` | UI apresentacional | chamadas de API, roteamento de página    |
| `hooks/`      | estado e effects   | JSX, URLs de fetch                       |
| `services/`   | HTTP e mapeamento  | hooks ou components React                |
| `types/`      | tipos frontend     | components ou lógica runtime             |
| `lib/`        | helpers agnósticos | regras de negócio específicas            |

```
pages → hooks → services → (backend API)
  ↓       ↓
components  types
```

### Nomenclatura de arquivos

- **kebab-case**: `health-service.ts`, `api-status-indicator.tsx`
- Um export principal por arquivo quando possível
- Tipos em `types/`, um tipo por arquivo (kebab-case)

### Checklist rápido

- Arquivo na camada correta (backend: `routes` / `services` / `data` / `types`; frontend: `pages` / `components` / `hooks` / `services` / `types`)
- HTTP no backend fica em `routes/`; no frontend, fetch em `services/`
- Regras de negócio em `services/` (ambos os lados)
- Tipos centralizados em `types/`, sem duplicar entre camadas

## Ambiente e comandos

| Serviço  | Porta         | URL                   |
| -------- | ------------- | --------------------- |
| Backend  | 3000 (`PORT`) | http://localhost:3000 |
| Frontend | 5173          | http://localhost:5173 |

Frontend consome `http://localhost:3000/health`.

```bash
# Instalar
cd backend && npm install
cd frontend && npm install

# Desenvolvimento (dois terminais)
cd backend && npm run dev
cd frontend && npm run dev

# Testes
cd backend && npm test
cd frontend && npm test

# Build / produção
cd backend && npm run build && npm start
cd frontend && npm run build && npm run preview

# Frontend — lint e typecheck
cd frontend && npm run lint && npm run typecheck
```
