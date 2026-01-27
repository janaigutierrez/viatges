const errorHandler = (err, req, res, next) => {
    console.error('❌ Error captat:', err);
    console.error('Stack:', err.stack);

    // Si és un error de Mongoose (ex: CastError en IDs)
    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'ID invàlid'
        });
    }

    // Si és un error de validació de Mongoose
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            error: messages.join(', ')
        });
    }

    // Si és un error de duplicat (ex: email ja existent)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            error: `Aquest ${field} ja existeix`
        });
    }

    // Error genèric
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || 'Error intern del servidor'
    });
};

module.exports = errorHandler;