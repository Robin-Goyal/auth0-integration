
const { connectionString } =  require('../../config/constants');
const mongoose = require('mongoose');

//define the schema for our user model
const userSchema = mongoose.Schema({	
	_id:{ type: Number, default: 1 },
	name: String,
	email: String,
	status: String,
	created_date: Date,
	updated_date: Date,
	role_id: { type: Number, default: 2 }
});


mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}).then((response) => {
		console.log('mongo connection created')
	}).catch((err) => {
	console.log("Error connecting to Mongo")
	console.log(err);
});

mongoose.set('debug', true);

//create the model for users and expose it to our app
const userModel = mongoose.model('users', userSchema);

module.exports = userModel;