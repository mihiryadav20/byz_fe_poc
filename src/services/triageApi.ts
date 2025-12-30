import type { TriageResult } from '@/types/triage';

const API_BASE_URL = 'https://byzantex-poc.onrender.com';

export class TriageApiError extends Error {
  status?: number;

  constructor(
    message: string,
    status?: number
  ) {
    super(message);
    this.name = 'TriageApiError';
    this.status = status;
  }
}

export async function analyzeLogFile(file: File): Promise<TriageResult> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/triage/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to analyze log file';

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If response isn't JSON, use status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }

      throw new TriageApiError(errorMessage, response.status);
    }

    const result: TriageResult = await response.json();
    return result;
  } catch (error) {
    if (error instanceof TriageApiError) {
      throw error;
    }

    // Network errors or other fetch errors
    if (error instanceof Error) {
      throw new TriageApiError(
        `Network error: ${error.message}. Make sure the API server is running at ${API_BASE_URL}`
      );
    }

    throw new TriageApiError('An unexpected error occurred');
  }
}
