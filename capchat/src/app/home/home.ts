import { Component, OnInit } from '@angular/core';
import { ChallengeService } from '../services/challenge';
import { Challenge } from '../models/models';

@Component({
  selector: 'app-home',
  imports: [],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit{
  
  constructor(private challengeService : ChallengeService){}

  async ngOnInit(): Promise<void> {
    
  }
}
