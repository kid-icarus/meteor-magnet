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
  
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
