import { Genre } from './genre.model';
import { PlatformWrapper } from './platform.model';

export interface Game {
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
  rating: number;
  released: string | null;
  metacritic: number | null;
  playtime: number;
  genres: Genre[];
  platforms: PlatformWrapper[];
}

export interface GameDetails extends Game {
  description_raw: string;
  website: string;
  developers: Developer[];
  publishers: Publisher[];
  tags: Tag[];
}

export interface Developer {
  id: number;
  name: string;
  slug: string;
}

export interface Publisher {
  id: number;
  name: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Screenshot {
  id: number;
  image: string;
}