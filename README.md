# redis-mongo — API con Redis + MongoDB con docker

Proyecto de respaldo por si hay therians en el salon www

## Estructura del proyecto por si pregunta o idk w

- `server.js` — entrypoint de la app
- `config/` — configuración de `mongodb` y `redis`
- `controllers/productController.js` — lógica para GET/POST
- `routes/products.js` — rutas
- `docker-compose.yml` — levanta MongoDB y Redis
- `.env` — variables de entorno que ya estan configuradas

## Variables de entorno listas

pero las pueden cambiar por si lo necesitan

- PORT=3000
- MONGODB_URI=mongodb://localhost:27017/tienda
- REDIS_HOST=localhost
- REDIS_PORT=6379
- REDIS_PASSWORD=
- CACHE_TTL=60

Si cambian `REDIS_PASSWORD`, normalmente no tiene pass pero si le ponen ahi la colocan

## Para levantar todo

1. Levantar MongoDB y Redis

```bash
# desde la raíz del proyecto donde se encuentra el docker-compose.yml
docker compose up -d
```

Esto levantará dos contenedores:

- MongoDB en `localhost:27017`
- Redis en `localhost:6379`

2. Instalar dependencias de Node.js

```bash
npm install
```

3. Iniciar la API

```bash
npm start
```

La aplicación por defecto escuchará en `http://localhost:3000`.

## Para probar el API

Crear un producto POST:

```bash
curl -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Teléfono","precio":199.99,"categoria":"electronica","stock":10}'
```

Obtener productos (GET):

```bash
curl -s http://localhost:3000/api/products
```

Observen los logs de la consola asi sabran que pasa
al crear debe solo sale de momento un post
al obtenerlo si no estan en redis debe salir el mensaje - productos guardados en rdis con un rana www
si estan en redis es - Productos obtenidos de redis con la rana igual 🐸 ww

## Comandos para Docker

Parar y quitar contenedores

```bash
docker compose down
```

por si necesitan eliminarlo y hacerlo denuevo

```bash
docker compose down -v
```

## Ejecutar sin Docker

si ya tienen el su redis aparte o su db

1. Actualizar `.env` URI/host/puerto que tengan ustedes.
2. Ejecutar `npm install` y `npm start`.
3. finish www

## Pruebas JSON

1. Crear producto — POST /api/products

Request body:

```json
{
  "nombre": "Teléfono Modelo X",
  "precio": 299.99,
  "categoria": "electronica",
  "stock": 25
}
```

Respuesta (201):

```json
{
  "success": true,
  "product": {
    "_id": "<ID>",
    "nombre": "Teléfono Modelo X",
    "precio": 299.99,
    "categoria": "electronica",
    "stock": 25,
    "createdAt": "2026-02-20T10:00:00.000Z",
    "updatedAt": "2026-02-20T10:00:00.000Z",
    "__v": 0
  }
}
```

2. Obtener todos — GET /api/products

Respuesta (200):

```json
{
  "success": true,
  "products": [
    {
      "_id": "<ID>",
      "nombre": "Teléfono Modelo X",
      "precio": 299.99,
      "categoria": "electronica",
      "stock": 25,
      "createdAt": "2026-02-20T10:00:00.000Z",
      "updatedAt": "2026-02-20T10:00:00.000Z",
      "__v": 0
    }
  ]
}
```

3. Obtener por id — GET /api/products/:id

Respuesta exitosa (200):

```json
{
  "success": true,
  "product": {
    "_id": "<ID>",
    "nombre": "Teléfono Modelo X",
    "precio": 299.99,
    "categoria": "electronica",
    "stock": 25,
    "createdAt": "2026-02-20T10:00:00.000Z",
    "updatedAt": "2026-02-20T10:00:00.000Z",
    "__v": 0
  },
  "source": "mongo"
}
```

Si viene de Redis (cache por id), la respuesta incluirá `"source": "redis"` o `"source":

4. Actualizar producto — PUT /api/products/:id

Body

```json
{
  "precio": 249.99,
  "stock": 30
}
```

Respuesta (200):

5. Eliminar producto — DELETE /api/products/:id

Respuesta (200):

```json
{
  "success": true,
  "message": "Producto eliminado"
}
```
