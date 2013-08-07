Words = new Meteor.Collection("words");

if (Meteor.isClient) {
  
  Template.hello.greeting = function () {
    return "Words";
  };

  Template.hello.words = function () {
    return Words.find();
  };

  Template.hello.events({
    'click .delete' : function () {
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
    // code to run on server at startup
  });
}
