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
        `${moves} moves • ${difficultyEmoji} ${difficulty.toUpperCase()} mode 🎮\n\n` +
        `Can you match this?: wordescalator.com`;

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
          <DialogTitle className="text-2xl text-center">
            🎉 Daily Puzzle Complete! 🎉
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div
            className={`
            px-3 py-1 rounded-full text-sm font-medium
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

          <div className="text-center space-y-1">
            <div className="text-3xl font-bold">{moves}</div>
            <div className="text-sm text-gray-500">MOVES</div>
          </div>

          <div className="text-sm text-gray-500 text-center">
            Word Escalator #{getDayNumber()}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              <Copy size={20} />
              {copied ? "Copied!" : "Share Results"}
            </button>

            <button
              onClick={onStartEndless}
              className="flex items-center justify-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition-colors"
            >
              <span>🎮</span>
              Continue in Endless Mode
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionModal;
