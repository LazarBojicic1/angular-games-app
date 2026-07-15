<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Genre;
use App\Models\LibraryItem;
use App\Models\Platform;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::query()->where('name', Role::ADMIN)->firstOrFail();
        $userRole = Role::query()->where('name', Role::USER)->firstOrFail();

        User::query()->firstOrCreate(
            ['email' => 'admin@gamevault.test'],
            [
                'name' => 'GameVault Admin',
                'role_id' => $adminRole->id,
                'password' => 'admin12345',
            ],
        );
        $demoUser = User::query()->firstOrCreate(
            ['email' => 'user@gamevault.test'],
            [
                'name' => 'Demo Player',
                'role_id' => $userRole->id,
                'password' => 'user12345',
            ],
        );

        $genres = $this->seedGenres();
        $platforms = $this->seedPlatforms();
        $games = $this->seedGames($genres, $platforms);

        if ($demoUser->wasRecentlyCreated) {
            LibraryItem::query()->create([
                'user_id' => $demoUser->id,
                'game_id' => $games['the-witcher-3-wild-hunt']->id,
                'list_type' => LibraryItem::FAVORITE,
            ]);
            LibraryItem::query()->create([
                'user_id' => $demoUser->id,
                'game_id' => $games['hades']->id,
                'list_type' => LibraryItem::PLAY_LATER,
            ]);
        }
    }

    /** @return Collection<string, Genre> */
    private function seedGenres(): Collection
    {
        return collect([
            ['name' => 'Action', 'slug' => 'action'],
            ['name' => 'Adventure', 'slug' => 'adventure'],
            ['name' => 'Role-Playing Games (RPG)', 'slug' => 'role-playing-games-rpg'],
            ['name' => 'Strategy', 'slug' => 'strategy'],
            ['name' => 'Puzzle', 'slug' => 'puzzle'],
        ])->mapWithKeys(function (array $data): array {
            $genre = Genre::query()->firstOrCreate(
                ['slug' => $data['slug']],
                [
                    ...$data,
                    'rawg_games_count' => 0,
                    'image_background' => 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg',
                ],
            );

            return [$genre->slug => $genre];
        });
    }

    /** @return Collection<string, Platform> */
    private function seedPlatforms(): Collection
    {
        return collect([
            ['name' => 'PC', 'slug' => 'pc'],
            ['name' => 'PlayStation 5', 'slug' => 'playstation5'],
            ['name' => 'Xbox Series S/X', 'slug' => 'xbox-series-x'],
            ['name' => 'Nintendo Switch', 'slug' => 'nintendo-switch'],
        ])->mapWithKeys(function (array $data): array {
            $platform = Platform::query()->firstOrCreate(
                ['slug' => $data['slug']],
                [
                    ...$data,
                    'rawg_games_count' => 0,
                    'image_background' => 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg',
                ],
            );

            return [$platform->slug => $platform];
        });
    }

    /**
     * @param  Collection<string, Genre>  $genres
     * @param  Collection<string, Platform>  $platforms
     * @return Collection<string, Game>
     */
    private function seedGames(Collection $genres, Collection $platforms): Collection
    {
        $games = [
            [
                'name' => 'The Witcher 3: Wild Hunt',
                'slug' => 'the-witcher-3-wild-hunt',
                'description' => 'A story-driven open-world role-playing game set in a visually stunning fantasy universe full of meaningful choices.',
                'website' => 'https://thewitcher.com/',
                'released' => '2015-05-18',
                'rating' => 4.67,
                'metacritic' => 92,
                'playtime' => 46,
                'developers' => ['CD PROJEKT RED'],
                'publishers' => ['CD PROJEKT RED'],
                'tags' => ['Open World', 'Story Rich', 'Fantasy'],
                'genres' => ['action', 'adventure', 'role-playing-games-rpg'],
                'platforms' => ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'],
            ],
            [
                'name' => 'Portal 2',
                'slug' => 'portal-2',
                'description' => 'A first-person puzzle adventure built around inventive portal mechanics, sharp writing and cooperative challenges.',
                'website' => 'https://www.thinkwithportals.com/',
                'released' => '2011-04-18',
                'rating' => 4.61,
                'metacritic' => 95,
                'playtime' => 11,
                'developers' => ['Valve'],
                'publishers' => ['Valve'],
                'tags' => ['Puzzle', 'Co-op', 'Science Fiction'],
                'genres' => ['puzzle', 'adventure'],
                'platforms' => ['pc', 'nintendo-switch'],
            ],
            [
                'name' => 'Hades',
                'slug' => 'hades',
                'description' => 'A fast action roguelike where every escape attempt advances a character-rich story inspired by Greek mythology.',
                'website' => 'https://www.supergiantgames.com/games/hades/',
                'released' => '2020-09-17',
                'rating' => 4.45,
                'metacritic' => 93,
                'playtime' => 22,
                'developers' => ['Supergiant Games'],
                'publishers' => ['Supergiant Games'],
                'tags' => ['Roguelike', 'Mythology', 'Indie'],
                'genres' => ['action', 'role-playing-games-rpg'],
                'platforms' => ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'],
            ],
            [
                'name' => 'Disco Elysium',
                'slug' => 'disco-elysium',
                'description' => 'A dialogue-heavy detective role-playing game with an unusual skill system and exceptional freedom of choice.',
                'website' => 'https://discoelysium.com/',
                'released' => '2019-10-15',
                'rating' => 4.36,
                'metacritic' => 91,
                'playtime' => 24,
                'developers' => ['ZA/UM'],
                'publishers' => ['ZA/UM'],
                'tags' => ['Detective', 'Choices Matter', 'Political'],
                'genres' => ['adventure', 'role-playing-games-rpg'],
                'platforms' => ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'],
            ],
            [
                'name' => 'Civilization VI',
                'slug' => 'civilization-vi',
                'description' => 'Build an empire across centuries through exploration, diplomacy, technology and turn-based strategic decisions.',
                'website' => 'https://civilization.com/',
                'released' => '2016-10-21',
                'rating' => 4.18,
                'metacritic' => 88,
                'playtime' => 43,
                'developers' => ['Firaxis Games'],
                'publishers' => ['2K Games'],
                'tags' => ['Turn-Based', 'Historical', 'Management'],
                'genres' => ['strategy'],
                'platforms' => ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'],
            ],
            [
                'name' => 'Control',
                'slug' => 'control',
                'description' => 'A supernatural third-person action adventure set inside an ever-shifting government facility.',
                'website' => 'https://www.controlgame.com/',
                'released' => '2019-08-27',
                'rating' => 4.12,
                'metacritic' => 85,
                'playtime' => 12,
                'developers' => ['Remedy Entertainment'],
                'publishers' => ['505 Games'],
                'tags' => ['Supernatural', 'Atmospheric', 'Third Person'],
                'genres' => ['action', 'adventure'],
                'platforms' => ['pc', 'playstation5', 'xbox-series-x', 'nintendo-switch'],
            ],
        ];

        return collect($games)->mapWithKeys(function (array $data) use ($genres, $platforms): array {
            $genreSlugs = $data['genres'];
            $platformSlugs = $data['platforms'];
            unset($data['genres'], $data['platforms']);

            $game = Game::query()->firstOrCreate(
                ['slug' => $data['slug']],
                [
                    ...$data,
                    'background_image' => 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg',
                    'screenshots' => ['https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg'],
                ],
            );
            if ($game->wasRecentlyCreated) {
                $game->genres()->sync(collect($genreSlugs)->map(fn ($slug) => $genres[$slug]->id));
                $game->platforms()->sync(collect($platformSlugs)->map(fn ($slug) => $platforms[$slug]->id));
            }

            return [$game->slug => $game];
        });
    }
}
