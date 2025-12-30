export interface TimelineEvent {
  timestamp: string;
  event: string;
  severity: 'fatal' | 'warning' | 'info';
}

export interface TriageResult {
  status: string;
  message: string;
  request_id: string;
  metadata: {
    processing_time_ms: number;
    model_used: string;
    api_version: string;
    timestamp: string;
    log_file: {
      filename: string;
      size_bytes: number;
      format: string;
    };
  };
  triage: {
    test_name: string;
    error_type: string;
    location: string;
    classification: {
      category: 'BUG' | 'INFRA' | 'TEST';
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      confidence: number;
      severity: string;
    };
    summary: string;
    analysis: {
      reasoning: string;
      timeline: TimelineEvent[];
      failure_signature: {
        error_message: string;
        instance_count: number;
        first_occurrence: string;
        pattern: string;
      };
      context: {
        test_phase: string;
        subsystem: string;
        security_related: boolean;
      };
    };
    recommendations: {
      owner: string;
      actions: string[];
      priority_justification: string;
      estimated_effort_hours: string;
      blocking: boolean;
    };
    related_failures: string[];
    impact: {
      blocks_testing: boolean;
      affects_security: boolean;
      reproducibility: string;
    };
  };
  time_savings: {
    manual_triage_minutes: number;
    automated_triage_seconds: number;
    time_saved_minutes: number;
    efficiency_gain_percent: number;
  };
}
