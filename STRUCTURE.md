# Estructura del proyecto — app/

## Raíz
```
app/
├── public/
├── src/
├── .env.development        # VITE_API_URL=http://localhost:3001
├── .env.production         # VITE_API_URL=https://api.casmedical.co
├── components.json         # shadcn/ui config
├── index.html
├── package.json
├── postcss.config.js       # @tailwindcss/postcss
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts          # alias @/ → src/
```

## src/
```
src/
├── main.tsx                # Punto de entrada — BrowserRouter + QueryClientProvider + rutas
├── index.css               # Tailwind v4 + shadcn/ui tokens
│
├── config/
│   ├── api.config.ts       # baseUrl desde VITE_API_URL
│   ├── query.client.ts     # TanStack Query client (staleTime, retry)
│   └── routes.tsx          # Definición centralizada de todas las rutas
│
├── shared/                 # Reutilizable entre todos los módulos
│   ├── layouts/
│   │   ├── LandingLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── components/
│   │   ├── ProtectedRoute.tsx    # Redirige a /login si no hay JWT
│   │   ├── PublicOnlyRoute.tsx   # Redirige a /dashboard si ya hay JWT
│   │   └── ui/                   # Componentes shadcn/ui
│   ├── hooks/
│   │   └── useMediaQuery.ts
│   ├── utils/
│   │   ├── cn.utils.ts           # clsx + tailwind-merge
│   │   └── date.utils.ts         # Formatters con date-fns
│   └── types/
│       ├── api-response.types.ts
│       └── pagination.types.ts
│
└── modules/
    ├── landing/
    │   └── screens/
    │       └── landing.tsx
    │
    ├── auth/
    │   ├── types/
    │   │   └── auth.types.ts
    │   ├── screens/
    │   │   └── login.tsx
    │   ├── hooks/
    │   │   ├── useLogin.ts
    │   │   └── components/
    │   │       └── useLoginForm.ts
    │   ├── components/
    │   │   └── LoginCard.tsx
    │   ├── services/
    │   │   └── auth.service.ts
    │   └── auth.store.ts         # Zustand — accessToken en memoria
    │
    └── dashboard/
        ├── types/
        │   └── dashboard.types.ts
        ├── screens/
        │   └── inicio.tsx
        ├── hooks/
        │   └── useInicio.ts
        ├── components/
        │   ├── KpiCard.tsx
        │   ├── QuickActions.tsx
        │   └── RecentActivity.tsx
        └── services/
            └── dashboard.service.ts
```

## Convenciones
- `screens/*.tsx` — solo JSX, cero lógica
- `hooks/use{Nombre}.ts` — lógica de cada pantalla
- `hooks/components/use{Nombre}.ts` — lógica de cada componente
- `components/*.tsx` — solo JSX, cero lógica
- `services/*.service.ts` — llamadas fetch a la API
- `*.store.ts` — Zustand stores (solo auth por ahora)

## Rutas
| Path | Componente | Acceso |
|------|-----------|--------|
| `/` | LandingPage | Público |
| `/login` | LoginPage | Solo no autenticados |
| `/dashboard/inicio` | InicioDashboardPage | JWT requerido |
