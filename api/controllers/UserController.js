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

	adminEdit: function(req, res, next){

	},
};

