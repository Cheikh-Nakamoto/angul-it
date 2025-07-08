import { Component, OnDestroy, OnInit } from '@angular/core';
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
  private destroy$ = new Subject<void>();

  constructor(private challengeService: ChallengeService) { }

  async ngOnInit(): Promise<void> {
   const  elem = await this.challengeService.getChallengeImages();
   this.challengesList.push(elem);
    console.log(this.challengesList)
  }

  saveState(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
