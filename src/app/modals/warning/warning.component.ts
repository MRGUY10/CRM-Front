import { Component, computed, input, output } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-warning',
  standalone: true,
  imports: [LottieComponent],
  templateUrl: './warning.component.html',
  styleUrl: './warning.component.scss'
})
export class WarningComponent {
  confirmed = output<boolean>();
  message = input<string>();

  options: AnimationOptions = {
    path: '/assets/warning.json',  // Animation URL (replace with your own)
    autoplay: true,  // Play the animation automatically
    loop: false,     // Do not loop the animation
    renderer: 'svg',  // Choose the renderer (can be 'svg', 'canvas', or 'html')
  };

  animationCreated(animationItem: AnimationItem): void {
    console.log(animationItem);
    // animationItem.setSpeed(0.8);
  }
}
