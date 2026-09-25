<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/eecf2776-3e59-4918-ade3-6ff677992518

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# feria-robotica

## API de inscripciones con MongoDB

La aplicación SSR expone la API bajo `/api` y persiste las inscripciones en MongoDB.
La colección `registrations` se crea automáticamente al iniciar el servidor con:

- Un máximo de dos estudiantes en `members` (el líder y un integrante adicional).
- Un profesor o tutor opcional en `mentorName` y `mentorDoc`.
- Un máximo de dos proyectos por institución dentro de cada categoría.
- Validación de documentos repetidos entre estudiantes, profesor e inscripciones existentes.
- Índices únicos para `code` y de consulta para documentos, categoría, estado y ciudad.

Configura estas variables en `.env` o en el entorno de ejecución:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=feria_robotica_nobsa
```

No uses credenciales que hayan sido compartidas en chats, commits o capturas. Rota inmediatamente la contraseña del usuario en MongoDB Atlas y configura la nueva cadena de conexión como secreto del entorno. En PowerShell, para una sesión local:

```powershell
$env:MONGODB_URI = 'mongodb+srv://<usuario>:<contraseña>@<cluster>/feria_robotica_nobsa'
$env:MONGODB_DB = 'feria_robotica_nobsa'
```

En producción, configura estas variables desde el administrador de secretos del proveedor de hosting, no desde el código fuente.

Endpoints disponibles:

- `GET /api/registrations?category=...&search=...`
- `GET /api/registrations/:codeOrId`
- `POST /api/registrations`
- `PUT /api/registrations/:id/status`
- `DELETE /api/registrations/:id`
- `GET /api/stats`

Después de instalar Node.js y npm, ejecuta `npm install` para instalar el driver de MongoDB y actualizar el lockfile. Luego usa `npm run dev` con MongoDB accesible en `MONGODB_URI`.
