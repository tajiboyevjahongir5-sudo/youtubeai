import { uz } from '@jpilot/shared';

export const t = (key: string) => {
  const keys = key.split('.');
  let current: any = uz;
  for (const k of keys) {
    if (current[k] === undefined) return key;
    current = current[k];
  }
  return current;
};
