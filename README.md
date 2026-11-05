# Ejercicio API — Inventario de componentes de PC

API serverless para consultar un inventario de productos (procesadores, tarjetas gráficas, memorias RAM y almacenamiento) usando MongoDB, Mongoose y Node.js.

## Requisitos

- Node.js 20 o superior
- Una base de datos MongoDB (local o Atlas)

## Instalación

```bash
npm install
cp .env.example .env
```

Edita `.env` y configura tu cadena de conexión:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ejercicioapi
```

`config/env.js` valida que `MONGODB_URI` exista al arrancar; si falta, el proceso termina con un error claro.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run seed` | Inserta o actualiza los productos iniciales **sin borrar** nada (idempotente). |
| `npm run seed:reset` | **Borra** la colección y vuelve a insertar los productos iniciales. |
| `npm run consultas` | Ejecuta las consultas de ejemplo del laboratorio. |
| `npm run demo:validacion` | Muestra los errores de validación de Mongoose sin tocar la base de datos. |
| `npm test` | Ejecuta los tests de la lógica de filtros. |

> `seed:reset` es destructivo: úsalo solo en desarrollo o con datos de prueba.

## Endpoint

El handler está pensado para un runtime serverless (por ejemplo Vercel). Este repositorio no incluye un servidor HTTP local.

```
GET /api/productos
```

### Parámetros de consulta

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `categoria` | string | No | `Procesadores`, `Tarjetas Gráficas`, `Memorias RAM` o `Almacenamiento`. |
| `precioMax` | number | No | Precio máximo, mayor o igual que 0. |
| `compatibilidad` | string | No | Compatibilidad a buscar, por ejemplo `DDR5` o `AM5`. |
| `limit` | integer | No | Número de resultados entre 1 y 100. Por defecto 50. |

Los resultados se ordenan por precio ascendente.

### Ejemplo

```bash
curl "https://tu-dominio/api/productos?categoria=Memorias%20RAM&precioMax=150&limit=10"
```

Respuesta `200` (simplificada; se omiten `_id` y timestamps):

```json
{
  "total": 2,
  "limite": 10,
  "datos": [
    {
      "codigo": "RAM001",
      "nombre": "Corsair Vengeance 16GB DDR4",
      "categoria": "Memorias RAM",
      "precio": 49.99,
      "stock": 25,
      "compatibleCon": [],
      "destacado": false
    },
    {
      "codigo": "RAM002",
      "nombre": "Kingston Fury 32GB DDR5",
      "categoria": "Memorias RAM",
      "precio": 99.99,
      "stock": 10,
      "compatibleCon": [],
      "destacado": true
    }
  ]
}
```

### Errores

- `400`: parámetros inválidos. Incluye el detalle por campo:

```json
{
  "error": "Parámetros de consulta inválidos",
  "campos": {
    "precioMax": "precioMax debe ser un número mayor o igual que 0"
  }
}
```

- `405`: método distinto de `GET` (respuesta con cabecera `Allow: GET`).
- `500`: error interno. En producción no se expone el detalle técnico.

## Estructura del proyecto

```
ejercicioapi/
├─ api/productos.js               # handler GET /api/productos
├─ config/
│  ├─ env.js                      # carga y valida variables de entorno
│  └─ db.js                       # conexión cacheada (apta para serverless)
├─ models/Producto.js             # schema, categorías e índices
├─ services/productos.service.js  # validación de filtros y consulta
├─ scripts/
│  ├─ seed.js
│  ├─ consultas.js
│  └─ demo-validacion.js
├─ test/productos.service.test.js
├─ .env.example
└─ package.json
```

## Modelo de producto

| Campo | Tipo | Reglas |
|---|---|---|
| `codigo` | string | Obligatorio, único, mínimo 3 caracteres, se guarda en mayúsculas. |
| `nombre` | string | Obligatorio, mínimo 4 caracteres. |
| `categoria` | string | Obligatoria y limitada a las categorías definidas en `CATEGORIAS`. |
| `precio` | number | Obligatorio y mayor o igual que 0. |
| `stock` | number | Obligatorio, entero y mayor o igual que 0. |
| `compatibleCon` | string[] | Lista de compatibilidades (por defecto vacía). |
| `destacado` | boolean | Por defecto `false`. |
