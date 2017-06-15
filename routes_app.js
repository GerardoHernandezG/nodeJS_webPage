var express = require("express");
var Imagen = require("./models/imagenes");
var router = express.Router();
//modulo de express que nos sirve para mover un archivo de un lugar a otro (en este caso será una imagen de temp a /imagenes)
var fs = require("fs"); 


var image_finder_middleware = require("./middlewares/find_image");  //cargar el middleware find_image

/* localhost:3000/app/ */  
//Configurar solo los usuarios que hayan iniciado sesión pueden entrar a /app

router.get("/",function(req,res){
	//buscar el usuario
	Imagen.find({})
		  .populate("creator") //traer datos del creator con el join
		  .exec(function(err,imagenes){
		  	if(err) console.log(err);
		  	res.render("app/home",{imagenes:imagenes});
		  });	
;});

/* Arquitectura REST PARA UN CRUD DE IMAGENES con los métodos GET, POST, PUT, DELETE */

router.get("/imagenes/new",function(req,res){
	res.render("app/imagenes/new");
});

//se aplica el middleware a todas las rutas que tengan la url de abajo (busqueda por id), 
//el * indica todo lo que contenga la url despues de /imagenes/:id
router.all("/imagenes/:id*", image_finder_middleware); 

router.get("/imagenes/:id/edit", function(req,res){	
	res.render("app/imagenes/edit");	
});

//para imagen individual
router.route("/imagenes/:id")
	.get(function(req,res){  //obtener un elemento
		//despues del submit del post entramos en esta peticion
		//buscamos en el modelo la imagen guardada, pero con el metodo de router.all, se quita el finder para no repetir codigo
		//Imagen.findById(req.params.id, function(err,imagen){
			//res.render("app/imagenes/show", {imagen: imagen});
			//en el callback podemos hacer el render de la imagen, y pasamos como parametro la imagen que ya con el find_image.js no se necesita
		//});
		res.render("app/imagenes/show");		
	})
	.put(function(req,res){ //actualizar elemento		
		res.locals.imagen.title = req.fields.title;
		res.locals.imagen.save(function(err){
			if(!err){
				res.render("app/imagenes/show");
			}else{
				//res.render("app/imagenes/"+imagen.id+"/edit");
				res.render("app/imagenes/"+req.params.id+"/edit");
			}
		});			
	})
	.delete(function(req,res){ //eliminar imagen

		//se puede eliminar tambien así, pero implica hacer dos queries a la bd
		//puede servir más si queremos hacer más cosas con la imagen antes de eliminarla
		// Imagen.findById(req.params.id, function(err,imagen){
		// 	Imagen.remove();
		// });	

		//Éste método Elimina únicamente el que se le está mandando
		Imagen.findOneAndRemove({_id: req.params.id},function(err){
			if(!err){
				res.redirect("/app/imagenes");
			}else{
				console.log(err);
				res.redirect("/app/imagenes"+req.params.id);
			}
		});
	});

//para todas las imagenes o conjunto de imagenes
router.route("/imagenes")
	.get(function(req,res){ //obtener elementos
		Imagen.find({creator: res.locals.user._id},function(err,imagenes){ 
			//en la condición del finder ponemos que sólo muestre al usuario las imágenes que éste creó
			if(err){
				res.redirect("/app"); return; //con return se evita que se ejecute el resto del codigo, solo hacer el redirect
			}
			res.render("app/imagenes/index", {imagenes: imagenes});
		});
	})
	.post(function(req,res){  //crear elementos
		//obtenemos los datos del post
		var extension = req.files.archivo.name.split(".").pop();  //pop retorna el ultimo elemento del arreglo
		//con formidable accedemos a los archivos con req.files y a los campos con req.fields		
		var data = {
			title: req.fields.title,
			creator: res.locals.user._id,
			extension: extension			
		}

		//creamos una instancia del model Imagen
		var imagen = new Imagen(data);

		imagen.save(function(err){
			if(!err){
				//pasar la imagen de temp a /imagenes y renombrar
				fs.rename(req.files.archivo.path, "public/imagenes/"+imagen._id+"."+extension);
				res.redirect("/app/imagenes/"+imagen._id);
				//si no hay error redireccionamos a la ruta /imagenes/:id por el metodo get y hacemos render de show
			}
			else{
				res.render(err);
			}
		});
	});
	
module.exports = router; //exportamos el objeto renutas