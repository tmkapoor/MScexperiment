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

