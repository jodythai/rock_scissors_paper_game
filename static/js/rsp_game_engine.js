rspGameData = {
  "lord_ai" : {},
  "human" : {
    "dialog": {
      "intro": {
        "title": 'We need your help',
        "content" : [
          "Hello human, the humanity is under extinction because of the rise of A.I.",
          "You are our last hope to save the human race!"
        ],
        "buttons" : [
          { 
            "text" : "OK, I'm In!",
            "action" : "human_dialog_intro-form"
          }
        ]
      },
      "intro-form": {
        "title": 'Before we start',
        "content" : [
          "Please create your nickname",
          "[[intro-form]]"
        ],
        "buttons" : [
          { 
            "text" : "Submit",
            "action" : "human_register"
          }
        ]
      }
    }
  }
}

rspVexActiveDialogs = {}

const rspWeaponChoices = ["rock", "paper", "scissors"];

function rspInitLordAIIntro() {
  rspAnimateText('.lord-ai-intro-content .intro .letters');
}

function rspAnimateText(lettersElem, loadWeapon = false, showWinner = false) {
  let textWrappers = document.querySelectorAll(lettersElem);

  let rspLordAIIntroTimeline = anime.timeline();

  for ( let i = 1; i <= textWrappers.length; i++ ) {
    index = i - 1;
    
    let textWrapper = document.querySelector(lettersElem + '-' + index);
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter-wrapper'><span class='letter'>$&</span></span>");
    
    rspLordAIIntroTimeline.add({
      targets: lettersElem + '-' + index + ' .letter',
      translateY: ["1.5em", 0],
      translateZ: 0,
      duration: 200,
      delay: (el, j) => 50 * j,
      complete: function(anim) {
        if (loadWeapon) {
          rspLoadLordAIWeapon();
        }

        if (showWinner) {
          rspShowWinner();
        }
      }
    })
  }
}

// let rspGameStatusTimeline = anime.timeline({loop: true});

// rspGameStatusTimeline.add({
//   targets: '#game-status',
//   scale: [
//     {value: [1, 1.05], easing: 'easeInOutQuad', duration: 2000}
//   ]
// }).add({
//   targets: '#game-status',
//   scale: [
//     {value: [1.05, 1], easing: 'easeInOutQuad', duration: 2000}
//   ]
// })

function rspInitLordAIWeapon() {

  $('.lord-ai-intro-content .intro').addClass('hidden');
  $('.lord-ai-intro-content .ai-turn').removeClass('hidden');
  $('.lord-ai-small-content p').addClass('hidden');
  $('.lord-ai-small-content .default').removeClass('hidden');

  rspAnimateText('.lord-ai-intro-content .ai-turn .letters', true, false);
}

function rspLoadLordAIWeapon() {
  // Animate loading screen
  let rspWeaponLoadingTimeline = anime.timeline();
  
  rspWeaponLoadingTimeline.add({
    targets: '.lord-ai-intro',
    translateX: { value: [0, -250], duration: 500, easing: 'easeInQuad' },
    opacity: [
      { value: [1, 0], duration: 500, easing: 'easeOutQuad' }
    ],
  }).add({
    targets: '#lord-ai-weapon',
    translateX: { value: [-250, 0], duration: 500, easing: 'easeInQuad' },
    opacity: [
      { value: [0, 1], duration: 500, easing: 'easeOutQuad' }
    ],
  }).add({
    targets: '.lord-ai-weapon-loading .el',
    scale: [
      {value: .1, easing: 'easeOutSine', duration: 200},
      {value: 1, easing: 'easeInOutQuad', duration: 400}
    ],
    delay: anime.stagger(100, {grid: [18, 14], from: 'center'}),
    complete: function() {
      // randomly generate lord AI weapon
      lordAIWeapon = rspWeaponChoices[Math.floor((Math.random() * 3))];
      humanWeapon = $('#prediction-key').val();

      // load weapon image
      $('.lord-ai-weapon-loading .ai-weapon').html('<img src="static/img/ai-weapon-' + lordAIWeapon + '.jpg" />');
      
      anime({
        targets: '.lord-ai-weapon-loading .square',
        scale: [
          {value: 0, easing: 'easeOutSine', duration: 200}
        ],
        delay: anime.stagger(100, {grid: [18, 14], from: 'center'}),
        complete: function() {
          // Animate the winner
          // Animate AI text
          $('.lord-ai-small-content .default').addClass('hidden');
          $('.lord-ai-small-content .weapon-' + lordAIWeapon).removeClass('hidden');
          rspAnimateText('.lord-ai-small-content .weapon-' + lordAIWeapon + " .letters", false, true)
        }
      })

      anime({
        targets: '.lord-ai-weapon-loading .ai-weapon img',
        opacity: [
          { value: [0, 1], duration: 800, easing: 'easeOutQuad' }
        ]
      })
    }
  })
}

