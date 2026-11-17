# Campus Resource API

A REST API where students can discover and share learning resources such as notes, links, and study material.

## Features

- Register and log in with JWT authentication and bcrypt password hashing
- Resource CRUD (create, list, view, update, delete)
- Resource search, subject/category/semester filters, and pagination
- Categories (admin-only create/delete)
- Resource reviews with 1–5 ratings (one review per user per resource; updating is supported)
- Zod request validation and centralized error responses
- Prisma ORM with PostgreSQL
- Health endpoint and seed script

## Requirements

- Node.js LTS and npm
- PostgreSQL installed and running, with a database named `campus_resource_api`
- Postman (optional, recommended for testing)

## Setup on Windows / PowerShell

1. Extract the ZIP. If merging into your existing project, back up your current `package.json` and `.env` first.
2. Open this folder in VS Code.
3. Install dependencies:

   ```powershell
   npm install
   ```

4. Copy `.env.example` to `.env` and set your PostgreSQL password and a long JWT secret.

   Example (replace `YOUR_PASSWORD` with your actual local PostgreSQL password):

   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/campus_resource_api?schema=public"
   JWT_SECRET="use-a-long-random-secret-at-least-32-characters"
   JWT_EXPIRES_IN=7d
   ```

5. Create a PostgreSQL database named `campus_resource_api`. In pgAdmin, right-click **Databases → Create → Database**. Or, in `psql`, run:

   ```sql
   CREATE DATABASE campus_resource_api;
   ```

6. Generate Prisma Client and create the tables:

   ```powershell
   npx prisma generate
   npx prisma migrate dev --name init
   ```

7. Add starter categories:

   ```powershell
   npm run db:seed
   ```

8. Start the API:

   ```powershell
   npm run dev
   ```

9. Open `http://localhost:5000/` or test with Postman.

## Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/` | No | API welcome / endpoint list |
| GET | `/api/health` | No | API + database health check |
| POST | `/api/auth/register` | No | Create student account |
| POST | `/api/auth/login` | No | Log in and receive JWT |
| GET | `/api/auth/me` | Bearer token | Current user |
| GET | `/api/resources` | No | List/search/filter/paginate resources |
| GET | `/api/resources/:id` | No | Resource details and reviews |
| POST | `/api/resources` | Bearer token | Create resource |
| PATCH | `/api/resources/:id` | Owner or admin | Update resource |
| DELETE | `/api/resources/:id` | Owner or admin | Delete resource |
| GET | `/api/categories` | No | List categories |
| POST | `/api/categories` | Admin | Create category |
| DELETE | `/api/categories/:id` | Admin | Delete category |
| PUT | `/api/resources/:resourceId/reviews` | Bearer token | Create/update own review |
| DELETE | `/api/resources/:resourceId/reviews/:reviewId` | Owner or admin | Delete review |

## Postman quick tests

Base URL: `http://localhost:5000`

### 1. Register

`POST /api/auth/register`

Body → raw → JSON:

```json
{
  "name": "Test Student",
  "email": "student@example.com",
  "password": "StrongPass123"
}
```

Copy `data.token` from the response.

### 2. Create a resource

`POST /api/resources`

Authorization → Bearer Token → paste the token.

Body → raw → JSON:

```json
{
  "title": "DBMS Notes",
  "description": "Semester notes covering relational databases and SQL.",
  "url": "https://example.com/dbms-notes.pdf",
  "subject": "DBMS",
  "semester": 4,
  "fileType": "PDF",
  "tags": ["dbms", "notes"]
}
```

### 3. List resources

`GET /api/resources?page=1&limit=10&search=DBMS`

### 4. Login

`POST /api/auth/login`

```json
{
  "email": "student@example.com",
  "password": "StrongPass123"
}
```

## Important notes

- The first registered user is a `STUDENT`. Admin-only category routes return 403 until an account's role is explicitly promoted to `ADMIN` in your local database.
- Never commit `.env` or real secrets to GitHub.
- The API stores resource URLs; it does not upload files to cloud storage.
- Before deploying publicly, configure production CORS, rate limiting, HTTPS, logging, and a managed PostgreSQL database.
- This starter is intended for learning and a college project. Review and test the code before presenting it as production-ready.
