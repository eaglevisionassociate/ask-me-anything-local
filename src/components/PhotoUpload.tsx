import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Upload, FileText, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Tesseract from 'tesseract.js';

interface PhotoUploadProps {
  onAnalysisComplete?: (results: any) => void;
}

export const PhotoUpload = ({ onAnalysisComplete }: PhotoUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setExtractedText("");
    setAnalysisResults(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
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

  const extractTextFromImage = async (file: File): Promise<string> => {
    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      });
      return result.data.text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // For PDF processing, we'll need a PDF.js implementation
    // For now, return a placeholder message
    return "PDF text extraction not yet implemented. Please convert to image format.";
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      let text = "";
      
      if (selectedFile.type.startsWith('image/')) {
        text = await extractTextFromImage(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        text = await extractTextFromPDF(selectedFile);
      }

      setExtractedText(text);
      
      // Simulate AI analysis - in a real app, this would call an AI service
      const mockAnalysis = {
        totalQuestions: text.split('?').length - 1,
        detectedAnswers: text.match(/\d+/g)?.length || 0,
        corrections: [
          {
            question: "Example detected question",
            studentAnswer: "Example student answer",
            correctAnswer: "Example correct answer",
            isCorrect: Math.random() > 0.5,
            feedback: "Example feedback"
          }
        ]
      };
      
      setAnalysisResults(mockAnalysis);
      onAnalysisComplete?.(mockAnalysis);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${mockAnalysis.totalQuestions} questions with ${mockAnalysis.detectedAnswers} answers`,
      });
      
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
                {isProcessing ? "Processing..." : "Analyze"}
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
            Supported formats: JPG, PNG, PDF. Max size: 10MB
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
            <CardTitle>Extracted Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResults && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{analysisResults.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Questions Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analysisResults.detectedAnswers}</div>
                <div className="text-sm text-muted-foreground">Answers Detected</div>
              </div>
            </div>
            
            <div className="space-y-3">
              {analysisResults.corrections?.map((correction: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {correction.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {correction.isCorrect ? "Correct" : "Needs Review"}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Question:</strong> {correction.question}</div>
                    <div><strong>Your Answer:</strong> {correction.studentAnswer}</div>
                    {!correction.isCorrect && (
                      <div><strong>Correct Answer:</strong> {correction.correctAnswer}</div>
                    )}
                    <div className="text-muted-foreground">{correction.feedback}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};