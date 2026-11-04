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
- No hay límite de proyectos por colegio ni por categoría. Las inscripciones se cierran cuando el total global llega a 210 participantes únicos; cada nuevo proyecto se valida para no superar ese máximo.
- Validación de documentos repetidos entre estudiantes, profesor e inscripciones existentes.
- Índices únicos para `code` y de consulta para documentos, categoría, estado y ciudad.

El formulario acepta NIT de 9 o 10 dígitos, con o sin puntos y guion, y lo guarda normalizado solo con dígitos. Al iniciar con una colección existente, el servidor actualiza su validador de MongoDB para aceptar tanto los registros históricos como los nuevos; el usuario de MongoDB debe tener permiso para ejecutar `collMod`. Las inscripciones antiguas no incluyen NIT y se mostrarán como “No registrado”.

Configura estas variables en `.env` o en el entorno de ejecución:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=feria_robotica_nobsa
GMAIL_USER=tu_correo@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
PUBLIC_APP_URL=https://feria-robotica.vercel.app
```

El correo de confirmación se envía al líder después de guardar la inscripción. Configura `GMAIL_USER` y una contraseña de aplicación de Google en `GMAIL_APP_PASSWORD` como secretos del entorno. Si el envío falla, la inscripción permanece guardada y la confirmación en pantalla lo indicará.

## Job de recordatorio por correo

Después de ingresar al panel de administración, puedes probar cómo se verá el recordatorio ingresando una dirección y seleccionando **ENVIAR PRUEBA**. Esta opción envía el mismo correo y la misma imagen, y pide confirmación antes del envío. Cuando hayas revisado la prueba, **ENVIAR AVISO A TODOS** ejecuta el envío masivo: manda un correo individual a cada dirección válida y única registrada como líder, docente o integrante, previa confirmación. El mensaje muestra `public/2dias.jpeg` desde `PUBLIC_APP_URL`; la imagen se carga en el cuerpo HTML del correo y no se adjunta. El panel informa cuántos envíos masivos se completaron y cuántos fallaron.

En Vercel, estas operaciones se publican como funciones API independientes bajo `/api/admin/jobs/two-days-reminder` y `/api/admin/jobs/two-days-reminder/test`.

Configura `GMAIL_USER`, `GMAIL_APP_PASSWORD` y `PUBLIC_APP_URL` como secretos/variables del entorno de producción. El panel conserva la contraseña administrativa existente y la valida en el servidor.

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
