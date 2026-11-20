import { writeFileSync } from "node:fs";
import { SOURCES } from "../src/data/sources";

const map = Object.fromEntries(SOURCES.map((source) => [source.id, source.feedUrl]));
writeFileSync(new URL("../electron/sources.json", import.meta.url), JSON.stringify(map, null, 2));
