import type { TriageResult } from '@/types/triage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircleIcon, AlertTriangleIcon, InfoIcon } from 'lucide-react';

interface TriageResultsProps {
  result: TriageResult;
}

export function TriageResults({ result }: TriageResultsProps) {
  const { triage, metadata, time_savings } = result;

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'BUG':
        return 'destructive';
      case 'INFRA':
        return 'outline';
      case 'TEST':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'outline';
      case 'LOW':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'fatal':
        return <AlertCircleIcon className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <InfoIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Geist Mono, monospace' }}>{metadata.log_file.filename}</h2>
          <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: 'Geist Mono, monospace' }}>
            {formatBytes(metadata.log_file.size_bytes)} • Confidence: {triage.classification.confidence}% •
            Processed in {metadata.processing_time_ms}ms
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={getCategoryVariant(triage.classification.category)} style={{ fontFamily: 'Geist Mono, monospace' }}>
            {triage.classification.category}
          </Badge>
          <Badge variant={getPriorityVariant(triage.classification.priority)} style={{ fontFamily: 'Geist Mono, monospace' }}>
            {triage.classification.priority}
          </Badge>
        </div>
      </div>

      {/* Time Savings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Time Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Manual Triage</dt>
              <dd className="mt-1 text-lg font-semibold" style={{ fontFamily: 'Geist Mono, monospace' }}>{time_savings.manual_triage_minutes} min</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Automated</dt>
              <dd className="mt-1 text-lg font-semibold" style={{ fontFamily: 'Geist Mono, monospace' }}>{time_savings.automated_triage_seconds}s</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Time Saved</dt>
              <dd className="mt-1 text-lg font-semibold text-green-500" style={{ fontFamily: 'Geist Mono, monospace' }}>{time_savings.time_saved_minutes} min</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Efficiency Gain</dt>
              <dd className="mt-1 text-lg font-semibold text-green-500" style={{ fontFamily: 'Geist Mono, monospace' }}>{time_savings.efficiency_gain_percent}%</dd>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 text-sm font-medium text-muted-foreground w-1/3">Test Name</td>
                <td className="py-3 text-sm" style={{ fontFamily: 'Geist Mono, monospace' }}>{triage.test_name}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 text-sm font-medium text-muted-foreground">Error Type</td>
                <td className="py-3 text-sm" style={{ fontFamily: 'Geist Mono, monospace' }}>{triage.error_type}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 text-sm font-medium text-muted-foreground">Location</td>
                <td className="py-3 text-sm" style={{ fontFamily: 'Geist Mono, monospace' }}>{triage.location}</td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-muted-foreground">Instance Count</td>
                <td className="py-3 text-sm" style={{ fontFamily: 'Geist Mono, monospace' }}>{triage.analysis.failure_signature.instance_count}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Summary and Reasoning Row */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
        {/* Summary Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed" style={{ fontFamily: 'Geist Mono, monospace' }}>{triage.summary}</p>
          </CardContent>
        </Card>

        {/* Reasoning Card */}
        <Card className="md:col-span-7">
          <CardHeader>
            <CardTitle>Analysis Reasoning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Geist Mono, monospace' }}>{triage.analysis.reasoning}</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Card */}
      {triage.analysis.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {triage.analysis.timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  {getSeverityIcon(event.severity)}
                  <div className="flex-1">
                    <div className="font-medium" style={{ fontFamily: 'Geist Mono, monospace' }}>{event.timestamp}</div>
                    <div className="text-muted-foreground" style={{ fontFamily: 'Geist Mono, monospace' }}>{event.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Owner</dt>
            <dd className="mt-1 text-sm" style={{ fontFamily: 'Geist Mono, monospace' }}>{triage.recommendations.owner}</dd>
          </div>
          <Separator />
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Estimated Effort</dt>
            <dd className="mt-1 text-sm" style={{ fontFamily: 'Geist Mono, monospace' }}>{triage.recommendations.estimated_effort_hours} hours</dd>
          </div>
          <Separator />
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-2">Actions</dt>
            <ul className="space-y-2">
              {triage.recommendations.actions.map((action, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <span style={{ fontFamily: 'Geist Mono, monospace' }}>{action}</span>
                </li>
              ))}
            </ul>
          </div>
          {triage.recommendations.blocking && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Blocking Issue</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Related Failures Card */}
      {triage.related_failures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Failures</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {triage.related_failures.map((failure, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span style={{ fontFamily: 'Geist Mono, monospace' }}>{failure}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Impact Card */}
      <Card>
        <CardHeader>
          <CardTitle>Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Blocks Testing</dt>
              <dd className="mt-1 text-sm" style={{ fontFamily: 'Geist Mono, monospace' }}>{triage.impact.blocks_testing ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Security Related</dt>
              <dd className="mt-1 text-sm" style={{ fontFamily: 'Geist Mono, monospace' }}>{triage.impact.affects_security ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Reproducibility</dt>
              <dd className="mt-1 text-sm capitalize" style={{ fontFamily: 'Geist Mono, monospace' }}>{triage.impact.reproducibility.replace('_', ' ')}</dd>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
