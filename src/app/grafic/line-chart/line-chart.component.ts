import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, ChartEvent, LegendItem, LegendElement, ChartTypeRegistry } from 'chart.js';
import { registerables } from 'chart.js';
import { ChartDataInput } from '../interfaces/ChartDataInput';
import { DataPoint } from '../interfaces/DataPoint';
Chart.register(...registerables);

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css'
})
  
export class LineChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('membershipChart') chartCanvas!: ElementRef;
  chart!: Chart;

  // Variable para rastrear el estado de filtrado
  private currentlyFilteredIndex: number = -1;

  @Input() chartData: ChartDataInput | undefined;
  @Input() linguisticVariable: string = '';
  @Output() chartRendered: EventEmitter<HTMLCanvasElement> = new EventEmitter<HTMLCanvasElement>();

  constructor() { }

  ngAfterViewInit() {   

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData']) {

      setTimeout(() => {
        if (
          changes['chartData'].currentValue &&
          changes['chartData'].currentValue.linguisticValues &&
          changes['chartData'].currentValue.linguisticValues.length > 0
        ) {
          this.createChart(changes['chartData'].currentValue, this.linguisticVariable);
        } else {
          this.createEmptyChart(
            changes['chartData'].currentValue?.xAxisLimit,
            changes['chartData'].currentValue?.yAxisStep,
            this.linguisticVariable
          );
        }
      }, 0);
    }
  }

  createEmptyChart(xAxisLimit: number = 1, yAxisStep: number = 0.5, linguisticVariable: string = '') {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) return;
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (this.chart) this.chart.destroy();

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            min: 0,
            max: xAxisLimit,
            ticks: {
              stepSize: Math.max(1, Math.floor(xAxisLimit / 10))
            },
            title: {
              display: true,
              text: linguisticVariable
            }
          },
          y: {
            min: 0,
            max: 1,
            ticks: {
              stepSize: yAxisStep
            },
            title: {
              display: true,
              text: 'Grado de Pertenencia'
            }
          }
        },
        plugins: {
          legend: {
            display: true
          },
          title: {
            display: false,
            text: `Conjunto difuso para la variable lingüística ${linguisticVariable}`
          }
        },
        animation: {
          onComplete: (e) => {
            this.chartRendered.emit(this.chartCanvas.nativeElement);
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
    // Reiniciar el índice filtrado cuando se crea un nuevo gráfico
    this.currentlyFilteredIndex = -1;
  }

  createChart(data: ChartDataInput, linguisticVariable: string) {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    const datasets: any[] = [];
    const colors = ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 206, 86)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)'];

    let allXValues: number[] = [];

    data.linguisticValues.forEach((lv, index) => {
      let datasetData: DataPoint[] = [];

      // Ordenar los puntos del trapezoide para garantizar a <= b <= c <= d
      if (lv.functionType === 'trapezoidal') {
        const sorted = [lv.points.a, lv.points.b, lv.points.c, lv.points.d].sort((a, b) => a - b);
        [lv.points.a, lv.points.b, lv.points.c, lv.points.d] = sorted;
        
      } else if (lv.functionType === 'triangular') {
        const sorted = [lv.points.a, lv.points.b, lv.points.c].sort((a, b) => a - b);
        [lv.points.a, lv.points.b, lv.points.c] = sorted;
      }

      const localMaxX = lv.functionType === 'trapezoidal'
        ? Math.max(lv.points.d)
        : Math.max(lv.points.c);

      const xValues = this.generateXValues(localMaxX, data.yAxisStep);
      allXValues.push(...xValues);

      datasetData = xValues.map(x => {
        const y = lv.functionType === 'trapezoidal'
          ? this.trapezoidalFunction(x, lv.points.a, lv.points.b, lv.points.c, lv.points.d)
          : this.triangularFunction(x, lv.points.a, lv.points.b, lv.points.c);
        return { x, y };
      });

      datasets.push({
        label: `μ${lv.nameValue}(x)`,
        data: datasetData,
        borderColor: colors[index % colors.length],
        backgroundColor: this.hexToRgba(colors[index % colors.length], 0.1),
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0
      });
    });

    const maxXInPoints = Math.max(...allXValues);
    const finalXAxisLimit = Math.max(data.xAxisLimit, maxXInPoints);

    // Crear una referencia al componente para usarlo dentro de la función onClick
    const component = this;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: allXValues,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: linguisticVariable,
              font: { size: 14 }
            },
            min: 0,
            max: finalXAxisLimit,
            ticks: {
              stepSize: Math.max(1, Math.floor(finalXAxisLimit / 10))
            }
          },
          y: {
            min: 0,
            max: 1,
            title: {
              display: true,
              text: 'Grado de Pertenencia',
              font: { size: 14 }
            },
            ticks: {
              stepSize: data.yAxisStep
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            display: true,
            onClick: function (this: LegendElement<keyof ChartTypeRegistry>, e: ChartEvent, legendItem: LegendItem, legend: LegendElement<keyof ChartTypeRegistry>) {
              // Obtener el índice del dataset seleccionado
              const index = legendItem.datasetIndex !== undefined ? legendItem.datasetIndex : 0;

              const isClickingSameElement = component.currentlyFilteredIndex === index;

              if (isClickingSameElement) {
                // Mostrar todos los datasets
                if (this.chart && this.chart.data && this.chart.data.datasets) {
                  this.chart.data.datasets.forEach((dataset, i) => {
                    const meta = this.chart.getDatasetMeta(i);
                    meta.hidden = false;
                  });

                  component.currentlyFilteredIndex = -1;
                }
              } else {
                if (this.chart && this.chart.data && this.chart.data.datasets) {
                  this.chart.data.datasets.forEach((dataset, i) => {
                    const meta = this.chart.getDatasetMeta(i);
                    meta.hidden = i !== index;
                  });

                  component.currentlyFilteredIndex = index;
                }
              }

              this.chart.update();
            },
            labels: {
              usePointStyle: true,
              padding: 20,
              generateLabels: (chart: Chart) => {
                const data = chart.data;
                return data.datasets.map((dataset, index) => {
                  return {
                    text: dataset.label || `Dataset ${index + 1}`,
                    fillStyle: dataset.borderColor as string,
                    strokeStyle: dataset.borderColor as string,
                    lineWidth: 2,
                    pointStyle: 'circle',
                    datasetIndex: index
                  };
                });
              }
            }
          },
          title: {
            display: true,
            text: `Conjunto difuso para la variable lingüística ${linguisticVariable}`,
            font: { size: 16 }
          }
        },
        animation: {
          onComplete: (e) => {
            this.chartRendered.emit(this.chartCanvas.nativeElement);
          }
        }
      }
    };

    if (this.chart) this.chart.destroy();
    this.chart = new Chart(ctx, config);
    this.currentlyFilteredIndex = -1;
  }

  generateXValues(limit: number, step: number): number[] {
    const values = [];
    const smallStep = step / 10;
    for (let i = 0; i <= limit; i += smallStep) {
      values.push(parseFloat(i.toFixed(2)));
    }
    return values;
  }

  trapezoidalFunction(x: number, a: number, b: number, c: number, d: number): number {
    if (x < a || x > d) return 0;
    else if (x >= a && x <= b) return (x - a) / (b - a);
    else if (x > b && x < c) return 1;
    else if (x >= c && x <= d) return (d - x) / (d - c);
    return 0;
  }

  triangularFunction(x: number, a: number, b: number, c: number): number {
    if (x < a || x > c) return 0;
    else if (x >= a && x <= b) return (x - a) / (b - a);
    else if (x > b && x <= c) return (c - x) / (c - b);
    return 0;
  }

  hexToRgba(hex: string, alpha: number): string {
    if (hex.startsWith('rgb')) {
      return hex.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}