export function environment<T = string>(
  key: string,
  options?: { default?: T; cast?: (value: string) => T }
): T {
  const value = process.env[key];

  if (value === undefined) {
    if (options?.default === undefined) {
      throw `Missing required environment variable: ${key}`;
    }

    return options?.default;
  }

  if (options?.cast !== undefined) {
    return options.cast(value);
  }

  // @ts-ignore
  return value;
}
