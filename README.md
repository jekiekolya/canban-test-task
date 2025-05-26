# Kanban Test Task

A Node.js backend project using **GraphQL**, **Prisma**, and **PostgreSQL**, containerized with **Docker**.

## Stack

- **Node.js** + **TypeScript**
- **GraphQL** with Apollo Server
- **Prisma ORM**
- **PostgreSQL**
- **Docker + docker-compose**

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/kanban-test-task.git
cd kanban-test-task
```

### 2. Start PostgreSQL via Docker

Start the PostgreSQL service defined in `docker-compose.yml`:

```bash
docker-compose up -d
```

This runs a PostgreSQL container with:

- **User**: `kanban`
- **Password**: `kanban`
- **Database**: `kanban`

> The container will be accessible at `localhost:5432`.

---

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://kanban:kanban@localhost:5432/kanban"
JWT_SECRET=your-very-secure-secret
PORT=4000
```

---

### 4. Install Dependencies

```bash
npm install
```

---

### 5. Apply Prisma Migrations

```bash
npm run prisma:migrate
```

This will apply your Prisma schema to the PostgreSQL DB.

---

### 6. Start the Development Server

```bash
npm run dev
```

The GraphQL server should now be running at:

```
http://localhost:4000/graphql
```

---

## Available Scripts

- `npm run dev` – Start server in development mode
- `npm run build` – Compile TypeScript to JavaScript
- `npm start` – Run the compiled server
- `npm run prisma:migrate` – Apply local DB migrations
- `npm run prisma:generate` – Generate Prisma client
- `npm run test` – Run tests
- `npm run lint` – Lint the codebase
- `npm run format` – Format code with Prettier

---

## Testing

To run all tests:

```bash
npm test
```

---

## License

ISC
