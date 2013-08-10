Words = new Meteor.Collection("words");
Users = new Meteor.Collection("users");

if (Meteor.isClient) {

  Template.hello.greeting = function () {
    return "Words";
  };

  Template.hello.words = function () {
    return Words.find();
  };
  Template.hello.users = function () {
    return Users.find();
  };

  Template.hello.events({
    'click .word-delete' : function () {
      // template data, if any, is available in 'this'
      Words.remove(this._id);
    },
    'mouseover .word': function() {
      $('#' + this._id).draggable();
    },
    'click #up': function() {
      $('#canvas').animate({top:'+=20'}, 30);
      updateURL();
    },
    'click #down': function() {
      $('#canvas').animate({top:'-=20'}, 30);
      updateURL();
    },
    'click #left': function() {
      $('#canvas').animate({left:'+=20'}, 30);
      updateURL();
    },
    'click #right': function() {
      $('#canvas').animate({left:'-=20'}, 30);
      updateURL();
    }
  });

  Meteor.startup(function() {

    var urlParts = document.URL.split('/');
    
    if (urlParts.length == 4) {

      var locationParts = urlParts[3].split(',');
      
      $('#canvas').css('top', locationParts[0]);  
      $('#canvas').css('left', locationParts[1]);

    } // if

    $('#words').autocomplete({
      delay: 500,
      select: function(event, ui) {

        var currentLeft = parseInt($('#canvas').css('left'));
        var currentTop = parseInt($('#canvas').css('top'));

        var insertWord = {
          'name': ui.item.value,
          'x' : (0 - currentLeft) + 100,
          'y' : (0 - currentTop) + 100,
          'z' : 0,
        };

        Words.insert(insertWord);

        $('#words').val('');

        return false;

      },
      source: function(request, response) {
          $.ajax({
            url: 'http://www.linkedin.com/ta/skill',
            dataType: 'jsonp',
            data: {
              query: request.term
            },
            success: function( data ) {

              response( $.map( data.resultList, function( item ) {
                return {
                  label: item.headline,
                  value: item.displayName
                }
              }));

            }
          });
        },
    });

  });

  $(document).ready(function(){

    $('body').on('click', '.word', function(event) {
      $word = $(event.srcElement);
      var max = Words.findOne({}, {sort: {z: -1}});
      if (typeof max !== 'undefined') {
        if (typeof max.z !== 'undefined') {
          var z = max.z;
        }
      }
      Words.update({_id: $word.attr('id') }, {
        $set: {
          z: (typeof z !== 'undefined') ? z + 1 : 0,
        }
      });
    });

    $('body').on('dragstop', '.word', function(event) {
      $word = $(event.srcElement);
      position = $word.position();


      Words.update({_id: $word.attr('id') }, {
        $set: {
          x: position.left,
          y: position.top,
        }
      });
    });

  }); // .ready

} // if


if (Meteor.isServer) {
  Meteor.startup(function () {
  Users.remove({});
    Meteor.default_server.stream_server.register( Meteor.bindEnvironment( function(socket) {
        var intervalID = Meteor.setInterval(function() {
            if (socket.meteor_session) {

                var connection = {
                    connectionID: socket.meteor_session.id,
                    connectionAddress: socket.address,
                    userID: socket.meteor_session.userId,
                    color: '#'+Math.floor(Math.random()*16777215).toString(16)
                };

                socket.id = socket.meteor_session.id;

                Users.insert(connection); 

                Meteor.clearInterval(intervalID);
            }
        }, 1000);

        socket.on('close', Meteor.bindEnvironment(function () {
            Users.remove({
                connectionID: socket.id
                });
        }, function(e) {
            Meteor._debug("Exception from connection close callback:", e);
        }));
    }, function(e) {
        Meteor._debug("Exception from connection registration callback:", e);
    }));
    // code to run on server at startup
  });
}

function updateURL() {
  if ('history' in window && 'pushState' in window.history) {
    window.history.pushState({},'', $('#canvas').css('top') + ',' + $('#canvas').css('left'));
  }
}
