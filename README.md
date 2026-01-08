# Backend - SpaceX Data Insights

Backend API server untuk aplikasi SpaceX Data Insights menggunakan Express.js dan SQLite dengan arsitektur berlapis.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **Documentation**: Swagger/OpenAPI 3.0
- **API Source**: SpaceX API v4

## Arsitektur

Backend menggunakan **Layered Architecture**:

```
Request → Routes → Controllers → Services → Models → Database
```

1. **Routes** - Definisi endpoint dan routing
2. **Controllers** - Handle HTTP request/response
3. **Services** - Business logic
4. **Models** - Data access layer

## Struktur Folder

```
backend/
├── server.js                 # Entry point aplikasi
├── package.json
├── data.db                   # SQLite database (auto-generated)
└── src/
    ├── config/
    │   └── swagger.js        # Konfigurasi Swagger/OpenAPI
    ├── controllers/
    │   ├── dataController.js     # Controller CRUD data
    │   ├── analyticsController.js # Controller analytics
    │   └── syncController.js     # Controller sinkronisasi
    ├── services/
    │   ├── dataService.js        # Business logic data
    │   ├── analyticsService.js   # Business logic analytics
    │   └── syncService.js        # Business logic sync
    ├── models/
    │   └── database.js           # Database connection & schema
    ├── routes/
    │   ├── index.js              # Route aggregator
    │   ├── dataRoutes.js         # Routes CRUD
    │   ├── analyticsRoutes.js    # Routes analytics
    │   └── syncRoutes.js         # Routes sync
    └── middleware/
        └── validateDataType.js   # Validasi data type
```

## Database Schema

### Tabel `launches`

| Column     | Type    | Description                       |
|------------|---------|-----------------------------------|
| id         | TEXT    | Primary key (SpaceX launch ID)    |
| name       | TEXT    | Nama peluncuran                   |
| date_utc   | TEXT    | Tanggal UTC lengkap               |
| date_day   | TEXT    | Tanggal (YYYY-MM-DD)              |
| category   | TEXT    | Nama roket                        |
| success    | INTEGER | 1=success, 0=failed, null=unknown |
| details    | TEXT    | Deskripsi peluncuran              |
| source     | TEXT    | "spacex" atau "manual"            |
| created_at | TEXT    | Timestamp dibuat                  |
| updated_at | TEXT    | Timestamp diupdate                |

### Tabel `rockets`

| Column          | Type    | Description           |
|-----------------|---------|-----------------------|
| id              | TEXT    | Primary key           |
| name            | TEXT    | Nama roket            |
| type            | TEXT    | Tipe roket            |
| active          | INTEGER | Status aktif (0/1)    |
| stages          | INTEGER | Jumlah stage          |
| height_meters   | REAL    | Tinggi (meter)        |
| diameter_meters | REAL    | Diameter (meter)      |
| mass_kg         | INTEGER | Massa (kg)            |
| first_flight    | TEXT    | Tanggal terbang pertama |
| description     | TEXT    | Deskripsi             |

### Tabel `ships`

| Column     | Type    | Description        |
|------------|---------|--------------------|
| id         | TEXT    | Primary key        |
| name       | TEXT    | Nama kapal         |
| type       | TEXT    | Tipe kapal         |
| active     | INTEGER | Status aktif (0/1) |
| home_port  | TEXT    | Pelabuhan          |
| year_built | INTEGER | Tahun pembuatan    |

### Tabel `capsules`

| Column      | Type    | Description          |
|-------------|---------|----------------------|
| id          | TEXT    | Primary key          |
| serial      | TEXT    | Serial number        |
| status      | TEXT    | Status               |
| type        | TEXT    | Tipe kapsul          |
| reuse_count | INTEGER | Jumlah penggunaan    |

### Tabel `history`

| Column         | Type | Description   |
|----------------|------|---------------|
| id             | TEXT | Primary key   |
| title          | TEXT | Judul         |
| event_date_utc | TEXT | Tanggal event |
| details        | TEXT | Detail        |

