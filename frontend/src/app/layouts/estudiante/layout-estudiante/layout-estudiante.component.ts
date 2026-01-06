import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-layout-estudiante',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './layout-estudiante.component.html',
  styleUrls: ['./layout-estudiante.component.css']
})
export class LayoutEstudianteComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login')
    });
  }
  
}
