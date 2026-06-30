# Documento de Requisitos do Produto (PRD)

<critical>
DESIGN DE REFERÊNCIA (LAYOUT OBRIGATÓRIO): `docs/design/index.html`

Este arquivo é o layout de referência visual para esta funcionalidade e DEVE ser lido antes de qualquer trabalho de implementação ou especificação técnica. A interface do Painel de Clima deve seguir fielmente a estrutura, hierarquia, composição e linguagem visual definidas nesse design (incluindo disposição dos blocos de clima atual, previsão de 24h e 7 dias, métricas extras e estados de interface). Qualquer divergência em relação a esse design deve ser explicitamente justificada.
</critical>

## Visão Geral

O **Painel de Clima** resolve uma necessidade direta: permitir que a pessoa consulte, em um só lugar, o clima atual e a previsão de qualquer cidade de forma rápida e confiável. Hoje a aplicação possui apenas o esqueleto de frontend e backend, sem nenhuma capacidade de clima. Esta feature entrega uma ferramenta de clima funcional e precisa, no padrão de um produto de consumo: o usuário busca uma cidade (com sugestões de autocomplete) ou usa um botão de localização, e visualiza as condições atuais, a previsão das próximas 24 horas e dos próximos 7 dias, além de métricas complementares (qualidade do ar, índice UV e horários de nascer/pôr do sol). Todos os dados são fornecidos exclusivamente pelo backend da própria aplicação, que orquestra as APIs públicas da Open-Meteo.

O público-alvo são desenvolvedores em formação que usam a aplicação como sandbox de aprendizado full-stack, avaliando como uma interface real comunica estado e dados. Por isso o valor é duplo: como produto, entrega informação meteorológica correta e útil; como referência de engenharia, demonstra um padrão limpo de integração frontend ↔ backend ↔ API externa, com estados de interface visíveis e dados honestos.

## Objetivos

- **Resolver cidade corretamente:** a busca por nome retorna a cidade pretendida entre as sugestões em ≥ 95% das consultas de cidades válidas (incluindo desambiguação de homônimos por estado/país).
- **Tempo até o resultado:** da seleção da cidade até a exibição das condições atuais em ≤ 3 segundos na maioria das consultas (rede normal).
- **Precisão dos dados:** os valores exibidos refletem fielmente a fonte (Open-Meteo), sem transformação que altere o significado do dado; divergência apenas por arredondamento documentado.
- **Cobertura de estados:** 100% dos estados relevantes (carregando, sucesso, vazio/sem dados, cidade não encontrada, erro de rede, API indisponível) possuem feedback claro em PT-BR.
- **Acessibilidade:** conformidade com WCAG 2.1 AA na superfície escura para os fluxos principais (busca, leitura de dados, geolocalização).
- **Métricas a acompanhar:** taxa de sucesso de busca, tempo médio até resultado, taxa de erro por origem (cidade não encontrada vs. falha de API), uso do botão de geolocalização, taxa de quedas (estado de erro exibido).

## Histórias de Usuário

- **US1** — Como usuário, quero digitar o nome de uma cidade e receber sugestões (autocomplete) para selecionar a cidade certa rapidamente, mesmo quando há nomes repetidos.
- **US2** — Como usuário, quero ver as condições atuais da cidade escolhida (temperatura, sensação térmica, descrição do tempo, vento e umidade) para saber como está o clima agora.
- **US3** — Como usuário, quero visualizar a previsão das próximas 24 horas em um gráfico para planejar o restante do meu dia.
- **US4** — Como usuário, quero ver a previsão dos próximos 7 dias (mínima, máxima e condição) para planejar a semana.
- **US5** — Como usuário, quero consultar qualidade do ar, índice UV e horários de nascer e pôr do sol para tomar decisões de saúde e exposição.
- **US6** — Como usuário, quero acionar um botão "usar minha localização" para ver o clima de onde estou sem precisar digitar.
- **US7** *(caso de borda)* — Como usuário que digitou uma cidade inexistente, quero uma mensagem clara de "cidade não encontrada" para corrigir a busca.
- **US8** *(caso de borda)* — Como usuário que negou a permissão de localização, quero continuar usando a busca manual normalmente, sem bloqueio.
- **US9** *(caso de borda)* — Como usuário em rede instável ou com a fonte de dados indisponível, quero uma mensagem de erro com opção de tentar novamente, para não ficar sem saber o que aconteceu.
- **US10** *(persona secundária)* — Como desenvolvedor-aprendiz, quero observar claramente os estados de carregamento, erro e indisponibilidade da API para estudar como uma ferramenta real comunica seu estado.

## Principais funcionalidades

