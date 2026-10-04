import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="nf-wrap">
      <div class="nf-card">
        <div class="nf-code">404</div>
        <h2>Página no encontrada</h2>
        <p>La dirección que buscas no existe o fue movida.</p>
        <a mat-flat-button class="nf-btn" routerLink="/login">Volver al inicio</a>
      </div>
    </div>
  `,
  styles: [`
    .nf-wrap { display: flex; justify-content: center; padding: 64px 16px; }
    .nf-card {
      background: #fff; border: 1px solid var(--eu-border, #E4E8D8);
      border-radius: 16px; padding: 40px 32px; text-align: center; max-width: 420px;
    }
    .nf-code { font-size: 56px; font-weight: 800; color: var(--eu-primary, #256B45); line-height: 1; }
    .nf-card h2 { margin: 8px 0; font-size: 22px; }
    .nf-card p { color: var(--eu-muted, #68755F); margin: 0 0 20px; }
    .nf-btn { background: var(--eu-primary, #256B45); color: #fff; }
  `]
})
export class NotFoundComponent {}
