var models = require('../models/models.js');

// Autoload - factoriza el codigo si ruta incluye :quizId
exports.load = function(req, res, next, quizId)
{
  models.Quiz.find({
    where: { id: Number(quizId)},
    include: [{ model: models.Comment}]
  }).then(function(quiz)
  {
      if (quiz)
      {
        req.quiz = quiz;
        next();
      }
      else
      {
        next(new Error('No existe quizId=' + quizId));
      }
  }).catch(function(error) { next(error); });
}

// GET /quizes/
exports.index = function(req, res)
{
  var search = (req.query.search || '').trim();
  var options = {};
  var search_where = '';

  if (search !== '')
  {
    search_where = '%' + search.replace(' ', '%') +'%';
    options = {where: ['pregunta LIKE ?', search_where], order: 'pregunta ASC'};
  }

  models.Quiz.findAll(options).then(function(quizes)
  {
    res.render('quizes/index', { quizes: quizes , search: search , errors: [] });
  });
}

// GET /quizes/statistics
exports.statistics = function(req, res)
{
  var options = {
    include: [{ model: models.Comment}]
  };

  models.Quiz.findAll(options).then(function(quizes)
  {
      var statistics = {
        totalQuiz: quizes.length
      , totalComments: 0
      , numQuizComments: 0
      , numQuizNoComments: 0
      };

      for (var i = 0 ; i < quizes.length; i++)
      {
        var numComments = quizes[i].Comments.length;

        statistics.totalComments += numComments;
        if (numComments)
        {
          statistics.numQuizComments++;
        }
        else
        {
          statistics.numQuizNoComments++;
        }
      }

      res.render('quizes/statistics', { stats: statistics
                                      , errors: [] });
  });
}

// GET /quizes/new
exports.new = function(req, res)
{
  var quiz = models.Quiz.build( // crea objeto quiz
    { pregunta: "", respuesta: "", tema: "" }
  );

  res.render('quizes/new', { quiz: quiz , errors: [] });
}

// GET /quizes/:id/edit
exports.edit = function(req, res)
{
  var quiz = req.quiz; // Autoload de instancia de quiz

  res.render('quizes/edit', { quiz: quiz , errors: [] });
}

// POST /quizes/create
exports.create = function(req, res)
{
  var quiz = models.Quiz.build( req.body.quiz );

  quiz.validate()
  .then(function(err)
  {
    if (err)
    {
      res.render('quizes/new', { quiz: quiz, errors: err.errors });
    }
    else
    {
      quiz
      .save({fields: ["pregunta", "respuesta", "tema"]})
      .then(function()
      {
          res.redirect('/quizes'); // Redireccion HTTP (URL relativo) lista de preguntas
      });
    }
  }).catch(function(error){next(error);});
}

// PUT /quizes/:id
exports.update = function(req, res)
{
  req.quiz.pregunta = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  req.quiz.validate()
  .then(function(err)
  {
    if (err)
    {
      res.render('quizes/edit', { quiz: req.quiz, errors: err.errors });
    }
    else
    {
      req.quiz
      .save({fields: ["pregunta", "respuesta", "tema"]})
      .then(function()
      {
          res.redirect('/quizes'); // Redireccion HTTP (URL relativo) lista de preguntas
      });
    }
  }).catch(function(error){next(error);});
}

// DELETE /quizes/:id
exports.destroy = function(req, res)
{
  req.quiz.destroy()
  .then(function(err)
  {
    res.redirect('/quizes'); // Redireccion HTTP (URL relativo) lista de preguntas
  }).catch(function(error){next(error);});
}

// GET /quizes/:quizId(\\d+)
exports.show = function(req, res)
{
  res.render('quizes/show', { quiz: req.quiz , errors: [] });
}

// GET /quizes/:quizId(\\d+)/answer
exports.answer = function(req, res)
{
  var resultado = 'Incorrecto';

  if (req.query.respuesta === req.quiz.respuesta)
  {
    resultado = 'Correcto';
  }

  res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado , errors: [] });
}