### 1. Busca de cidade com autocomplete
- **O que faz:** permite digitar o nome de uma cidade e exibe sugestões correspondentes para seleção.
- **Por que é importante:** é o ponto de entrada do produto; reduz erro de escolha e resolve ambiguidade de nomes repetidos.
- **Como funciona (alto nível):** a interface envia o termo ao backend, que retorna as cidades candidatas com elementos de desambiguação (estado/país); o usuário seleciona uma.
- **Requisitos funcionais:**
  - **RF1.** O sistema deve exibir sugestões de cidade à medida que o usuário digita.
  - **RF2.** Cada sugestão deve apresentar informação suficiente para distinguir homônimos (ex.: estado/região e país).
  - **RF3.** O sistema deve permitir selecionar uma sugestão e usá-la como cidade ativa do painel.
  - **RF4.** Quando nenhuma cidade corresponder ao termo, o sistema deve informar "cidade não encontrada".

### 2. Clima atual
- **O que faz:** exibe as condições meteorológicas correntes da cidade ativa.
- **Por que é importante:** é a informação central e mais consultada do painel.
- **Como funciona (alto nível):** após a cidade ser definida, o backend retorna as condições atuais e a interface as apresenta com destaque.
- **Requisitos funcionais:**
  - **RF5.** O sistema deve exibir a temperatura atual e a sensação térmica.
  - **RF6.** O sistema deve exibir a descrição do tempo (ex.: limpo, nublado, chuva) com rótulo textual em PT-BR.
  - **RF7.** O sistema deve exibir métricas de apoio: vento e umidade.
  - **RF8.** O sistema deve indicar a cidade ativa à qual os dados se referem.

### 3. Previsão das próximas 24 horas
- **O que faz:** mostra a evolução horária prevista para as próximas 24 horas.
- **Por que é importante:** apoia decisões de curtíssimo prazo (sair agora, levar guarda-chuva).
- **Como funciona (alto nível):** o backend fornece a série horária e a interface a apresenta como gráfico legível.
- **Requisitos funcionais:**
  - **RF9.** O sistema deve exibir a previsão horária das próximas 24 horas em formato gráfico.
  - **RF10.** O gráfico deve comunicar, no mínimo, a temperatura prevista ao longo das horas.
  - **RF11.** Os valores horários devem ser legíveis também por rótulo textual, não apenas pela curva visual.

### 4. Previsão dos próximos 7 dias
- **O que faz:** apresenta a previsão diária para os próximos 7 dias.
- **Por que é importante:** apoia o planejamento semanal.
- **Como funciona (alto nível):** o backend retorna a série diária e a interface lista cada dia com seus indicadores.
- **Requisitos funcionais:**
  - **RF12.** O sistema deve exibir a previsão para os próximos 7 dias.
  - **RF13.** Cada dia deve apresentar temperatura mínima, máxima e a condição do tempo.

### 5. Métricas extras (qualidade do ar, índice UV e arco solar)
- **O que faz:** complementa o panorama com qualidade do ar, índice UV e horários de nascer/pôr do sol.
- **Por que é importante:** agrega valor de saúde e exposição, aproximando o painel de um produto de consumo completo.
- **Como funciona (alto nível):** o backend agrega esses indicadores para a cidade ativa e a interface os exibe de forma compacta.
- **Requisitos funcionais:**
  - **RF14.** O sistema deve exibir o índice de qualidade do ar com rótulo qualitativo (ex.: boa, moderada, ruim).
  - **RF15.** O sistema deve exibir o índice UV com rótulo qualitativo.
  - **RF16.** O sistema deve exibir os horários de nascer e pôr do sol (arco solar) da cidade ativa.
  - **RF17.** Quando algum desses indicadores não estiver disponível, o sistema deve exibir um estado vazio explícito em vez de ocultar silenciosamente.

### 6. Geolocalização por botão manual
- **O que faz:** permite obter o clima da localização atual do usuário sob ação explícita.
- **Por que é importante:** acelera o acesso ao clima local sem digitação.
- **Como funciona (alto nível):** ao acionar o botão, o navegador solicita permissão; havendo consentimento, as coordenadas são usadas para definir a cidade ativa via backend.
- **Requisitos funcionais:**
  - **RF18.** O sistema deve oferecer um botão explícito "usar minha localização".
  - **RF19.** A localização só pode ser obtida após consentimento do usuário no navegador.
  - **RF20.** Se a permissão for negada ou indisponível, o sistema deve manter a busca manual funcional e informar o usuário sem bloquear o uso.

### 7. Origem única de dados via backend
- **O que faz:** garante que o frontend obtenha todos os dados de clima apenas do backend da aplicação.
- **Por que é importante:** centraliza a integração com a fonte externa, é o padrão de arquitetura que a feature deve demonstrar e evita acoplamento do frontend à API externa.
- **Como funciona (alto nível):** o backend expõe endpoint(s) próprios que orquestram as APIs da Open-Meteo e devolvem dados prontos para exibição.
- **Requisitos funcionais:**
  - **RF21.** O frontend deve consumir exclusivamente o backend da aplicação para qualquer dado de clima, geocoding ou métrica.
  - **RF22.** O backend deve expor endpoint(s) próprios que sirvam os dados necessários ao painel.

