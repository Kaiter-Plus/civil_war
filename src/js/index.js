import '../css/index.css';
import 'bootstrap/js/dist/modal';
import $ from 'jquery';

// 游戏对象
const game = {
  // 初始容器对象
  stage: $('#stage'),

  // 音效对象
  buttonDown: $('#buttonDown'),
  start: $('#start'),
  backgroundMusic: $('#backgroundMusic'),
  shot: $('#shot'),
  killed: $('#killed'),
  gameOver: $('#gameOver'),

  // 模态框标题
  modalTitle: $('.modal-title'),

  // 定时器
  timer: {
    capsule: null,
    virus: null,
    backgroundMusic: null,
    startGame: null,
  },

  // 游戏模式参数配置，修改此处可以修改难度
  mode: [
    // [胶囊速度, 胶囊发射间隔, 病毒速度最小, 病毒速度最大值, 病毒出现间隔] 单位：ms 病毒速度越小越快，难度越难
    [2000, 260, 1500, 4500, 600],
  ],

  // 胶囊发射坐标，分数
  num: {
    ambulanceX: 0,
    ambulanceY: 0,
    score: 0,
  },

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
          <br />不要气馁，继续努力！<br />
          <p class='btn btn-block btn-lg btn-primary col-10 offset-1'>继续消灭</p>`,
        );
        break;
      case 1:
        tip.html(
          `您获得了<span class='s'>${score.html()}</span>分
          <br />坚持就是胜利！<br />
          <p class='btn btn-block btn-lg btn-primary'>继续消灭</p>`,
        );
        break;
      case 2:
        tip.html(
          `您获得了<span class='s'>${score.html()}</span>分
          <br />离消灭病毒只剩一点点了！<br />
          <p class='btn btn-block btn-lg btn-primary'>继续消灭</p>`,
        );
        break;
      default:
        tip.html(
          `恭喜您成功获得了<span class='s'>${score.html()}</span>分
          <br />病毒已经消灭，感谢您为消灭病毒做出的努力！<br />
          <p class='btn btn-block btn-lg btn-primary'>继续消灭</p>`,
        );
    }
  },

  // 开始界面按钮点击事件
  buttonClick(index, showMessage) {
    switch (index) {
      // 开始游戏
      case 0: {
        // 游戏开始标志
        game.stage.start = true;
        // 设置鼠标不可见
        game.stage.css('cursor', 'none');
        // 移除开始界面
        game.startScreen.remove();
        const ready = $("<div id='ready'>")
          .text('Ready')
          .stop()
          .animate(
            {
              fontSize: '5em',
            },
            1000,
            () => {
              ready.text('GO!').stop().fadeTo(1000, 'hide');
            },
          );
        game.stage.append(ready);
        // 按钮点击音效
        game.buttonDown.get(0).play();
        // 开始游戏音效
        $('#start').get(0).play();
        // 降低胶囊发射音量
        $('#shot').get(0).volume = 0.4;
        // 播放背景音乐
        game.timer.backgroundMusic = setTimeout(() => {
          // 开始播放背景音乐
          game.backgroundMusic.get(0).load();
          game.backgroundMusic.get(0).play();
          clearTimeout(game.timer.backgroundMusic);
        }, 2000);
        // 控制救护车
        if (/Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent)) {
          // 移动端
          $(document).on('touchmove', (e) => {
            game.control(e.originalEvent.changedTouches[0]);
          });
        } else {
          // PC端
          $(document).mousemove((e) => {
            game.control(e);
          });
        }
        const set = game.mode[index];

        game.timer.startGame = setTimeout(() => {
          // 调用函数绘制救护车以及分数栏
          game.core.draw();

          // 胶囊发射定时器
          game.timer.capsule = setInterval(() => {
            game.core.capsule(set[0], [game.num.ambulanceX, game.num.ambulanceY]);
          }, set[1]);

          // 病毒出现定时器
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
      // 展示游戏规则
      case 1: {
        game.modalTitle.html('游戏规则');
        showMessage.html(game.rules.join('\n'));
        break;
      }
      // 展示防疫小知识
      case 2: {
        game.modalTitle.html('防疫小知识');
        showMessage.html(
          `<li class="list-group-item list-group-item-success">
            ${game.knowledge[game.randomNum(0, game.knowledge.length)]}
          </li>`,
        );
        break;
      }
      // 展示谣言以及真相
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
    // 绘制开始界面
    draw() {
      // 绘制标题
      const title = $('<div>')
        .addClass('title')
        .append(
          $("<div class='logo'>").append(
            $("<img alt='全民战疫' src=''>").prop({
              class: 'img-fluid',
              src: './assets/img/logo.png',
              style: 'user-select: none',
            }),
          ),
        );
      game.stage.append(title);

      // 创建选项
      const buttonGroup = $('<div>').addClass('buttonGroup col-8').html(`
            <a class='btn btn-block btn-lg btn-success' href='javascript:;'>开始游戏</a>
            <a class='btn btn-block btn-lg btn-primary' href='javascript:;' data-bs-toggle='modal' data-bs-target='#modal'>查看规则</a>
            <a class='btn btn-block btn-lg btn-warning' href='javascript:;' data-bs-toggle='modal' data-bs-target='#modal'>防疫小知识</a>
            <a class='btn btn-block btn-lg btn-danger' href='javascript:;' data-bs-toggle='modal' data-bs-target='#modal'>谣言我先知</a>
          `);
      game.stage.append(buttonGroup);

      // 事件委派
      buttonGroup.on('click', 'a', (e) => {
        const that = e.target;
        const showMessage = $('#showMessage');
        game.buttonClick($(that).index(), showMessage);
      });
    },

    // 界面元素移除
    remove() {
      const removeDiv = game.stage.children($('div'));
      removeDiv.stop().animate(
        {
          opacity: 0,
        },
        100,
      );
      setTimeout(() => {
        removeDiv.remove();
      }, 300);
    },
  },

  // 核心代码
  core: {
    // 绘制救护车以及分数栏
    draw() {
      // 绘制救护车
      const ambulance = $('<div>');
      ambulance.addClass('ambulance').css({
        top: game.stage.height() / 2 + 64,
        left: game.stage.width() / 2 - 15,
      });
      game.stage.append(ambulance);
      // 绘制分数栏
      const score = $('<div>').addClass('score').html('0');
      game.stage.append(score);

      // 新建一个隐藏按钮,用于触发结算界面的防疫小知识
      const tipButton = $('<button id=\'tipButton\' style=\'display:none\' data-bs-toggle=\'modal\' data-bs-target=\'#modal\'>');
      game.stage.append(tipButton);

      // 记录胶囊发射初始位置
      game.num.ambulanceX = parseInt(ambulance.css('left'), 10) + ambulance.width() / 2;
      game.num.ambulanceY = parseInt(ambulance.css('top'), 10);
    },

    // 救护车位置
    ambulance(pos) {
      const ambulance = game.stage.find($('.ambulance'));
      let left = pos[0] - ambulance.width() / 2;
      let top = pos[1] - ambulance.height() / 2;

      // 防止救护车跑出画面之外
      if (left <= 0) {
        left = 0;
      } else if (left >= game.stage.width() - ambulance.width()) {
        left = game.stage.width() - ambulance.width();
      }
      if (top <= 0) {
        top = 0;
      } else if (top >= game.stage.height() - ambulance.height()) {
        top = game.stage.height() - ambulance.height();
      }

      ambulance.css({
        left,
        top,
      });

      // 记录胶囊发射初始位置
      game.num.ambulanceX = left + ambulance.width() / 2;
      game.num.ambulanceY = top;
    },

    // 绘制胶囊并开始发射动画
    capsule(speed, pos) {
      // 胶囊发射音效
      $('#shot').get(0).play();
      const capsule = $('<div>');
      capsule.addClass('capsule');
      game.stage.append(capsule);
      capsule.css({
        left: pos[0] - capsule.width() / 2,
        top: pos[1] - capsule.height() / 2,
      });
      capsule.stop().animate(
        {
          top: -capsule.height(),
        },
        speed,
        'linear',
        () => {
          capsule.remove();
        },
      );
    },

    // 病毒
    virus(argument) {
      const { speed } = argument;
      const { left } = argument;
      const { top } = argument;
      const $virus = $('<div>');
      $virus
        .addClass('virus')
        .css({
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
        // 获取救护车对象
        const ambulance = $('.ambulance');
        // 获取屏幕上的所有胶囊
        const capsule = $('.capsule');
        // 胶囊击中，病毒消失
        const x = parseInt($virus.css('left'), 10) + 32;
        const y = parseInt($virus.css('top'), 10) + 32;
        const l = capsule.length;

        // 病毒击中消失
        for (let i = 0; i < l; i += 1) {
          const dx = Math.abs(x - parseInt(capsule.eq(i).css('left'), 10) - 8);
          const dy = Math.abs(y - parseInt(capsule.eq(i).css('top'), 10) - 13);
          if (dx <= 40 && dy <= 45) {
            // 病毒击中效果
            $virus.css('background', "url('./assets/img/killed.png')");
            // 击毁病毒音效
            game.killed.get(0).play();

            // 移除胶囊
            capsule.eq(i).remove();
            clearInterval($virus.timer);
            game.num.score += 1;
            game.stage.find($('.score')).html(game.num.score * 1000);
            setTimeout(() => {
              $virus.remove();
            }, 300);
          }
        }

        // 救护车损坏，显示分数以及成就
        const dx2 = Math.abs(x - parseInt(ambulance.css('left'), 10) - 15);
        const dy2 = Math.abs(y - parseInt(ambulance.css('top'), 10) - 32);

        // !($(".tips").get(0)) 用于防止创建多个 tips
        if (dx2 <= 47 && dy2 <= 64 && !$('.tips').get(0)) {
          // 设置鼠标可见
          game.stage.css('cursor', 'default');
          // 播放游戏结束音乐
          $('#gameOver').get(0).play();
          // 暂停音乐
          $('#backgroundMusic').get(0).pause();
          // 结算
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

          // 结算时的防疫小知识
          game.stage.on('click', '#tipButton', () => {
            game.modalTitle.html('悄悄告诉你：');
            $('#showMessage').html(
              `<li class="list-group-item list-group-item-success">
                ${game.knowledge[game.randomNum(0, game.knowledge.length)]}
              </li>`,
            );
          });
          $('#tipButton').get(0).click();

          // 监听 再来一次 点击事件，事件委派给 stage
          game.stage.on('click', '.tips p', () => {
            game.num.score = 0;
            game.startScreen.remove();
            game.startScreen.draw();
          });

          // 移除
          $virus.remove();
          score.addClass('none');
          ambulance.css('background', "url('./assets/img/isDestroy.png')");
          clearInterval($virus.timer);
          setTimeout(() => {
            $('.ambulance').remove();
          }, 400);

          // 清除时间轮
          clearInterval(game.timer.capsule);
          clearInterval(game.timer.virus);

          // 2s 后显示结算信息
          setTimeout(() => {
            tips.css('display', 'block');
          }, 1000);
        }
      }, 50);
    },
  },

  // 产生指定区域整形随机数。
  randomNum(a, b) {
    const value = Math.abs(a - b);
    const num = Math.floor(Math.random() * value) + Math.min(a, b);
    return num;
  },
};

$(() => {
  // 初始化数据
  (async function init() {
    // 游戏规则
    await $.ajax({
      type: 'GET',
      url: './assets/json/rules.json',
      dataType: 'json',
      success(data) {
        game.rules = data;
      },
      error() {
        game.rules = ['不好意思，加载本地文件失败了'];
      },
    });
    // 防疫小知识
    await $.ajax({
      type: 'GET',
      url: './assets/json/knowledge.json',
      dataType: 'json',
      success(data) {
        game.knowledge = data;
      },
      error() {
        game.knowledge = ['不好意思，加载本地文件失败了'];
      },
    });
    // 谣言和真相
    await $.ajax({
      type: 'GET',
      url: './assets/json/rumors.json',
      dataType: 'json',
      success(data) {
        game.rumors = data;
      },
      error() {
        game.rumors = [['不好意思，加载本地文件失败了', '不好意思，加载本地文件失败了']];
      },
    });
    game.startScreen.draw();
  }());
});
