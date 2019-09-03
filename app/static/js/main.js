CAPTURE_IMG_WIDTH = 400
CAPTURE_IMG_HEIGHT = 300

// Show the selected image to the UI before uploading
function readURL(input, id) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    
    reader.onload = function(e) {
      $(id).attr('src', e.target.result).css({'width': CAPTURE_IMG_WIDTH, 'height': CAPTURE_IMG_HEIGHT});
    }
    
    reader.readAsDataURL(input.files[0]);

    process_upload_another()
  }
}

// jQuery.ajaxSetup({
//   beforeSend: function() {
//      $('#loading').removeClass('hidden');
//   },
//   complete: function(){
//      $('#loading').addClass('hidden');
//   },
//   success: function() {
//     $('#loading').addClass('hidden');
//   }
// });

function initialize_webcam() {
  // HTML5 WEBCAM
  Webcam.set({
    width: CAPTURE_IMG_WIDTH,
    height: CAPTURE_IMG_HEIGHT,
    image_format: 'jpeg',
    jpeg_quality: 90
  });
  Webcam.attach( '#my-camera' );
}

let form_capture = document.getElementById('form-capture-image')
$('.btn-capture-image').on('click', function(e) {
  e.preventDefault();

  $(this).addClass('is-loading');

  Webcam.snap(function(data_uri) {
    // display results in page
    let json_data = {'data-uri': data_uri }
    let camera = $('#my-camera')
    $('#my-camera').addClass('hidden');
    $('.taken-photo').attr('src', data_uri).removeClass('hidden');

    $.ajax({
      type: 'POST',
      // url: '/predict/',
      url: 'https://asia-east2-rsp-game-251717.cloudfunctions.net/predict',
      processData: false,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify(json_data),
      success: function(data) {
        $('.btn-capture-image').removeClass('is-loading');
        $('#taken-photo').attr('src', data_uri);
        $('#prediction').text(data['label'][0][0]);
        $('#prediction-key').val(data['label'][0][0]);
        
        // html = '<ul>'
        // for( let i = 0; i < data['probs'].length; i++) {
        //   data_splitted = data['probs'][i]

        //   html += '<li><span class="num">' + data_splitted[0] + '</span> <span class="prob">'+ data_splitted[1] + '</span></li>'
        // }
        // html += '</ul>'

        // $('#probs').text('').append(html)

        $('.box-results').removeClass('hidden');
        $('#results-prediction').removeClass('hidden')

        predictResultTimeline = anime.timeline();
        predictResultTimeline.add({
          targets: '.box-upload-file',
          translateX: { value: [0, -250], duration: 200, easing: 'easeInQuad' },
          opacity: [
            { value: [1, 0], duration: 200, easing: 'easeInQuad' }
          ],
        }).add({
          targets: '.box-results',
          translateX: { value: [250, 0], duration: 200, easing: 'easeOutQuad' },
          opacity: [
            { value: [0, 1], duration: 200, easing: 'easeOutQuad' }
          ],
          complete: function() {
            $('.tile-human').css('height', $('.box-results').height());
          }
        })
      }
    });
  });
});

// Choose another weapon (take another photo)
$('#go-back').on('click', function(e) {
  e.preventDefault();

  $('#my-camera').removeClass('hidden');
  $('.taken-photo').addClass('hidden');
  
  predictResultTimeline = anime.timeline();
  predictResultTimeline.add({
    targets: '.box-results',
    translateX: { value: [0, -250], duration: 200, easing: 'easeInQuad' },
    opacity: [
      { value: [1, 0], duration: 200, easing: 'easeInQuad' }
    ],
  }).add({
    targets: '.box-upload-file',
    translateX: { value: [250, 0], duration: 200, easing: 'easeOutQuad' },
    opacity: [
      { value: [0, 1], duration: 200, easing: 'easeOutQuad' }
    ],
  })
  $('#results-prediction').addClass('hidden');
});

$('#confirm-weapon').on('click', function() {
  rspInitLordAIWeapon();
  $('#confirm-weapon, #go-back').addClass('hidden');
});

// Handle Predict Correction
$('#form-predict-correction .btn-correction').on('click', function(e) {
  e.preventDefault();

  let label = $(this).attr('data-label')

  handle_predict_correction(label)
})

function handle_predict_correction(label) {
  let correction_form = document.getElementById('form-predict-correction')

  let form_data = new FormData(correction_form);
  form_data.append('correction-label', label)

  $.ajax({
    type: 'POST',
    url: '/predict-correction/',
    processData: false,
    contentType: false,
    data: form_data,
    success: function(data) {
      $('#form-predict-correction .button').addClass('hidden')
      $('#thank-you').text(data['message']);
    }
  });
};

$(document).ready(function() {

  // initRSPGame();
  initialize_webcam();

  rspInitLordAIIntro();
  
  $('#game-status .btn-play-again').on('click', function() {
    anime({
      targets: '#game-status',
      scale: [
        {value: [1, 20], easing: 'easeOutSine', duration: 800}
      ],
      opacity: [
        { value: [1, 0], duration: 600, easing: 'easeOutQuad' }
      ],
      complete: function() {
        $('#confirm-weapon, #go-back').removeClass('hidden');
        $('#game-status').css('transform', 'scale(1)')
        $('#go-back').trigger('click');
        $('')

        let rspPlayAgainTimeline = anime.timeline();
  
        rspPlayAgainTimeline.add({
          targets: '#lord-ai-weapon',
          translateX: { value: [0, -250], duration: 500, easing: 'easeInQuad' },
          opacity: [
            { value: [1, 0], duration: 500, easing: 'easeOutQuad' }
          ],
        }).add({
          targets: '.lord-ai-intro',
          translateX: { value: [-250, 0], duration: 500, easing: 'easeInQuad' },
          opacity: [
            { value: [0, 1], duration: 500, easing: 'easeOutQuad' }
          ],
          complete: function() {
            $('.lord-ai-weapon-loading .square').css('transform', 'scale(1)')
            $('.lord-ai-intro-content .intro').removeClass('hidden');
            $('.lord-ai-intro-content .ai-turn').addClass('hidden');
            $('.lord-ai-weapon-loading .ai-weapon img').css('opacity', 0);
            rspAnimateText('.lord-ai-intro-content .intro .letters', false, false);
          }
        })
      }
    })
  });
});