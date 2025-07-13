import { Injectable } from '@angular/core';
import { Challenge } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class StorageHelpers {
  saveState(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  saveChallenge(id: string, challenges: Challenge[]): void {
    const value = JSON.stringify(challenges);
    localStorage.setItem(id, value);
  }

  getState(key: string): string | null {
    return localStorage.getItem(key);
  }

  getChallenge(id: string): Challenge[] | [] {
    const value = localStorage.getItem(id);
    return value ? JSON.parse(value) : [];
  }

  removeState(key: string): void {
    localStorage.removeItem(key);
  }

  clearStorage(): void {
    localStorage.clear();
  }
}