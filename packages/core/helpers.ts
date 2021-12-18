export const generateId = (): string =>
  (Math.random() + 1).toString(36).substring(7);

export const randomPort = (): number =>
  (Math.floor(10000 + Math.random() * 9000));
