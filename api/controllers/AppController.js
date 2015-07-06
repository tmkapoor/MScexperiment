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

							for(var i=0 ; i<avail.length ; i++){
								var test = sails.config.app.online.filter(function(el){
									return el.id === avail[i].id;
								});

								if(test.length > 0){
									avail[i].online = true;
								}
								else{
									avail[i].online = false;	
								}
							}

							var viewSlave = {
								attached: req.session.user.attached,
								attachedTo: req.session.user.attachedTo,
								available: avail,
								me: req.session.user.id,
								mySname: req.session.user.sname,
								unread: unread,
							};

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
	},

	init: function(req, res, next){
		//Add db check here, also get sname of the user
		if (req.session.user.attached == true) {
			var to = req.session.user.attachedTo;
		}
		else{
			var to = req.param("id");
		}

		User.findOne({id: to }).exec(function(err, user){
			if(err){
				sails.config.app.setFlashMessage(req, "Unable to connect to database", "error");
				res.redirect("/app/home");
			}
			else{
				if(user.length <= 0){
					sails.config.app.setFlashMessage(req, "No such user found, sorry :(", "error");
					res.redirect("/app/home");		
				}
				else{
					req.session.chat = {
						recipient: to,
					};

					res.redirect("/app/chat");
				}
			}
		});
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

					Message.find().where({from: [req.session.user.id, req.session.chat.recipient], to: [req.session.chat.recipient, req.session.user.id]}).sort("id DESC").limit(256).exec(function(err, messages){
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

							var viewSlave = {
								me: req.session.user.id,
								recipient: user.id, 
								recipientSname: user.sname,
								recipientOnline: sails.config.app.getSocketId(user.id),
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
