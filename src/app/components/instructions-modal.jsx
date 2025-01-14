import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const InstructionsModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto my-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-3">
            How to Play Word Escalator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p>
            Transform the starting word into the target word by changing one
            letter at a time. Each word must be valid. See how far you can climb
            the word escalator each day as puzzles get progressively harder!
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">Example:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold">COLD</span>
                <ArrowRight className="text-gray-400 w-4 h-4" />
                <span className="font-bold">WARM</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm">Solution:</p>
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      C
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      O
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      L
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      D
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      C
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      O
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      R
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 bg-yellow-100 border-yellow-500 rounded">
                      D
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      C
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      O
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      R
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 bg-yellow-100 border-yellow-500 rounded">
                      E
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-10 h-10 flex items-center justify-center border-2 bg-yellow-100 border-yellow-500 rounded">
                      W
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      O
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      R
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      E
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      W
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 bg-yellow-100 border-yellow-500 rounded">
                      A
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      R
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      E
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      W
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      A
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 rounded">
                      R
                    </span>
                    <span className="w-10 h-10 flex items-center justify-center border-2 bg-yellow-100 border-yellow-500 rounded">
                      M
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Scoring:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Complete puzzles in fewer moves for more points</li>
              <li>Using hints costs 10 points</li>
              <li>Resetting a puzzle costs 50 points</li>
              <li>Each completed puzzle unlocks a more challenging level</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Tips:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Look for common word patterns</li>
              <li>Sometimes going "backwards" can help reach the goal</li>
              <li>Use hints if you're stuck, but they cost points!</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstructionsModal;
