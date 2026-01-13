const logger = (req, res, next) => {
    const start = Date.now();
    
    // TODO: Écouter l'événement 'finish' sur la réponse (res.on)
    res.on('finish', () => {

        // TODO: Dans le callback, calculer la durée et logger: [METHOD] URL - Status (Duration ms)
        const duration = Date.now() - start;
        console.log(
            `[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration} ms)`
        );
        

    });

    next();
};

module.exports = logger;