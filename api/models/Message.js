/**
* Message.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	schema: false,

  	attributes: {
  		from: {
  			type: 'integer',
  			required: true
  		},

  		to: {
  			type: 'integer',
  			required: true,
  		},

  		content: {
  			type: 'string',
  			required: true,
  		},

      unread: {
        type: 'boolean',
        required: true,
        defaultsTo: false
      },
      
  	}
};

