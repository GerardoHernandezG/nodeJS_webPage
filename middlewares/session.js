var User = require("../models/user").User;

module.exports = function(req,res,next){
	//se programa el middleware para validar la sesion	
	//console.log(req.session.user_id);
	if(!req.session.user_id){		
		res.redirect("/login");
	}
	else{	
		//En lugar de buscar el usuario en cada peticion de routes_app.js, lo buscamos aqui y no repetimos codigo
		User.findById(req.session.user_id, function(err, user){
			if(err){
				console.log(err);
				res.redirect("/login");
			}else{				
				res.locals = { user: user }; //le asignamos el array user al atributo locals del response				
				next(); //si el usuario es correcto se pasa al siguiente middleware
			}
		});		
	}
}