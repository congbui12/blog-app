import { nanoid } from "nanoid";

const createSlug = (title) => {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const id = nanoid(6); // Generates an 6-char ID
  return `${cleanTitle}-${id}`;
};

export default createSlug;
