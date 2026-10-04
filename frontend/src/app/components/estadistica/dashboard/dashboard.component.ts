import { Component, OnInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, Plugin } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import { ReporteEstadisticaService } from '../../../services/reporte-estadistica.service';

import {
  EstadisticaPorMes,
  EstadisticaPorTipoProblema,
  EstadisticaPorUbicacion,
  EstadisticaPorEstado
} from '../../../models/estadistica.interface';

// Dibuja el total al centro de la dona
const centroDona: Plugin<'doughnut'> = {
  id: 'centroDona',
  afterDraw(chart) {
    const meta = chart.getDatasetMeta(0);
    if (!meta.data[0]) return;
    const { ctx } = chart;
    const x = (meta.data[0] as any).x;
    const y = (meta.data[0] as any).y;
    const total = (chart.data.datasets[0].data as number[]).reduce((a, b) => a + (b ?? 0), 0);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#14201B';
    ctx.font = "800 28px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(String(total), x, y - 8);
    ctx.fillStyle = '#68755F';
    ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText('REPORTES', x, y + 14);
    ctx.restore();
  }
};

// Escribe el valor al final de cada barra (sin librerías extra)
const valorEnBarra: Plugin<'bar'> = {
  id: 'valorEnBarra',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.fillStyle = '#414944';
    ctx.font = "700 11px 'Plus Jakarta Sans', sans-serif";
    ctx.textBaseline = 'middle';
    meta.data.forEach((bar: any, i) => {
      const v = chart.data.datasets[0].data[i];
      ctx.fillText(String(v ?? ''), bar.x + 6, bar.y);
    });
    ctx.restore();
  }
};

const PALETA_TIPOS = [
  '#256B45', '#1F8A70', '#123F2A', '#7FB069',
  '#B5462B', '#D9A441', '#68755F', '#3B729F'
];

