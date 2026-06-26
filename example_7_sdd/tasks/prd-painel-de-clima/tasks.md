# Resumo das tarefas de implementação de Painel de Clima

> Referências: [`prd.md`](./prd.md) · [`techspec.md`](./techspec.md) · Design obrigatório: `docs/design/index.html` · Layering: `AGENTS.md`

## Tarefas

- [x] 1.0 Backend — origem única de dados (API de clima)
- [x] 2.0 Frontend — painel de clima completo
- [x] 3.0 E2E — validação ponta a ponta (Playwright)

## Mapa de dependências

```
1.0 (backend: types → data → services → routes)
      ↓  contrato /api/weather* estável
2.0 (frontend: services → hooks → lib → components → page/App)
      ↓  app integrada
3.0 (E2E Playwright com Open-Meteo mockada)
```

## Cobertura de testes (todos os casos da techspec alocados)

| Tarefa | Unitários | Integração | E2E |
| --- | --- | --- | --- |
| 1.0 | #1–26 (client, codes, service) | #1–8 (rotas via supertest) | — |
| 2.0 | #27–55 (api, hooks, lib, componentes) | #9–13 (fluxos US1–US9) | — |
| 3.0 | — | — | #1–9 (Playwright, Open-Meteo mockada) |
