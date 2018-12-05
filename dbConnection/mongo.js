const mongoose = require('mongoose');
 // Set a Mongoose Promise Library
mongoose.Promise = global.Promise;
const dbpassword = process.env.DB_PASSWORD;
const dbuser = process.env.DB_USER;
const dbURI = process.env.MONGODB_URI || `mongodb://${dbuser}:${dbpassword}@ds119688.mlab.com:19688/outbooked`;
mongoose.connect(dbURI, { useNewUrlParser: true });
mongoose.connection.once('open', () => {
  console.log('Mongo Connected.')
});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection Error:'));
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false); // corrects the annoying DeprecationWarning
// mongoose.set('debug', true);