const COLOR_ESTADO: Record<string, string> = {
  'Pendiente': '#B5462B',
  'Aceptado': '#256B45',
  'Resuelto': '#1F8A70'
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  @ViewChildren(BaseChartDirective) charts?: QueryList<BaseChartDirective>;

  estadisticaPorMes: EstadisticaPorMes[] = [];
  estadisticaPorTipoProblema: EstadisticaPorTipoProblema[] = [];
  estadisticaPorUbicacion: EstadisticaPorUbicacion[] = [];
  estadisticaPorEstado: EstadisticaPorEstado[] = [];

  totalReportes = 0;
  reportesMesActual = 0;
  variacionMes = '';
  variacionSube: boolean | null = null;
  tipoProblemaTop = '';
  ubicacionTop = '';
  loading = false;


  lineChartType: 'line' = 'line';
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Reportes',
      data: [],
      tension: 0.35,
      fill: true,
      borderColor: '#256B45',
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: canvasCtx, chartArea } = chart;
        if (!chartArea) return 'rgba(37, 107, 69, 0.2)';
        const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(37, 107, 69, 0.35)');
        gradient.addColorStop(1, 'rgba(37, 107, 69, 0.05)');
        return gradient;
      },
      pointRadius: 2,
      borderWidth: 2
    }]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.parsed.y} reportes` }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#EAEEDF' },
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const numericValue = Number(value);
            if (Number.isInteger(numericValue)) {
              return numericValue;
            }
            return null; 
          }
        }
      },
      x: { grid: { display: false } }
    }
  };


  doughnutChartType: 'doughnut' = 'doughnut';
  doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: PALETA_TIPOS,
      borderColor: '#FFFFFF',
      borderWidth: 2,
      hoverOffset: 10
    }]
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} reportes` }
      }
    }
  };


  barChartType: 'bar' = 'bar';
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Reportes',
      data: [],
      backgroundColor: '#256B45',
      borderRadius: 4
    }]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,

    layout: {
      padding: {
        left: 10,
        right: 28
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.parsed.x} reportes` }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#EAEEDF' },
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const numericValue = Number(value);
            if (Number.isInteger(numericValue)) {
              return numericValue;
            }
            return null;
          }
        }
      },
      y: {
        ticks: {
          color: '#555',
          autoSkip: false,
          font: {
            size: 11
          },
          padding: 10,
          callback: function(value: any) {
            const label = this.getLabelForValue(value);

            if (label.length > 12) {
              return label.split(' ');
            }
            return label;
          }
        },
        grid: { display: false }
      }
    },
    datasets: {
      bar: {
        barPercentage: 0.6,
        categoryPercentage: 0.8
      }
    }
  };

  // Dona de estados con total al centro
  estadoChartType: 'doughnut' = 'doughnut';
  estadoChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: '#FFFFFF',
      borderWidth: 2,
      hoverOffset: 10
    }]
  };
  estadoChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} reportes` }
      }
    }
  };

  readonly centroDona = [centroDona];
  readonly valorEnBarra = [valorEnBarra];

  constructor(
    private estadisticaService: ReporteEstadisticaService,
    private cdRef: ChangeDetectorRef
  ) {
    // Misma letra que el resto de la app dentro de los gráficos
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.color = '#68755F';
  }

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.loading = true;
    forkJoin({
      porMes: this.estadisticaService.obtenerPorMes(),
      porTipo: this.estadisticaService.obtenerPorTipoProblema(),
      porUbicacion: this.estadisticaService.obtenerPorUbicacion(),
      porEstado: this.estadisticaService.obtenerPorEstado()
    }).subscribe({
      next: (res) => {
        this.estadisticaPorMes = res.porMes;
        this.estadisticaPorTipoProblema = res.porTipo;
        this.estadisticaPorUbicacion = res.porUbicacion.slice(0, 5);
        this.estadisticaPorEstado = res.porEstado;

        this.calcularKPIs();
        this.cargarGraficoPorMes();
        this.cargarGraficoPorTipoProblema();
        this.cargarGraficoPorUbicacion();
        this.cargarGraficoPorEstado();

        this.loading = false;
        this.cdRef.detectChanges();
        this.charts?.forEach(child => child.chart?.update());
      },
      error: () => this.loading = false
    });
  }

  calcularKPIs(): void {
    this.totalReportes = this.estadisticaPorMes.reduce((sum, r) => sum + r.total_reportes, 0);
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1;
    const anioActual = ahora.getFullYear();

    const ordenados = [...this.estadisticaPorMes].sort((a, b) =>
      a.anio === b.anio ? a.mes_numero - b.mes_numero : a.anio - b.anio);
    const idx = ordenados.findIndex(r => r.mes_numero === mesActual && r.anio === anioActual);
    const actual = idx >= 0 ? ordenados[idx].total_reportes : 0;
    this.reportesMesActual = actual;
    // Comparativa contra el mes anterior con datos
    const previo = idx > 0 ? ordenados[idx - 1].total_reportes : null;
    if (previo === null) {
      this.variacionMes = '';
      this.variacionSube = null;
    } else {
      const dif = actual - previo;
      this.variacionSube = dif >= 0;
      this.variacionMes = `${dif >= 0 ? '+' : ''}${dif} vs mes anterior`;
    }

    if (this.estadisticaPorTipoProblema.length > 0) this.tipoProblemaTop = this.estadisticaPorTipoProblema[0].tipo_problema;
    if (this.estadisticaPorUbicacion.length > 0) this.ubicacionTop = this.estadisticaPorUbicacion[0].ubicacion;
  }

  cargarGraficoPorMes(): void {
    this.lineChartData.labels = this.estadisticaPorMes.map(r => `${this.capitalizar(r.mes_nombre)} ${r.anio}`);
    this.lineChartData.datasets[0].data = this.estadisticaPorMes.map(r => r.total_reportes);
  }

  cargarGraficoPorTipoProblema(): void {
    this.doughnutChartData.labels = this.estadisticaPorTipoProblema.map(t => t.tipo_problema);
    this.doughnutChartData.datasets[0].data = this.estadisticaPorTipoProblema.map(t => t.total_reportes);
  }

  cargarGraficoPorUbicacion(): void {
    this.barChartData.labels = this.estadisticaPorUbicacion.map(u => u.ubicacion);
    this.barChartData.datasets[0].data = this.estadisticaPorUbicacion.map(u => u.total_reportes);
  }

  cargarGraficoPorEstado(): void {
    this.estadoChartData.labels = this.estadisticaPorEstado.map(e => e.estado);
    this.estadoChartData.datasets[0].data = this.estadisticaPorEstado.map(e => e.total_reportes);
    this.estadoChartData.datasets[0].backgroundColor =
      this.estadisticaPorEstado.map(e => COLOR_ESTADO[e.estado] ?? '#68755F');
  }

  private capitalizar(texto: string): string {
    return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
  }
}
