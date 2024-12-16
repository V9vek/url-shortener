import { nanoid } from "nanoid";

export const generateShortUrl = (length = 6) => {
  return nanoid(length);
};
