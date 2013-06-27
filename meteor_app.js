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
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    },
    'mouseover .word': function() {
      $('#' + this._id).draggable();
      console.log(this._id);
    },

    'keyup #words' : function(event) {
        console.log(event); 
        if (event.keyCode == 13) {
          insertWord = {
            'name': $('#words').val(),
            'x' : 0,
            'y' : 0
          };
          Words.insert(insertWord);
          console.log("You changed words the button");

        }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
