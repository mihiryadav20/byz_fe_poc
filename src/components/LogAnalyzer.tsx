import { useState, useRef } from 'react';
import type { TriageResult } from '@/types/triage';
import { analyzeLogFile, TriageApiError } from '@/services/triageApi';
import { TriageResults } from '@/components/TriageResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircleIcon, FileTextIcon, LoaderIcon, UploadIcon, XIcon, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
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
    <div className={cn("min-h-screen bg-background p-8", !triageResult && "flex items-center justify-center")}>
      {triageResult ? (
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Results Display */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Analysis Results:</h2>

              <Button onClick={handleReset} variant="default">
                <UploadIcon className="h-4 w-4" />
                Analyze Another File
              </Button>
            </div>
            <Separator className="my-4" />
            <TriageResults result={triageResult} />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-lg space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-normal whitespace-nowrap">Your logs, decoded instantly!</h1>
          </div>

          {/* Upload Area */}
          <div>
            <h3 className="text-lg font-semibold text-foreground">File Upload</h3>
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "mt-4 flex justify-center space-x-4 rounded-md border border-dashed px-6 py-10 transition-colors",
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-input'
              )}
            >
              <div className="sm:flex sm:items-center sm:gap-x-3">
                <Upload
                  className="mx-auto h-8 w-8 text-muted-foreground sm:mx-0 sm:h-6 sm:w-6"
                  aria-hidden={true}
                />
                <div className="mt-4 flex text-sm leading-6 text-foreground sm:mt-0">
                  <p>Drag and drop or</p>
                  <Label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:underline hover:underline-offset-4"
                  >
                    <span>choose file</span>
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      accept=".log"
                      onChange={handleFileInputChange}
                      className="sr-only"
                    />
                  </Label>
                  <p className="pl-1">to upload</p>
                </div>
              </div>
            </div>
            <p className="mt-2 flex items-center justify-between text-xs leading-5 text-muted-foreground">
              Accepted file types: .log files only
            </p>

            {/* Selected File Preview */}
            {selectedFile && (
              <div className="relative mt-8 rounded-lg bg-muted p-3">
                <div className="absolute right-1 top-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-sm p-2 text-muted-foreground hover:text-foreground"
                    aria-label="Remove"
                    onClick={handleReset}
                  >
                    <XIcon className="size-4 shrink-0" aria-hidden={true} />
                  </Button>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-background shadow-sm ring-1 ring-inset ring-input">
                    <FileTextIcon
                      className="size-5 text-foreground"
                      aria-hidden={true}
                    />
                  </span>
                  <div className="w-full">
                    <p className="text-xs font-medium text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="mt-0.5 flex justify-between text-xs text-muted-foreground">
                      <span>{formatBytes(selectedFile.size)}</span>
                      <span>Ready</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <AlertCircleIcon className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/90 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <div className="mt-8">
              <Button
                type="button"
                variant="default"
                className="w-full whitespace-nowrap rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
