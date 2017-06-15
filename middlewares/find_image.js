var Imagen = require("../models/imagenes");
var owner_check = require("../middlewares/image_permission");

//este middleware ayuda a refactorizar el codigo para no estár repitiendo muchas queries repetidas en routes_app de la busqueda de imagenes
module.exports = function(req,res,next){
	Imagen.findById(req.params.id) 
		  .populate("creator") //join de la imagen con el creator
		  .exec(function(err,imagen){
				if(imagen != null && owner_check(imagen,req,res)){
					//console.log(imagen.title);
					//Si se econtró la imagen, la almacenamos en el objeto res.locals para poder acceder despues a ella directamente en las vistas
					//console.log(imagen.creator);
					res.locals.imagen = imagen;
					next();
				}else{
					//si no se encuentra la imagen redireccionamos a app
					res.redirect("/app");
				}
	});
}