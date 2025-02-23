declare module 'web-vitals' {
  type NextWebVitalsMetric = {
    id: string;
    name: string;
    startTime: number;
    value: number;
    label: string;
  };

  export type ReportHandler = (metric: NextWebVitalsMetric) => void;

  export function getCLS(onReport: ReportHandler): void;
  export function getFID(onReport: ReportHandler): void;
  export function getFCP(onReport: ReportHandler): void;
  export function getLCP(onReport: ReportHandler): void;
  export function getTTFB(onReport: ReportHandler): void;
}