# Design System — Painel de Clima

## Overview

Aplicação utilitária simples: o usuário digita uma cidade (ou aceita sua geolocalização) e vê o clima atual. O design prioriza clareza, calma e leitura imediata.

## Color

Base neutra levemente ar Polar, com uma cor de acento céu (azul-ácido) para ações. Tem dark mode embutido.

```
:root {
  --background: 0 0% 100%;
  --foreground: 220 18% 14%;
  --card: 0 0% 100%;
  --card-foreground: 220 18% 14%;
  --popover: 0 0% 100%;
  --popover-foreground: 220 18% 14%;
  --primary: 204 75% 44%;
  --primary-foreground: 0 0% 100%;
  --secondary: 210 25% 96%;
  --secondary-foreground: 220 18% 14%;
  --muted: 210 22% 96%;
  --muted-foreground: 215 14% 46%;
  --accent: 205 89% 94%;
  --accent-foreground: 204 70% 22%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 214 20% 90%;
  --input: 214 20% 90%;
  --ring: 204 75% 44%;
  --radius: 0.625rem;
}
```

Dark mode:

```
.dark {
  --background: 220 24% 8%;
  --foreground: 210 20% 96%;
  --card: 220 20% 11%;
  --card-foreground: 210 20% 96%;
  --popover: 220 20% 11%;
  --popover-foreground: 210 20% 96%;
  --primary: 199 81% 52%;
  --primary-foreground: 220 30% 8%;
  --secondary: 220 16% 16%;
  --secondary-foreground: 210 20% 96%;
  --muted: 220 16% 16%;
  --muted-foreground: 215 14% 62%;
  --accent: 204 55% 20%;
  --accent-foreground: 199 90% 88%;
  --destructive: 0 62% 46%;
  --destructive-foreground: 0 0% 100%;
  --border: 220 15% 20%;
  --input: 220 15% 20%;
  --ring: 199 81% 52%;
}
```

## Typography

- **Fonte**: Tailwind default stack (Inter/system-ui).
- **Escalas**:
  - Título principal da cidade: `text-5xl md:text-7xl`, `font-semibold`, `tracking-tight`.
  - Temperatura atual: `text-6xl md:text-8xl`, `font-light`, `tabular-nums`.
  - Rótulos secundários: `text-sm`, `text-muted-foreground`, `uppercase tracking-wide`.

## Spacing

- Container centralizado, máximo `max-w-2xl`.
- Padding: `p-8` (mobile), `p-12` (desktop).
- Gap entre elementos principais: `gap-8`.

## Components

### Search

Input centralizado com botão integrado. Borda suave, foco via ring. Placeholder legível (contraste ≥ 4.5:1).

### Weather Card

Fundo de superfície com borda sutil. Layout vertical:
1. Cidade e país.
2. Temperatura grande e ícone de condição.
3. Grid de detalhes (sensação térmica, umidade, vento) em 3 colunas no desktop, 1 no mobile.

### Status Badge

Pill pequeno com indicador redondo (mantido do projeto base) para comunicar API status.

## Motion

- Transições de entrada: `fade-in` com opacity + translateY (0.35s ease-out).
- Reduced motion: transições desabilitadas.
- Nenhuma animação de layout (width/height).

## Responsive

- Mobile-first.
- Painel ocupa toda a largura em telas pequenas, limitado a `max-w-2xl` em desktop.
- Grid de detalhes passa de 3 para 1 coluna abaixo de `md`.
