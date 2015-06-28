/**
 * AppController
 *
 * @description :: Server-side logic for managing apps
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	home: function(req, res, next){

		User.find().exec(function(err, users){
			if(err){
				sails.config.setFlashMessage(req, ["Unable to connect try database, try again or contact administrator."], "error");
				res.redirect("/app/home");
			}
			else{
				if(users.length > 0){

					Message.find().where({to: req.session.user.id, unread: true}).exec(function(err, messages){
						if(err){
							sails.config.setFlashMessage(req, ["Unable to connect try database, try again or contact administrator."], "error");
							res.redirect("/app/home");
						}
						else{

							console.log(messages.length + " unread messages were found.");

							if(req.session.user.attached){
								var avail = users.filter(function(el){
									return el.id === req.session.user.attachedTo;
								});
							}
							else{
								var avail = users.filter(function(el){
									return el.attached == false && el.id != req.session.user.id;
								});
							}

							var unread = [];

							for(var i=0 ; i<messages.length ; i++){
								if(!unread[messages[i].from])
									unread[messages[i].from] = 1;
								else
									unread[messages[i].from]++;
							}

							console.log(unread);

							var viewSlave = {
								attached: req.session.user.attached,
								attachedTo: req.session.user.attachedTo,
								available: avail,
								me: req.session.user.id,
								mySname: req.session.user.sname,
								unread: unread,
							};

							console.log(viewSlave);

							res.view(viewSlave);
						}
					});
				}
				else{
					sails.config.setFlashMessage(req, ["Something went gravely wrong, contact administrator ASAP !"], "error");
					res.redirect("/app/home");
				}
			}
		});

		/*if(req.session.user.attached){

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
							mySname: req.session.user.sname,
							attachedToSname: user.sname,
						};

						console.log(viewSlave);

						res.view(viewSlave);
					}
				}
			});
		}
		else{

		}*/

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

		User.findOne({id: req.session.chat.recipient }).limit(256).exec(function(err, user){
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

					Message.find().where({from: [req.session.user.id, req.session.chat.recipient], to: [req.session.chat.recipient, req.session.user.id]}).exec(function(err, messages){
						if(err){
							sails.config.setFlashMessage(req, "Unable to connect to databse.");
							console.log(err);
						}
						else{

							Message.update({to: req.session.user.id, from: req.session.chat.recipient, unread: true}, {unread: false}).exec(function(err, messages){
								if(!err){
									console.log("Marked unread messages as read.");
								}
							});

							console.log("Found these many messages: " + messages.length);
							var viewSlave = {
								me: req.session.user.id,
								recipient: user.id, 
								recipientSname: user.sname,
								recipientOnline: user.online,
								messages: messages,
							};
							res.view(viewSlave);
						}
					});
				}
			}
		});
	},

};