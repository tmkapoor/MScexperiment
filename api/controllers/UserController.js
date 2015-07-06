/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	new: function(req, res, next){
		if(req.session.authenticated && req.session.authenticated == true){
			sails.config.app.setFlashMessage(req, ["You are already Signed up and logged in :)"], "info");
			res.redirect("/app/home");
		}
		res.view();
	},

	create: function(req, res, next){

		if(req.session.authenticated && req.session.authenticated == true){
			res.redirect("/app/home");
		}

		var holder = req.params.all();

		console.log(holder);

		if(!holder.sname || !holder.email || !holder.emailcheck || !holder.password || !holder.confirmation){
			sails.config.app.setFlashMessage(req, ["Please fill in all the fields"], "error");
			res.redirect('/user/new');
		}
		else{

			if(holder.email != holder.emailcheck){
				sails.config.app.setFlashMessage(req, ["You emails didn't match"], "error");
				res.redirect('/user/new');
			}
			else if(holder.password != holder.confirmation){
				sails.config.app.setFlashMessage(req, ["You passwords didn't match"], "error");
				res.redirect('/user/new');
			}
			else{


				User.find({sname: holder.sname}).exec(function(err, user){
					if(!err){
						if(user.length > 0){
							sails.config.app.setFlashMessage(req, ["The screen name '" + holder.sname + "' is already taken, try another"], "error");
							res.redirect("/user/new");
						}
					}
				});

				var encPassword = "";
				dbSlave = {};

				require('bcrypt').hash(holder.password, 10, function passwordEncrypted(err, encryptedPassword){
				    if (err){
				    	return next(err);
				    }

			      	dbSlave = {
						sname: holder.sname,
						email: holder.email,
						password: encryptedPassword,
						online: 0,
					};

					User.create(dbSlave, function userCreated(err, user){
						if(err){
							sails.config.app.setFlashMessage(req, ["An error occured."], "error");
							console.log(err);
						}
						else{
							sails.config.app.setFlashMessage(req, ["You have succesfully created your account."], "success");
							console.log(user);
							res.redirect('/session/new');
						}
					});
				});
			}
		}
	},

	adminEdit: function(req, res, next){

		User.find().exec(function(err, users){
			if(err){
				sails.config.app.setFlashMessage(req, ["Unable to connect to database"], "error");
			}
			else{
				res.view({
					users: users
				});
			}
		});

	},

	unattach: function(req, res, next){
		var id = req.param("id");

		User.update({id: id}, {attached: false, attachedTo: -1}).exec(function(err, user){
			if(err){
				sails.config.app.setFlashMessage(req, ["Some error occured"], "error");
				console.log(err);
				res.redirect("/user/adminEdit");
			}
			else{
				sails.config.app.setFlashMessage(req, ["Success !"], "success");
				res.redirect("/user/adminEdit");
			}
		});
	},

	attach: function(req, res, next){

		var id1 = req.param("id1");
		var id2 = req.param("id2");

		User.update({id: id1}, {attached: true, attachedTo: id2}).exec(function(err, user){
			if(err){
				sails.config.app.setFlashMessage(req, ["Some error occured in updating id1 "+id1], "error");
				console.log(err);
				res.redirect("/user/adminEdit");
			}
			else{
				User.update({id: id2}, {attached: true, attachedTo: id1}).exec(function(err, user){
					if(err){
						sails.config.app.setFlashMessage(req, ["Some error occured in updating id2 "+id2], "error");
						console.log(err);
						res.redirect("/user/adminEdit");
					}
					else{
						sails.config.app.setFlashMessage(req, ["Success !"], "success");
						res.redirect("/user/adminEdit");
					}
				});
			}
		});

	},

	subToUser: function(req, res, next){
		if(req.isSocket){
			User.find({}).exec(function(err, users){
				if(!err){
					console.log(req.socket.id + " asked to subscribe to the user model.");
					User.subscribe(req.socket, users);
				}
			});
		}
		else{
			res.redirect("/app/home");
		}
	},
};

