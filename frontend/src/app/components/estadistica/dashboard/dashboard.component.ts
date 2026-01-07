import { Component, OnInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { forkJoin } from 'rxjs';

import { ReporteEstadisticaService } from '../../../services/reporte-estadistica.service';

import {
  EstadisticaPorMes,
  EstadisticaPorTipoProblema,
  EstadisticaPorUbicacion
} from '../../../models/estadistica.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  @ViewChildren(BaseChartDirective) charts?: QueryList<BaseChartDirective>;

  estadisticaPorMes: EstadisticaPorMes[] = [];
  estadisticaPorTipoProblema: EstadisticaPorTipoProblema[] = [];
  estadisticaPorUbicacion: EstadisticaPorUbicacion[] = [];

  totalReportes = 0;
  reportesMesActual = 0;
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
      borderColor: '#2e7d32',
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: canvasCtx, chartArea } = chart;
        if (!chartArea) return 'rgba(46, 125, 50, 0.2)';
        const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(46, 125, 50, 0.35)');
        gradient.addColorStop(1, 'rgba(46, 125, 50, 0.05)');
        return gradient;
      },
      pointRadius: 2,
      borderWidth: 2
    }]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
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
      }
    }
  };


  doughnutChartType: 'doughnut' = 'doughnut';
  doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#1976d2', '#2e7d32', '#ed6c02', '#d32f2f',
        '#9c27b0', '#00bcd4', '#795548', '#607d8b'
      ],
      hoverOffset: 10
    }]
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };


  barChartType: 'bar' = 'bar';
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Reportes',
      data: [],
      backgroundColor: '#1976d2',
      borderRadius: 4
    }]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,

    layout: {
      padding: {
        left: 10
      }
    },
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
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

  constructor(
    private estadisticaService: ReporteEstadisticaService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.loading = true;
    forkJoin({
      porMes: this.estadisticaService.obtenerPorMes(),
      porTipo: this.estadisticaService.obtenerPorTipoProblema(),
      porUbicacion: this.estadisticaService.obtenerPorUbicacion()
    }).subscribe({
      next: (res) => {
        this.estadisticaPorMes = res.porMes;
        this.estadisticaPorTipoProblema = res.porTipo;
        this.estadisticaPorUbicacion = res.porUbicacion.slice(0, 5);

        this.calcularKPIs();
        this.cargarGraficoPorMes();
        this.cargarGraficoPorTipoProblema();
        this.cargarGraficoPorUbicacion();

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

    const mesActualData = this.estadisticaPorMes.find(r => r.mes_numero === mesActual && r.anio === anioActual);
    this.reportesMesActual = mesActualData?.total_reportes ?? 0;

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

  private capitalizar(texto: string): string {
    return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
  }
}
