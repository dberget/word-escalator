import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { MessageSquare, Send, CheckCircle } from "lucide-react";

export default function FeedbackModal({ open, onOpenChange }) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      setSubmitted(true);
      setTimeout(() => {
        onOpenChange(false);
        setFeedback("");
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg shadow-slate-300 mb-4">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <DialogTitle className="text-2xl font-display font-semibold text-slate-900 text-center">
            Send Feedback
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm text-center mt-1">
            Share ideas, suggestions, or report issues
          </DialogDescription>
        </div>

        <div className="px-6 pb-6">
          {!submitted ? (
            <div className="space-y-4 mt-4">
              <Textarea
                placeholder="What's on your mind? We'd love to hear from you..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[120px] rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-100 resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !feedback.trim()}
                className={`
                  w-full flex items-center justify-center gap-2.5
                  px-6 py-3.5 rounded-xl font-semibold text-base
                  transition-all duration-200
                  ${isSubmitting || !feedback.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-200 hover:shadow-amber-300'
                  }
                `}
              >
                <Send className="w-5 h-5" />
                <span>{isSubmitting ? "Sending..." : "Submit Feedback"}</span>
              </button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-lg font-semibold text-slate-900">Thank you!</p>
              <p className="text-slate-500 text-sm mt-1">Your feedback helps us improve</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
