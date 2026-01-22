"use client";
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, HelpCircle, ArrowRight, Info, Sparkles, Zap } from "lucide-react";
import { getValidWords } from "@/utils/wordUtils";
import { findWordPath, findHardestWord } from "@/utils/wordSolver";
import {
  puzzleData,
  getRandomPuzzle,
  getNextDifficulty,
} from "@/data/puzzleData";
import {
  mulberry32,
  dateToSeed,
  getLocalDateString,
} from "@/utils/puzzleUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import InstructionsModal from "./instructions-modal";
import CompletionModal from "./completion-modal";
import { notifyPuzzleCompletion } from "@/utils/discord";
import { createGameStatsClient, getTodayDate } from "@/lib/statsClient";
import { streakStore } from "@/lib/streakStore";
import FeedbackModal from "./feedback-modal";

const statsClient = createGameStatsClient('word-escalator');
import Link from "next/link";
import GameNav from "./GameNav";

const WordEvolutionGame = () => {
  const validWords = getValidWords();

  const [isWarmupCompleted, setIsWarmupCompleted] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") === "endless";
  });
  const [isEndlessMode, setIsEndlessMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") === "endless";
  });
  const [hasCompletedDaily, setHasCompletedDaily] = useState(false);
  const [streak] = useState(() => {
    if (typeof window === "undefined") return 0;
    return streakStore.getGameStreak('word-escalator').currentStreak;
  });

  const getDailyPuzzle = () => {
    // Use local time for daily puzzles
    const dateString = getLocalDateString();

    // Create deterministic random generator from date
    const seed = dateToSeed(dateString);
    const random = mulberry32(seed);

    // Independent random values for each decision
    const wordLengthRoll = random();
    const difficultyRoll = random();
    const puzzleIndexRoll = random();

    // Word length selection (50/50)
    const wordLength = wordLengthRoll < 0.5 ? "fourLetters" : "fiveLetters";

    // Difficulty selection (hard: 50%, extreme: 25%, impossible: 25%)
    let difficulty;
    if (difficultyRoll < 0.5) {
      difficulty = "hard";
    } else if (difficultyRoll < 0.75) {
      difficulty = "extreme";
    } else {
      difficulty = "impossible";
    }

    // Puzzle selection with uniform distribution
    const puzzlesForLength = puzzleData[wordLength][difficulty];
    const puzzleIndex = Math.floor(puzzleIndexRoll * puzzlesForLength.length);

    return {
      ...puzzlesForLength[puzzleIndex],
      difficulty: difficulty,
    };
  };

  const getWarmupPuzzle = () => {
    const wordLength = Math.random() < 0.5 ? 4 : 5;
    const warmupPuzzle = getRandomPuzzle(wordLength, "easy");
    return {
      ...warmupPuzzle,
      difficulty: "easy",
    };
  };

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
  const [showEndlessModeTooltip, setShowEndlessModeTooltip] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [par, setPar] = useState(null);

  let pointsSound;

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
    // Check if starting in endless mode from URL param
    if (isEndlessMode) {
      const puzzle = getEndlessPuzzle();
      setCurrentPuzzle(puzzle);
      setCurrentDifficulty(puzzle.difficulty);
      setCurrentWord(" ".repeat(puzzle.start.length));
    } else {
      const warmup = getWarmupPuzzle();
      setCurrentPuzzle(warmup);
      setCurrentDifficulty(warmup.difficulty);
      setCurrentWord(" ".repeat(warmup.start.length));
    }
  }, []);

  useEffect(() => {
    if (!currentPuzzle) return;
    setCurrentWord(" ".repeat(currentPuzzle.start.length));
    setPreviousWords([]);
    setMessage("");
    setMoves(0);
    setIsGivenUp(false);
    setIsShowingSolution(false);

    // Calculate par (optimal solution length)
    const optimalPath = findWordPath(currentPuzzle.start, currentPuzzle.end, validWords);
    setPar(optimalPath.length > 0 ? optimalPath.length - 1 : null); // -1 because path includes start word

    // Track game start
    const gameMode = !isWarmupCompleted ? "warmup" : isEndlessMode ? "endless" : "daily";
    statsClient.trackEvent('game_start', {
      gameMode,
      difficulty: currentPuzzle.difficulty,
      startWord: currentPuzzle.start,
      endWord: currentPuzzle.end,
    });

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
      setTimeout(() => setIsInvalid(false), 500);
      return;
    }

    if (currentWord === currentPuzzle.end) {
      // Skip valid word check if it matches the goal
    } else if (!validWords.has(currentWord)) {
      setIsInvalid(true);
      setTimeout(() => setIsInvalid(false), 500);
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

    const newMoves = moves + 1;
    setPreviousWords([...previousWords, currentWord]);
    setMoves(newMoves);

    if (currentWord === currentPuzzle.end) {
      const gameMode = !isWarmupCompleted ? "warmup" : isEndlessMode ? "endless" : "daily";

      await notifyPuzzleCompletion({
        moves: newMoves,
        difficulty: currentDifficulty,
        startWord: currentPuzzle.start,
        endWord: currentPuzzle.end,
        isGivenUp: false,
        gameMode: gameMode.toUpperCase(),
      });

      // Track stats
      statsClient.recordSession({
        gameMode,
        score: newMoves,
        result: 'completed',
        puzzleDate: gameMode === 'daily' ? getTodayDate() : undefined,
        metadata: {
          moves: newMoves,
          difficulty: currentDifficulty,
          startWord: currentPuzzle.start,
          endWord: currentPuzzle.end,
        },
      }).catch(err => console.error('Stats tracking failed:', err));

      // Record win for streak tracking (daily mode only)
      if (gameMode === 'daily') {
        streakStore.recordWin('word-escalator');
      }

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
        setIsWarmupCompleted(true);
        const dailyPuzzle = getDailyPuzzle();

        setTimeout(() => {
          setCurrentPuzzle(dailyPuzzle);
          setCurrentDifficulty(dailyPuzzle.difficulty);
        }, 1000);
      } else if (!hasCompletedDaily && !isEndlessMode) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setHasCompletedDaily(true);
          if (!isGivenUp) {
            setShowCompletionModal(true);
          }
        }, 500);
      } else if (isEndlessMode) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          nextEndlessPuzzle();
        }, 1000);
      }
    } else {
      setMessage("");
      setCurrentWord(" ".repeat(currentPuzzle.start.length));
      const firstInput = document.querySelector('input[data-index="0"]');
      firstInput?.focus();
    }
  };

  const nextEndlessPuzzle = () => {
    if (!isEndlessMode) {
      startEndlessMode();
    } else {
      const nextPuzzle = getEndlessPuzzle();
      setCurrentPuzzle(nextPuzzle);
      setCurrentDifficulty(nextPuzzle.difficulty);
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
        const aMatches = a
          .split("")
          .filter((letter, i) => letter === targetWord[i]).length;
        const bMatches = b
          .split("")
          .filter((letter, i) => letter === targetWord[i]).length;
        return bMatches - aMatches;
      })
      .slice(0, 10);
  };

  const handleShowHints = () => {
    if (!showHints) {
      statsClient.trackHint(moves + 1, { previousWords: previousWords.length });
    }
    setShowHints(!showHints);
  };

  const handleGiveUp = async () => {
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

    if (!isEndlessMode) {
      setTimeout(() => {
        setShowCompletionModal(true);
        setIsShowingSolution(false);
      }, path.length * 700);
    }

    setCurrentWord(" ".repeat(currentPuzzle.start.length));
    setMoves(path.length);

    const gameMode = !isWarmupCompleted ? "warmup" : isEndlessMode ? "endless" : "daily";

    await notifyPuzzleCompletion({
      moves: path.length,
      difficulty: currentDifficulty,
      startWord: currentPuzzle.start,
      endWord: currentPuzzle.end,
      isGivenUp: true,
      gameMode: gameMode.toUpperCase(),
    });

    // Track stats
    statsClient.recordSession({
      gameMode,
      score: path.length,
      result: 'gave_up',
      puzzleDate: gameMode === 'daily' ? getTodayDate() : undefined,
      metadata: {
        moves: path.length,
        difficulty: currentDifficulty,
        startWord: currentPuzzle.start,
        endWord: currentPuzzle.end,
      },
    }).catch(err => console.error('Stats tracking failed:', err));
  };

  const getEndlessPuzzle = () => {
    const wordLength = Math.random() < 0.5 ? 4 : 5;
    const puzzle = getRandomPuzzle(wordLength, currentDifficulty);

    return {
      ...puzzle,
      difficulty: currentDifficulty,
    };
  };

  const startEndlessMode = () => {
    setIsWarmupCompleted(true);
    setIsEndlessMode(true);
    setShowCompletionModal(false);
    const newPuzzle = getEndlessPuzzle();
    setCurrentPuzzle(newPuzzle);
    setCurrentDifficulty(newPuzzle.difficulty);
    setShowEndlessModeTooltip(true);
    statsClient.trackModeSelect('endless');
    window.history.replaceState({}, '', '/?mode=endless');
    setTimeout(() => setShowEndlessModeTooltip(false), 5000);
  };

  const handleDifficultyClick = () => {
    if (!isEndlessMode) return;

    const nextDifficulty = getNextDifficulty(currentDifficulty);
    setCurrentDifficulty(nextDifficulty);

    const newPuzzle = getRandomPuzzle(
      currentPuzzle.start.length,
      nextDifficulty
    );
    setCurrentPuzzle({
      ...newPuzzle,
      difficulty: nextDifficulty,
    });
  };

  const getDifficultyConfig = (diff) => {
    const configs = {
      easy: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        glow: "shadow-emerald-100",
      },
      hard: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        glow: "shadow-orange-100",
      },
      extreme: {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        glow: "shadow-rose-100",
      },
      impossible: {
        bg: "bg-slate-900",
        text: "text-white",
        border: "border-slate-700",
        glow: "shadow-slate-500",
      },
    };
    return configs[diff] || configs.easy;
  };

  const getModeConfig = () => {
    if (!isWarmupCompleted) {
      return {
        label: "WARMUP",
        bg: "bg-sky-50",
        text: "text-sky-700",
        border: "border-sky-200",
        icon: Sparkles,
      };
    }
    if (isEndlessMode) {
      return {
        label: "ENDLESS",
        bg: "bg-violet-50",
        text: "text-violet-700",
        border: "border-violet-200",
        icon: Zap,
      };
    }
    return {
      label: "DAILY",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Sparkles,
    };
  };

  if (!currentPuzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  const modeConfig = getModeConfig();
  const diffConfig = getDifficultyConfig(currentDifficulty);
  const ModeIcon = modeConfig.icon;

  return (
    <div className="min-h-screen flex flex-col">
      <GameNav currentGame="word-escalator" theme="light" streak={streak} />
      <div className="flex-grow w-full max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
            Word Escalator
          </h1>
          <p className="text-slate-500 text-sm">
            Transform words, one letter at a time
          </p>
        </header>

        {/* Game Status Bar */}
        <div className="game-card rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowInstructions(true);
                  statsClient.trackHelp();
                }}
                className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 hover:scale-105 active:scale-95 transition-all duration-100"
                aria-label="How to play"
              >
                <Info size={18} />
              </button>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${modeConfig.bg} ${modeConfig.text} ${modeConfig.border}`}
              >
                <ModeIcon size={14} />
                {modeConfig.label}
              </div>
            </div>

            <button
              onClick={handleDifficultyClick}
              disabled={!isEndlessMode}
              className={`
                px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                border transition-all duration-100
                ${diffConfig.bg} ${diffConfig.text} ${diffConfig.border}
                ${isEndlessMode ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default"}
              `}
            >
              {currentDifficulty}
            </button>
          </div>

          {showEndlessModeTooltip && (
            <div className="mt-4 p-3 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
              <span className="font-medium">Tip:</span> Click the difficulty badge to cycle through difficulty levels
            </div>
          )}
        </div>

        {/* Word Target Display */}
        <div className="game-card rounded-2xl p-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-medium">Start</p>
              <p className="font-display text-3xl sm:text-4xl font-semibold text-slate-800 tracking-wide">
                {currentPuzzle.start}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
              <ArrowRight className="text-amber-600 w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-medium">Goal</p>
              <p className="font-display text-3xl sm:text-4xl font-semibold text-amber-600 tracking-wide">
                {currentPuzzle.end}
              </p>
            </div>
          </div>
          {/* Moves & Par indicator */}
          {par !== null && (
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Moves</span>
                <span className={`font-display text-lg font-bold ${
                  moves === 0 ? 'text-slate-400' :
                  moves <= par ? 'text-emerald-600' :
                  moves <= par + 2 ? 'text-amber-600' : 'text-rose-500'
                }`}>
                  {moves}
                </span>
              </div>
              <span className="text-slate-300">/</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Optimal</span>
                <span className="font-display text-lg font-bold text-slate-600">{par}</span>
              </div>
              {!isEndlessMode && (
                <>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Streak</span>
                    <span className="font-display text-lg font-bold" style={{ color: streak > 0 ? '#f97316' : '#94a3b8' }}>
                      {streak > 0 ? `🔥 ${streak}` : '0'}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="game-card rounded-2xl p-5">
          <div className="flex flex-col gap-2.5">
            {/* Previous words */}
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
                  const isChanged = wordIndex > 0 && prevWord[letterIndex] !== letter;
                  const isLastWord = wordIndex === previousWords.length;

                  return (
                    <div
                      key={`${letter}-${letterIndex}-${wordIndex}`}
                      className={`
                        w-12 h-12 sm:w-14 sm:h-14
                        flex items-center justify-center
                        text-lg sm:text-xl font-bold rounded-xl border-2
                        transition-all duration-150
                        ${isChanged
                          ? "bg-amber-100 border-amber-400 letter-tile-changed text-amber-800"
                          : "bg-white border-slate-200 letter-tile text-slate-700"
                        }
                        ${isLastWord && isSuccess ? "animate-success-bounce" : ""}
                        hover:scale-[1.02]
                      `}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Input row */}
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

                    const isDifferent =
                      currentWord[letterIndex] &&
                      currentWord[letterIndex] !== " " &&
                      currentWord[letterIndex] !== lastWord[letterIndex];

                    let inputStyle = "border-slate-300 bg-white focus:border-amber-400 focus:ring-amber-100";
                    if (isInvalid) {
                      inputStyle = "border-rose-400 bg-rose-50";
                    } else if (isDifferent && currentDifferences === 1) {
                      inputStyle = "border-amber-400 bg-amber-50";
                    } else if (isDifferent && currentDifferences > 1) {
                      inputStyle = "border-rose-400 bg-rose-50";
                    }

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
                        className={`
                          w-12 h-12 sm:w-14 sm:h-14
                          text-center text-lg sm:text-xl font-bold
                          rounded-xl border-2
                          outline-none focus:ring-4
                          transition-all duration-100
                          ${inputStyle}
                        `}
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isShowingSolution ? (
            <button
              onClick={handleSubmit}
              className="flex-1 btn-primary text-white py-3.5 px-6 rounded-xl font-semibold text-base"
            >
              Submit Word
            </button>
          ) : (
            <button
              onClick={() => nextEndlessPuzzle()}
              className="flex-1 btn-primary text-white py-3.5 px-6 rounded-xl font-semibold text-base"
            >
              Next Puzzle
            </button>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={restartCurrentPuzzle}
                  className="p-3.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 hover:scale-105 active:scale-95 transition-all duration-100"
                >
                  <RefreshCw size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white border-0">
                <p>Reset puzzle</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleShowHints}
                  className={`p-3.5 rounded-xl transition-all duration-100 hover:scale-105 active:scale-95 ${
                    showHints
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                  }`}
                >
                  <HelpCircle size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white border-0">
                <p>Show hints</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleGiveUp}
                  className="p-3.5 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 hover:text-rose-700 hover:scale-105 active:scale-95 transition-all duration-100"
                >
                  <span className="text-lg">🏳️</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white border-0">
                <p>Give up & see solution</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Hints Panel */}
        {showHints && (
          <div className="game-card rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Available words</p>
            <div className="flex flex-wrap gap-2">
              {getAvailableHints().map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-100 cursor-default"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error Messages */}
        {message && (
          <Alert
            variant={
              message.includes("Invalid") || message.includes("Please")
                ? "destructive"
                : "default"
            }
            className="animate-in fade-in slide-in-from-top-2 duration-150 rounded-xl"
          >
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Rules */}
        <div className="game-card rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Quick Rules</p>
          <ol className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">1</span>
              <span>Change one letter at a time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">2</span>
              <span>Each word must be {currentPuzzle.start.length} letters and valid</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">3</span>
              <span>Reach the goal in as few moves as possible</span>
            </li>
          </ol>
        </div>

        <InstructionsModal
          open={showInstructions}
          onOpenChange={setShowInstructions}
        />

        <CompletionModal
          open={showCompletionModal}
          currentPuzzle={currentPuzzle}
          onOpenChange={setShowCompletionModal}
          moves={moves}
          par={par}
          difficulty={currentDifficulty}
          puzzleHistory={puzzleHistory}
          isGivenUp={isGivenUp}
          onStartEndless={startEndlessMode}
          hasCompletedDaily={hasCompletedDaily}
        />
      </div>

      {/* Below-the-fold SEO Content */}
      <section className="w-full bg-[#0a0a0a] text-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          {/* How to Play Summary */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-orange-500">
              How to Play Word Escalator
            </h2>
            <ol className="space-y-4 text-zinc-300 mb-6">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-sm font-bold">1</span>
                <span>Start with the given word and transform it into the target word</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-sm font-bold">2</span>
                <span>Change exactly one letter per move - each step must form a valid English word</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-sm font-bold">3</span>
                <span>Try to match the optimal solution - the fewer moves, the better your score</span>
              </li>
            </ol>
            <Link
              href="/how-to-play"
              className="inline-flex items-center text-orange-500 hover:text-orange-400 transition-colors text-sm font-medium"
            >
              Read full instructions
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-orange-500">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <details className="group bg-zinc-900 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 text-white font-medium">
                  What is Word Escalator?
                  <svg className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-zinc-400">
                  Word Escalator is a free daily word ladder puzzle game where you transform one word into another by changing one letter at a time. Each step must form a valid English word. It&apos;s inspired by Lewis Carroll&apos;s classic &quot;Doublets&quot; game from 1877.
                </p>
              </details>

              <details className="group bg-zinc-900 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 text-white font-medium">
                  Is Word Escalator free to play?
                  <svg className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-zinc-400">
                  Yes! Word Escalator is completely free to play with no ads, subscriptions, or paywalls. Play the daily puzzle or enjoy unlimited games in Endless Mode.
                </p>
              </details>

              <details className="group bg-zinc-900 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 text-white font-medium">
                  How often do new puzzles appear?
                  <svg className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-zinc-400">
                  A new daily puzzle is available every day at midnight UTC. The same puzzle is available for all players worldwide, so you can compare your solution with friends. Plus, Endless Mode offers unlimited puzzles anytime.
                </p>
              </details>

              <details className="group bg-zinc-900 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 text-white font-medium">
                  What&apos;s the difference between difficulty levels?
                  <svg className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-zinc-400">
                  Word Escalator features four difficulty levels: Easy (2-3 moves), Hard (4-5 moves), Extreme (6-7 moves), and Impossible (8+ moves). The optimal solution length increases with difficulty, challenging you to find more creative word paths.
                </p>
              </details>

              <details className="group bg-zinc-900 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 text-white font-medium">
                  Can I play on mobile?
                  <svg className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-zinc-400">
                  Yes! Word Escalator is fully responsive and works great on phones, tablets, and desktop browsers. No app download required - just visit the website and start playing.
                </p>
              </details>
            </div>
          </div>

          {/* About Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-orange-500">
              About Word Escalator
            </h2>
            <div className="text-zinc-400 space-y-4">
              <p>
                Word Escalator brings the classic word ladder puzzle to the modern web. Originally invented by Lewis Carroll in 1877 and known as &quot;Doublets,&quot; word ladders have challenged puzzle enthusiasts for nearly 150 years.
              </p>
              <p>
                Whether you&apos;re a word game enthusiast looking for your daily brain workout or a casual player wanting a quick mental challenge, Word Escalator offers the perfect balance of accessibility and depth. Challenge yourself, improve your vocabulary, and join thousands of players solving the daily puzzle.
              </p>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center text-orange-500 hover:text-orange-400 transition-colors text-sm font-medium mt-4"
            >
              Learn more about Word Escalator
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full mt-auto bg-slate-900 text-slate-300">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div className="md:col-span-1 space-y-4">
              <h2 className="font-display text-2xl font-semibold text-white">Word Escalator</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Transform words one letter at a time. Challenge yourself with daily puzzles and compete with friends.
              </p>
            </div>

            {/* Game Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Play</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/how-to-play"
                    className="text-slate-400 hover:text-amber-400 transition-colors text-sm"
                  >
                    How to Play
                  </Link>
                </li>
                <li>
                  <button
                    onClick={startEndlessMode}
                    className="text-slate-400 hover:text-amber-400 transition-colors text-sm"
                  >
                    Endless Mode
                  </button>
                </li>
                <li>
                  <a
                    href="https://dial-words.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-amber-400 transition-colors text-sm"
                  >
                    Try Dial Words
                  </a>
                </li>
                <li>
                  <a
                    href="https://guesshex.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-amber-400 transition-colors text-sm"
                  >
                    Try GuessHex
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Connect</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="text-slate-400 hover:text-amber-400 transition-colors text-sm"
                  >
                    Send Feedback
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800">
            <p className="text-slate-500 text-xs text-center">
              © {new Date().getFullYear()} Word Escalator. Made with care.
            </p>
          </div>
        </div>
      </footer>

      <FeedbackModal open={showFeedback} onOpenChange={setShowFeedback} />
    </div>
  );
};

export default WordEvolutionGame;
