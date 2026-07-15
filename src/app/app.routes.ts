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
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

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
    component: Favorites,
    canActivate: [authGuard]
  },
  {
    path: 'play-later',
    component: PlayLater,
    canActivate: [authGuard]
  },
  {
    path: 'about',
    component: About
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((module) => module.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then((module) => module.Register)
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./pages/forbidden/forbidden').then((module) => module.Forbidden)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    loadComponent: () =>
      import('./admin/layout/admin-layout/admin-layout').then((module) => module.AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin/pages/dashboard/admin-dashboard').then((module) => module.AdminDashboard)
      },
      {
        path: 'games',
        loadComponent: () =>
          import('./admin/pages/games/admin-games').then((module) => module.AdminGames)
      },
      {
        path: 'games/new',
        loadComponent: () =>
          import('./admin/pages/game-form/admin-game-form').then((module) => module.AdminGameForm)
      },
      {
        path: 'games/:id/edit',
        loadComponent: () =>
          import('./admin/pages/game-form/admin-game-form').then((module) => module.AdminGameForm)
      },
      {
        path: 'genres',
        loadComponent: () =>
          import('./admin/pages/genres/admin-genres').then((module) => module.AdminGenres)
      },
      {
        path: 'platforms',
        loadComponent: () =>
          import('./admin/pages/platforms/admin-platforms').then((module) => module.AdminPlatforms)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/pages/users/admin-users').then((module) => module.AdminUsers)
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./admin/pages/roles/admin-roles').then((module) => module.AdminRoles)
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((module) => module.NotFound)
  }
];
