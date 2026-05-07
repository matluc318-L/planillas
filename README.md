# Sistema de gestión de empleados y planillas

Aplicación web de nivel intermedio: **React (Vite) + TailwindCSS** en el frontend y **Node.js (Express) + Prisma + SQLite + JWT** en el backend.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (recomendado 20+)
- npm (incluido con Node)

## Estructura

```
yatusabe/
├── backend/          # API REST
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── middlewares/
│       ├── prisma/   # Cliente Prisma
│       └── app.js
├── frontend/         # SPA React
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       └── context/
└── README.md
```

## Instalación y ejecución

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

La API queda en `http://localhost:5000`. Variables en `.env`:

- `DATABASE_URL` — ruta al archivo SQLite (por defecto `file:./dev.db`)
- `JWT_SECRET` — secreto para firmar tokens (cámbialo en producción)
- `PORT` — puerto del servidor (opcional, por defecto 5000)

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La app abre en `http://localhost:5173`. El proxy de Vite reenvía `/api` al backend en el puerto 5000.

## Credenciales de prueba (seed)

Tras `npm run db:seed`:

- **Email:** `admin@empresa.com`
- **Contraseña:** `admin123`

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login (email, password) → JWT |
| GET | `/api/empleados` | Listar / buscar (`?q=texto`) — requiere Bearer token |
| POST | `/api/empleados` | Crear — requiere token |
| PUT | `/api/empleados/:id` | Actualizar — requiere token |
| DELETE | `/api/empleados/:id` | Eliminar — requiere token |
| GET | `/api/planillas` | Listar — requiere token |
| POST | `/api/planillas` | Generar planilla — requiere token |

**Planilla:** el sueldo neto se calcula en el servidor como `salarioBase - descuento + bono`.

## Producción

- Backend: `npm start` (tras definir `NODE_ENV` y un `JWT_SECRET` seguro).
- Frontend: `npm run build` y servir la carpeta `frontend/dist` con un servidor estático o integrar con Express.
