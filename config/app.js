module.exports.app = {
	appName: "UCLIC",

	setFlashMessage: function(req, msg, type){
		if(req.session){
			req.session.flash = {
				msg: msg,
				type: type,
			};
		}
	},

	getSocketId: function(id){

		var onlineUsers = sails.config.app.online;
		for(var i=0 ; i<onlineUsers.length ; i++ ){
			if(onlineUsers[i].id === id){
				return {index: i, id: onlineUsers[i].socketId, inChat: onlineUsers[i].inChat };
			}
		}
		return false;
	},

	online: [],


}