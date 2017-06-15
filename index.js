/* El monitor nodemon instalado así: npm install -g nodemon, nos permite monitorizar cambios en el codigo
y reiniciar el server automaricamente sin tener que esta haciendolo manualmente cada que hagamos cambios al codigo */
var express = require("express");
var bodyParser = require("body-parser"); //Con body-parser podemos leer los parametros que vienen en nuestras peticiones
var app = express();
var User = require("./models/user").User; //no es necesario colocar .js
//var session = require("express-session"); //la informacion se pierde y la memoria se libera
var cookieSession = require("cookie-session");  //es mejor para preservar las sesiones aunque reiniciemos el servidor js
var router_app = require("./routes_app");  //mandamos llamar el modulo de las rutas
var session_middleware = require("./middlewares/session");
var methodOverride = require("method-override");  //cargamos el middleware para los metodos del form
var formidable = require("express-formidable"); //middleware parser para subir archivos


app.use("/public",express.static('public'));  
/*	montar el middleware para archivos estaticos, el primer parametro es el prefijo para la ruta 
	para generalizar las rutas sin contaminar las url con varias rutas
	todo lo que esta en public se puede acceder a traves de una url
	app.use(express.static('assets')); //se pueden usa multiples folders para montar los middlewares 
*/

//Inicializamos las configuraciones de body-parser
//app.use(bodyParser.json()); //nos sirve para peticiones tipo application/json
//app.use(bodyParser.urlencoded({extended: true})); //permite leer los elementos de todo tipo, al establecer extended = true, permitimos tambien arreglos y otros elementos
app.use(methodOverride("_method"));  //al inicializar el override, el nombre que se le pone es el name del hidden que se manda en los forms

// //middleware para sessions donde estableces un random secret y otras configuraciones
// app.use(session({
// 	secret: "34sdsafwewd",
// 	resave: false, //true: la session se vuelve a guardar aunque no haya sido modificada
// 	saveUninitialized: false //reduce espacio del store, indica si la sesion debe guardarse aunque no este inicializada, es nueva pero no ha sido modificada
// }));  

app.use(cookieSession({
	name: "session",
	keys: ["llave-1", "llave-2"]	
}));

//cofniguramos la app, para que use formidable, ya no se necesita body-parser, cambiar req.body por req.fields cuando recibamos parametros por post o put
app.use(formidable({keepExtensions: true}));

app.set("view engine", "jade");  //jade es un motor de vistas para nodejs


/* Seccion de rutas url */

app.get("/", function(req,res){		
	res.render("index");  //home de la pagina
});

app.get("/signup", function(req,res){
	User.find(function(err,doc){
		//console.log(doc);
		res.render("signup");
	});
	
});

app.get("/login", function(req,res){
	User.find(function(err,doc){		
		res.render("login");
	});
	
});

app.post("/users", function(req,res){	
	var user = new User({email: req.fields.email, 
						 password: req.fields.password, 
						 password_confirmation: req.fields.password_confirmation,
						 username: req.fields.username,
						});
	//console.log(user.password_confirmation);  //mostrar el atributo virtual, no se refleja en la base de datos
	//las validaciones hechas en el modelo con mongoose se pueden desplegar en el metodo user.save en el callback
	user.save().then(function(us){
		res.send("Guardamos el usuario exitosamente");
	},function(err){
		console.log(String(err));
		res.send("Hubo un error al guardar el usuario");
	});	
});

app.post("/sessions", function(req,res){
	//User.findOne, User.findById("id", callback);		
	User.findOne({email:req.fields.email, password:req.fields.password}, function(err,user){
		if(!user){
			//res.send("Datos Incorrectos");
			res.redirect("/login");
		}else{
			//el session de express tiende a ocupar mucha memoria en produccion, es dificilmente escalable. Revisar este punto
			//req.session.user_id = {} se puede mandar un array json de elementos
			req.session.user_id = user._id;
			//Se le asigna el user._id al req.session.user_id para luego validarlo en el middleware session.js
			res.redirect("/app");
		}		
	});
});

app.use("/app", session_middleware);  //para cargar el modulo de session en la app
//primero se establece el middleware de sessions
app.use("/app", router_app);  //Con esto le decimos al servidor que cargue todas las rutas establecidas en el modulo routes, el prefijo puede ser el que sea


/* FIN Seccion de rutas url */


app.listen(3000, function(){
	console.log("Servidor iniciado...");
});