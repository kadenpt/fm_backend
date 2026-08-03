# fm_backend

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` with your Postgres connection string:

```
PORT=5050
DATABASE_URL=postgresql://user:password@localhost:5432/fm
```

## Run

Development (watch mode):

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Routes

- `GET /health` — health check
