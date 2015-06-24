/**
 * AppController
 *
 * @description :: Server-side logic for managing apps
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	home: function(req, res, next){

		User.findOne({id: req.session.user.attachedTo }).exec(function(err, user){
			if(err){
				sails.config.app.setFlashMessage(req, "Unable to connect to database", "error");
				res.redirect("/app/home");
			}
			else{
				if(user.length <= 0){
					sails.config.app.setFlashMessage(req, "Unable to connect to database", "error");
					res.redirect("/app/home");		
				}
				else{

					//Subscribe to Users model

					var viewSlave = {
						attached: req.session.user.attached,
						attachedTo: req.session.user.attachedTo,
						online: sails.config.app.online,
						favorites: ["something", "something else"],
						me: req.session.user.id,
						attachedToSname: user.sname,
					};

					console.log(viewSlave);

					res.view(viewSlave);
				}
			}
		});
	},

	init: function(req, res, next){
		//Add db check here, also get sname of the user
		if (req.session.user.attached == true) {
			var to = req.session.user.attachedTo;
		}
		else{
			var to = req.param("connectTo");
		}

		req.session.chat = {
			recipient: to,
		};

		res.redirect("/app/chat");
	},

	chat: function(req, res, next){

		User.findOne({id: req.session.chat.recipient }).exec(function(err, user){
			if(err){
				sails.config.app.setFlashMessage(req, "Unable to connect to database", "error");
				res.redirect("/app/home");
			}
			else{
				if(user.length <= 0){
					sails.config.app.setFlashMessage(req, "Unrecognised recipient, contact admin or try again.", "error");
					res.redirect("/app/home");		
				}
				else{

					Message.find(
						[{from: req.session.user.id, to: req.session.chat.recipient},
						{to: req.session.user.id, from: req.session.chat.recipient},]).exec(function(err, messages){
						if(err){
							sails.config.setFlashMessage(req, "Unable to connect to databse.");
							console.log(err);
						}
						else{
							console.log("Found these many messages: " + messages.length);
						}
					});

					var viewSlave = {
						me: req.session.user.id,
						recipient: user.id, 
						recipientSname: user.sname,
						recipientOnline: user.online,
					};

					console.log("\n\n From /app/chat logging session.chat");
					console.log(req.session.chat);

					//Push self to online list
					/*sails.config.app.online.push({
						id: req.session.user.id,
						sname: req.session.user.sname,
						socketId: req.session.chat.mySocketId,
					});*/

					req.session.chat.recipientSname = viewSlave.recipientSname;

					res.view(viewSlave);
				}
			}
		});
	},

};
