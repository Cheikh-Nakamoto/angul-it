import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DomHelpers {
  
  getElementById(id: string | number): HTMLElement | null {
    const element = document.getElementById(id.toString());
    if (!element) {
      console.warn(`Attempted to access element with ID '${id}' which does not exist.`);
    }
    return element;
  }

  removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className);
  }

  addClass(element: HTMLElement, className: string): void {
    element.classList.add(className);
  }

  hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
  }

  toggleClass(element: HTMLElement, className: string): void {
    element.classList.toggle(className);
  }
}