### 8. Estados de interface visíveis
- **O que faz:** comunica claramente carregamento, sucesso, vazio e falhas.
- **Por que é importante:** confiabilidade percebida e valor didático; o usuário sempre entende o que está acontecendo.
- **Como funciona (alto nível):** cada fluxo possui um estado correspondente com copy em PT-BR e, quando aplicável, ação de recuperação.
- **Requisitos funcionais:**
  - **RF23.** O sistema deve exibir um estado de carregamento durante a obtenção de dados.
  - **RF24.** O sistema deve exibir mensagens de erro distintas para "cidade não encontrada", "falha de rede" e "fonte de dados indisponível".
  - **RF25.** Estados de erro recuperáveis devem oferecer a opção de tentar novamente.
  - **RF26.** Todas as mensagens de estado devem estar em PT-BR e não depender apenas de cor para comunicar o significado.

## Experiência do usuário

- **Personas e necessidades:** persona primária é a pessoa que quer consultar o clima de uma cidade de forma rápida e confiável; persona secundária é o desenvolvedor-aprendiz que estuda como a interface comunica dados e estado. Ambas precisam de leitura imediata, dados honestos e feedback claro.
- **Fluxo principal:** o usuário abre o painel → busca uma cidade e seleciona uma sugestão (ou aciona o botão de localização) → vê as condições atuais em destaque, a previsão de 24h, a de 7 dias e as métricas extras → corrige a cidade quando quiser repetir a consulta.
- **Fluxos secundários e de borda:** cidade não encontrada (mensagem orientando correção), permissão de localização negada (continua na busca manual), métrica indisponível (estado vazio explícito), rede/API com falha (mensagem com opção de tentar novamente).
- **Considerações de UI/UX:** o layout deve seguir o design de referência obrigatório em `docs/design/index.html` (ver bloco `<critical>` no topo deste documento); hierarquia centrada no dado (temperatura e condição dominam; cromo recua); previsões legíveis tanto visual quanto textualmente; copy direta e informativa em PT-BR; layout responsivo adequado a uso em tela dividida (editor + navegador) e em telas menores.
- **Requisitos de acessibilidade:** conformidade com WCAG 2.1 AA em superfície escura (contraste de texto ≥ 4,5:1 para corpo e ≥ 3:1 para texto grande, verificado sobre o fundo composto); operação completa por teclado para busca, navegação no autocomplete (setas/Enter/Esc, semântica de listbox) e botão de localização; respeito a `prefers-reduced-motion` com alternativa estática/crossfade; cor nunca como único indicador de estado (sempre acompanhada de rótulo ou ícone).

## Restrições técnicas de alto nível

- **Integração externa obrigatória:** dados provenientes da família de APIs públicas da Open-Meteo (geocoding, previsão e qualidade do ar), gratuitas e sem necessidade de chave de API.
- **Arquitetura de consumo:** o frontend deve acessar os dados somente através do backend da aplicação; o frontend não chama a Open-Meteo diretamente.
- **Exposição de backend:** o backend deve disponibilizar endpoint(s) próprios para o painel consumir.
- **Privacidade de dados:** a geolocalização só pode ser usada mediante consentimento explícito do usuário; coordenadas não devem ser persistidas nem associadas a identidade.
- **Desempenho/escala:** alvo de latência de resposta percebida ≤ 3 segundos para a consulta principal em rede normal; a solução deve degradar com elegância quando a fonte externa estiver lenta ou indisponível.
- **Idioma:** toda a interface e mensagens em PT-BR.
- **Unidade de medida:** temperatura apresentada em Celsius como padrão (sem alternância de unidade nesta feature).
- **Acessibilidade não negociável:** WCAG 2.1 AA na superfície escura.

*Os detalhes de implementação (endpoints específicos, contratos de dados, bibliotecas, caching e estratégia de erros) serão tratados na Especificação Técnica.*

## Fora do escopo

- Alternância de unidades °C/°F (apenas Celsius nesta feature).
- Cidades favoritas/fixadas e qualquer persistência de preferências entre sessões.
- Sugestão automática de cidade por geolocalização ao carregar a página (a geolocalização é apenas por botão manual).
- Autenticação, contas ou perfis de usuário.
- Alertas, notificações ou avisos meteorológicos.
- Histórico de clima passado e dados climatológicos de longo prazo.
- Mapas interativos, radar de precipitação ou camadas geográficas.
- Aplicativo mobile nativo (apenas a aplicação web existente).
- Internacionalização para outros idiomas além de PT-BR.

*(Nota: riscos técnicos de implementação serão detalhados na Especificação Técnica.)*
