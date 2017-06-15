var Imagen = require("../models/imagenes");

//middleware para dar permisos a las imagenes
module.exports = function(image,req,res){  //la funcion debe recibir la imagen como parametro que ya tiene el creator, tambien la solicitud y respuesta

	//si el metodo es get y el path no es edit muestrala a todos, se evalua primero para ver la imagen
	if(req.method === "GET" && req.path.indexOf("edit") < 0){
		//True: tienes permisos, si retorna False: no tienes permisos
		//Para ver la imagen
		return true;
	}


	//validamos si el creator de la imagen es undefined, retornar false
	if(typeof image.creator == "undefined"){
		return false;
	} 

	//si el creador es el user loggeado muestra la imagen
	if(image.creator._id.toString() == res.locals.user._id){		
		return true;
	}

	//si no entran las validaciones no la muestres
	return false;
}