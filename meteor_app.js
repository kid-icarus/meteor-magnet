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

    'keyup #words' : function(event) {
        if (event.keyCode == 13) {
          insertWord = {
            'name': $('#words').val(),
            'x' : 0,
            'y' : 0
          };
          Words.insert(insertWord);
          $('#words').val('');
        }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
