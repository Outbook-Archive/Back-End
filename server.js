require('dotenv').config();
const path = require('path')
const express = require('express');
const bodyParser = require('body-parser')
//hbs will be replace with React
const hbs = require('express-handlebars')
const methodOverride = require('method-override')
const app = express();
const port = process.env.PORT || 8080;

//Future db connection

app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/'
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

//Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// override with POST having ?_method=DELETE & ?_method=PUT
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'));
app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.get('/', (req, res) => {
  res.render('index.hbs', {})
});

module.exports = app.listen(port, () => {
    console.log(`On server port: ${port}`)
});
