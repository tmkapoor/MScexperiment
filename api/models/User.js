/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	schema: true,

  	attributes: {
  	
  	email: {
  		type: 'string',
  		required: true,
  		email: true,
  		unique: true
  	},

  	sname: 	{
  		type: 'string',
  		required: true,
  		unique: true
  	},

  	password: 	{
  		type: 'string',
  		required: true
  	},

  	admin:{
  		type: 'boolean',
  		defaultsTo: false
  	},

  	online:{
  		type: 'boolean',
  		defaultsTo: false
  	},

  	attached:{
  		type: 'boolean',
  		required: true,
  		defaultsTo: false,
  	},

  	attachedTo:{
  		type: 'integer',
  		required: true,
  		defaultsTo: -1,
  	},

  	toJSON: function(){
  		console.log("User toJSONed.");
  		var obj = this.toObject();
  		delete obj.epassword;
  		delete obj.password;
  		delete obj.confirmation;
  		delete obj._csrf;
  		return obj;	
  	},

	beforeCreate: function(values, next) {
	// An example encrypt function defined somewhere
	encrypt(values.password, function(err, password) {
	  if(err){
	  	return next(err);
	  }

	  values.password = password;
	  values.online = false;
	  values.admin = true;
	  next();
	});
	},

  }
};

