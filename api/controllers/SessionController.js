/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	new: function(req,res,next){
		res.view();
	},

	create: function(req, res, next){
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


		//Remove entry from online array
		Object.keys(sails.config.app.online).forEach(function(key) {
			var obj = sails.config.app.online[key];
			console.log(key + " :: ");
			console.log(obj);
			if(obj[0] == req.session.user.id){
				sails.config.app.splice(key, 1);
			}
		});

		sails.config.app.online

		req.session.authenticated = false;
		delete req.session.authenticated;

		req.session.user = {};
		delete req.session.user;

		res.redirect('/session/new');
	},
};

