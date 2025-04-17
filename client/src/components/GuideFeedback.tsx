import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface GuideFeedbackProps {
  guideId: number;
  stainName: string;
  materialName: string;
}

const GuideFeedback = ({ guideId, stainName, materialName }: GuideFeedbackProps) => {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [feedbackValue, setFeedbackValue] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check if user has already given feedback for this guide
  useEffect(() => {
    const storedFeedback = localStorage.getItem(`guide-feedback-${guideId}`);
    if (storedFeedback) {
      setFeedbackGiven(true);
      setFeedbackValue(storedFeedback === "true");
    }
  }, [guideId]);

  const handleFeedback = (isHelpful: boolean) => {
    // Store in localStorage
    localStorage.setItem(`guide-feedback-${guideId}`, isHelpful.toString());
    
    // Log the feedback to console
    console.log(`Guide Feedback - ${stainName} from ${materialName}: ${isHelpful ? "Helpful" : "Not Helpful"}`);
    
    // Update state
    setFeedbackGiven(true);
    setFeedbackValue(isHelpful);
    
    // Show toast
    toast({
      title: "Thank you for your feedback!",
      description: "We use this to improve our stain removal guides.",
      duration: 3000,
    });
  };

  if (feedbackGiven) {
    return (
      <Alert className="mb-8 bg-primary/10 border-primary/30">
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">
            <Check className="h-4 w-4 inline-block mr-2 text-green-600" />
            Thanks for your feedback! {feedbackValue ? "We're glad this guide was helpful." : "We'll work to improve this guide."}
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-8 border-muted-foreground/20">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-base font-medium text-foreground">Was this guide helpful?</p>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
              onClick={() => handleFeedback(true)}
            >
              <ThumbsUp className="h-4 w-4" />
              Yes
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
              onClick={() => handleFeedback(false)}
            >
              <ThumbsDown className="h-4 w-4" />
              No
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuideFeedback;