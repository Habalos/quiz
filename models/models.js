var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name   = (url[6] || null);
var user      = (url[2] || null);
var pwd       = (url[3] || null);
var protocol  = (url[1] || null);
var dialect   = (url[1] || null);
var port      = (url[5] || null);
var host      = (url[4] || null);
var storage   = process.env.DATABASE_STORAGE;

// Cargar modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite
var sequelize = new Sequelize(DB_name, user, pwd,
                             {
                              dialect:  dialect,
                              protocol: protocol,
                              port:     port,
                              host:     host,
                              storage:  storage,   // solo SQLite (.env)
                              omitNull: true       // solo Postgres
                             });

// Importar la definicion de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));
var Comment = sequelize.import(path.join(__dirname, 'comment'));

// Creamos la relacion 1 a N
Comment.belongsTo(Quiz); // 1 comentario pertenece a 1 Quiz
Quiz.hasMany(Comment);   // Quiz puede tener varios Comment

exports.Quiz = Quiz; // Exportar definicion de la tabla Quiz
exports.Comment = Comment;

// sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().then(function()
{
  // success(..) ejecuta el manejador una vez creada la tabla
  Quiz.count().then(function(count)
  {
    if (count === 0) // La tabla inicializa si esta vacia
    {
      Quiz.create({ pregunta: 'Capital de Italia',
                    respuesta: 'Roma',
                    tema: 'humanidades'
                 });
      Quiz.create({ pregunta: 'Capital de España',
                    respuesta: 'Madrid',
                    tema: 'humanidades'
                 });
      Quiz.create({ pregunta: 'Capital de Portugal',
                   respuesta: 'Lisboa',
                   tema: 'humanidades'
                 })
      .then(function(){ console.log('Base de datos inicializada'); });
    }
  });
});
