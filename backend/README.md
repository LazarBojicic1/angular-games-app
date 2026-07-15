# GameVault Laravel API

Laravel 13 / MySQL backend for the Angular GameVault exam project. The Angular client talks only to this API; the RAWG key remains server-side and personal game lists are stored per authenticated user in MySQL.

## Local setup

Requirements: PHP 8.3+, Composer, MySQL and the PHP `pdo_mysql` extension.

```bash
mysql -h127.0.0.1 -uroot -p -e "CREATE DATABASE IF NOT EXISTS game_vault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Configure `DB_*`, `RAWG_API_KEY` and `FRONTEND_URL` in `.env`. The local project uses:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=game_vault
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
FRONTEND_URL=http://localhost:4200,http://127.0.0.1:4200
SANCTUM_TOKEN_EXPIRATION=480
```

Deterministic seed accounts:

- `admin@gamevault.test` / `admin12345`
- `user@gamevault.test` / `user12345`

The seed contains six games, five genres and four platforms, so the application works without an external network request.

## RAWG import

Import a deliberately small catalog (12 games by default):

```bash
php artisan games:import --pages=1 --page-size=12
```

The command also accepts `--ordering=-added`, clamps the requested size, imports details and up to six screenshots, and is safe to run repeatedly. Records are updated by RAWG ID or slug rather than duplicated.

## API contract

Public catalog responses preserve the existing RAWG-style envelope:

```json
{
  "count": 6,
  "next": "http://127.0.0.1:8000/api/games?page=2",
  "previous": null,
  "results": []
}
```

Main routes:

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/auth/me`, `POST /api/auth/logout` (Sanctum bearer token)
- `GET /api/games`, `GET /api/games/{id}`, `GET /api/games/{id}/screenshots`
- `GET /api/genres`, `GET /api/platforms`
- `GET /api/library/{type}`, where `type` is `favorites` or `play-later`
- `PUT /api/library/{type}/{game}` and `DELETE /api/library/{type}/{game}`
- `/api/admin/dashboard` and API resources under `/api/admin/{games|genres|platforms|users|roles}`

Catalog query parameters are `search`, `genres` (comma-separated IDs), `platforms` (comma-separated IDs), `ordering`, `page` and `page_size`. Allowed ordering values are `-rating`, `-released`, `released`, `name` and `-metacritic`.

Admin game writes accept `genre_ids` and `platform_ids` as integer arrays, and `developers`, `publishers`, `tags` and `screenshots` as string arrays. Validation failures use Laravel's standard HTTP 422 `{message, errors}` response.
