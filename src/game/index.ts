/// <reference path="./shims.d.ts" />
import '../css/index.css';
import 'bootstrap/js/dist/modal';
import { Game } from './game';

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game('stage');
  game.start();
});
