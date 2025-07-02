import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  setItem(value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('language', value);
    }
  }

  getItem(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('language') || 'es';
    }
    return null;
  }
}
