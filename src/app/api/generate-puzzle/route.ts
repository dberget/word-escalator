import { NextResponse } from "next/server";
import {
  wordList,
  findWordPath,
  getNeighbors,
} from "../../../../lib/wordUtils";

export async function POST(request: Request) {
  try {
    const { startWord, currentDifficulty } = await request.json();
    console.log(startWord);
    // Validate input
    if (!startWord || typeof startWord !== "string" || startWord.length !== 4) {
      return NextResponse.json(
        { error: "Invalid start word" },
        { status: 400 }
      );
    }

    if (
      !currentDifficulty ||
      !["easy", "medium", "hard", "impossible"].includes(currentDifficulty)
    ) {
      return NextResponse.json(
        { error: "Invalid difficulty" },
        { status: 400 }
      );
    }

    // Define target solution lengths for each difficulty
    const difficultyRanges = {
      easy: { min: 2, max: 3 },
      medium: { min: 4, max: 5 },
      hard: { min: 6, max: 8 },
      impossible: { min: 9, max: 10 },
    };

    // Get the target range for the current difficulty
    const range =
      difficultyRanges[currentDifficulty as keyof typeof difficultyRanges];

    // Build a word set at the desired distance
    let currentWords = new Set([startWord]);
    let distance = 0;
    const visited = new Set([startWord]);

    // Keep expanding until we reach the maximum desired distance
    while (distance < range.max) {
      const nextWords = new Set<string>();
      for (const word of currentWords) {
        const neighbors = getNeighbors(word, new Set(wordList));
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            nextWords.add(neighbor);
            visited.add(neighbor);
          }
        }
      }

      // If we're within the desired range, pick a random word from nextWords
      if (distance + 1 >= range.min && nextWords.size > 0) {
        const endWord =
          Array.from(nextWords)[Math.floor(Math.random() * nextWords.size)];
        const solution = findWordPath(startWord, endWord, new Set(wordList));

        console.log(endWord);

        return NextResponse.json({
          start: startWord,
          end: endWord,
          solution,
          difficulty: currentDifficulty,
          moves: solution.length - 1,
        });
      }

      currentWords = nextWords;
      distance++;
    }

    return NextResponse.json(
      { error: "Could not generate a valid puzzle" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Puzzle generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
