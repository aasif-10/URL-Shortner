import { nanoid } from "nanoid";

function genShortUrl(url) {
  return nanoid(7);
}

export { genShortUrl };
