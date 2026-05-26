import { mkdir, writeFile } from "fs/promises";
import type { Game } from "../types/game";

const GAME_COUNT = 1200;
const SEED = 0x5eed2026;

const titles = [
  "Aether Drift",
  "Iron Vale",
  "Neon Circuit",
  "Shadow Harbor",
  "Starfall Protocol",
  "Emberwatch",
  "Frostline",
  "Solar Brigade",
  "Midnight Forge",
  "Crystal Frontier",
  "Rogue Signal",
  "Titan Orchard",
  "Skybound Atlas",
  "Grim Ledger",
  "Pulse Runner",
  "Hollow Meridian",
  "Arcane Foundry",
  "Velvet Siege",
  "Quantum Rally",
  "Echo Dominion",
  "Cinder Colony",
  "Marble Horizon",
  "Rustwake",
  "Oceanic Outpost",
  "Lunar Market",
  "Verdant Tactics",
  "Chrome Revenant",
  "Warden's Call",
  "Ghostline Station",
  "Aurora Bastion",
];

const genres = [
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Simulation",
  "Puzzle",
  "Racing",
  "Sports",
  "Survival",
  "Shooter",
  "Platformer",
  "Roguelike",
  "City Builder",
  "Fighting",
  "MMO",
];

const platforms = [
  "PC",
  "PlayStation 5",
  "Xbox Series X|S",
  "Nintendo Switch",
  "Steam Deck",
  "Mac",
  "Linux",
  "iOS",
  "Android",
];

const tags = [
  "Singleplayer",
  "Multiplayer",
  "Co-op",
  "Open World",
  "Story Rich",
  "Pixel Graphics",
  "Atmospheric",
  "Competitive",
  "Relaxing",
  "Difficult",
  "Early Access",
  "Controller Support",
  "Crafting",
  "Base Building",
  "Exploration",
  "Turn-Based",
  "Real-Time",
  "Procedural",
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Retro",
  "Tactical",
  "Sandbox",
  "Family Friendly",
];

const subtitles = [
  "Origins",
  "Reforged",
  "Afterlight",
  "Zero Hour",
  "Frontiers",
  "Legends",
  "Ascension",
  "Blackout",
  "Second Wave",
  "Wildlands",
  "Chronicles",
  "Breakpoint",
];

const descriptionTemplates = [
  "Lead a growing crew through {genreLower} challenges across handcrafted worlds.",
  "Build momentum, unlock upgrades, and master tight {genreLower} systems.",
  "A polished {genreLower} game built around expressive choices and replayable missions.",
  "Explore dangerous regions, meet memorable rivals, and shape the fate of your team.",
  "Mix sharp moment-to-moment play with long-term progression and strategic decisions.",
  "Chase rare rewards, experiment with builds, and uncover a layered campaign.",
];

function createRng(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createRng(SEED);

function randomInt(min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(items: T[]) {
  return items[randomInt(0, items.length - 1)];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pickTags(genre: string) {
  const selected = new Set<string>([genre]);
  const total = randomInt(2, 5);

  while (selected.size < total) {
    selected.add(pick(tags));
  }

  return Array.from(selected);
}

function buildTitle(index: number) {
  const base = pick(titles);
  const roll = rng();

  if (roll < 0.25) {
    return `${base}: ${pick(subtitles)}`;
  }

  if (roll < 0.45) {
    return `${base} ${randomInt(2, 5)}`;
  }

  if (roll < 0.6) {
    return `${pick(subtitles)} of ${base}`;
  }

  return `${base} ${String(index + 1).padStart(4, "0")}`;
}

function buildDescription(genre: string) {
  return pick(descriptionTemplates).replace("{genreLower}", genre.toLowerCase());
}

function buildGame(index: number): Game {
  const title = buildTitle(index);
  const genre = pick(genres);
  const releaseYear = randomInt(1995, 2026);
  const rating = randomInt(10, 100) / 10;
  const id = `${slugify(title)}-${index + 1}`;

  return {
    id,
    title,
    description: buildDescription(genre),
    platform: pick(platforms),
    genre,
    tags: pickTags(genre),
    rating,
    releaseYear,
    featured: rating >= 8.7 || rng() < 0.12,
    coverImage: `/covers/${id}.jpg`,
  };
}

async function main() {
  const games = Array.from({ length: GAME_COUNT }, (_, index) => buildGame(index));
  const outputFile = new URL("../data/games.json", import.meta.url);

  await mkdir(new URL("../data/", import.meta.url), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(games, null, 2)}\n`, "utf8");

  console.log(`Seeded ${games.length} games to data/games.json`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
