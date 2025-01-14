import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import Confetti from "react-confetti";
import { useState, useEffect } from "react";

const CompletionModal = ({
  open,
  onOpenChange,
  moves,
  difficulty,
  isGivenUp,
  onStartEndless,
  hasCompletedDaily,
  currentPuzzle,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleCopy = () => {
    const difficultyEmoji =
      {
        easy: "🟢",
        hard: "🔴",
        extreme: "💀",
        impossible: "👿",
      }[difficulty] || "🟢";

    const shareText = isGivenUp
      ? `Word Escalator #${getDayNumber()}\n` +
        `${currentPuzzle.start} ⚡️ ${currentPuzzle.end}\n` +
        `${difficultyEmoji} ${difficulty.toUpperCase()} mode\n` +
        `🏳️ Gave up\n\n` +
        `Challenge your friends: wordescalator.com`
      : `Word Escalator #${getDayNumber()}\n` +
        `${currentPuzzle.start} ⚡️ ${currentPuzzle.end}\n` +
        `${moves} moves • ${difficultyEmoji} ${difficulty.toUpperCase()}\n\n` +
        `Can you match this?: https://wordescalator.com`;

    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(console.error);
  };

  const getDayNumber = () => {
    const launchDate = new Date("2024-03-20"); // Replace with your launch date
    const today = new Date();
    const diffTime = Math.abs(today - launchDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {showConfetti && (
          <Confetti {...windowSize} recycle={false} numberOfPieces={200} />
        )}
        <DialogHeader>
          <DialogTitle className="text-2xl text-center font-bold">
            {isGivenUp ? "Better luck next time!" : "🎉 Puzzle Complete! 🎉"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Game Info Section */}
          <div className="w-full text-center space-y-2">
            <div className="text-sm text-gray-500">
              Word Escalator #{getDayNumber()}
            </div>
            <div className="flex items-center justify-center gap-3 text-xl font-semibold">
              <span>{currentPuzzle.start}</span>
              <span className="text-blue-500">⚡️</span>
              <span>{currentPuzzle.end}</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="w-full grid grid-cols-2 gap-4 border-y border-gray-200 py-4">
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold">{moves}</div>
              <div className="text-sm text-gray-500">MOVES</div>
            </div>
            <div className="text-center space-y-1">
              <div
                className={`
                inline-block px-3 py-1 rounded-full text-sm font-medium
                ${
                  difficulty === "easy"
                    ? "bg-green-100 text-green-800"
                    : difficulty === "hard"
                    ? "bg-red-100 text-red-800"
                    : difficulty === "extreme"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-900 text-white"
                }
              `}
              >
                {difficulty.toUpperCase()}
              </div>
              <div className="text-sm text-gray-500">DIFFICULTY</div>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="flex flex-col gap-4 w-full">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2.5 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {copied ? (
                <>
                  <span className="text-lg">✓</span>
                  <span>Results Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Share Results</span>
                </>
              )}
            </button>

            <button
              onClick={onStartEndless}
              className="flex items-center justify-center gap-2.5 bg-violet-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="text-xl">∞</span>
              <span>Continue in Endless Mode</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionModal;
