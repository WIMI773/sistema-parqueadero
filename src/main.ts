import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAiqv-iXOjkQOfF4FosqrFqZw0pgKLGiwA",
  authDomain: "sistema-parqueadero-535f7.firebaseapp.com",
  projectId: "sistema-parqueadero-535f7",
  storageBucket: "sistema-parqueadero-535f7.firebasestorage.app",
  messagingSenderId: "25218287144",
  appId: "1:25218287144:web:d369c343750f9172f5971d",
  measurementId: "G-K9PB510PLP"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
});
