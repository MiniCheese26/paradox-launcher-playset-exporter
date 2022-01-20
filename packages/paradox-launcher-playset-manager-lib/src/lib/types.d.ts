export interface PlaySet {
  id: string,
  name: string
}

export interface Mods {
  displayName: string,
  enabled: boolean,
  position: number,
  steamId: string
}

export interface PlaysetConfig {
  name: string,
  mods: Mods[]
}
