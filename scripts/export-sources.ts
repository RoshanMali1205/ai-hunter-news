import { writeFileSync } from "node:fs";
import { FEED_USER_AGENT, SOURCES } from "../src/data/sources";

const feeds = Object.fromEntries(SOURCES.map((source) => [source.id, source.feedUrl]));
const config = { userAgent: FEED_USER_AGENT, feeds };
writeFileSync(new URL("../electron/sources.json", import.meta.url), JSON.stringify(config, null, 2));
