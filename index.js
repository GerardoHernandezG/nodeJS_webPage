/* El monitor nodemon instalado así: npm install -g nodemon, nos permite monitorizar cambios en el codigo
y reiniciar el server automaricamente sin tener que esta haciendolo manualmente cada que hagamos cambios al codigo */
var express = require("express");
var app = express();
var User = require("./models/user").User; //not necessary to put .js
var session = require("express-session");
var router_app = require("./routes_app");
var session_middleware = require("./middlewares/session");
var methodOverride = require("method-override");  //middleware for the form methods: put, delete
var formidable = require("express-formidable"); //middleware parser, para subir archivos

app.use("/public",express.static('public')); 

app.use(methodOverride("_method"));  //al inicializar el override, el nombre que se le pone es el name del hidden que se manda en los forms

app.use(formidable({keepExtensions: true}));

//independiente del middleware de sesiones, este config es para la redis_Store
app.use(session({ 
	//store: new RedisStore({}), 
	resave: true,
	secret: '123456', 
	saveUninitialized: true	
}));

app.set("view engine", "jade");  //views engine for nodejs


/* Seccion de rutas url */

app.get("/", function(req,res){		
	res.render("index");  //web site index
});

app.get("/signup", function(req,res){
	User.find(function(err,user){
		//console.log(user);
		res.render("signup");
	});
	
});

app.get("/login", function(req,res){
	User.find(function(err,user){		
		res.render("login");
	});
	
});

app.post("/users", function(req,res){	
	var user = new User({email: req.fields.email, 
						 password: req.fields.password, 
						 //atributo virtual, no se refleja en la base de datos
						 password_confirmation: req.fields.password_confirmation,
						 username: req.fields.username,
						});
	//las validaciones hechas en el modelo con mongoose se pueden desplegar en el metodo user.save en el callback
	user.save().then(function(us){
		//res.send("Guardamos el usuario exitosamente");
		res.render("login");
	},function(err){
		console.log(String(err));
		//res.send("Hubo un error al guardar el usuario");
	});	
});

app.post("/sessions", function(req,res){
	//User.findOne, User.findById("id", callback);		
	User.findOne({email:req.fields.email, password:req.fields.password}, function(err,user){
		if(!user){
			//res.send("Datos Incorrectos");
			res.redirect("/login");
		}else{
			req.session.user_id = user._id;
			//console.log(req.session);
			//el session de express tiende a ocupar mucha memoria en produccion, es dificilmente escalable. Revisar este punto
			//req.session.user_id = {} se puede mandar un array json de elementos			
			//Se le asigna el user._id al req.session.user_id para luego validarlo en el middleware session.js
			res.redirect("/app");
		}		
	});
});

app.get('/logout',function(req,res){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        } else {
            res.render("index");  //web site index
        }
    });
});

app.use("/app", session_middleware);  //inicializa middleware session en la app
//primero se establece el middleware de sessions
app.use("/app", router_app);  //cargar todas las rutas establecidas en el modulo routes, el prefijo puede ser el que sea


/* FIN Seccion de rutas url */


app.listen(3000, function(){
	console.log("Servidor iniciado...");
});