import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ChallengeService } from '../services/challenge';
import { Subject } from 'rxjs';
import { Challenge } from '../models/models';

@Component({
  selector: 'app-capchat',
  imports: [],
  templateUrl: './capchat.html',
  styleUrl: './capchat.scss'
})
export class Capchat implements OnInit, OnDestroy {
  challengesList: Challenge[] = [];
  currentChallenge: Challenge = {}
  selectedAnswer: string | null = null; // Added for selected answer in multiple/boolean challenges
  private destroy$ = new Subject<void>();
  private isNext :boolean = false;

  constructor(private challengeService: ChallengeService, private renderer: Renderer2) { }

  async ngOnInit(): Promise<void> {
    const elem = await this.challengeService.getRandomChallenge();
    this.challengesList.push(elem);
    console.log(this.challengesList)
  }

  async nextChallenge(): Promise<void> {
    const elem = await this.challengeService.getRandomChallenge();
    this.challengesList.push(elem);
  }

  previouqChallenge(): void {

  }

  selectanswer(Idname : string){
    // Remove 'selected-answer' class from previously selected element
    if (this.selectedAnswer) {
      const prevSelectedElement = document.getElementById(this.selectedAnswer);
      if (prevSelectedElement) {
        this.renderer.removeClass(prevSelectedElement, 'selected-answer');
      }
    }

    // Add 'selected-answer' class to the newly selected element
    const currentSelectedElement = document.getElementById(Idname);
    if (currentSelectedElement) {
      this.renderer.addClass(currentSelectedElement, 'selected-answer');
      this.selectedAnswer = Idname; // Update the component's state
    } else {
      // Handle case where element is not found (e.g., log a warning)
      console.warn(`Element with ID '${Idname}' not found.`);
      this.selectedAnswer = null; // Clear selection if element not found
    }
  }

  saveState(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  saveChallenge(id: string, challenges: Challenge[]): void {
    const value = JSON.stringify(challenges);
    localStorage.setItem(id, value);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
