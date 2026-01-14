import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async login() {
    if (!this.username || !this.password) {
      this.error = 'Por favor ingresa email y contraseña';
      return;
    }

    this.loading = true;
    this.error = '';

    const success = await this.authService.login(
      this.username,
      this.password
    );

    this.loading = false;

    if (success) {
      this.router.navigate(['/home']);
    } else {
      this.error = 'Email o contraseña incorrectos';
    }
  }
}
