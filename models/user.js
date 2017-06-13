var mongoose = require("mongoose");
var Schema = mongoose.Schema; //Constructor de schemas

mongoose.connect("mongodb://localhost/fotos"); //Conexión a mongodb

/* 
	String
	Number
	Date
	Buffer
	Boolean
	Mixed
	Objected
	Array
*/

var posibles_valores = ["M", "F"];

var email_match = [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Email no válido"]; //expresión regular para emails

//esta validacion se pone en la parte validate del password en donde validamos el virtual de password validation
var password_validation = {
	validator: function(p){		
		return this.password_confirmation == p;
	},
	message: "Las contraseñas no coinciden"
};

//la clase crea un objeto de estructura del objeto tabla users
var user_schema = new Schema({
	name: String,
	last_name:String,
	username: {type: String, required: true, maxlength: [50, "Username demasiado largo"]},
	password: {type: String, minlength: [8, "El password es muy corto"], validate: password_validation},
	age: {type: Number, min: [5, "Edad no puede ser menor a 5"], mex: [5, "Edad no puede ser mayor a 100"]},
	email: {type: String, required: "El correo es obligatorio", match: email_match},
	date_of_birth: Date,
	sex: {type: String, enum: {values: posibles_valores, message: "Opción no válida"}} //enum valida y solo acepta valores de tipo string, si ponen otro valor fuera del array, marca error
});


/* Virtuals, son atributos que se añaden a los documentos de las colecciones */
//Aqui se aplican directamente al schema, no al modelo
//Metodos geter and sether es cuando definimos la forma en que accedemos a un atributo
user_schema.virtual("password_confirmation").get(function(){
	return this.pass_conf;	
}).set(function(password){
	//el sether define como se asigna el valor
	this.pass_conf = password;
});  

//Primer parametro nombre del modelo y el segundo es el schema
var User = mongoose.model("User", user_schema);  //crear modelo de usuarios

module.exports.User = User;