"use client";
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, HelpCircle, ArrowRight, Info } from "lucide-react";
import { getValidWords } from "@/utils/wordUtils";
import { findWordPath, findHardestWord } from "@/utils/wordSolver";
import {
  puzzleData,
  getRandomPuzzle,
  getNextDifficulty,
} from "@/data/puzzleData";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import InstructionsModal from "./instructions-modal";
import CompletionModal from "./completion-modal";

const WordEvolutionGame = () => {
  const validWords = getValidWords();

  // Add state to track if warmup is completed
  const [isWarmupCompleted, setIsWarmupCompleted] = useState(false);

  // Add new state for endless mode
  const [isEndlessMode, setIsEndlessMode] = useState(false);
  const [hasCompletedDaily, setHasCompletedDaily] = useState(false);

  // Get a deterministic puzzle based on the current date
  const getDailyPuzzle = () => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`;

    // Create a deterministic but seemingly random number between 0 and 1
    let randomSeed = 0;
    for (let i = 0; i < dateString.length; i++) {
      randomSeed += dateString.charCodeAt(i);
    }
    randomSeed = (randomSeed % 100) / 100; // Normalize to 0-1

    // Determine word length (50/50 chance)
    const wordLength = randomSeed < 0.5 ? "fourLetters" : "fiveLetters";

    // Use a different hash of the date for puzzle selection
    let index = 0;
    for (let i = dateString.length - 1; i >= 0; i--) {
      index += dateString.charCodeAt(i);
    }

    // Determine difficulty with weighted distribution:
    // hard: 60%, extreme: 25%, impossible: 15%
    const difficultyRandom = (index % 100) / 100;
    console.log(difficultyRandom);
    let difficulty;
    if (difficultyRandom < 0.6) {
      difficulty = "hard";
    } else if (difficultyRandom < 0.85) {
      difficulty = "extreme";
    } else {
      difficulty = "impossible";
    }

    // Get puzzles for the selected length and difficulty
    const puzzlesForLength = puzzleData[wordLength][difficulty];

    // Select a puzzle using the index
    return {
      ...puzzlesForLength[index % puzzlesForLength.length],
      difficulty: difficulty, // Ensure difficulty is included in puzzle object
    };
  };

  // Get a simple warmup puzzle
  const getWarmupPuzzle = () => {
    const warmupPuzzle = getRandomPuzzle(4, "easy");
    return {
      ...warmupPuzzle,
      difficulty: "easy",
    };
  };

  // Get initial warmup puzzle
  const [currentPuzzle, setCurrentPuzzle] = useState();
  const [currentDifficulty, setCurrentDifficulty] = useState();
  const [currentWord, setCurrentWord] = useState("");
  const [previousWords, setPreviousWords] = useState([]);
  const [message, setMessage] = useState("");
  const [moves, setMoves] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isShowingSolution, setIsShowingSolution] = useState(false);
  const [puzzleHistory, setPuzzleHistory] = useState([]);
  const [isGivenUp, setIsGivenUp] = useState(false);

  let pointsSound;

  // Only create Audio instance in browser environment
  if (typeof window !== "undefined" && typeof Audio !== "undefined") {
    pointsSound = new Audio("/sounds/320655__rhodesmas__level-up-01.wav");
    pointsSound.volume = 0.2;
  }

  useEffect(() => {
    if (typeof Audio !== "undefined") {
      pointsSound.load();
    }
  }, []);

  useEffect(() => {
    const warmup = getWarmupPuzzle();
    setCurrentPuzzle(warmup);
    setCurrentDifficulty(warmup.difficulty);
    setCurrentWord(" ".repeat(warmup.start.length));
  }, []);

  useEffect(() => {
    if (!currentPuzzle) return;
    setCurrentWord(" ".repeat(currentPuzzle.start.length));
    setPreviousWords([]);
    setMessage("");
    setMoves(0);

    // Add focus after a short delay to ensure the input exists
    setTimeout(() => {
      const firstInput = document.querySelector('input[data-index="0"]');
      firstInput?.focus();
    }, 0);
  }, [currentPuzzle]);

  const startNewPuzzle = () => {
    setCurrentWord(" ".repeat(currentPuzzle.start.length));
    setPreviousWords([]);
    setMessage("");
    setMoves(0);
  };

  const isValidTransition = (prevWord, newWord) => {
    let differences = 0;
    for (let i = 0; i < prevWord.length; i++) {
      if (prevWord[i] !== newWord[i]) differences++;
    }
    return differences === 1;
  };

  const handleCharChange = (letterIndex, value) => {
    if (value.length > 1) return;

    const newWord = currentWord.split("");
    newWord[letterIndex] = value.toUpperCase() || " ";
    setCurrentWord(newWord.join(""));

    // Auto-focus next input if character is entered
    if (value && letterIndex < currentPuzzle.start.length - 1) {
      const nextInput = document.querySelector(
        `input[data-index="${letterIndex + 1}"]`
      );
      nextInput?.focus();
    }
  };

  const handleSubmit = async () => {
    const expectedLength = currentPuzzle.start.length;

    if (!currentWord?.trim() || currentWord.length !== expectedLength) {
      setMessage("Please fill all letters");
      setIsInvalid(true);
      setTimeout(() => setIsInvalid(false), 500); // Reset after animation
      return;
    }

    // Check if word matches goal word first
    if (currentWord === currentPuzzle.end) {
      // Skip valid word check if it matches the goal
    } else if (!validWords.has(currentWord)) {
      setIsInvalid(true);
      setTimeout(() => setIsInvalid(false), 500); // Reset after animation
      return;
    }

    const lastWord =
      previousWords.length > 0
        ? previousWords[previousWords.length - 1]
        : currentPuzzle.start;

    if (!isValidTransition(lastWord, currentWord)) {
      setMessage("You can only change one letter at a time");
      return;
    }

    if ([...previousWords, currentPuzzle.start].includes(currentWord)) {
      setMessage("This word has already been used");
      return;
    }

    // Add the word to previous words and increment moves
    const newMoves = moves + 1;
    setPreviousWords([...previousWords, currentWord]);
    setMoves(newMoves);

    // Check for win condition
    if (currentWord === currentPuzzle.end) {
      if (typeof Audio !== "undefined") {
        pointsSound.currentTime = 0;
        pointsSound
          .play()
          .catch((err) => console.log("Audio play failed:", err));
      }

      setPuzzleHistory([
        ...puzzleHistory,
        {
          difficulty: currentDifficulty,
          moves: newMoves,
        },
      ]);

      if (!isWarmupCompleted) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 500);

        // Warmup completion logic
        setIsWarmupCompleted(true);
        const dailyPuzzle = getDailyPuzzle();

        setTimeout(() => {
          setCurrentPuzzle(dailyPuzzle);
          setCurrentDifficulty(dailyPuzzle.difficulty);
        }, 1000);
      } else if (!hasCompletedDaily && !isEndlessMode) {
        // Daily puzzle completion - only show modal for daily puzzle
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setHasCompletedDaily(true);
          if (!isGivenUp) {
            setShowCompletionModal(true);
          }
        }, 500);
      } else if (isEndlessMode) {
        // Endless mode - just transition to next puzzle
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);

          const nextPuzzle = getEndlessPuzzle();
          setCurrentPuzzle(nextPuzzle);
          setCurrentDifficulty(nextPuzzle.difficulty);
        }, 1000);
      }
    } else {
      setMessage("");
      setCurrentWord(" ".repeat(currentPuzzle.start.length));
      const firstInput = document.querySelector('input[data-index="0"]');
      firstInput?.focus();
    }
  };

  const restartCurrentPuzzle = () => {
    startNewPuzzle();
  };

  const getAvailableHints = () => {
    const lastWord =
      previousWords.length > 0
        ? previousWords[previousWords.length - 1]
        : currentPuzzle.start;
    const targetWord = currentPuzzle.end;

    return Array.from(validWords)
      .filter((word) => {
        if (word.length !== lastWord.length) return false;
        let differences = 0;
        for (let i = 0; i < word.length; i++) {
          if (word[i] !== lastWord[i]) differences++;
        }
        return differences === 1;
      })
      .sort((a, b) => {
        // Count matching letters with target word
        const aMatches = a
          .split("")
          .filter((letter, i) => letter === targetWord[i]).length;
        const bMatches = b
          .split("")
          .filter((letter, i) => letter === targetWord[i]).length;
        return bMatches - aMatches; // Sort by most matches first
      })
      .slice(0, 10); // Still keep only 10 results, but now they're the most relevant ones
  };

  const handleSolve = () => {
    const solution = findWordPath(
      currentPuzzle.start,
      currentPuzzle.end,
      validWords
    );

    if (solution.length === 0) {
      setMessage("No solution found!");
      return;
    }

    // Remove the start word since it's already shown
    const path = solution.slice(1);
    setPreviousWords(path);
    setCurrentWord(" ".repeat(currentPuzzle.start.length));
    setMoves(path.length);
    setMessage(`Solution found in ${path.length} moves!`);
  };

  const handleFindHardest = () => {
    const startWord = currentPuzzle.start;
    const result = findHardestWord(startWord, validWords);

    setMessage(
      `Hardest reachable word from ${startWord} is "${result.word}" ` +
        `(${result.distance} moves)`
    );

    // Optionally show the path
    setPreviousWords(result.path.slice(1));
    setCurrentWord(" ".repeat(startWord.length));
    setMoves(result.distance);
  };

  // Add a function to handle showing hints with point deduction
  const handleShowHints = () => {
    setShowHints(!showHints);
  };

  const handleGiveUp = () => {
    setIsGivenUp(true);
    const solution = findWordPath(
      currentPuzzle.start,
      currentPuzzle.end,
      validWords
    );

    if (solution.length === 0) {
      setMessage("No solution found!");
      return;
    }

    setIsShowingSolution(true);
    const path = solution.slice(1);

    path.forEach((word, index) => {
      setTimeout(() => {
        setPreviousWords(path.slice(0, index + 1));
      }, index * 500);
    });

    // Only show completion modal if not in endless mode
    if (!isEndlessMode) {
      setTimeout(() => {
        setShowCompletionModal(true);
        setIsShowingSolution(false); // Reset for next puzzle
      }, path.length * 700);
    } else {
      // In endless mode, just move to next puzzle after showing solution
      setTimeout(() => {
        setIsShowingSolution(false);
        const nextPuzzle = getEndlessPuzzle();
        setCurrentPuzzle(nextPuzzle);
        setCurrentDifficulty(nextPuzzle.difficulty);
      }, path.length * 500);
    }

    setCurrentWord(" ".repeat(currentPuzzle.start.length));
    setMoves(path.length);
  };

  // Add function to get random endless puzzle
  const getEndlessPuzzle = () => {
    // Randomly choose word length (4 or 5)
    const wordLength = Math.random() < 0.5 ? 4 : 5;

    // Random difficulty with weighted distribution
    const difficultyRoll = Math.random();
    let difficulty;
    if (difficultyRoll < 0.6) {
      difficulty = "hard";
    } else if (difficultyRoll < 0.85) {
      difficulty = "extreme";
    } else {
      difficulty = "impossible";
    }

    const puzzle = getRandomPuzzle(wordLength, difficulty);
    return {
      ...puzzle,
      difficulty: difficulty,
    };
  };

  // Modify startEndlessMode to use random puzzle
  const startEndlessMode = () => {
    setIsEndlessMode(true);
    setShowCompletionModal(false);
    const newPuzzle = getEndlessPuzzle();
    setCurrentPuzzle(newPuzzle);
    setCurrentDifficulty(newPuzzle.difficulty);
  };

  if (!currentPuzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading puzzle...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow max-w-md mx-auto p-4 space-y-4">
        <div className="text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2">
              <h1 className="relative inline-block transform -skew-x-12 hover:skew-x-0 transition-transform duration-300">
                <span className="text-5xl font-extrabold tracking-tight bg-clip-text text-black">
                  Word Escalator
                </span>
              </h1>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInstructions(true)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <Info size={20} />
                </button>
                <span
                  className={`text-sm uppercase tracking-wider font-bold 
                ${
                  !isWarmupCompleted
                    ? "text-blue-600 bg-blue-100 p-1 rounded"
                    : isEndlessMode
                    ? "text-green-600 bg-green-100 p-1 rounded"
                    : "text-yellow-600 bg-yellow-100 p-1 rounded"
                }`}
                >
                  {!isWarmupCompleted
                    ? "WARMUP"
                    : isEndlessMode
                    ? "ENDLESS MODE"
                    : "DAILY PUZZLE"}
                </span>
              </div>
              <div
                className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${
                currentDifficulty === "easy"
                  ? "bg-green-100 text-green-800"
                  : currentDifficulty === "hard"
                  ? "bg-red-100 text-red-800"
                  : currentDifficulty === "extreme"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-900 text-white"
              }
            `}
              >
                {currentDifficulty.toUpperCase()}
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-3xl font-bold">
              <span>{currentPuzzle.start}</span>
              <ArrowRight className="text-gray-400 w-6 h-6" />
              <span>{currentPuzzle.end}</span>
            </div>
          </div>
        </div>

        <InstructionsModal
          open={showInstructions}
          onOpenChange={setShowInstructions}
        />

        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex flex-col gap-2">
            {[currentPuzzle.start, ...previousWords].map((word, wordIndex) => (
              <div
                key={`${word}-${wordIndex}`}
                className={`
                flex justify-center gap-2
                ${wordIndex > 0 && isShowingSolution ? "animate-slide-in" : ""}
              `}
              >
                {word.split("").map((letter, letterIndex) => {
                  const prevWord =
                    wordIndex > 0
                      ? previousWords[wordIndex - 1]
                      : currentPuzzle.start;
                  const isChanged = prevWord[letterIndex] !== letter;
                  const isLastWord = wordIndex === previousWords.length;

                  return (
                    <div
                      key={`${letter}-${letterIndex}-${wordIndex}`}
                      className={`
                      w-12 h-12 
                      flex items-center justify-center 
                      text-xl font-bold rounded border-2
                      transition-all duration-500
                      ${
                        isChanged
                          ? "bg-yellow-100 border-yellow-500"
                          : "bg-white border-gray-300"
                      }
                      ${isLastWord && isSuccess ? "animate-success-bounce" : ""}
                    `}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            ))}

            {previousWords[previousWords.length - 1] !== currentPuzzle.end && (
              <div
                className={`flex justify-center gap-2 ${
                  isInvalid ? "animate-shake" : ""
                }`}
              >
                {Array(currentPuzzle.start.length)
                  .fill("")
                  .map((_, letterIndex) => {
                    const lastWord =
                      previousWords.length > 0
                        ? previousWords[previousWords.length - 1]
                        : currentPuzzle.start;

                    // Count total differences
                    const currentDifferences = lastWord
                      .split("")
                      .reduce((count, letter, i) => {
                        return (
                          count +
                          (currentWord[i] &&
                          currentWord[i] !== " " &&
                          currentWord[i] !== letter
                            ? 1
                            : 0)
                        );
                      }, 0);

                    // Check if this letter is different
                    const isDifferent =
                      currentWord[letterIndex] &&
                      currentWord[letterIndex] !== " " &&
                      currentWord[letterIndex] !== lastWord[letterIndex];

                    // Determine the highlighting style
                    const highlightStyle =
                      isDifferent && currentDifferences === 1
                        ? "bg-yellow-100 border-yellow-500"
                        : isDifferent && currentDifferences > 1
                        ? "bg-red-100 border-red-500"
                        : "border-gray-300";

                    return (
                      <input
                        key={letterIndex}
                        type="text"
                        value={
                          !currentWord[letterIndex] ||
                          currentWord[letterIndex] === " "
                            ? ""
                            : currentWord[letterIndex]
                        }
                        onChange={(e) =>
                          handleCharChange(letterIndex, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key === "Backspace" &&
                            !e.target.value &&
                            letterIndex > 0
                          ) {
                            const prevInput = document.querySelector(
                              `input[data-index="${letterIndex - 1}"]`
                            );
                            prevInput?.focus();
                          } else if (e.key === "Enter") {
                            handleSubmit();
                          }
                        }}
                        className={`w-12 h-12 text-center text-xl font-bold rounded border-2 
                        ${highlightStyle}
                        ${isInvalid ? "bg-red-50 border-red-500" : ""}`}
                        maxLength={1}
                        data-index={letterIndex}
                        autoComplete="off"
                      />
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 font-medium"
          >
            Submit
          </button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={restartCurrentPuzzle}
                  className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  <RefreshCw size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset puzzle (-50 points)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleShowHints}
                  className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  <HelpCircle size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show hints (-10 points)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleGiveUp}
                  className="p-2 bg-red-200 rounded hover:bg-red-300"
                >
                  🏳️
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Give up</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {showHints && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {getAvailableHints().map((word, index) => (
                <span
                  key={index}
                  className="bg-white px-2 py-1 rounded text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {message && (
          <Alert
            variant={
              message.includes("Invalid") || message.includes("Please")
                ? "destructive"
                : "default"
            }
            className="animate-in fade-in duration-200"
          >
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-500">
          <p className="font-medium mb-1">Rules:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Change one letter at a time</li>
            <li>Each word must be {currentPuzzle.start.length} letters</li>
            <li>Reach the target word in the fewest moves</li>
          </ol>
        </div>

        <CompletionModal
          open={showCompletionModal}
          currentPuzzle={currentPuzzle}
          onOpenChange={setShowCompletionModal}
          moves={moves}
          difficulty={currentDifficulty}
          puzzleHistory={puzzleHistory}
          isGivenUp={isGivenUp}
          onStartEndless={startEndlessMode}
          hasCompletedDaily={hasCompletedDaily}
        />
      </div>
      <footer className="w-full mt-8 bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-2xl font-bold text-white">Word Escalator</h2>
              <p className="text-base text-gray-400 max-w-md">
                Transform words one letter at a time in this challenging word
                puzzle game. Test your vocabulary and problem-solving skills
                with daily puzzles.
              </p>
              <p className="text-sm text-gray-500 pt-4">
                © {new Date().getFullYear()} Word Escalator. All rights
                reserved.
              </p>
            </div>

            {/* Game Links Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Game</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setShowInstructions(true)}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    How to Play
                  </button>
                </li>
                <li>
                  <button
                    onClick={startEndlessMode}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    Endless Mode
                  </button>
                </li>
                <li>
                  <a
                    href="https://guesshex.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    Try GuessHex
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WordEvolutionGame;