function rspShowWinner() {
  winner = rspGetWinner(lordAIWeapon, humanWeapon)
  
  if ( winner == 'ai' ) { // AI Wins
    $('#game-status .winner .letters').text("Lord A.I. Wins!")
  } else if ( winner == 'human') { // Human Wins
    $('#game-status .winner .letters').text("You Wins!")
  } else { // Tie
    $('#game-status .winner .letters').text("Tie!")
  }

  anime({
    targets: '#game-status',
    scale: [
      {value: [20, 1], easing: 'easeInOutQuad', duration: 800},
    ],
    opacity: [
      { value: [0, 1], duration: 600, easing: 'easeOutQuad' }
    ],
    complete: function() {
      rspAnimateText('#game-status .winner .letters');

      anime({
        targets: '#game-status .btn-play-again',
        opacity: [
          { value: [0, 1], duration: 300, easing: 'easeOutQuad' }
        ]
      });
    }
  });
}

function rspGetWinner(lordAIWeapon, humanWeapon) {
  // paper: 0
  // rock: 1
  // scissors: 2
  
  let result = ''

  choice1 = rspWeaponChoices.indexOf(lordAIWeapon);
  choice2 = rspWeaponChoices.indexOf(humanWeapon);

  console.log('ai weapon: ', choice1);
  console.log('human weapon: ', choice2);

  if (choice1 == choice2) {
    return "tie";
  }
  if (choice1 == rspWeaponChoices.length - 1 && choice2 == 0) {
    return "human";
  }
  if (choice2 == rspWeaponChoices.length - 1 && choice1 == 0) {
    return "ai";
  }
  if (choice1 > choice2) {
    return "ai";
  } else {
    return "human";
  }
}

