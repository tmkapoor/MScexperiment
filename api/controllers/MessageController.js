/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	subToMessage: function(req, res, next){
		if(req.isSocket){
			console.log("Socket id " + req.socket + " has asked to subscribe to message model.");
			Message.find({}).exec(function(err, messages){
				if(!err){
					Message.watch(req);
					console.log("Socket id " + req.socket + " has been subscribed to message model !");
				}
			});
		}
		else{
			res.redirect("/app/home");
		}
	},

	send: function(req, res, next){
		if(req.isSocket && req.param('content')){
			console.log("Socket id " + req.socket + " sent message: " + req.param('content'));

			var recipientSocket = sails.config.app.getSocketId(req.session.chat.recipient);

			var dbSlave = {
				from: req.session.user.id,
				to: req.session.chat.recipient,
				content: req.param('content'),
			};

			if(!recipientSocket){
				dbSlave.unread = true;
			}

			console.log(dbSlave);

			Message.create(dbSlave, function(err, message){
				if(err){
					console.log(err);
				}
				else{

					var socketSlave = {
						id: message.id,
						message: message.content,
						from: message.from,
					};					

					console.log(socketSlave);
					
					var destinationSocket = [];
					destinationSocket.push(req.session.chat.mySocketId);

					if(recipientSocket){
						destinationSocket.push();
					}

					sails.sockets.emit(destinationSocket, 'message', socketSlave);
				}
			});
		}
		else{
			res.redirect("/app/home");
		}
	},

};

