# Como rodar o SkyTrace Backend

## Pré-requisitos
- Node.js 20+ (testado com v24.11.1) e npm.
- `npm install` já feito (roda `prisma skills sync` no postinstall).
- Um `.env` na raiz com `DATABASE_URL` (Postgres) — copie de `.env.example` e ajuste. O `.env` atual já aponta para um banco Postgres hospedado (Prisma Postgres), então roda "out of the box" se esse `.env` for mantido.
- `PORT` (padrão 3000), `OPENSKY_CLIENT_ID`/`OPENSKY_CLIENT_SECRET`, `OPENWEATHER_API_KEY` também vêm do `.env`.

## Comando
Da raiz do projeto:

```
npm run dev
```

Isso executa `tsx watch src/server.ts`. Não precisa de build separado (tsx roda TS direto) nem de `prisma generate` — este projeto usa **Prisma Next** (contrato em `src/config/prisma/schema.prisma`), cujos artefatos (`schema.json`/`schema.d.ts`) já estão emitidos e versionados; só rode `npm run contract:emit` se editar o `schema.prisma`.

Sobe em `http://localhost:3000`. Endpoints de checagem: `GET /health` e `GET /api/metrics`.

## Bug corrigido para funcionar (contexto para a próxima pessoa)
O projeto estava em estado transicional: parte do código ainda usava a API clássica do Prisma (`@prisma/client` + `PrismaClient`) que **nunca chegou a ser gerada** (não existe `prisma/schema.prisma` clássico nem `generator`/`datasource` — o `schema.prisma` real é um contrato do Prisma Next, sem esses blocos). Isso quebrava o boot com `Cannot find module '.prisma/client/default'`.

Correções aplicadas:
- `src/config/prisma/db.ts`: importava artefatos com nome errado (`./contract.d`, `./contract.json`) — os arquivos emitidos de fato se chamam `./schema.d.ts` / `./schema.json` (o emit usa o basename do arquivo fonte apontado em `prisma.config.ts`).
- `src/modules/radar/engine.ts`: importava `{ prisma }` de `../../config/database` (client clássico não gerado). Trocado para `{ db }` de `../../config/prisma/db` (client real do Prisma Next), e as chamadas `prisma.flight.upsert(...)` / `prisma.alertLog.create({data:...})` viraram `db.orm.Flight.upsert({create, update})` / `db.orm.AlertLog.create({...campos...})`, a API do Prisma Next.

`src/config/database.ts` (o client clássico, sem uso) e a dependência `@prisma/client` foram removidos.

## Erros comuns
- **"Cannot find module '.prisma/client/default'"**: sintoma do bug acima, já corrigido. Se reaparecer, verifique se algum arquivo voltou a importar de `config/database.ts`.
- **Porta 3000 ocupada**: mude `PORT` no `.env` ou libere a porta.
- **Falha ao conectar no banco**: confira `DATABASE_URL` no `.env`; as migrations já foram aplicadas nesse banco (`migrations/app/refs/db.json` tem um ref `db` gravado).
