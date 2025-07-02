export interface ChartDataInput {
  linguisticVariable: string;
  linguisticValues: {
    nameValue: string;
    functionType: string;
    points: {
      a: number;
      b: number;
      c: number;
      d: number;
      e: number;
    };
  }[];
  xAxisLimit: number;
  yAxisStep: number;
}