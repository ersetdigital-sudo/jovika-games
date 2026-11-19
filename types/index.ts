export type GameCat = "MOBA" | "Battle Royale" | "RPG" | "FPS";
export type ColorKey = "c" | "v" | "w" | "d";

export interface GameItemTuple { 0: number; 1: number }

export interface Game {
  id: string;
  name: string;
  pub: string;
  cat: GameCat;
  unit: string;
  zone?: boolean;
  server?: boolean;
  col: ColorKey;
  items: [number, number][];
  pass?: boolean;
}

export interface PpobService {
  id: string;
  name: string;
  pub: string;
  cat: "PPOB";
  unit: string;
  col: ColorKey;
  label: string;
  ph: string;
  desc: string;
  items?: [number, number][];
  fmt?: "rp";
  list?: [string, number][];
}

export type Service = Game | PpobService;

export interface NominalOption {
  n: string;
  p: number;
  old?: number;
  hot?: boolean;
}

export interface PayItem {
  id: string;
  n: string;
  fee: (sub: number) => number;
}

export interface PayGroup {
  g: string;
  items: PayItem[];
}

export interface TxRecord {
  game: string;
  item: string;
  id: string;
  pay: string;
  total: number;
  status: string;
  time: string;
}
