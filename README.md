# 🛰️ SkyTrace Core

O **SkyTrace Core** é o cérebro analítico do ecossistema SkyTrace. Desenvolvido como um microsserviço de missão crítica e orientado a eventos, ele é responsável por processar fluxos contínuos de telemetria de voos e cruzá-los com dados meteorológicos em tempo real para prever e mitigar riscos aéreos.

Este sistema atua para garantir que os operadores no front-end recebam dados precisos, auditáveis e com latência quase nula.

## 🌟 Principais Funcionalidades

- **Motor de Risco Ambiental:** A cada ciclo de atualização, o servidor cruza a localização exata das aeronaves com o clima daquela coordenada. Dependendo da intensidade de ventos, rajadas ou precipitação, o voo é reclassificado automaticamente (de `SAFE` para `WARNING` ou `CRITICAL`).
- **Throttling Inteligente (Economia de Recursos):** O motor de telemetria possui um sistema de *standby* automático. Ele detecta se há operadores conectados no painel; caso não haja, as requisições externas são pausadas, otimizando o consumo de APIs gratuitas e reduzindo custos.
- **Persistência e Auditoria:** Todas as ações críticas são gravadas. O histórico espacial, logs climáticos no momento da ameaça e as ordens emitidas pelos operadores (comandos de desvio) são armazenados de forma imutável para futuras auditorias.
- **Comunicação em Tempo Real:** Utiliza WebSockets para garantir que qualquer alteração de status ou comando de operador seja refletido instantaneamente em toda a rede.

## 🛠️ Tecnologias Utilizadas

- **Base:** Node.js com TypeScript.
- **Mensageria Real-Time:** Socket.io.
- **Banco de Dados:** PostgreSQL com Prisma ORM.
- **Integrações Externas:** OpenSky Network API (Telemetria) e OpenWeatherMap API (Clima).

## 🚀 Deploy

O deploy em ambiente de produção do **SkyTrace Core** foi realizado no **Render Dashboard**, garantindo alta disponibilidade para o processamento contínuo de dados(CI/CD).

---

### 💻 Como rodar localmente

1. Clone o repositório: `git clone https://github.com/Edson242/sky-trace-core`
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env` com suas credenciais de banco de dados e chaves de API.
4. Rode as migrations: `npx prisma migrate dev --name init`
5. Inicie o servidor: `npm run dev`