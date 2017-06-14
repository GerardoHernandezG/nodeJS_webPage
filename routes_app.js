var express = require("express");
var Imagen = require("./models/imagenes");
var router = express.Router();

/* localhost:3000/app/ */  
//Configurar solo los usuarios que hayan iniciado sesión pueden entrar a /app

router.get("/",function(req,res){
	//buscar el usuario
	
	res.render("app/home");
});

/* Arquitectura REST PARA UN CRUD DE IMAGENES con los métodos GET, POST, PUT, DELETE */

router.get("/imagenes/new",function(req,res){
	res.render("app/imagenes/new");
});

router.get("/imagenes/:id/edit", function(req,res){
	Imagen.findById(req.params.id, function(err,imagen){
		res.render("app/imagenes/edit", {imagen: imagen});		
	});
});

//para imagen individual
router.route("/imagenes/:id")
	.get(function(req,res){
		//despues del submit del post entramos en esta peticion
		//buscamos en el modelo la imagen guardada
		Imagen.findById(req.params.id, function(err,imagen){
			res.render("app/imagenes/show", {imagen: imagen});
			//en el callback podemos hacer el render de la imagen, y pasamos como parametro la imagen
		});		
	})
	.put(function(req,res){
		Imagen.findById(req.params.id, function(err,imagen){
			imagen.title = req.body.title;
			imagen.save(function(err){
				if(!err){
					res.render("app/imagenes/show", {imagen: imagen});
				}else{
					res.render("app/imagenes/"+imagen.id+"/edit", {imagen: imagen});
				}
			});			
		});	
	})
	.delete(function(req,res){

	});

//para todas las imagenes o conjunto de imagenes
router.route("/imagenes")
	.get(function(req,res){
		Imagen.find({},function(err,imagenes){
			if(err){
				res.redirect("/app"); return; //con return se evita que se ejecute el resto del codigo, solo hacer el redirect
			}
			res.render("app/imagenes/index", {imagenes: imagenes});
		});
	})
	.post(function(req,res){
		//obtenemos los datos del post
		var data = {
			title: req.body.title
		}

		//creamos una instancia del model Imagen
		var imagen = new Imagen(data);

		imagen.save(function(err){
			if(!err){
				res.redirect("/app/imagenes/"+imagen._id);
				//si no hay error redireccionamos a la ruta /imagenes/:id por el metodo get y hacemos render de show
			}
			else{
				res.render(err);
			}
		})
	});
	
module.exports = router; //exportamos el objeto renutas