import { Component, OnInit } from '@angular/core';
import { ChallengeService } from '../services/challenge';
import { Challenge } from '../models/models';
import { StorageHelpers } from '../utils/storage-helpers';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit{
  private challenge : Challenge[] = [];
  constructor(private storageService : StorageHelpers,private router : Router){}

  async ngOnInit(): Promise<void> {
    this.challenge = this.storageService.getChallenge("old");
  }

  CaptchaRunning():boolean {
    if (this.challenge.length == 0) {
      return false
    }
    return true;
  }

  BeginCaptcha() {
    this.storageService.clearStorage();
    this.router.navigateByUrl("captcha")
  }
  goToCaptcha() {
    this.router.navigateByUrl("captcha")
  }
  
}
