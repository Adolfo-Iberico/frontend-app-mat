# E-Lean Studio (Aulamate)

Frontend de la plataforma de aprendizaje de matemáticas (marca **Aulamate**), construido con Next.js App Router, React y TypeScript. La aplicación consume la API Laravel de `backend-app-mat` para autenticación y funciones académicas.

## Tecnologías

- Next.js 15 y React 18
- TypeScript
- Tailwind CSS y componentes Radix UI
- API REST Laravel con autenticación Bearer de Sanctum

## Funcionalidades conectadas con la API

La integración está implementada en acciones de servidor (`src/lib/actions/*`) y en el cliente HTTP `src/lib/api/client.ts`. La URL base se configura con `API_BASE_URL`; el token de acceso se almacena en una cookie `httpOnly` y las solicitudes al backend se realizan desde el servidor de Next.js.

- Registro, inicio/cierre de sesión, recuperación y cambio de contraseña.
- Inicio de sesión con Google (requiere configurar OAuth en el backend).
- Perfil de usuario y funciones de administración de cuentas, incluida la creación de cuentas de estudiantes y docentes.
- Catálogo, detalle, creación y administración de lecciones y sus recursos.
- Progreso e historial de lecciones y evaluaciones, con paneles/estadísticas por rol.
- Evaluaciones interactivas: administración de preguntas, envío de respuestas, calificación automática y revisión con respuestas correctas y explicaciones.
- Retos de aprendizaje, insignias, niveles y puntos de experiencia.
- Reportes académicos para docentes y administración, con descarga CSV.
- Seguimiento docente del progreso y resultados de estudiantes.
- Foro de preguntas y respuestas.
- Anuncios y notificaciones.

Las llamadas correspondientes están implementadas, pero su funcionamiento requiere que el backend esté configurado y disponible.

El HTML de cursos y lecciones se sanea con DOMPurify antes de renderizarse.
El backend también lo sanea al guardar contenido; la validación del cliente
no sustituye la del servidor.

## Funcionalidades locales o pendientes de integración

- Las sugerencias de recursos se calculan con una regla local sobre las lecciones y el progreso; no llaman a un servicio de IA.
- Las unidades/rutas de aprendizaje se forman agrupando lecciones por unidad temática; no usan un recurso independiente de rutas.
- El contenido informativo y promocional (por ejemplo, términos y privacidad) forma parte del frontend.
- El backend ofrece consultas de progreso para apoderados autenticados, pero este frontend no incluye una pantalla conectada a esas rutas.
- No se encontró una integración de API para pagos/compra, sesiones en vivo o emisión/validación de certificados. La disponibilidad de componentes visuales no implica que esos flujos estén operativos.

## Requisitos

- Node.js 22 (misma versión usada en CI; Next.js requiere Node.js 18.18 o superior).
- npm.
- `backend-app-mat` instalado y configurado para probar la integración completa.

## Instalación y configuración local

Desde la carpeta de este proyecto:

```powershell
npm ci
Copy-Item .env.example .env.local
```

Revisa `.env.local` y configura estas variables:

```dotenv
API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:9002
```

`API_BASE_URL` es la URL base del backend, incluyendo `/api/v1`. Para producción, configura la URL pública HTTPS del backend. `NEXT_PUBLIC_SITE_URL` es la URL pública del frontend. No pongas tokens ni credenciales privadas en variables `NEXT_PUBLIC_*`.

Para habilitar Google, configura `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_REDIRECT_URI` en el `.env` del backend. El URI de retorno local de Google es `http://localhost:8000/api/v1/auth/google/callback`; `FRONTEND_URL` debe apuntar al origen del frontend (`http://localhost:9002` en desarrollo). Registra el URI de retorno en las credenciales OAuth de Google. En producción, usa las URL HTTPS reales del backend y frontend.

En otra terminal, inicia el backend siguiendo las instrucciones de su README. Con la configuración local predeterminada, Laravel sirve la API en `http://127.0.0.1:8000`; luego inicia el frontend:

```powershell
npm run dev
```

Abre [http://localhost:9002](http://localhost:9002).

Si la API está en otro host, ajusta `API_BASE_URL`. El backend debe tener su base de datos configurada y migrada. Los endpoints protegidos requieren una cuenta válida y activa con el rol adecuado.

Para consultar el progreso de un estudiante, inicia sesión con una cuenta
activa de rol `parent` y asegúrate de que el backend tenga registrada la
relación en `parent_student`. El backend verifica esa relación en cada
solicitud a sus endpoints; el DNI no es una credencial. El CAPTCHA es de un
solo uso y no sustituye la autenticación ni el vínculo del apoderado. Este
frontend todavía no tiene una pantalla para iniciar ese flujo.

## Cuentas de demostración

Para probar la integración local, usa cuentas de desarrollo creadas por los seeders del backend. No reutilices contraseñas de demostración en producción.

## Variables de entorno

Consulta `.env.example` para los valores de desarrollo. En Vercel configura `API_BASE_URL` como variable de entorno del servidor con la URL HTTPS pública del backend, y `NEXT_PUBLIC_SITE_URL` con el dominio del frontend. Después de cambiar variables en Vercel, vuelve a desplegar para que se apliquen.

El cliente envía las solicitudes desde el servidor de Next.js, por lo que el navegador no llama directamente a la API. Si posteriormente se habilitan solicitudes directas desde el navegador, configura también el origen del frontend en CORS del backend.

## Comandos

- `npm run dev`: servidor de desarrollo en el puerto 9002.
- `npm run build`: compilación de producción.
- `npm run start`: inicia la aplicación compilada.
- `npm run typecheck`: comprueba los tipos TypeScript.
- `npm run lint`: ejecuta el script de lint configurado en `package.json`.
- `npm audit`: revisa vulnerabilidades conocidas en dependencias.

El workflow de GitHub Actions en `.github/workflows/ci.yml` ejecuta `npm ci`,
`npm run typecheck` y `npm run build` en Linux. El build requiere `API_BASE_URL`
configurada con HTTPS en producción; CI usa una URL HTTPS de prueba porque no
realiza solicitudes reales a la API durante la compilación.

## Despliegue

El proyecto utiliza Next.js y puede desplegarse en Vercel. Configura las variables de producción indicadas arriba y confirma que el backend esté publicado, accesible por HTTPS y permita las solicitudes del servidor de Next.js. No uses `127.0.0.1` o `localhost` como URL del backend en producción: allí apuntarían al propio entorno del frontend, no al servidor Laravel.

La carpeta `src/components/layout` usa minúsculas para que sus imports
funcionen en sistemas de archivos sensibles a mayúsculas como Linux.
