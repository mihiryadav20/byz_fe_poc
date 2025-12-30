import { useState, useRef } from 'react';
import type { TriageResult } from '@/types/triage';
import { analyzeLogFile, TriageApiError } from '@/services/triageApi';
import { TriageResults } from '@/components/TriageResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircleIcon, FileTextIcon, LoaderIcon, UploadIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LogAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.endsWith('.log')) {
      return 'Only .log files are allowed';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setTriageResult(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setTriageResult(null);

    try {
      const result = await analyzeLogFile(selectedFile);
      setTriageResult(result);
    } catch (err) {
      if (err instanceof TriageApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTriageResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Log File Triage Analyzer</h1>
          <p className="text-muted-foreground">
            Upload a .log file to get AI-powered triage analysis
          </p>
        </div>

        {/* Upload Area */}
        {!triageResult && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Log File</CardTitle>
              <CardDescription>
                Select or drag and drop a .log file for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 transition-colors cursor-pointer',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <div className="rounded-full bg-primary/10 p-4">
                  <UploadIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Drop your file here' : 'Drag and drop your .log file'}
                  </p>
                  <p className="text-xs text-muted-foreground">or click to browse</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".log"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="flex items-center gap-4 rounded-lg border bg-muted/50 p-4">
                  <FileTextIcon className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <AlertCircleIcon className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-sm text-destructive/90 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4" />
                    Analyze Log File
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {triageResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <Button onClick={handleReset} variant="outline">
                <UploadIcon className="h-4 w-4" />
                Analyze Another File
              </Button>
            </div>
            <TriageResults result={triageResult} />
          </div>
        )}
      </div>
    </div>
  );
}
