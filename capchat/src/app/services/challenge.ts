import { Injectable } from '@angular/core';
import { Challenge, ChallengeType, DetailsImg, ImageSelectionChallenge } from '../models/models';
import { asyncScheduler, delay, map, Observable, of, scheduled, shareReplay } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private challengesCache$?: Observable<Challenge[]>;
  challenges: Challenge[] = [];
  private questionLink: string = "https://opentdb.com/api.php?amount=10&difficulty=hard";
  private readonly UNSPLASH_API_BASE_URL: string = "https://api.unsplash.com/search/photos/";
  private readonly UNSPLASH_CLIENT_ID: string = "LQOBym_YOgyZL1F8oaT9jZtEdx2ginp1036APyX96fs";
  private readonly IMAGE_SEARCH_TERMS: string[] = ["dog", "bus", "cat", "car"];
  private CurrentChallengeId: number = 0;

  // getChallenges(): Observable<Challenge[]> {
  //   // Simule un chargement asynchrone même avec des données locales
  //   const task = () => console.log('Data is fetch!');
  //   asyncScheduler.schedule(task, 2000);
  //   return scheduled(of(this.challenges), asyncScheduler).pipe(delay(100));
  // }

  // getRandomChallenge(): Observable<Challenge> {
  //   return this.getChallenges().pipe(
  //     map(challenges => {
  //       const randomIndex = Math.floor(Math.random() * challenges.length);
  //       return challenges[randomIndex];
  //     })
  //   );
  // }

  private validateChallenges(data: any): Challenge[] {
    // Implémentez une validation robuste ici (ex: avec Zod)
    if (!Array.isArray(data)) {
      throw new Error('Format de données invalide');
    }
    return data as Challenge[];
  }

  async getChallengeQuestion(): Promise<Challenge[]> {
    const res = await fetch(this.questionLink.toString());
    const data = await res.json();
    return this.validateChallenges(data["results"]);
  }

  /**
   * Generates a random Unsplash image search URL based on predefined terms.
   * @returns A URL string for an Unsplash image search.
   * @throws Error if no image search terms are defined.
   */
  private getRandomwordslink(): string {
    if (this.IMAGE_SEARCH_TERMS.length === 0) {
      throw new Error("No image search terms defined.");
    }

    const randomIndex = Math.floor(Math.random() * this.IMAGE_SEARCH_TERMS.length);
    const searchTerm = encodeURIComponent(this.IMAGE_SEARCH_TERMS[randomIndex]);

    return `${this.UNSPLASH_API_BASE_URL}?query=${searchTerm}&client_id=${this.UNSPLASH_CLIENT_ID}`;
  }

  async getChallengeImages(): Promise<ImageSelectionChallenge> {
    let select = [];
    this.CurrentChallengeId = this.CurrentChallengeId + 1;
    let challengeImg: ImageSelectionChallenge = {
      id: this.CurrentChallengeId,
      type: "image_selection",
      images: []
    };
    // This function needs implementation to fetch image challenges
    // For now, returning an empty array to satisfy the return type
    for (let index = 0; index < 3; index++) {
      const res = await fetch(this.getRandomwordslink())
      const data = await res.json();
      const liste = data["results"];
      this.Echantillonnage(liste,challengeImg)
    }
    return challengeImg;
  }

  private Echantillonnage(data: any[], elem: ImageSelectionChallenge) {
    const split_data = data.sort(() => 0.5 - Math.random()).slice(0, 3);
    for (let index = 0; index < split_data.length; index++) {
      const img = split_data[index];
      const img_data : DetailsImg = {
        url: img["urls"]["small"],
        alt: img["alternative_slugs"]["fr"],
        isCorrect: false,
      }
      elem.images.push(img_data);
    }
  }
}
