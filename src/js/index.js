import '../css/index.css';
import 'bootstrap/js/dist/modal';
import $ from 'jquery';

// 导入资源
import logoImg from '../assets/img/logo.png';
import ambulanceImg from '../img/ambulance.png';
import capsuleImg from '../img/capsule.png';
import virusImg from '../img/virus.png';
import killedImg from '../assets/img/killed.png';
import isDestroyImg from '../assets/img/isDestroy.png';
import bgImg from '../img/bg.jpeg';

// 导入 JSON 数据
import rulesData from '../assets/json/rules.json';
import knowledgeData from '../assets/json/knowledge.json';
import rumorsData from '../assets/json/rumors.json';

// 导入音频
import buttonMp3 from '../music/buttonDown/button.mp3';
import startMp3 from '../music/start/start.mp3';
import bgMusicMp3 from '../music/backgroundMusic/backgroundMusic.mp3';
import shotMp3 from '../music/shot/shot.mp3';
import killedMp3 from '../music/killed/killed.mp3';
import gameOverMp3 from '../music/gameOver/gameOver.mp3';

// 游戏对象
const game = {
  // 初始容器对象
  stage: $('#stage'),

  // 音效对象
  buttonDown: null,
  start: null,
  backgroundMusic: null,
  shot: null,
  killed: null,
  gameOver: null,

  // 模态框标题
  modalTitle: $('.modal-title'),

  // 定时器
  timer: {
    capsule: null,
    virus: null,
    backgroundMusic: null,
    startGame: null,
  },

  // 游戏模式参数配置
  mode: [
    // [胶囊速度, 胶囊发射间隔, 病毒速度最小, 病毒速度最大值, 病毒出现时间间隔]
    [2000, 260, 1500, 4500, 600],
  ],

  // 胶囊发射坐标，分数
  num: {
    ambulanceX: 0,
    ambulanceY: 0,
    score: 0,
  },

  // 数据
  rules: rulesData,
  knowledge: knowledgeData,
  rumors: rumorsData,

  // 控制救护车移动
  control(e) {
    if (game.stage.start) {
      const x = e.clientX - game.stage.offset().left - 10;
      const y = e.clientY - game.stage.offset().top - 10;
      game.core.ambulance([x, y]);
    }
  },

  // 游戏结算界面提示信息
  tipHTML(tip, flag, score) {
    switch (flag) {
      case 0:
        tip.html(
          `您获得了<span class='s'>${score.html()}</span>分
          <br />不要气馁，继续努力!<br />
          <p class='btn btn-block btn-lg btn-primary col-10 offset-1'>继续消灭</p>`,
        );
        break;
      case 1:
        tip.html(
          `您获得了<span class='s'>${score.html()}</span>分
          <br />坚持就是胜利!<br />
          <p class='btn btn-block btn-lg btn-primary'>继续消灭</p>`,
        );
        break;
      case 2:
        tip.html(
          `您获得了<span class='s'>${score.html()}</span>分
          <br />离消灭病毒只剩一点点了!<br />
          <p class='btn btn-block btn-lg btn-primary'>继续消灭</p>`,
        );
        break;
      default:
        tip.html(
          `恭喜您成功获得了<span class='s'>${score.html()}</span>分
          <br />病毒已经消灭，感谢您为消灭病毒做出的努力!<br />
          <p class='btn btn-block btn-lg btn-primary'>继续消灭</p>`,
        );
    }
  },

  // 开始界面按钮点击事件
  buttonClick(index, showMessage) {
    switch (index) {
      case 0: {
        game.stage.start = true;
        game.stage.css('cursor', 'none');
        game.startScreen.remove();
        
        const ready = $("<div id='ready'>")
          .text('Ready')
          .stop()
          .animate(
            { fontSize: '5em' },
            1000,
            () => {
              ready.text('GO!').stop().fadeTo(1000, 'hide');
            },
          );
        game.stage.append(ready);
        
        game.buttonDown.get(0).play();
        game.start.get(0).play();
        game.shot.get(0).volume = 0.4;

        game.timer.backgroundMusic = setTimeout(() => {
          game.backgroundMusic.get(0).load();
          game.backgroundMusic.get(0).play();
          clearTimeout(game.timer.backgroundMusic);
        }, 2000);

        if (/Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent)) {
          $(document).on('touchmove', (e) => {
            game.control(e.originalEvent.changedTouches[0]);
          });
        } else {
          $(document).mousemove((e) => {
            game.control(e);
          });
        }

        const set = game.mode[index];

        game.timer.startGame = setTimeout(() => {
          game.core.draw();

          game.timer.capsule = setInterval(() => {
            game.core.capsule(set[0], [game.num.ambulanceX, game.num.ambulanceY]);
          }, set[1]);

          game.timer.virus = setInterval(() => {
            game.core.virus({
              speed: game.randomNum(set[2], set[3]),
              left: game.randomNum(0, game.stage.width() - 64),
              top: -game.randomNum(32, 64),
            });
          }, set[4]);
          
          clearTimeout(game.timer.startGame);
        }, 2000);
        break;
      }
      case 1: {
        game.modalTitle.html('游戏规则');
        showMessage.html(game.rules.join('\n'));
        break;
      }
      case 2: {
        game.modalTitle.html('防疫小知识');
        showMessage.html(
          `<li class="list-group-item list-group-item-success">
            ${game.knowledge[game.randomNum(0, game.knowledge.length)]}
          </li>`,
        );
        break;
      }
      case 3: {
        game.modalTitle.html('谣言我先知');
        showMessage.html(
          `<li class="list-group-item list-group-item-danger">
            ${game.rumors[game.randomNum(0, game.rumors.length)][0]}
          </li>
          <li class="list-group-item list-group-item-success">
            ${game.rumors[game.randomNum(0, game.rumors.length)][1]}
          </li>`,
        );
        break;
      }
      default:
        break;
    }
  },

  // 开始场景
  startScreen: {
    draw() {
      const title = $('<div>')
        .addClass('title')
        .append(
          $("<div class='logo'>").append(
            $("<img alt='全民战疫' src=''>").prop({
              class: 'img-fluid',
              src: logoImg,
              style: 'user-select: none',
            }),
          ),
        );
      game.stage.append(title);

      const buttonGroup = $('<div>').addClass('buttonGroup col-8').html(`
            <a class='btn btn-block btn-lg btn-success' href='javascript:;'>开始游戏</a>
            <a class='btn btn-block btn-lg btn-primary' href='javascript:;' data-bs-toggle='modal' data-bs-target='#modal'>查看规则</a>
            <a class='btn btn-block btn-lg btn-warning' href='javascript:;' data-bs-toggle='modal' data-bs-target='#modal'>防疫小知识</a>
            <a class='btn btn-block btn-lg btn-danger' href='javascript:;' data-bs-toggle='modal' data-bs-target='#modal'>谣言我先知</a>
          `);
      game.stage.append(buttonGroup);

      buttonGroup.on('click', 'a', (e) => {
        const that = e.target;
        const showMessage = $('#showMessage');
        game.buttonClick($(that).index(), showMessage);
      });
    },

    remove() {
      const removeDiv = game.stage.children($('div'));
      removeDiv.stop().animate({ opacity: 0 }, 100);
      setTimeout(() => {
        removeDiv.remove();
      }, 300);
    },
  },

  // 核心代码
  core: {
    draw() {
      const ambulance = $('<div>');
      ambulance.addClass('ambulance').css({
        'background-image': `url(${ambulanceImg})`,
        top: game.stage.height() / 2 + 64,
        left: game.stage.width() / 2 - 15,
      });
      game.stage.append(ambulance);

      const score = $('<div>').addClass('score').html('0');
      game.stage.append(score);

      const tipButton = $("<button id='tipButton' style='display:none' data-bs-toggle='modal' data-bs-target='#modal'>");
      game.stage.append(tipButton);

      game.num.ambulanceX = parseInt(ambulance.css('left'), 10) + ambulance.width() / 2;
      game.num.ambulanceY = parseInt(ambulance.css('top'), 10);
    },

    ambulance(pos) {
      const ambulance = game.stage.find($('.ambulance'));
      let left = pos[0] - ambulance.width() / 2;
      let top = pos[1] - ambulance.height() / 2;

      if (left <= 0) left = 0;
      else if (left >= game.stage.width() - ambulance.width()) left = game.stage.width() - ambulance.width();
      if (top <= 0) top = 0;
      else if (top >= game.stage.height() - ambulance.height()) top = game.stage.height() - ambulance.height();

      ambulance.css({ left, top });
      game.num.ambulanceX = left + ambulance.width() / 2;
      game.num.ambulanceY = top;
    },

    capsule(speed, pos) {
      game.shot.get(0).play();
      const capsule = $('<div>');
      capsule.addClass('capsule').css('background-image', `url(${capsuleImg})`);
      game.stage.append(capsule);
      capsule.css({
        left: pos[0] - capsule.width() / 2,
        top: pos[1] - capsule.height() / 2,
      });
      capsule.stop().animate({ top: -capsule.height() }, speed, 'linear', () => {
        capsule.remove();
      });
    },

    virus(argument) {
      const { speed } = argument;
      const { left } = argument;
      const { top } = argument;
      const $virus = $('<div>');
      $virus
        .addClass('virus')
        .css({
          'background-image': `url(${virusImg})`,
          left,
          top,
        })
        .appendTo(game.stage);
      
      $virus.stop().animate(
        {
          top: '100%',
          left: game.randomNum(0, game.stage.width()),
        },
        speed,
        () => {
          $virus.remove();
          clearInterval($virus.timer);
        },
      );

      $virus.timer = setInterval(() => {
        const ambulance = $('.ambulance');
        const capsule = $('.capsule');
        const x = parseInt($virus.css('left'), 10) + 32;
        const y = parseInt($virus.css('top'), 10) + 32;
        const l = capsule.length;

        for (let i = 0; i < l; i += 1) {
          const dx = Math.abs(x - parseInt(capsule.eq(i).css('left'), 10) - 8);
          const dy = Math.abs(y - parseInt(capsule.eq(i).css('top'), 10) - 13);
          if (dx <= 40 && dy <= 45) {
            $virus.css('background-image', `url(${killedImg})`);
            game.killed.get(0).play();
            capsule.eq(i).remove();
            clearInterval($virus.timer);
            game.num.score += 1;
            game.stage.find($('.score')).html(game.num.score * 1000);
            setTimeout(() => {
              $virus.remove();
            }, 300);
          }
        }

        const dx2 = Math.abs(x - parseInt(ambulance.css('left'), 10) - 15);
        const dy2 = Math.abs(y - parseInt(ambulance.css('top'), 10) - 32);

        if (dx2 <= 47 && dy2 <= 64 && !$('.tips').get(0)) {
          game.stage.css('cursor', 'default');
          game.gameOver.get(0).play();
          game.backgroundMusic.get(0).pause();

          const tips = $('<div>');
          tips.addClass('tips alert').css('display', 'none');
          const score = $('.score');
          
          switch (String(game.num.score).length) {
            case 1:
              tips.addClass('alert-danger');
              game.tipHTML(tips, 0, score);
              break;
            case 2:
              tips.addClass('alert-warning');
              game.tipHTML(tips, 1, score);
              break;
            case 3:
              tips.addClass('alert-info');
              game.tipHTML(tips, 2, score);
              break;
            default:
              tips.addClass('alert-success');
              game.tipHTML(tips, 3, score);
          }
          game.stage.append(tips);

          game.stage.on('click', '#tipButton', () => {
            game.modalTitle.html('悄悄告诉你：');
            $('#showMessage').html(
              `<li class="list-group-item list-group-item-success">
                ${game.knowledge[game.randomNum(0, game.knowledge.length)]}
              </li>`,
            );
          });
          $('#tipButton').get(0).click();

          game.stage.on('click', '.tips p', () => {
            game.num.score = 0;
            game.startScreen.remove();
            game.startScreen.draw();
          });

          $virus.remove();
          score.addClass('none');
          ambulance.css('background-image', `url(${isDestroyImg})`);
          clearInterval($virus.timer);
          setTimeout(() => {
            $('.ambulance').remove();
          }, 400);

          clearInterval(game.timer.capsule);
          clearInterval(game.timer.virus);

          setTimeout(() => {
            tips.css('display', 'block');
          }, 1000);
        }
      }, 50);
    },
  },

  randomNum(a, b) {
    const value = Math.abs(a - b);
    const num = Math.floor(Math.random() * value) + Math.min(a, b);
    return num;
  },
};

// 初始化音频元素
function initAudio() {
  game.buttonDown = $('#buttonDown');
  game.start = $('#start');
  game.backgroundMusic = $('#backgroundMusic');
  game.shot = $('#shot');
  game.killed = $('#killed');
  game.gameOver = $('#gameOver');

  game.buttonDown.append(`<source src="${buttonMp3}" type="audio/mpeg">`);
  game.start.append(`<source src="${startMp3}" type="audio/mpeg">`);
  game.backgroundMusic.append(`<source src="${bgMusicMp3}" type="audio/mpeg">`);
  game.shot.append(`<source src="${shotMp3}" type="audio/mpeg">`);
  game.killed.append(`<source src="${killedMp3}" type="audio/mpeg">`);
  game.gameOver.append(`<source src="${gameOverMp3}" type="audio/mpeg">`);
}

$(() => {
  initAudio();
  game.startScreen.draw();
});
