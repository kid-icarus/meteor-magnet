Words = new Meteor.Collection("words");
Users = new Meteor.Collection("users");

wordSource = '';
wordSources = {
  'linkedin': {
    label: 'LinkedIn',
    ajax: function(request, response) {
      $.ajax({
        url: 'http://www.linkedin.com/ta/skill',
        dataType: 'jsonp',
        data: {
          query: request.term
        },
        success: function(data) {
    
          response( $.map(data.resultList, function(item) {
            return {
              label: item.headline,
              value: item.displayName
            }
          }));
    
        }
      });
    }
  },
  'wikipedia': {
    label: 'Wikipedia',
    ajax: function(request, response) {
      $.ajax({
        url: 'http://en.wikipedia.org/w/api.php',
        dataType: 'jsonp',
        data: {
          action: 'opensearch',
          format: 'json',
          namespace: '0',
          search: request.term,
        },
        success: function(data) {
  
          response( $.map(data[1], function(item) {
            return {
              label: item,
              value: item
            };
          }));

        }
      });
    }
  },
  'amazon': {
    label: 'Amazon',
    ajax: function(request, response) {
      $.ajax({
        url: 'http://completion.amazon.com/search/complete',
        dataType: 'jsonp',
        data: {
          mkt: '1',
          'search-alias': 'aps',
          q: request.term,
        },
        success: function(data) {
  
          response( $.map(data[1], function(item) {
            return {
              label: item,
              value: item
            };
          }));

        }
      });
    }
  },
};

Meteor.methods({
 
 setSets: function() {
 
   // Update all words without a set to have set of linkedin.
 
   Words.update({set: null}, {$set: {set: 'linkedin'}}, {multi: true});

 },

});

// Client-side code

if (Meteor.isClient) {

  Template.hello.words = function () {
    setWordSource();
    return Words.find({set: wordSource});
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

    setWordSource();

    if (urlParts.length >= 5) {

      var locationParts = urlParts[4].split(',');
      
      $('#canvas').css('top', locationParts[0]);  
      $('#canvas').css('left', locationParts[1]);

    }
    else {
      updateURL();
    }

    $('#words').autocomplete({
      delay: 500,
      select: function(event, ui) {

        var currentLeft = parseInt($('#canvas').css('left'));
        var currentTop = parseInt($('#canvas').css('top'));

        var insertWord = {
          'set': wordSource,
          'name': ui.item.value,
          'x' : (0 - currentLeft) + 100,
          'y' : (0 - currentTop) + 100,
          'z' : 0,
        };

        Words.insert(insertWord);

        $('#words').val('');

        return false;

      },
      source: wordSources[wordSource].ajax
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

  });

}

// Server-side code

if (Meteor.isServer) {

  Meteor.startup(function () {
  
    Users.remove({});

    Meteor.default_server.stream_server.register( Meteor.bindEnvironment(function(socket) {

      // Update users for display.

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

      socket.on('close', Meteor.bindEnvironment(function() {
        Users.remove({
          connectionID: socket.id
        });
      }, function(e) {
        Meteor._debug("Exception from connection close callback:", e);
      }));
    }, function(e) {
        Meteor._debug("Exception from connection registration callback:", e);
    }));

  });

}

/**
 * Updates path to match position.
 */
function updateURL() {
  var path = $('#canvas').css('top') + ',' + $('#canvas').css('left');
  setPushState(path);
}

/**
 * Updates path.
 */
function setPushState(path) {
  if ('history' in window && 'pushState' in window.history) {
    window.history.pushState({},'', path);
  }
}

/**
 * Sets the wordSource based on the URL.
 */
function setWordSource() {
 
  var urlParts = document.URL.split('/');

  if (urlParts.length >= 4 && urlParts[3].length > 0) {
    wordSource = urlParts[3];
  }
  else {

    // Set random wordSource.
    // TODO: provide interface to choose wordSource.

    var keys = Object.keys(wordSources);
    wordSource = keys[keys.length * Math.random() << 0];
    setPushState(wordSource + '/');

  }

}
