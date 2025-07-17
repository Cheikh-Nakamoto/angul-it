import { Injectable } from '@angular/core';
import { Challenge } from '../models/models';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = '01TalentSN';

@Injectable({
  providedIn: 'root'
})
export class StorageHelpers {
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  }

  private decrypt(data: string): string {
    const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  saveState(key: string, value: string): void {
    const encryptedValue = this.encrypt(value);
    localStorage.setItem(key, encryptedValue);
  }

  saveChallenge(id: string, challenges: Challenge[]): void {
    const value = JSON.stringify(challenges);
    const encryptedValue = this.encrypt(value);
    localStorage.setItem(id, encryptedValue);
  }

  getState(key: string): string | null {
    const encryptedValue = localStorage.getItem(key);
    if (encryptedValue) {
      return this.decrypt(encryptedValue);
    }
    return null;
  }

  getChallenge(id: string): Challenge[] | [] {
    const encryptedValue = localStorage.getItem(id);
    if (encryptedValue) {
      const decryptedValue = this.decrypt(encryptedValue);
      return decryptedValue ? JSON.parse(decryptedValue) : [];
    }
    return [];
  }

  removeState(key: string): void {
    localStorage.removeItem(key);
  }

  clearStorage(): void {
    localStorage.clear();
  }
}