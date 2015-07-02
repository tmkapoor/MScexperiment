/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	subToMessage: function(req, res, next){
		if(req.isSocket){
			Message.find({}).exec(function(err, messages){
				if(!err){
					Message.watch(req);
				}
			});
		}
		else{
			res.redirect("/app/home");
		}
	},

	send: function(req, res, next){
		if(req.isSocket && req.param('content')){

			var socketStatus = sails.config.app.getSocketId(req.session.chat.recipient);

			var recipientSocket = (socketStatus)? socketStatus.id : false;

			var dbSlave = {
				from: req.session.user.id,
				to: req.session.chat.recipient,
				content: req.param('content'),
			};

			if(!recipientSocket){
				dbSlave.unread = true;
			}

			console.log("\n\n*********\n MSG\n*********");
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
					
					var destinationSocket = [];
					destinationSocket.push(req.session.chat.mySocketId);

					if(recipientSocket){
						destinationSocket.push(recipientSocket);
					}

					console.log(destinationSocket);

					sails.sockets.emit(destinationSocket, 'message', socketSlave);
				}
			});
		}
		else{
			res.redirect("/app/home");
		}
	},

};

