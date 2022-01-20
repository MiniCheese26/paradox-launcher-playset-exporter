export interface PlaySet {
  id: string,
  name: string
}

export interface Mod {
  displayName: string,
  enabled: boolean,
  position: number,
  steamId: string
}

export interface ModRow {
  displayName: string,
  enabled: number,
  position: number,
  steamId: string
}

export interface PlaysetConfig {
  name: string,
  mods: Mod[]
}
