import winston from "winston";





//Creamos el passport 

export const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({ level: "debug"}),
        new winston.transports.File({ __filename: "./clase4.log", level: "warn"})
    ]
})

//Creamos un middleware de log

export const addLogger = (req, res, next) => {
    req.logger = logger

    req.logger.info('${new Date().toLocaleDateString()} - ${logger.info} - $ {req.method} en ${req.url}')

    next()
}
