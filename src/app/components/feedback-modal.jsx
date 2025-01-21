import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Share your ideas, suggestions, or report issues. We'd love to hear
            from you!
          </DialogDescription>
        </DialogHeader>
        {!submitted ? (
          <>
            <Textarea
              placeholder="Your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !feedback.trim()}
              className="w-full"
            >
              {isSubmitting ? "Sending..." : "Submit Feedback"}
            </Button>
          </>
        ) : (
          <div className="text-center py-4 text-green-600">
            Thank you for your feedback!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
