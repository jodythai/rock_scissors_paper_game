rspGameData = {
  "lord_ai" : {},
  "human" : {
    "dialog": {
      "intro": {
        "content" : [
          "Hello human, the humanity is under extinction because of the rise of A.I.",
          "You are our last hope to save our race!"
        ],
        "buttons" : [
          { 
            "text" : "OK, I'm In!",
            "action" : "dialog-intro-form"
          }
        ]
      }
    }
  }
}

function rspInitLordAI() {

}

function rspGetDialogContent(race, dialogName) {

  let rspDialogContent = rspGameData[race]['dialog'][dialogName]['content'];
  let rspDialogButtons = rspGameData[race]['dialog'][dialogName]['buttons'];

  // Generate dialog content
  rspDialogContentHTML = '';
  if (rspDialogContent.length > 1) {
    for (i = 0; i< rspDialogContent.length; i++) {
      rspDialogContentHTML += "<p>" + rspDialogContent[i] + "</p>";
    }
  } else {
    rspDialogContentHTML += "<p>" + rspDialogContent + "</p>";
  }

  // generate dialog bar
  dialogButtonsHTML = '';
  for(i = 0; i< dialogButtons.length; i++) {
    console.log()
    dialogButtonsHTML += "<a href='#'class='button rsp-dialog-button' data-rsp-action=" + dialogButtons[i]['action'] + ">" + dialogButtons[i]['text'] + "</a>"
  }

  $('.rsp-dialog-' + dialogName).html(dialogContentHTML);
  $('.rsp-dialog-' + dialogName + "-buttons").html(dialogButtonsHTML);


  anime.timeline({loop: true})
  .add({
    targets: '.rsp-dialog-' + dialogName + ' p',
    translateY: ["1.1em", 0],
    translateZ: 0,
    duration: 750,
    delay: (el, i) => 50 * i
  }).add({
    targets: '.rsp-dialog-' + dialogName,
    opacity: 0,
    duration: 1000,
    easing: "easeOutExpo",
    delay: 1000
  });
}

function rspActionRoute(action) {
  
}

$(document).ready(function() {

  initialize_game_intro();

  let rspDialogButtons = $('.rsp-dialog-button')

    // let's fight!
  $('#modal-game-intro .btn-modal-close').on('click', function() {
    
  });
});