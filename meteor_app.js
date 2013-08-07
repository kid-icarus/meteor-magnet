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

    }
  });

  Meteor.startup(function() {

    $('#words').autocomplete({
      delay: 500,
      select: function(event, ui) {

        var insertWord = {
          'name': ui.item.value,
          'x' : 0,
          'y' : 0
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
    console.log($('.word'));
    $('body').on('dragstop', '.word', function(event) {
      $word = $(event.srcElement);
      console.log($word.attr('id'));
      position = $word.position();
      Words.update({_id: $word.attr('id') }, {
        $set: {
          x: position.left,
          y: position.top
        }
      });
      console.log(position);
    });
  });
}


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
