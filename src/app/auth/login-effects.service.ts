import { Injectable, Renderer2, RendererFactory2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LoginEffectsService {
  private renderer: Renderer2;
  private isBrowser: boolean;

  constructor(rendererFactory: RendererFactory2, @Inject(PLATFORM_ID) private platformId: Object) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isBrowser = isPlatformBrowser(this.platformId); // Verifica se è il browser
  }

  applyLoginEffects(): void {
    if (!this.isBrowser) return; // Evita di eseguire il codice lato server

    const inputs = document.querySelectorAll<HTMLInputElement>(".input-field");
    const toggleButtons = document.querySelectorAll<HTMLAnchorElement>(".toggle");
    const main = document.querySelector<HTMLElement>("main");
    const bullets = document.querySelectorAll<HTMLSpanElement>(".bullets span");
    const images = document.querySelectorAll<HTMLImageElement>(".image");

    // Effetto input attivo
    inputs.forEach((inp) => {
      inp.addEventListener("focus", () => inp.classList.add("active"));
      inp.addEventListener("blur", () => {
        if (inp.value === "") inp.classList.remove("active");
      });
    });

    // Toggle tra Login e Registrazione
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (main) {
          main.classList.toggle("sign-up-mode");
        }
      });
    });

    // Cambio immagini con lo slider
    function moveSlider(this: HTMLSpanElement) {
      let index = this.dataset["value"];

      let currentImage = document.querySelector<HTMLImageElement>(`.img-${index}`);
      if (!currentImage) return;

      images.forEach((img) => img.classList.remove("show"));
      currentImage.classList.add("show");

      const textSlider = document.querySelector<HTMLElement>(".text-group");
      if (textSlider) {
        textSlider.style.transform = `translateY(${-(Number(index) - 1) * 2.2}rem)`;
      }

      bullets.forEach((bull) => bull.classList.remove("active"));
      this.classList.add("active");
    }

    bullets.forEach((bullet) => {
      bullet.addEventListener("click", moveSlider);
    });

    // Slide to the next bullet every 3 seconds
    let currentIndex = 0;
    setInterval(() => {
      currentIndex = (currentIndex + 1) % bullets.length;
      moveSlider.call(bullets[currentIndex]);
    }, 3000);
  }
}
