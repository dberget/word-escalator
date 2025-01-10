// Import your word list or load it from a file
export const wordList: string[] = [
  /* your 4-letter words array */
];

export function getNeighbors(word: string, wordList: Set<string>): Set<string> {
  const neighbors = new Set<string>();
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < word.length; i++) {
    for (let letter of alphabet) {
      const newWord = word.slice(0, i) + letter + word.slice(i + 1);
      if (wordList.has(newWord) && newWord !== word) {
        neighbors.add(newWord);
      }
    }
  }
  return neighbors;
}

export function findWordPath(
  start: string,
  end: string,
  validWords: Set<string>
): string[] {
  if (start === end) return [start];

  const queue: string[][] = [[start]];
  const visited = new Set([start]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentWord = path[path.length - 1];

    const neighbors = getNeighbors(currentWord, validWords);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        const newPath = [...path, neighbor];
        if (neighbor === end) return newPath;
        queue.push(newPath);
      }
    }
  }
  return [];
}
