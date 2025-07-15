import { Subject, interval, takeUntil } from 'rxjs';
import { signal, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private destroy$ = new Subject<void>();
  private timerInterval: any;
  private remainingSeconds = 165; // 2:45 = 165 secondes

  timeRemaining = signal<string>('2:45');

  startTimer(handleTimeUpCallback: () => void): void {
    this.timerInterval = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.remainingSeconds--;
        if (this.remainingSeconds <= 0) {
          this.timeRemaining.set('0:00');
          handleTimeUpCallback();
        } else {
          const minutes = Math.floor(this.remainingSeconds / 60);
          const seconds = this.remainingSeconds % 60;
          this.timeRemaining.set(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      });
  }

  resetTimer(): void {
    this.remainingSeconds = 165;
    this.timeRemaining.set('2:45');
  }
  elapsed_time(): number {
    const elapsed_time = 165-this.remainingSeconds;
    return elapsed_time;
  }
  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}