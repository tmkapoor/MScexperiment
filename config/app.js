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
		console.log("Look up socket Id for " + id);
		for(var i=0 ; i<onlineUsers.length ; i++ ){
			if(onlineUsers[i].id === id){
				console.log(onlineUsers[i]);
				console.log(" *** Socket Id found to be " + onlineUsers[i].socketId);
				return onlineUsers[i].socketId;
			}
		}
		console.log("User is not online.");
		return false;
	},

	online: [],


}