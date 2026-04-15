import * as React from "react";
const { useState, useRef } = React;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Upload, FileText, Loader2, CheckCircle, XCircle, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  onAnalysisComplete?: (results: any) => void;
}

interface AnalysisResult {
  extractedText: string;
  isDrawing: boolean;
  drawingDescription: string;
  questions: {
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  totalQuestions: number;
  correctCount: number;
}

export const PhotoUpload = ({ onAnalysisComplete }: PhotoUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setExtractedText("");
    setAnalysisResults(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        handleFileSelect(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an image or PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const callPuterAI = async (prompt: string): Promise<string> => {
    if (!window.puter?.ai) {
      throw new Error("Puter AI is not available. Please refresh the page.");
    }

    const response = await window.puter.ai.chat(prompt, {
      model: 'claude-sonnet-4',
    });

    if (response?.message?.content?.[0]?.text) {
      return response.message.content[0].text;
    } else if (response?.text) {
      return response.text;
    } else if (typeof response === 'string') {
      return response;
    }
    return JSON.stringify(response);
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProcessingStep("Reading image...");
    
    try {
      const base64Data = await fileToBase64(selectedFile);
      
      // Step 1: Extract text and detect if it's a drawing
      setProcessingStep("Extracting text from image...");
      
      const extractionPrompt = `You are analyzing an uploaded image of a student's exercise or homework. Please do the following:

1. Extract ALL text visible in the image exactly as written. Include questions, answers, numbers, equations, and any handwritten text.
2. If the image contains drawings (diagrams, shapes, graphs, sketches), describe what is drawn in detail.
3. Identify each question and the student's answer.

The image is provided as a base64 data URL: ${base64Data}

Please respond in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "extractedText": "all text found in the image exactly as written",
  "isDrawing": true/false,
  "drawingDescription": "description of any drawings/diagrams found, or empty string if none",
  "questions": [
    {
      "question": "the question text",
      "studentAnswer": "what the student wrote as answer"
    }
  ]
}

If you cannot read the image or it's unclear, still try your best and note any uncertain parts.`;

      let extractionResult: any;
      try {
        const extractionResponse = await callPuterAI(extractionPrompt);
        // Try to parse JSON from response, handling possible markdown wrapping
        let jsonStr = extractionResponse;
        const jsonMatch = extractionResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1].trim();
        }
        extractionResult = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Parse error, using raw text:', parseError);
        extractionResult = {
          extractedText: "Could not parse structured data. Raw extraction attempted.",
          isDrawing: false,
          drawingDescription: "",
          questions: []
        };
      }

      setExtractedText(extractionResult.extractedText || "No text detected");

      // Step 2: Analyze answers and provide corrections
      setProcessingStep("Analyzing answers...");
      
      const analysisPrompt = `You are a helpful tutor. A student submitted their homework. Here is what was extracted:

Extracted Text: ${extractionResult.extractedText}
${extractionResult.isDrawing ? `Drawing Description: ${extractionResult.drawingDescription}` : ''}
Questions found: ${JSON.stringify(extractionResult.questions)}

For each question found, please:
1. Determine if the student's answer is correct
2. Provide the correct answer
3. Give brief, encouraging feedback

Respond in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "questions": [
    {
      "question": "the question",
      "studentAnswer": "what student wrote",
      "correctAnswer": "the correct answer",
      "isCorrect": true/false,
      "feedback": "encouraging feedback explaining the answer"
    }
  ]
}

If there are drawings, evaluate them too (e.g., if asked to draw a triangle, check if the description matches). Be encouraging and helpful.`;

      let analysisResult: any;
      try {
        const analysisResponse = await callPuterAI(analysisPrompt);
        let jsonStr = analysisResponse;
        const jsonMatch = analysisResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1].trim();
        }
        analysisResult = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Analysis parse error:', parseError);
        analysisResult = {
          questions: extractionResult.questions?.map((q: any) => ({
            ...q,
            correctAnswer: "Unable to determine",
            isCorrect: false,
            feedback: "Could not analyze this answer. Please check manually."
          })) || []
        };
      }

      const correctCount = analysisResult.questions?.filter((q: any) => q.isCorrect).length || 0;
      
      const finalResults: AnalysisResult = {
        extractedText: extractionResult.extractedText || "",
        isDrawing: extractionResult.isDrawing || false,
        drawingDescription: extractionResult.drawingDescription || "",
        questions: analysisResult.questions || [],
        totalQuestions: analysisResult.questions?.length || 0,
        correctCount,
      };

      setAnalysisResults(finalResults);
      onAnalysisComplete?.(finalResults);
      
      toast({
        title: "✅ Analysis Complete",
        description: `Found ${finalResults.totalQuestions} questions — ${correctCount} correct!`,
      });
      
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Exercise Photo or PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            {selectedFile && (
              <Button 
                onClick={processFile}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                {isProcessing ? processingStep || "Processing..." : "Analyze"}
              </Button>
            )}
          </div>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="text-sm text-muted-foreground">
            Supported: Photos of exercises, handwritten work, drawings. JPG, PNG formats.
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={preview} 
              alt="Uploaded exercise" 
              className="max-w-full max-h-96 object-contain rounded-lg border"
            />
          </CardContent>
        </Card>
      )}

      {extractedText && (
        <Card>
          <CardHeader>
            <CardTitle>📝 Extracted Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-foreground">{extractedText}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResults?.isDrawing && analysisResults.drawingDescription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Drawing Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-foreground">{analysisResults.drawingDescription}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResults && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">{analysisResults.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Questions Found</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {analysisResults.correctCount}/{analysisResults.totalQuestions}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
            </div>
            
            {analysisResults.questions.length > 0 && (
              <div className="space-y-3">
                {analysisResults.questions.map((correction, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      {correction.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium text-foreground">
                        Question {index + 1}: {correction.isCorrect ? "Correct ✅" : "Needs Review ❌"}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="text-foreground"><strong>Question:</strong> {correction.question}</div>
                      <div className="text-foreground"><strong>Your Answer:</strong> {correction.studentAnswer}</div>
                      <div className="text-foreground">
                        <strong>Correct Answer:</strong>{" "}
                        <span className={correction.isCorrect ? "text-green-500" : "text-red-500 font-semibold"}>
                          {correction.correctAnswer}
                        </span>
                      </div>
                      <div className="text-muted-foreground italic mt-1">💡 {correction.feedback}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
