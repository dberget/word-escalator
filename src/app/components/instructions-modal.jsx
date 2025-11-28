import { ArrowRight, Lightbulb, Target, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const InstructionsModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200 mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <DialogTitle className="text-2xl font-display font-semibold text-slate-900 text-center">
            How to Play
          </DialogTitle>
          <p className="text-slate-500 text-sm text-center mt-1">
            Master the word escalator
          </p>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Main instruction */}
          <div className="bg-slate-50 rounded-xl p-4 mt-4">
            <p className="text-slate-700 leading-relaxed">
              Transform the <span className="font-semibold text-slate-900">starting word</span> into
              the <span className="font-semibold text-amber-600">target word</span> by changing one
              letter at a time. Each step must form a valid English word.
            </p>
          </div>

          {/* Example */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Example</h3>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="font-display text-xl font-semibold text-slate-800">COLD</span>
                <ArrowRight className="text-amber-500 w-5 h-5" />
                <span className="font-display text-xl font-semibold text-amber-600">WARM</span>
              </div>

              <div className="space-y-2">
                {[
                  { word: "COLD", changed: null },
                  { word: "CORD", changed: 2 },
                  { word: "CORE", changed: 3 },
                  { word: "WORE", changed: 0 },
                  { word: "WARE", changed: 1 },
                  { word: "WARM", changed: 3 },
                ].map((step, index) => (
                  <div key={index} className="flex justify-center gap-1.5">
                    {step.word.split("").map((letter, letterIndex) => (
                      <div
                        key={letterIndex}
                        className={`
                          w-9 h-9 flex items-center justify-center
                          text-sm font-bold rounded-lg border-2
                          ${step.changed === letterIndex
                            ? "bg-amber-100 border-amber-400 text-amber-800"
                            : "bg-white border-slate-200 text-slate-700"
                          }
                        `}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Game Modes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Game Modes</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3 bg-sky-50 rounded-xl p-3 border border-sky-100">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-200 text-sky-700 text-xs font-bold flex items-center justify-center mt-0.5">W</span>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Warmup</p>
                  <p className="text-slate-500 text-xs">Start with an easy puzzle to get warmed up</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">D</span>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Daily Puzzle</p>
                  <p className="text-slate-500 text-xs">A new challenge every day - share your score!</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-violet-50 rounded-xl p-3 border border-violet-100">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-200 text-violet-700 text-xs font-bold flex items-center justify-center mt-0.5">∞</span>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Endless Mode</p>
                  <p className="text-slate-500 text-xs">Keep playing with adjustable difficulty</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Tips</h3>
            </div>

            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>Look for common word patterns and letter combinations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>Sometimes going "backwards" can help you reach the goal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>Use hints if stuck, but they don't always show optimal paths</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstructionsModal;
