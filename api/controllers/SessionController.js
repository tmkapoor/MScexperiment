/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	new: function(req,res,next){
		if(req.session.authenticated && req.session.authenticated == true){
			sails.config.app.setFlashMessage(req, ["You are already logged in :)"], "info");
			res.redirect("/app/home");
		}
		else{
			res.view();
		}
	},

	create: function(req, res, next){

		if(req.session.authenticated && req.session.authenticated == true){
			res.redirect("/app/home");
		}

		var dbSlave = req.params.all();

		if(dbSlave.email && dbSlave.email != "" && dbSlave.password && dbSlave.password != ""){
			User.findOne({email: dbSlave.email}, function(err, user){
				if(err){
					req.session.flash = {
						msg: ["You need to enter both email and password"],
						type: "error"
					};
					res.redirect("/session/new");
				}
				else{
					if(!user || user.length == 0){
						req.session.flash = {
							msg: ["No such user was found."],
							type: "error"
						};
						res.redirect("session/new");
					}
					else{
						require('bcrypt').compare(dbSlave.password, user.password, function(err, valid){
							if(err){
								req.session.flash = {
									msg: ["Unable to connect to database"],
									type: "error",
								};
								res.redirect("/session/new")
							}
							else{
								if(!valid){
									req.session.flash = {
										msg: ["Incorrect password"],
										type: "error",
									};
									res.redirect("/session/new");
								}
								else{
									//Set user online

									var userObj = {
										id: user.id,
										sname: user.sname,
										admin: user.admin,
										email: user.email,
										attached: user.attached,
										attachedTo: user.attachedTo,
									};

									req.session.authenticated = true;
									req.session.user = userObj;

									//Change status to online in db

									res.redirect('/app/home');
								}
							}
						});
					}
				}

			});
		}
		else{
			req.session.flash = {
				msg: ["You need to enter both username and password."],
				type: "error",
			};

			res.redirect('/session/new');
		}
	},

	destroy: function(req, res, next){

		if(req.session.authenticated){
			for(var i=0 ; i<sails.config.app.online.length ; i++){
				if(sails.config.app.online[i].id == req.session.user.id){
					sails.config.app.online.splice(i, 1);
				}
			}
		}

		req.session.authenticated = false;
		delete req.session.authenticated;

		req.session.user = {};
		delete req.session.user;

		User.publishUpdate(session.user.id, { online: false});

		sails.config.app.setFlashMessage(req, ["You have successfully logged out."], "success");

		res.redirect('/session/new');
	},
};

