/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	new: function(req, res, next){
		res.view();
	},

	create: function(req, res, next){
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
					console.log("An error has occured.");
					console.log(err);
				}
				else{
					console.log("User successfully created.");
					console.log(user);
					res.redirect('/user');
				}
			});
		});
	},

	test: function(req, res, next){
		User.find({sname: ["tmk", "dumpy"]}).exec(function(err, users){
			res.send(users);
		});
	},

	adminEdit: function(req, res, next){
		
	},
};

