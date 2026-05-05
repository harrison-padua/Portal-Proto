import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  input,
} from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-echart',
  standalone: true,
  template: `<div #host class="h-full w-full"></div>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 240px;
      }
    `,
  ],
})
export class EChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly option = input.required<echarts.EChartsCoreOption>();

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  private chart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  ngAfterViewInit(): void {
    this.chart = echarts.init(this.hostRef.nativeElement, undefined, { renderer: 'svg' });
    this.chart.setOption(this.option());
    this.resizeObserver = new ResizeObserver(() => this.chart?.resize());
    this.resizeObserver.observe(this.hostRef.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['option'] && this.chart) {
      this.chart.setOption(this.option(), true);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
    this.chart = null;
  }
}
