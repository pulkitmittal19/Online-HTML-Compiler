this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection('editingUsers')
if (Meteor.isClient) {
// find the first document in the Documents colleciton and send back its id
  Template.editor.helpers({
    docid:function(){
      var doc = Documents.findOne();
      if (doc){
        return doc._id;
      }
      else {
        return undefined;
      }
    }, 
   
    config:function(){
      return function(editor){
        editor.setOption("mode", "html");
        editor.on("change", function(cm_editor, info){
          //console.log(cm_editor.getValue());
          $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
          Meteor.call('addEditingUser')
         // EditingUsers.insert({user:'pulkit'})
        });        
      }
    }, 
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
     
    if (!Documents.findOne()){// no documents yet!
        Documents.insert({title:"my new document"});
    }
  });
}

Meteor.methods({
  addEditingUser: function(){
    
    var doc = Documents.findOne();
    if (!doc){
      return;
    }

    if (!this.userId){
      return;
    }

    var user = Meteor.user().profile;

     var eusers = EditingUsers.findOne({docid:doc._id})

    if(!eusers){
      eusers={
        docid:doc._id,
        users:{}
      };
    }
      user.lastEdit= new Date();
      eusers.users[this.userId] = user;


      EditingUsers.upsert({id: eusers._id}, eusers)
  }
})
