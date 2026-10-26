//===== Ajax Contact Form =====//
    $('#contactform').submit(function () {
       var action = $(this).attr('action');
       var msg = $('#message');
       $(msg).hide();
       var data = 'name=' + $('#name').val() + '&email=' + $('#email').val() + '&phone=' + $('#phone').val() + '&comments=' + $('#comments').val() + '&verify=' + $('#verify').val() + '&captcha=' + $(".g-recaptcha-response").val();
       $.ajax({
           type: 'POST',
           url: action,
           data: data,
           beforeSend: function () {
              $('#submit').attr('disabled', true);
              $('img.loader').fadeIn('slow');
          },
          success: function (data) {
              $('#submit').attr('disabled', false);
              $('img.loader').fadeOut('slow');
              $(msg).empty();
              $(msg).html(data);
              $('#message').slideDown('slow');
              if (data.indexOf('success') > 0) {
                  $('#contactform').slideUp('slow');
              }
          }
      });
       return false;
   });