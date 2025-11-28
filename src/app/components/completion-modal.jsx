import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Share2, Zap, Trophy, Target } from "lucide-react";
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
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleCopy = () => {
    const difficultyEmoji =
      {
        easy: "🟢",
        hard: "🟠",
        extreme: "🔴",
        impossible: "💀",
      }[difficulty] || "🟢";

    const shareText = isGivenUp
      ? `Word Escalator #${getDayNumber()}\n` +
        `${currentPuzzle.start} → ${currentPuzzle.end}\n` +
        `${difficultyEmoji} ${difficulty.toUpperCase()}\n` +
        `🏳️ Gave up\n\n` +
        `Can you solve it? wordescalator.com`
      : `Word Escalator #${getDayNumber()}\n` +
        `${currentPuzzle.start} → ${currentPuzzle.end}\n` +
        `${moves} moves • ${difficultyEmoji} ${difficulty.toUpperCase()}\n\n` +
        `Can you beat this? wordescalator.com`;

    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(console.error);
  };

  const getDayNumber = () => {
    const launchDate = new Date("2024-03-20");
    const today = new Date();
    const diffTime = Math.abs(today - launchDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDifficultyConfig = (diff) => {
    const configs = {
      easy: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      },
      hard: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
      },
      extreme: {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
      },
      impossible: {
        bg: "bg-slate-800",
        text: "text-white",
        border: "border-slate-600",
      },
    };
    return configs[diff] || configs.easy;
  };

  const diffConfig = getDifficultyConfig(difficulty);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
        {showConfetti && !isGivenUp && (
          <Confetti
            {...windowSize}
            recycle={false}
            numberOfPieces={200}
            colors={["#f59e0b", "#fbbf24", "#fcd34d", "#10b981", "#6366f1"]}
          />
        )}

        {/* Header with gradient */}
        <div className={`px-6 pt-8 pb-6 text-center ${isGivenUp ? 'bg-slate-50' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100'}`}>
          <div className="mb-4">
            {isGivenUp ? (
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-200 flex items-center justify-center">
                <Target className="w-8 h-8 text-slate-500" />
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <DialogTitle className="text-2xl font-display font-semibold text-slate-900 mb-1">
            {isGivenUp ? "Nice Try!" : "Puzzle Complete!"}
          </DialogTitle>
          <p className="text-slate-500 text-sm">
            {isGivenUp ? "Better luck next time" : "Great job solving today's puzzle"}
          </p>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Puzzle Info */}
          <div className="flex items-center justify-center gap-3 py-3 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Day #{getDayNumber()}</span>
            <span className="text-slate-300">•</span>
            <span className="font-display text-lg font-semibold text-slate-700">{currentPuzzle.start}</span>
            <span className="text-amber-500">→</span>
            <span className="font-display text-lg font-semibold text-amber-600">{currentPuzzle.end}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-slate-900">{moves}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-1">Moves</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${diffConfig.bg} ${diffConfig.text} ${diffConfig.border}`}
              >
                {difficulty}
              </span>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-2">Difficulty</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleCopy}
              className={`
                w-full flex items-center justify-center gap-2.5
                px-6 py-3.5 rounded-xl font-semibold text-base
                transition-all duration-100 hover:scale-[1.02] active:scale-[0.98]
                ${copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-200 hover:shadow-emerald-300'
                }
              `}
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" />
                  <span>Share Results</span>
                </>
              )}
            </button>

            <button
              onClick={onStartEndless}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3.5 rounded-xl font-semibold text-base hover:from-violet-600 hover:to-purple-700 transition-all duration-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-200 hover:shadow-violet-300"
            >
              <Zap className="w-5 h-5" />
              <span>Continue in Endless Mode</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionModal;
