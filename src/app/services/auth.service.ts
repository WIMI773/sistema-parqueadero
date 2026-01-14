import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ParqueaderoService } from './parqueadero.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: User | null = null;

  constructor(
    private auth: Auth,
    private router: Router,
    
  ) {
  onAuthStateChanged(this.auth, (user) => {
    if (user) {
      this.user = user;
      localStorage.setItem('uid', user.uid);
    } else {
      this.user = null;
      localStorage.clear();

      // 🔥 redirección automática si no hay sesión
      this.router.navigate(['/login']);
    }
  });
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const cred = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      this.user = cred.user;
      localStorage.setItem('uid', cred.user.uid);
      return true;

    } catch (error) {
      console.error(error);
      return false;
    }
  }

 async logout() {
  await signOut(this.auth);

  

  // 🔥 limpiar todo
  this.user = null;
  localStorage.clear();
  sessionStorage.clear();

  // 🔥 forzar reinicio de navegación
  this.router.navigateByUrl('/login', { replaceUrl: true });
}



  isAuthenticated(): boolean {
    return !!localStorage.getItem('uid');
  }

  getUID(): string | null {
    return localStorage.getItem('uid');
  }
}
