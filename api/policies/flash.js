module.exports = function(req, res, next){
	res.locals.flash = {};

	if(req.session.flash && req.session.flash.msg ){
		console.log("*** FLASH MESSAGE");
		console.log(req.session.flash);
		res.locals.flash = _.clone(req.session.flash);
		req.session.flash = {};
	}
	
	next();
};