function rspShowDialog(race, dialogName, appendLocation='body') {
  let rspDialogTitle = rspGameData[race]['dialog'][dialogName]['title'];
  let rspDialogContent = rspGameData[race]['dialog'][dialogName]['content'];
  let rspDialogButtons = rspGameData[race]['dialog'][dialogName]['buttons'];

  // Generate dialog content
  rspDialogHTML = '<h2 class="rsp-dialog-title">' + rspDialogTitle + '</h2>'
  rspDialogHTML += '<div class="rsp-dialog-content">';
  for (i = 1; i <= rspDialogContent.length; i++) {
    let index = i - 1
    rspDialogHTML += '<p class="dialog-text-wrapper"><span class="letters-' + index + '">' + rspDialogContent[index] + '</span></p>';
  }
  rspDialogHTML += '</div>';

  // generate dialog bar
  rspDialogHTML += '<div class="rsp-dialog-buttons">';
  for(i = 1; i <= rspDialogButtons.length; i++) {
    let index = i - 1
    rspDialogHTML += '<a href="#" class="button rsp-dialog-button" data-rsp-dialog="rsp-dialog-' + dialogName + '" data-rsp-action=' + rspDialogButtons[index]['action'] + '>' + rspDialogButtons[index]['text'] + '</a>';
  }
  rspDialogHTML += '</div>';

  if (dialogName == 'intro-form') {
    let rspIntroFormHTML = '<form name="form-rsp-register">'

    rspIntroFormHTML += '<input type="text" name="nickname" />'
    rspIntroFormHTML += '</form>'

    rspDialogHTML = rspDialogHTML.replace(/\[\[intro-form\]\]/g, rspIntroFormHTML);
  }
  
  vexDialog = vex.open({
    content: '',
    unsafeContent: rspDialogHTML,
    className: 'vex-theme-default rsp-dialog rsp-dialog-' + dialogName,
    appendLocation: appendLocation,
    showCloseButton: false,
    afterOpen: function() {
      let rspDialogTimeline = anime.timeline();

      // Animate dialog text
      if (rspDialogContent.length >= 1) {
        for (i = 1; i <= rspDialogContent.length; i++) {
          index = i-1;

          // Wrap every letter in a span
          let textWrapper = document.querySelector('.rsp-dialog-' + dialogName + ' .dialog-text-wrapper .letters-' + index);
          textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter-wrapper'><span class='letter'>$&</span></span>");

          rspDialogTimeline.add({
            targets: '.rsp-dialog-' + dialogName + ' .letters-' + index + ' .letter',
            translateY: ["1.5em", 0],
            translateZ: 0,
            duration: 200,
            delay: (el, j) => 50 * j
          })

          if (i == rspDialogContent.length) {
            rspDialogTimeline.add({
              targets: '.rsp-dialog-' + dialogName + ' .rsp-dialog-buttons',
              opacity: [
                { value: [0, 1], duration: 500, easing: 'easeOutQuad' }
              ],
              delay: (200 * index)
            })
          }
        }
      } 
    }
  });  
  
  //assign the current dialog to the list of active dialogs
  rspVexActiveDialogs['rsp-dialog-' + dialogName] = vexDialog.id;
}

function rspInitGameIntro() {
  rspShowDialog('human', 'intro')

  // show game intro
  // $('#modal-rsp-dialog-intro').toggleClass('is-active');
}

function rspInitGamePanels() {
  let rspGamePanelsTimeline = anime.timeline();

  rspGamePanelsTimeline.add({
    targets: '.tile-ai',
    opacity: [
      { value: [0, 1], duration: 500, easing: 'easeOutQuad' }
    ],
  }).add({
    targets: '.tile-human',
    opacity: [
      { value: [0, 1], duration: 500, easing: 'easeOutQuad' }
    ],
  })
}

function writeCookie(name,value,days) {
  var date, expires;
  if (days) {
      date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      expires = "; expires=" + date.toGMTString();
          }else{
      expires = "";
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
  var i, c, ca, nameEQ = name + "=";
  ca = document.cookie.split(';');
  for(i=0;i < ca.length;i++) {
      c = ca[i];
      while (c.charAt(0)==' ') {
          c = c.substring(1,c.length);
      }
      if (c.indexOf(nameEQ) == 0) {
          return c.substring(nameEQ.length,c.length);
      }
  }
  return '';
}

function initRSPGame() {
  vex.defaultOptions.closeAllOnPopState = false;
  rspInitGameIntro();
  rspInitGamePanels();

  $('body').on('click', '.rsp-dialog-button', function() {
    let rspAction = $(this).attr('data-rsp-action').split('_');
    let rspActionRace = rspAction[0];
    let rspActionType = rspAction[1];
    let rspActionName = rspAction[2];

    // close current dialog
    vex.close(String(rspVexActiveDialogs[$(this).attr('data-rsp-dialog')]));

    switch(rspActionType) {
      case 'dialog':
        rspShowDialog(rspActionRace, rspActionName)
      case 'register':
        console.log('TODO: implement register user')
        // rspInitGamePanels()
      default:
    }

  })
}
