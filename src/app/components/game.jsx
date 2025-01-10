"use client";
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, HelpCircle, ArrowRight } from "lucide-react";
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

const WordEvolutionGame = () => {
  const validWords = getValidWords();

  // Get a deterministic puzzle based on the current date
  const getDailyPuzzle = () => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`;
    const puzzles = puzzleData["easy"];

    // Use the date string to create a deterministic index
    let index = 0;
    for (let i = 0; i < dateString.length; i++) {
      index += dateString.charCodeAt(i);
    }
    return puzzles[index % puzzles.length];
  };

  const [currentDifficulty, setCurrentDifficulty] = useState("easy");
  const [currentPuzzle, setCurrentPuzzle] = useState(getDailyPuzzle());
  const [currentWord, setCurrentWord] = useState("");
  const [previousWords, setPreviousWords] = useState([]);
  const [message, setMessage] = useState("");
  const [moves, setMoves] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [targetScore, setTargetScore] = useState(1000);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const PUZZLES_TO_LEVEL_UP = 1;
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [nextDifficulty, setNextDifficulty] = useState(null);
  const [floatingPoints, setFloatingPoints] = useState(null);

  const pointsSound = new Audio("/sounds/320655__rhodesmas__level-up-01.wav");
  pointsSound.volume = 0.2;

  useEffect(() => {
    pointsSound.load();
  }, []);

  useEffect(() => {
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
      return;
    }

    if (!validWords.has(currentWord)) {
      setMessage("Not a valid word");
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
      const pointsEarned = Math.max(10 - newMoves, 1) * 100;
      const newPuzzlesCompleted = puzzlesCompleted + 1;
      setPuzzlesCompleted(newPuzzlesCompleted);

      if (newPuzzlesCompleted >= PUZZLES_TO_LEVEL_UP) {
        // First: trigger difficulty change
        const newDifficulty = getNextDifficulty(currentDifficulty);
        setNextDifficulty(newDifficulty);

        // Play sound with points animation after difficulty change
        setTimeout(() => {
          pointsSound.currentTime = 0;
          pointsSound
            .play()
            .catch((err) => console.log("Audio play failed:", err));

          setFloatingPoints(pointsEarned);
          setScore(score + pointsEarned);

          setTimeout(() => {
            setFloatingPoints(null);
          }, 1000);
        }, 250);

        // Complete the difficulty change
        setTimeout(() => {
          setLevel(level + 1);
          setCurrentDifficulty(newDifficulty);
          setTargetScore((prev) => prev * 2);
          setPuzzlesCompleted(0);
          setNextDifficulty(null);

          setCurrentPuzzle(
            getRandomPuzzle(newDifficulty, currentPuzzle.start.length + 1)
          );
        }, 500);
      } else {
        // Regular puzzle completion
        pointsSound.currentTime = 0;
        pointsSound
          .play()
          .catch((err) => console.log("Audio play failed:", err));

        setFloatingPoints(pointsEarned);
        setScore(score + pointsEarned);

        setTimeout(() => {
          setFloatingPoints(null);
        }, 1000);

        // Use pre-generated puzzle at same difficulty
        setCurrentPuzzle(
          getRandomPuzzle(currentDifficulty, currentPuzzle.start.length)
        );
      }
    } else {
      setMessage("");
      setCurrentWord(" ".repeat(currentPuzzle.start.length));
      const firstInput = document.querySelector('input[data-index="0"]');
      firstInput?.focus();
    }
  };

  const restartCurrentPuzzle = () => {
    const pointDeduction = 50; // Deduct 50 points for each reset
    setScore((prevScore) => Math.max(0, prevScore - pointDeduction)); // Prevent negative scores
    setMessage(`-${pointDeduction} points for resetting`);
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
    if (!showHints) {
      // Only deduct points when opening hints
      const pointDeduction = 10;
      setScore((prevScore) => Math.max(0, prevScore - pointDeduction));
      setMessage(`-${pointDeduction} points for using hints`);
    }
    setShowHints(!showHints);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="relative inline-block transform -skew-x-12 hover:skew-x-0 transition-transform duration-300">
            <span className="text-5xl font-extrabold tracking-tight bg-clip-text text-black">
              Word Escalator
            </span>
          </h1>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 uppercase tracking-wider">
                DIFFICULTY:
              </span>
              <div className="relative h-8">
                <span
                  className={`absolute text-xl font-semibold capitalize transition-all
                  ${nextDifficulty ? "animate-slide-up-out" : ""}
                  ${
                    currentDifficulty === "easy"
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-600"
                      : currentDifficulty === "medium"
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"
                      : "text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600"
                  }`}
                >
                  {currentDifficulty === "easy" ? "warmup" : currentDifficulty}
                </span>
                {nextDifficulty && (
                  <span
                    className={`absolute text-xl font-semibold capitalize transition-all animate-slide-up-in
                    ${
                      nextDifficulty === "easy"
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-600"
                        : nextDifficulty === "medium"
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"
                        : "text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600"
                    }`}
                  >
                    {nextDifficulty === "easy" ? "warmup" : nextDifficulty}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 uppercase tracking-wider">
                SCORE:
              </span>
              <div className="relative">
                <span className="text-xl font-semibold">{score}</span>
                {floatingPoints && (
                  <span className="absolute left-0 -top-2 text-green-500 font-bold animate-float-up">
                    +{floatingPoints}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-3xl font-bold">
            <span>{currentPuzzle.start}</span>
            <ArrowRight className="text-gray-400 w-6 h-6" />
            <span>{currentPuzzle.end}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="flex flex-col gap-2">
          {[currentPuzzle.start, ...previousWords].map((word, index) => (
            <div key={index} className="flex justify-center gap-2">
              {word.split("").map((letter, letterIndex) => {
                const prevWord =
                  index > 0
                    ? [currentPuzzle.start, ...previousWords][index - 1]
                    : null;
                const isChanged = prevWord && prevWord[letterIndex] !== letter;

                return (
                  <div
                    key={letterIndex}
                    className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded border-2 
                    ${
                      word === currentPuzzle.end
                        ? "bg-green-100 border-green-500"
                        : isChanged
                        ? "bg-yellow-100 border-yellow-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}

          {previousWords[previousWords.length - 1] !== currentPuzzle.end && (
            <div className="flex justify-center gap-2">
              {Array(currentPuzzle.start.length)
                .fill("")
                .map((_, letterIndex) => {
                  const lastWord =
                    previousWords.length > 0
                      ? previousWords[previousWords.length - 1]
                      : currentPuzzle.start;

                  // Only highlight if this is the single different character AND the current letter isn't empty
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

                  const isOnlyDifference =
                    currentWord[letterIndex] &&
                    currentWord[letterIndex] !== " " &&
                    currentWord[letterIndex] !== lastWord[letterIndex] &&
                    currentDifferences === 1;

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
                        ${
                          isOnlyDifference
                            ? "bg-yellow-100 border-yellow-500"
                            : "border-gray-300"
                        }`}
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
      </div>

      {showHints && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {getAvailableHints().map((word, index) => (
              <span key={index} className="bg-white px-2 py-1 rounded text-sm">
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
    </div>
  );
};

export default WordEvolutionGame;
