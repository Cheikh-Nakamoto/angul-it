import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Challenge, ChallengeType, DetailsImg, ImageSelectionChallenge } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private challengesCache$?: Observable<Challenge[]>;
  challenges: Challenge[] = [];
  searchItem: string = "";
  private questionLink: string = "https://opentdb.com/api.php?amount=10&category=19";
  private readonly UNSPLASH_API_BASE_URL: string = "https://api.unsplash.com/search/photos/";
  private readonly UNSPLASH_CLIENT_ID: string = "LQOBym_YOgyZL1F8oaT9jZtEdx2ginp1036APyX96fs";
  private readonly IMAGE_SEARCH_TERMS: string[] = ["dog", "bus", "cat", "car"];
  private CurrentChallengeId: number = 0;

  constructor(private sanitizer: DomSanitizer) { }

  /**
   * Décode les entités HTML en utilisant DomSanitizer
   * @param text - Le texte contenant des entités HTML
   * @returns Le texte décodé
   */
  private decodeHtmlEntities(text: string): string {
    // Créer un élément temporaire pour décoder les entités HTML
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
  }

  /**
   * Nettoie et décode les données d'une question
   * @param questionData - Les données brutes de la question
   * @returns Les données nettoyées
   */
  private cleanQuestionData(questionData: any): any {
    return {
      ...questionData,
      question: this.decodeHtmlEntities(questionData.question),
      correct_answer: this.decodeHtmlEntities(questionData.correct_answer),
      incorrect_answers: questionData.incorrect_answers.map((answer: string) =>
        this.decodeHtmlEntities(answer)
      ),
      category: this.decodeHtmlEntities(questionData.category)
    };
  }

  async getChallengeQuestion(): Promise<void> {
    try {
      const res = await fetch(this.questionLink.toString());
      const data = await res.json();

      if (data != undefined && data["results"] != undefined) {
        // Nettoyer toutes les questions avant de les traiter
        const cleanedResults = data["results"].map((question: any) =>
          this.cleanQuestionData(question)
        );

        const challengeQuestion = this.getSingleRandomChallengeQuestion(cleanedResults);
        this.challenges.push(challengeQuestion);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des questions:', error);
    }
  }

  private getSingleRandomChallengeQuestion(data: any): Challenge {
    let challenge = data[Math.floor(Math.random() * data.length)];
    // Correction: ajouter la bonne réponse aux réponses incorrectes
    challenge.incorrect_answers.push(challenge.correct_answer);
    challenge.incorrect_answers = this.shuffleArray(challenge.incorrect_answers);
    return challenge;
  }
  
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async getRandomChallenge(): Promise<Challenge> {
    this.challenges = [];
    await this.getChallengeImages();
    await this.getChallengeQuestion();
    return this.challenges[Math.floor(Math.random() * this.challenges.length)];
  }

  /**
   * Generates a random Unsplash image search URL based on predefined terms.
   * @returns A URL string for an Unsplash image search.
   * @throws Error if no image search terms are defined.
   */
  private getRandomwordslink(): string[] {
    if (this.IMAGE_SEARCH_TERMS.length === 0) {
      throw new Error("No image search terms defined.");
    }

    const randomIndex = Math.floor(Math.random() * this.IMAGE_SEARCH_TERMS.length);
    const searchTerm = encodeURIComponent(this.IMAGE_SEARCH_TERMS[randomIndex]);

    return [`${this.UNSPLASH_API_BASE_URL}?query=${searchTerm}&client_id=${this.UNSPLASH_CLIENT_ID}`, searchTerm];
  }

  async getChallengeImages(): Promise<void> {
    let select = [];
    this.CurrentChallengeId = this.CurrentChallengeId + 1;
    let challengeImg: ImageSelectionChallenge = {
      id: this.CurrentChallengeId,
      type: "image_selection",
      images: []
    };

    const randomIndex = Math.floor(Math.random() * this.IMAGE_SEARCH_TERMS.length);
    const searchTerm = this.IMAGE_SEARCH_TERMS[randomIndex];
    this.searchItem = searchTerm

    // This function needs implementation to fetch image challenges
    // For now, returning an empty array to satisfy the return type
    for (let index = 0; index < 3; index++) {
      const randomlink = this.getRandomwordslink();
      const res = await fetch(randomlink[0])
      const data = await res.json();
      const liste = data["results"];
      this.Echantillonnage(liste, challengeImg, searchTerm, randomlink[1])
    }
    challengeImg.images = this.melangerSurPlace(challengeImg.images!);
    challengeImg.correctPos = this.findCorrectPosOnImg(challengeImg.images, searchTerm);
    this.challenges.push(challengeImg);
  }

  melangerSurPlace<T>(liste: T[]): T[] {
    for (let i = liste.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [liste[i], liste[j]] = [liste[j], liste[i]];
    }
    return liste;
  }

  private Echantillonnage(data: any[], elem: ImageSelectionChallenge, searchTerm: string, currentItem: string) {
    const split_data = data.sort(() => 0.5 - Math.random()).slice(0, 3);
    for (let index = 0; index < split_data.length; index++) {
      const img = split_data[index];
      const str = img["alternative_slugs"]["fr"] as string
      const img_data: DetailsImg = {
        url: img["urls"]["small"],
        alt: img["alternative_slugs"]["fr"],
        isCorrect: currentItem.includes(searchTerm),
        item: currentItem
      }
      elem.images?.push(img_data);
    }
  }

  private findCorrectPosOnImg(data: DetailsImg[], searchTerm: string): number[] {
    let pos: number[] = [];
    for (let index = 0; index < data.length; index++) {
      const imgDetail = data[index];
      if (imgDetail.isCorrect) {
        pos.push(index)
      }
    }
    return pos;
  }
}