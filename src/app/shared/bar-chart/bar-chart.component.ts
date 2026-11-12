import { Component, computed, input } from '@angular/core';

/**
 * Graphique en barres simple, dessiné en SVG (aucune librairie externe).
 * On lui donne une liste { label, value } et il dessine les barres.
 */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `
    <svg class="chart" [attr.viewBox]="'0 0 ' + W + ' ' + H" role="img" [attr.aria-label]="ariaLabel()" preserveAspectRatio="xMidYMid meet">
      @for (g of grid(); track g.y) {
        <line [attr.x1]="padL" [attr.x2]="W - 10" [attr.y1]="g.y" [attr.y2]="g.y" stroke="#e6e9ef" stroke-width="1" />
        <text [attr.x]="padL - 8" [attr.y]="g.y + 4" text-anchor="end" class="axis">{{ g.v }}</text>
      }
      @for (b of bars(); track b.label) {
        <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" rx="5" class="bar" />
        <text [attr.x]="b.x + b.w / 2" [attr.y]="b.y - 7" text-anchor="middle" class="val">{{ b.value }}</text>
        <text [attr.x]="b.x + b.w / 2" [attr.y]="H - 10" text-anchor="middle" class="axis">{{ b.label }}</text>
      }
    </svg>
  `,
  styles: [
    `
      .chart { width: 100%; height: auto; display: block; }
      .bar { fill: var(--navy); }
      .bar:last-of-type { fill: var(--gold); }
      .axis { font-size: 12px; fill: #6b7686; font-family: inherit; }
      .val { font-size: 13px; font-weight: 700; fill: #14213d; font-family: inherit; }
    `
  ]
})
export class BarChartComponent {
  data = input.required<{ label: string; value: number }[]>();
  ariaLabel = input<string>('Graphique en barres');

  readonly W = 520;
  readonly H = 260;
  readonly padL = 34;
  private readonly padT = 28;
  private readonly padB = 34;

  private max = computed(() => {
    const m = Math.max(1, ...this.data().map((d) => d.value));
    return Math.ceil(m / 4) * 4 || 4;
  });

  grid = computed(() => {
    const plotH = this.H - this.padT - this.padB;
    return [0, 1, 2, 3, 4].map((i) => ({ v: (this.max() / 4) * i, y: this.H - this.padB - (plotH / 4) * i }));
  });

  bars = computed(() => {
    const d = this.data();
    const plotW = this.W - this.padL - 10;
    const slot = plotW / Math.max(1, d.length);
    const w = Math.min(46, slot * 0.6);
    const plotH = this.H - this.padT - this.padB;
    return d.map((p, i) => {
      const h = (p.value / this.max()) * plotH;
      return { label: p.label, value: p.value, x: this.padL + slot * i + (slot - w) / 2, w, h, y: this.H - this.padB - h };
    });
  });
}
