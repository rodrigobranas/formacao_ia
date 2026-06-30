# Tarefa 3.0: E2E — validação ponta a ponta (Playwright)

## Visão geral

Valida o produto inteiro (frontend + backend juntos) ponta a ponta com **Playwright**, cobrindo os fluxos das histórias de usuário US1–US10 e os estados/erros exigidos pelo PRD. A Open-Meteo é **mockada por interceptação de rede** (route fulfill) para determinismo total — nenhum teste depende da rede externa. Inclui a instalação/configuração do `@playwright/test` e a verificação automatizada de acessibilidade (axe) na superfície escura.

Esta tarefa depende das Tarefas 1.0 e 2.0 concluídas (API + UI integradas).

<skills>
### Conformidade com skills

- **`tests`** — Playwright para E2E (suporte agora incluído na skill); Open-Meteo mockada por interceptação de rede, testes determinísticos e independentes.
- **`impeccable`** — referência de acessibilidade/craft ao validar WCAG 2.1 AA na superfície escura.
- **`finalize-implementation`** — encerramento da feature: commit convencional, screenshots, checklist de qualidade e PR (após a suíte E2E verde).
</skills>

<requirements>
- **US1–US5** — fluxo principal: buscar cidade, autocomplete/desambiguação, clima atual, 24h, 7 dias e métricas extras (UV, arco solar, qualidade do ar).
- **US6** — geolocalização concedida carrega o clima local.
- **US7** — cidade não encontrada exibe mensagem clara em PT-BR.
- **US8** — permissão de localização negada mantém a busca manual operante.
- **US9** — falha de rede/fonte exibe toast de erro com "Tentar de novo" que recupera após o mock voltar a `200`.
- **US10 / RF23** — estados de carregamento (skeletons) visíveis durante atraso simulado.
- **RF17** — métrica indisponível (`air: null`) mostra o estado vazio do cartão de qualidade do ar.
- **RF26** — operação completa por teclado e ausência de dependência exclusiva de cor; conformidade WCAG 2.1 AA validada com axe; respeito a `prefers-reduced-motion`.
</requirements>

## Subtarefas

- [x] 3.1 Adicionar `@playwright/test` ao frontend (`package.json` + script `test:e2e`) e configurar `playwright.config.ts` (subir backend + frontend, baseURL, projetos de browser, contexto com `geolocation`/permissões).
- [x] 3.2 Criar utilitário de mock da Open-Meteo por interceptação de rede (route fulfill) reutilizando as fixtures JSON versionadas (dia/noite, grupos WMO, `air` ausente, geocoding vazio e homônimos), com variações de `200`, `502` e atraso/timeout.
- [x] 3.3 Implementar os 9 specs em `frontend/e2e/*.spec.ts` cobrindo os fluxos abaixo, incluindo a verificação axe e navegação por teclado na superfície escura.

## Detalhes de implementação

Ver [`techspec.md`](./techspec.md): "Abordagem de testes → Testes E2E" (lista dos 9 cenários e a estratégia de mock por interceptação de rede) e "Pontos de integração" (URLs da Open-Meteo a interceptar). As fixtures reutilizadas são as versionadas na Tarefa 1.0 ("Dados de teste").

Pontos-chave a respeitar:
- Open-Meteo **sempre** mockada via `page.route(...)`/route fulfill — nunca rede real (mitiga flakiness).
- Geolocalização: usar contexto Playwright com `geolocation` e `permissions` para os caminhos concedido/negado.
- Erro recuperável: alternar o mock de `502`/timeout para `200` e validar que "Tentar de novo" recarrega.
- Acessibilidade: rodar axe na superfície escura; validar navegação completa por teclado (busca → listbox → seleção) e `prefers-reduced-motion`.

## Critérios de sucesso

- Os 9 specs passam de forma determinística e independente, sem acesso à rede externa.
- Fluxo principal ponta a ponta verde (busca → seleção → hero/24h/7d/extras), além de geolocalização, permissão negada, cidade não encontrada, falha de rede com retry, métrica indisponível e skeletons.
- Verificação axe sem violações na superfície escura; navegação por teclado completa funcional; `prefers-reduced-motion` respeitado.
- Suíte integrável ao fluxo de finalização (`finalize-implementation`).

## Testes da tarefa

### Testes unitários

- N/A (cobertos pelas Tarefas 1.0 e 2.0).

### Testes de integração

- N/A (cobertos pelas Tarefas 1.0 e 2.0).

### Testes E2E (Playwright, Open-Meteo mockada)

- [x] #1 **Fluxo principal (US1–US5):** digitar cidade → selecionar sugestão → ver clima atual, 24h, 7 dias, métricas, UV, arco solar e qualidade do ar.
- [x] #2 **Autocomplete/desambiguação (US1):** termo com homônimos lista variações com estado/país.
- [x] #3 **Geolocalização (US6):** conceder permissão (contexto com geolocation) carrega o clima local.
- [x] #4 **Permissão negada (US8):** negar geolocalização mantém a busca manual operante.
- [x] #5 **Cidade não encontrada (US7):** busca inválida exibe mensagem clara em PT-BR.
- [x] #6 **Falha de rede/fonte (US9):** mock de `502`/timeout exibe toast de erro; "Tentar de novo" recupera após o mock voltar a `200`.
- [x] #7 **Métrica indisponível (RF17):** mock com `air: null` mostra o estado vazio do cartão de qualidade do ar.
- [x] #8 **Estados de carregamento (RF23/US10):** skeletons visíveis durante atraso simulado da resposta.
- [x] #9 **Acessibilidade (WCAG 2.1 AA):** navegação por teclado completa (busca → listbox → seleção) + verificação axe na superfície escura; respeito a `prefers-reduced-motion`.

## Arquivos relevantes

**Novos:** `frontend/e2e/*.spec.ts` (9 specs); utilitário de mock/route fulfill da Open-Meteo; `frontend/playwright.config.ts`.
**Modificados:** `frontend/package.json` (dep/script: `@playwright/test`, `test:e2e`).
**Reutilizados:** fixtures JSON da Open-Meteo versionadas na Tarefa 1.0.
