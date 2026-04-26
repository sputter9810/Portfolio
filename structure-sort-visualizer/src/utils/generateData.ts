export function generateRandomNumbers(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
}

export function generateNearlySortedNumbers(length: number): number[] {
  const values = Array.from({ length }, (_, index) =>
    Math.floor(((index + 1) / length) * 100)
  );

  for (let i = 0; i < Math.floor(length / 8); i++) {
    const first = Math.floor(Math.random() * length);
    const second = Math.floor(Math.random() * length);
    [values[first], values[second]] = [values[second], values[first]];
  }

  return values;
}

export function generateReversedNumbers(length: number): number[] {
  return Array.from({ length }, (_, index) =>
    Math.floor(((length - index) / length) * 100)
  );
}