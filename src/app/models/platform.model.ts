export interface Platform {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: string;
}

export interface PlatformWrapper {
  platform: Platform;
}
