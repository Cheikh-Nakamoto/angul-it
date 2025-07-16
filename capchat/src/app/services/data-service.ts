import { Injectable, signal } from '@angular/core';
import { Challenge } from '../models/models';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  private captchaCompleted = signal(false);
  private captchaToken = signal<string | null>(null);

  // Signaux publics en lecture seule
  isCaptchaCompleted = this.captchaCompleted.asReadonly();
  getCaptchaToken = this.captchaToken.asReadonly();
  constructor() { }

  CaptchaComplet(data? : Challenge[]) {
    this.captchaCompleted.set(true);
  }
  IsValidate() : boolean {
    if (this.isCaptchaCompleted() ) {
      return true;
    }
    return false
  }
}
