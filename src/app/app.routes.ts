import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Games } from './pages/games/games';
import { GameDetails } from './pages/game-details/game-details';
import { Genres } from './pages/genres/genres';
import { GenreGames } from './pages/genre-games/genre-games';
import { Platforms } from './pages/platforms/platforms';
import { Favorites } from './pages/favorites/favorites';
import { PlayLater } from './pages/play-later/play-later';
import { About } from './pages/about/about';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'games',
    component: Games
  },
  {
    path: 'games/:id',
    component: GameDetails
  },
  {
    path: 'genres',
    component: Genres
  },
  {
    path: 'genres/:id',
    component: GenreGames
  },
  {
    path: 'platforms',
    component: Platforms
  },
  {
    path: 'favorites',
    component: Favorites
  },
  {
    path: 'play-later',
    component: PlayLater
  },
  {
    path: 'about',
    component: About
  },
  {
    path: '**',
    redirectTo: ''
  }
];