// MW de autorizacion de accesos HTTP restringidos
exports.loginRequired = function(req, res, next)
{
    if (req.session.user)
    {
        next();
    }
    else
    {
        res.redirect('/login');
    }
}

// Get /login   -- Formulario de login
exports.new = function(req, res)
{
    var errors = req.session.errors || {};
    req.session.errors = {};

    res.render('sessions/new', {errors: errors});
}

// POST /login    -- Crear la sesion
exports.create = function(req, res)
{
    var login     = req.body.login;
    var password  = req.body.password;
    var redir     = req.session.redir || '/';  // En caso que no exista lo redireccionara a la raiz

    var userController = require('./user_controller');
    userController.autenticar(login, password, function(error, user)
    {
        if (error) // si hay error retornamos mensajes de error de sesion
        {
            req.session.errors = [{"message": 'Se ha producido un error: ' + error}];
            res.redirect("/login");
            return;
        }

        // Crear req.session.user y guardar campos id y username
        // La sesion se define por la existencia de: req.session.user
        req.session.user = {id:user.id, username: user.username};

        exports.updateLastTransaction(req.session, new Date());

        res.redirect(redir.toString()); // redirect a path anterior a login
    });
}

// DELETE /logout    -- Destruir la sesion
exports.destroy = function(req, res)
{
    destroySession(req.session);
    res.redirect(req.session.redir.toString()); // redirect a path anterior a login
}

var destroySession = function(session)
{
    delete session.user;
    delete session.lasttransaction;
}

exports.isLoged = function(session)
{
    return session.user;
}

exports.updateLastTransaction = function(session, date)
{
    session.lasttransaction = date.toString();
}

exports.autoLogout = function(session, date)
{
    var lasttransaction = new Date(session.lasttransaction);
    var diferencia = date - lasttransaction;

    lasttransaction.setMinutes(lasttransaction.getMinutes() + parseInt(process.env.MAX_TIME_NO_TRANSACTION));

    if (lasttransaction < date )
    {
        destroySession(session);
        return true;
    }
    else
    {
        return false;
    }
}
