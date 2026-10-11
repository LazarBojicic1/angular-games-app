# GameVault — Angular + Laravel ispitni projekat

GameVault je client-server aplikacija za pregled i upravljanje katalogom video-igara. Angular klijent više ne poziva RAWG direktno i ne čuva korisničke podatke u `localStorage`; svi podaci prolaze kroz Laravel REST API i čuvaju se u MySQL bazi.

## Tehnologije

- Angular 21 standalone komponente, strict TypeScript
- Laravel 13 REST API
- Laravel Sanctum Bearer autentikacija
- MySQL 8
- RAWG API import na serverskoj strani

## Funkcionalnosti

- javni katalog igara sa pretragom, filterima, sortiranjem i paginacijom
- detalji igre, žanrovi, platforme i screenshot galerija
- registracija, prijava i odjava
- uloge `admin` i `user`, Angular guardovi i Laravel middleware
- favorite i play-later lista vezane za prijavljenog korisnika i sačuvane u bazi
- admin dashboard
- kompletan CRUD za igre, žanrove, platforme, korisnike i uloge
- reactive forme sa client validacijom i prikazom Laravel `422` grešaka
- template-driven forma za pretragu
- ugrađeni i prilagođeni Angular pipe-ovi
- loading, empty, success, 403, 404 i API error stanja
- idempotentna Artisan komanda za uvoz malog broja RAWG igara

## Struktura

```text
game-vault/
├── src/                 Angular aplikacija
│   └── app/
│       ├── admin/       admin layout, stranice, forme i servis
│       ├── core/        auth, HTTP servisi, guardovi i interceptor
│       ├── models/      TypeScript interfejsi
│       ├── pages/       javne, auth i status stranice
│       └── shared/      ponovljive komponente i pipe-ovi
└── backend/             Laravel API
    ├── app/             modeli, kontroleri, resources, requests, middleware
    ├── database/        migracije, factories i seeder-i
    └── routes/api.php   REST rute
```

## Pokretanje backenda

Potrebni su PHP 8.3+, Composer i pokrenut MySQL server.

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

U `backend/.env` postaviti:

```dotenv
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:4200,http://127.0.0.1:4200

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=game_vault
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

RAWG_API_URL=https://api.rawg.io/api
RAWG_API_KEY=vas_rawg_kljuc
SANCTUM_TOKEN_EXPIRATION=480
```

Kreiranje baze, migracije i deterministički demo podaci:

```bash
mysql --protocol=TCP -h127.0.0.1 -uroot -p \
  -e "CREATE DATABASE IF NOT EXISTS game_vault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

php artisan migrate:fresh --seed
```

Opcioni mali uvoz aktuelnih podataka sa RAWG-a:

```bash
php artisan games:import --pages=1 --page-size=12
```

Komanda radi `updateOrCreate` po `rawg_id`, pa ponovno pokretanje ne pravi duplikate. API server se pokreće ovako:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

## Pokretanje Angular aplikacije

U drugom terminalu, iz korena projekta:

```bash
npm ci
npm start
```

Aplikacija je dostupna na `http://localhost:4200`, a API na `http://127.0.0.1:8000/api`.

## Demo nalozi

| Uloga | Email | Lozinka |
|---|---|---|
| Admin | `admin@gamevault.test` | `admin12345` |
| User | `user@gamevault.test` | `user12345` |

Registracija preko aplikacije uvek kreira običnog korisnika. Samo admin može menjati uloge.
Auth endpointi su rate-limitovani, a Sanctum token podrazumevano važi 480 minuta.

## Glavne API rute

Javne:

- `GET /api/games`
- `GET /api/games/{id}`
- `GET /api/games/{id}/screenshots`
- `GET /api/genres`
- `GET /api/platforms`
- `POST /api/auth/register`
- `POST /api/auth/login`

Prijavljen korisnik:

- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/library/{favorites|play-later}`
- `PUT /api/library/{favorites|play-later}/{game}`
- `DELETE /api/library/{favorites|play-later}/{game}`

Admin:

- `/api/admin/dashboard`
- CRUD `/api/admin/games`
- CRUD `/api/admin/genres`
- CRUD `/api/admin/platforms`
- CRUD `/api/admin/users`
- CRUD `/api/admin/roles`

Laravel ponavlja autorizaciju na serveru; Angular `adminGuard` je samo UX zaštita, ne bezbednosna granica.

## Provera production build-a

```bash
npm run build

rg "localStorage|rawgApiKey|rawgApiUrl" src
```

Poslednja komanda treba da vrati nula pogodaka. RAWG ključ pripada samo lokalnom `backend/.env` fajlu.
