'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  ExpandMore,
  TrendingUp,
  People,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface GenerationResult {
  scheduleId: string;
  status: string;
  assignments: Record<string, string[]>;
  unfilled: string[];
  warnings: Array<{
    type: 'error' | 'warning' | 'info';
    shiftId: string;
    employeeId?: string;
    message: string;
  }>;
  stats: {
    totalShifts: number;
    filledShifts: number;
    partiallyFilledShifts: number;
    unfilledShifts: number;
    fillRate: number;
    totalHoursScheduled: number;
    employeesUsed: number;
  };
}

interface ScheduleGenerationPreviewProps {
  open: boolean;
  onClose: () => void;
  result: GenerationResult | null;
  onConfirm: () => void;
  onRegenerate: () => void;
  loading?: boolean;
}

export default function ScheduleGenerationPreview({
  open,
  onClose,
  result,
  onConfirm,
  onRegenerate,
  loading = false,
}: ScheduleGenerationPreviewProps) {
  if (!result) return null;

  const { stats, warnings, unfilled } = result;

  // Group warnings by type
  const errors = warnings.filter(w => w.type === 'error');
  const warningsList = warnings.filter(w => w.type === 'warning');
  const info = warnings.filter(w => w.type === 'info');

  // Determine overall status
  const isGoodFillRate = stats.fillRate >= 90;
  const hasErrors = errors.length > 0;
  const hasWarnings = warningsList.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ScheduleIcon />
          <Typography variant="h6">Schedule Generation Preview</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 4 }}>
            <LinearProgress />
            <Typography align="center" sx={{ mt: 2 }}>
              Generating schedule...
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Overall Status */}
            <Alert
              severity={hasErrors ? 'error' : hasWarnings ? 'warning' : 'success'}
              icon={hasErrors ? <ErrorIcon /> : hasWarnings ? <Warning /> : <CheckCircle />}
            >
              <Typography variant="body2">
                {hasErrors && 'Schedule generated with errors. Some shifts could not be filled.'}
                {!hasErrors && hasWarnings && 'Schedule generated with warnings. Review before confirming.'}
                {!hasErrors && !hasWarnings && 'Schedule generated successfully! All shifts filled.'}
              </Typography>
            </Alert>

            {/* Statistics */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Generation Statistics
              </Typography>
              
              <Stack spacing={2}>
                {/* Fill Rate */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Fill Rate
                    </Typography>
                    <Chip
                      label={`${stats.fillRate}%`}
                      color={isGoodFillRate ? 'success' : 'warning'}
                      size="small"
                    />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={stats.fillRate}
                    color={isGoodFillRate ? 'success' : 'warning'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Key Metrics */}
                <Stack direction="row" spacing={2} justifyContent="space-around">
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingUp color="primary" />
                    <Typography variant="h6">{stats.totalShifts}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Shifts
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <CheckCircle color="success" />
                    <Typography variant="h6">{stats.filledShifts}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fully Filled
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <People color="info" />
                    <Typography variant="h6">{stats.employeesUsed}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Employees
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <ScheduleIcon color="action" />
                    <Typography variant="h6">{stats.totalHoursScheduled}h</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Hours
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>

            {/* Errors */}
            {errors.length > 0 && (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ErrorIcon color="error" fontSize="small" />
                    <Typography>
                      Errors ({errors.length})
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Shift</TableCell>
                          <TableCell>Issue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {errors.map((err, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{err.shiftId.substring(0, 8)}...</TableCell>
                            <TableCell>
                              <Typography variant="body2" color="error">
                                {err.message}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Warnings */}
            {warningsList.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Warning color="warning" fontSize="small" />
                    <Typography>
                      Warnings ({warningsList.length})
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    {warningsList.slice(0, 10).map((warn, idx) => (
                      <Alert key={idx} severity="warning" sx={{ py: 0.5 }}>
                        <Typography variant="caption">
                          {warn.message}
                        </Typography>
                      </Alert>
                    ))}
                    {warningsList.length > 10 && (
                      <Typography variant="caption" color="text.secondary" align="center">
                        +{warningsList.length - 10} more warnings
                      </Typography>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Info Messages */}
            {info.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography>
                      Informational ({info.length})
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    {info.slice(0, 5).map((item, idx) => (
                      <Alert key={idx} severity="info" sx={{ py: 0.5 }}>
                        <Typography variant="caption">
                          {item.message}
                        </Typography>
                      </Alert>
                    ))}
                    {info.length > 5 && (
                      <Typography variant="caption" color="text.secondary" align="center">
                        +{info.length - 5} more items
                      </Typography>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Recommendations */}
            <Alert severity="info">
              <Typography variant="body2" gutterBottom>
                <strong>Recommendations:</strong>
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {stats.fillRate < 90 && (
                  <li>Consider adjusting shift requirements or employee availability</li>
                )}
                {stats.unfilledShifts > 0 && (
                  <li>Manually assign {stats.unfilledShifts} unfilled shift{stats.unfilledShifts > 1 ? 's' : ''}</li>
                )}
                {stats.fillRate >= 90 && (
                  <li>Schedule looks good! Review and confirm to publish.</li>
                )}
              </ul>
            </Alert>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onRegenerate} disabled={loading} color="secondary">
          Regenerate
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={hasErrors ? 'warning' : 'primary'}
        >
          {hasErrors ? 'Confirm Anyway' : 'Confirm Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
