# Glow Studio

Glow Studio es una aplicación web para administrar las operaciones principales de un salón de belleza: mostrar servicios, reservar citas en línea y permitir que el personal administrador consulte y gestione la agenda.

## Tabla de contenidos

- [Necesidad que resuelve](#necesidad-que-resuelve)
- [Roles y navegación](#roles-y-navegación)
- [Arquitectura y organización](#arquitectura-y-organización)
- [Tecnologías y librerías](#tecnologías-y-librerías)
- [Requisitos](#requisitos)
- [Configuración e inicio paso a paso](#configuración-e-inicio-paso-a-paso)
- [Rutas principales de la API](#rutas-principales-de-la-api)
- [Datos, seguridad y consideraciones de desarrollo](#datos-seguridad-y-consideraciones-de-desarrollo)
- [Preguntas técnicas frecuentes](#preguntas-técnicas-frecuentes)

## Necesidad que resuelve

El sistema reúne en una aplicación las tareas básicas de atención y operación de Glow Studio:

- Presenta el catálogo público de servicios con descripción, precio y duración.
- Permite que los clientes se registren e inicien sesión con correo electrónico.
- Permite reservar una cita eligiendo un servicio, estilista, fecha y hora.
- Valida que la fecha sea futura, que el servicio y el estilista estén activos y que el estilista no tenga un conflicto de horario.
- Proporciona al administrador una agenda con el cliente, el servicio, el estilista, el precio y el estado de cada cita.
- Permite al administrador actualizar estados y eliminar citas.
- Conserva las entidades relacionadas en MongoDB: usuarios, servicios, estilistas y citas.

## Roles y navegación

### Cliente

1. Abre la página principal en `http://localhost:9001/` (o el puerto que muestre Quasar).
2. Consulta las secciones Inicio, Servicios y Nosotros.
3. Pulsa **Iniciar sesión** para abrir el formulario de usuario, o elige el registro.
4. El registro solicita los datos del cliente, correo y contraseña. La contraseña debe tener al menos seis caracteres.
5. Al iniciar sesión, utiliza correo y contraseña.
6. Para reservar, selecciona un servicio, inicia sesión si todavía no lo ha hecho y completa estilista, fecha y hora.
7. La API también tiene una ruta para consultar las citas propias. Actualmente, la interfaz Vue no incluye una pantalla específica de “mis citas”.
8. Cierra la sesión desde el control que aparece en la barra superior.

El formulario de acceso administrativo es distinto y está disponible en `http://localhost:9001/#/admin/login`. Solo solicita **Usuario admin** y **Contraseña**. Una cuenta de cliente no obtiene permisos administrativos por visitar esa dirección.

### Administrador

1. Accede a `http://localhost:9001/#/admin/login`.
2. Inicia sesión con el nombre de usuario administrativo y la contraseña.
3. Después de autenticar correctamente, llega al panel `/admin`, que muestra la agenda completa.
4. Puede actualizar los estados permitidos de una cita y eliminarla.
5. Cierra la sesión desde el panel.

El enrutador comprueba la sesión administrativa con `GET /api/auth/me` al entrar o recargar una ruta `/admin`. Además, las operaciones administrativas de la API comprueban nuevamente el JWT y el rol en el backend. La protección del cliente no sustituye la autorización del servidor.

## Arquitectura y organización

El proyecto principal tiene dos aplicaciones independientes que se comunican por HTTP/JSON:

```text
centro_de_belleza-main/
├── backend/       API REST de Express y acceso a MongoDB
├── frontend/      SPA de Vue 3 y Quasar
├── legacy/        Prototipo anterior en HTML, CSS y JavaScript
└── Readme.md      Documentación del proyecto
```

### Backend

El punto de entrada local es `backend/server.js`; la aplicación Express y sus rutas están en `backend/app.js`. En Vercel, `backend/api/[...path].js` expone la misma aplicación como función serverless.

- `config/db.js`: conexión con Mongoose mediante `MONGODB_URI`.
- `models/`: esquemas y validaciones de `User`, `Servicio`, `Estilista` y `Cita`.
- `routes/`: endpoints y validaciones de entrada.
- `controllers/`: lógica de autenticación, reservas, catálogo y estilistas.
- `middleware/auth.js`: verifica tokens JWT y permisos de administrador.
- `middleware/validate.js`: devuelve errores de validación de Express Validator.
- `middleware/errorHandler.js`: respuestas de error para rutas no encontradas y errores de Express/Mongoose.
- `scripts/`: utilidades de inicialización y comprobación. No son necesarias para arrancar la API.

Las referencias entre colecciones se guardan como `ObjectId`. Una cita conserva además el precio y la duración aplicados al momento de reservar.

### Frontend

`frontend/src/App.vue` contiene el contenedor de rutas. `src/router/routes.js` define las páginas y `src/router/index.js` configura Vue Router en modo hash y la comprobación de rutas administrativas.

- `src/pages/IndexPage.vue`: página pública, catálogo, autenticación de clientes y flujo de reserva.
- `src/pages/AdminLoginPage.vue`: formulario separado de acceso administrativo.
- `src/pages/AdminDashboardPage.vue`: agenda y acciones administrativas sobre citas.
- `src/layouts/MainLayout.vue`: estructura visual común de Quasar.
- `src/css/`: estilos globales y variables visuales.
- `src/components/`: componentes reutilizables.

Las páginas hacen las llamadas HTTP a la API con Axios. `frontend/src/services/api.js` centraliza la URL: producción usa el backend de Vercel y desarrollo local usa `http://localhost:3000/api`.

La carpeta `legacy/` contiene una versión anterior independiente con HTML, estilos y JavaScript, incluyendo una configuración de Tailwind por CDN. No forma parte de la SPA Quasar que se ejecuta con `npm run dev`.

## Tecnologías y librerías

### Frontend

- **Vue 3**: componentes de una sola página (`.vue`), Composition API y `<script setup>`.
- **Quasar**: aplicación SPA, layout, páginas, formularios, botones, diálogos, tablas, selectores y notificaciones.
- **Vue Router**: rutas con historial hash, por ejemplo `/#/admin/login`, y navegación entre la página pública y el panel.
- **Axios**: solicitudes HTTP al backend. En rutas protegidas envía el token como `Authorization: Bearer ...`.
- **Sass/SCSS**: estilos globales, variables y estilos específicos de componentes.
- **ESLint y Prettier**: análisis de código y formato. El proyecto configura ESLint para archivos JS y Vue.
- **Vite / Quasar App Vite**: servidor de desarrollo y compilación de la SPA.
- **Material Icons y Roboto**: recursos visuales configurados desde `quasar.config.js`.

Pinia está incluido como dependencia disponible, aunque las páginas revisadas mantienen su estado local en Vue y no dependen de un almacén Pinia para los flujos descritos.

### Backend

- **Node.js**: entorno de ejecución. El `package.json` del frontend indica Node `>=22.12`, `^24` o `>=26`; se recomienda una versión LTS compatible.
- **Express 5**: servidor HTTP y montaje de la API REST.
- **Mongoose**: conexión, esquemas, referencias y validación de documentos MongoDB.
- **MongoDB Atlas o MongoDB local**: persistencia de las colecciones de usuarios, citas, servicios y estilistas.
- **JWT (`jsonwebtoken`)**: emisión y verificación de tokens de autenticación con vencimiento.
- **bcryptjs**: hash y comparación de contraseñas en el modelo de usuario.
- **express-validator**: reglas de validación de cuerpo de petición en rutas.
- **dotenv**: carga de configuración local desde `backend/.env`.
- **cors**: permite las solicitudes desde los orígenes locales configurados en `server.js` (puertos 9000 y 9001).
- **Nodemon**: reinicia el servidor de desarrollo al detectar cambios.

## Requisitos

- Node.js compatible con las versiones indicadas por los paquetes instalados.
- npm.
- Acceso a MongoDB Atlas o una instancia MongoDB local.
- Un usuario de base de datos con permisos sobre la base `glow_studio`.
- Un secreto JWT fuerte y privado.

## Configuración e inicio paso a paso

Abre una terminal de PowerShell en la raíz del proyecto:

```powershell
cd C:\Users\juand\Downloads\centro_de_belleza-main\centro_de_belleza-main
```

### 1. Preparar MongoDB

La aplicación no inicia un servidor de base de datos por sí sola. Se conecta a MongoDB mediante `MONGODB_URI`.

**Con MongoDB Atlas:**

1. Crea o utiliza un clúster de Atlas.
2. Crea un usuario de base de datos con permisos apropiados para la base del proyecto.
3. En **Network Access**, autoriza la IP desde la que ejecutarás la aplicación.
4. Copia el formato de conexión de la opción Node.js y úsalo como `MONGODB_URI`.
5. Si el usuario o la contraseña de Atlas contienen caracteres reservados para URL, codifícalos antes de colocarlos en la URI.
6. No publiques la URI, la contraseña ni el archivo `.env`.

**Con MongoDB local (opcional):** instala e inicia MongoDB Community Server y configura la URI local correspondiente, por ejemplo `mongodb://127.0.0.1:27017/glow_studio`.

### 2. Configurar el backend

En una terminal:

```powershell
cd C:\Users\juand\Downloads\centro_de_belleza-main\centro_de_belleza-main\backend
npm ci
Copy-Item .env.example .env
```

Abre `backend/.env` **en tu equipo** y configura estos valores:

```dotenv
PORT=3000
MONGODB_URI=<URI privada de MongoDB para glow_studio>
JWT_SECRET=<secreto largo, aleatorio y privado>
JWT_EXPIRES_IN=8h
```

No uses el valor de ejemplo de `JWT_SECRET` como secreto de producción. Genera uno aleatorio y mantenlo fuera del repositorio. El archivo `.env` está excluido por `.gitignore`.

Si todavía no existe una cuenta administradora, el script `backend/scripts/seed.js` permite crearla una sola vez desde variables locales:

```dotenv
ADMIN_USERNAME=<nombre de usuario admin>
ADMIN_EMAIL=<correo de recuperación/contacto>
ADMIN_PASSWORD=<contraseña privada>
```

Después de guardar esos valores localmente, ejecuta:

```powershell
npm run seed
```

El script no reemplaza una cuenta existente con el mismo nombre de usuario o correo. La contraseña se guarda mediante el hash del modelo con bcryptjs. No compartas los valores del `.env` ni los incluyas en el código. Si la cuenta administrativa ya existe, no necesitas ejecutar el seed.

### 3. Iniciar el backend

En la misma terminal de `backend`:

```powershell
npm run dev
```

El servidor debe mostrar que escucha en `http://localhost:3000`. Comprueba su disponibilidad en otra terminal:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

La respuesta debe indicar que la API está activa y que la base de datos está conectada.

### 4. Instalar e iniciar el frontend

Abre una **segunda terminal**:

```powershell
cd C:\Users\juand\Downloads\centro_de_belleza-main\centro_de_belleza-main\frontend
npm ci
npm run dev -- --port 9001
```

Quasar normalmente utiliza el puerto 9000; `--port 9001` permite usar el puerto solicitado si está disponible. Si el puerto está ocupado, detén el proceso que lo utiliza o elige otro puerto. `backend/app.js` permite los orígenes locales 9000 y 9001; para usar otro puerto de frontend, agrega ese origen a la configuración CORS antes de probar desde el navegador.

Abre la URL que Quasar indique en la terminal. Las direcciones habituales son:

- Página pública: `http://localhost:9001/`
- Acceso administrativo: `http://localhost:9001/#/admin/login`
- Panel administrativo: `http://localhost:9001/#/admin`

Deja ambas terminales abiertas mientras utilizas la aplicación.

### 5. Compilar para producción

Desde `frontend`:

```powershell
npm run build
```

Los archivos compilados se generan en `frontend/dist/spa`. La compilación estática no ejecuta el backend ni MongoDB; para que la aplicación desplegada funcione, publica la SPA, despliega la API con sus variables de entorno y configura correctamente CORS. El frontend usa el backend desplegado en producción y `localhost:3000` durante el desarrollo local.

### Desplegar el frontend en Vercel

El proyecto usa Quasar con Vite y el frontend está dentro de `frontend/`. La configuración [vercel.json](./vercel.json) indica a Vercel cómo instalar dependencias, compilar y publicar `frontend/dist/spa`, incluso cuando no detecta automáticamente el framework.

En Vercel, configura **Root Directory** como `.` (raíz del repositorio). Si solicita un framework, selecciona **Other**: aunque Quasar usa Vite internamente, sus comandos son `quasar dev` y `quasar build`, no los comandos de un proyecto Vite estándar. No sobrescribas los comandos de instalación y compilación ni el directorio de salida definidos en `vercel.json`. Si el proyecto ya estaba configurado con `frontend` como raíz, cámbialo a `.` y vuelve a desplegar.

El frontend usa `https://centro-de-belleza-fben.vercel.app/api` en producción. Despliega el backend como un proyecto Vercel separado con **Root Directory** `backend`; [backend/vercel.json](./backend/vercel.json) desactiva la detección SPA, instala desde el lockfile del backend y deja que Vercel compile sus funciones de API. Si el log del proyecto backend aún muestra `cd frontend && npm ci`, cambia su **Root Directory** a `backend` y vuelve a desplegar: está usando la configuración del proyecto frontend. Configura las variables `MONGODB_URI`, `JWT_SECRET` y `CLIENT_URL`; `CLIENT_URL` debe ser `https://centrodebelleza-frontend.vercel.app`. El backend debe responder en `/api/health` antes de que funcionen las llamadas del frontend. Los avisos de npm sobre `cache-dir` y scripts de instalación no son por sí mismos la causa del error de compilación.

## Rutas principales de la API

La API tiene el prefijo `http://localhost:3000/api`.

| Método | Ruta | Acceso | Función |
|---|---|---|---|
| `POST` | `/auth/register` | Público | Registra un cliente; el rol se asigna como `user` en el backend. |
| `POST` | `/auth/login` | Público | Inicia sesión de cliente con correo y contraseña. |
| `POST` | `/auth/admin-login` | Público | Inicia sesión administrativa usando nombre de usuario y contraseña; solo acepta cuentas `admin`. |
| `GET` | `/auth/me` | JWT válido | Devuelve el usuario autenticado para comprobar la sesión. |
| `GET` | `/servicios` | Público | Lista servicios activos. |
| `GET` | `/estilistas` | Público | Lista estilistas activos para el selector de citas. |
| `POST` | `/citas` | JWT válido | Crea una cita para el usuario autenticado. |
| `GET` | `/citas/mis-citas` | JWT válido | Lista únicamente las citas del usuario autenticado. |
| `GET` | `/citas/admin/todas` | Administrador | Lista la agenda completa. |
| `PATCH` | `/citas/:id/estado` | Administrador | Cambia el estado de una cita, respetando las transiciones admitidas. |
| `DELETE` | `/citas/:id` | Administrador | Elimina una cita. |
| `GET` | `/api/health` | Público | Comprueba el estado de la API y de la conexión a la base. |

Las rutas de administración de servicios y estilistas también están protegidas por autenticación y rol `admin`. La ruta pública de cada recurso solo expone registros activos.

## Datos, seguridad y consideraciones de desarrollo

- El registro público crea cuentas con rol `user`; no debe confiarse en un campo `role` enviado desde el navegador.
- El login de cliente utiliza correo. El login de administrador utiliza nombre de usuario y verifica el rol en el backend.
- El middleware vuelve a consultar la cuenta en MongoDB al validar el JWT, de modo que el rol actual de la base de datos es la autoridad para las rutas protegidas.
- La contraseña de usuario debe contener al menos seis caracteres. Esta regla se comprueba en el formulario y en el backend.
- El cliente guarda el token en `localStorage`; cerrar sesión elimina el token y los datos locales del usuario. `localStorage` es conveniente para este proyecto, pero una aplicación desplegada debe valorar medidas adicionales contra XSS y una estrategia de sesión adecuada a su amenaza.
- Las citas comparan fechas `AAAA-MM-DD` y horas `HH:MM` como texto. El backend comprueba conflictos de horario por estilista antes de crear una cita.
- La ruta DELETE elimina citas permanentemente; utilízala con cuidado.
- `backend/scripts/seedData.js` prepara servicios y estilistas solo cuando las colecciones correspondientes están vacías; no es un comando de arranque.
- `backend/cargarCitasDemo.js` carga clientes y citas ficticias identificadas como demostración. **No lo ejecutes en una base con datos reales sin revisar su comportamiento y el resultado deseado.**
- `backend/actualizarEstadosDemo.js` modifica estados de citas demo existentes. No es necesario para operar la aplicación.
- `backend/scripts/testModels.js` comprueba validaciones de modelos sin iniciar la API.
- Los archivos `.bak` son copias antiguas; `legacy/` es una versión anterior. El flujo activo se encuentra en `backend/` y `frontend/`.
- Los scripts `seed`, `seed:datos` y de datos demo no deben ejecutarse automáticamente en cada inicio del servidor.
- Los paquetes tienen archivos `package-lock.json` separados. Instala las dependencias dentro de la carpeta que corresponda.
- Los manifiestos actuales no definen una suite de pruebas automatizada general. Para validar cambios, usa las comprobaciones de ESLint, el build y pruebas funcionales de API apropiadas.

## Preguntas técnicas frecuentes

### ¿Cómo se asegura que un cliente no pueda ser administrador?

El controlador de registro construye el usuario campo por campo y asigna `role: 'user'`; ignora un rol enviado por el cliente. Las rutas administrativas pasan por `authenticateToken` y `requireAdmin`, que verifican el token y el rol guardado en MongoDB.

### ¿Por qué el panel redirige al login al recargar?

La SPA guarda un JWT localmente y el guard del router consulta `/auth/me` antes de permitir rutas administrativas. Si el token falta, venció o ya no representa una cuenta administradora válida, se retira o se deniega el acceso.

### ¿Dónde se configura la conexión a Atlas?

En `MONGODB_URI` dentro de `backend/.env`. Ese archivo es privado y no debe copiarse en tickets, documentación pública ni repositorios.

### ¿Cómo se crea un administrador?

Si aún no hay uno, configura localmente `ADMIN_USERNAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` y ejecuta una sola vez `npm run seed` desde `backend`. El script no actualiza cuentas que ya existan.

### ¿Por qué una reserva puede ser rechazada aunque haya elegido una hora?

La API vuelve a validar servicio y estilista activos, fecha y hora futuras y disponibilidad del estilista. Si hay una reserva no cancelada que se superpone, responde con conflicto en lugar de guardar una doble reserva.

### ¿Qué hago si Atlas no conecta?

Comprueba que el backend tenga el `.env` correcto, que la URI apunte a la base deseada, que las credenciales de base de datos sean válidas y que la IP esté permitida en **Network Access** de Atlas. No pegues esos valores en el chat ni en reportes.

### ¿Cómo detener los servidores locales?

En cada terminal donde corre `npm run dev`, pulsa `Ctrl+C`. El backend y el frontend se detienen por separado.