### Tabel `sync_meta`

| Column | Type | Description         |
|--------|------|---------------------|
| key    | TEXT | Primary key         |
| value  | TEXT | Value (JSON/string) |

## API Endpoints

### Health & Info

| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| GET    | `/api/health`    | Cek status server        |
| GET    | `/api/data-types`| Daftar tipe data tersedia |

### Data CRUD (Dynamic)

| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | `/api/:dataType`      | Get all data       |
| GET    | `/api/:dataType/:id`  | Get data by ID     |
| POST   | `/api/:dataType`      | Create new data    |
| PUT    | `/api/:dataType/:id`  | Update data        |
| DELETE | `/api/:dataType/:id`  | Delete data        |

**Data Types**: `launches`, `rockets`, `ships`, `capsules`, `history`

#### Query Parameters (GET /api/:dataType)

| Parameter  | Type   | Description                |
|------------|--------|----------------------------|
| `page`     | number | Nomor halaman (default: 1) |
| `limit`    | number | Item per halaman (default: 10) |
| `sort`     | string | Kolom untuk sorting        |
| `order`    | string | `asc` atau `desc`          |
| `search`   | string | Pencarian global           |
| `category` | string | Filter kategori            |
| `source`   | string | Filter sumber data         |

### Analytics

| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | `/api/:dataType/analytics`  | Get analytics data  |

#### Query Parameters

| Parameter | Type   | Description              |
|-----------|--------|--------------------------|
| `start`   | string | Tanggal mulai (YYYY-MM-DD) |
| `end`     | string | Tanggal akhir (YYYY-MM-DD) |

#### Response Format

```json
{
  "summary": {
    "total": 206,
    "inRange": 150,
    "topCategory": { "category": "Falcon 9", "count": 180 },
    "latest": { "name": "...", "date_utc": "..." },
    "lastSync": "2024-01-01T00:00:00.000Z"
  },
  "charts": {
    "byCategory": [{ "label": "Falcon 9", "value": 180 }],
    "byDate": [{ "date": "2024-01", "count": 5 }],
    "bucketType": "monthly"
  }
}
```

### Sync

| Method | Endpoint                    | Description               |
|--------|-----------------------------|---------------------------|
| POST   | `/api/:dataType/sync`       | Sync dari SpaceX API      |
| GET    | `/api/:dataType/sync/status`| Get status sync terakhir  |

## Dokumentasi API (Swagger)

Akses dokumentasi interaktif:
```
http://localhost:3001/api-docs
```

Download OpenAPI spec:
```
http://localhost:3001/api-docs.json
```

## Fitur Teknis

### Anti-Duplikasi
- Menggunakan SpaceX ID sebagai primary key
- Upsert pattern: insert jika baru, update jika sudah ada

### Sync Lock
- Mencegah race condition saat multiple sync request
- Return 409 Conflict jika sync sedang berjalan

### Retry dengan Exponential Backoff
- 3x retry untuk API calls
- Backoff: 1s, 2s, 4s
- Timeout: 30 detik per request

### Structured Logging
- JSON format untuk production logging
- Includes: timestamp, level, message, metadata

### Dynamic Date Bucketing
- < 60 hari: daily aggregation
- 60-365 hari: weekly aggregation
- > 365 hari: monthly aggregation

### SQL Injection Prevention
- Whitelist untuk sort columns
- Parameterized queries

## Menjalankan Server

```bash
cd backend
npm install
npm run dev   # Development dengan nodemon
npm start     # Production
```

Server berjalan di `http://localhost:3001`

## Environment Variables

```env
PORT=3001
NODE_ENV=development
```

## Response Format

### Success Response (List)
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Success Response (Single)
```json
{
  "id": "...",
  "name": "...",
  ...
}
```

### Error Response
```json
{
  "error": "Error message"
}
```
