import dotenv from 'dotenv';
import process from 'node:process';
dotenv.config({
    override: true,
});
import { app } from './app.js';
import { getConnection } from './db/db.connection.js';
import { startLocalmongoDBserver } from './utils/localhost-mongodb.start.js';
import os from 'node:os';
import config from 'config';
import { logger } from '../logger/index.logger.js';
/**
 * @property()
 */
let server;
let mongoDatabaseInstance;
try {
    logger.info('Starting Server Initialization...');
    logServerStart();
    //start localhost mongodb service
    if (config.util.getEnv('NODE_ENV') == 'development') {
        try {
            
                    logger.verbose('Development Server: Executing MongoDB  service startup script');
                    await startLocalmongoDBserver();
        } catch (error) {
           logger.error(error);
           logger.warn('Try to manually start the mongodb service from system through command line');
           
        }
    } else {
        
            logger.verbose(
                'Production Server: Connecting to MongoDB server on enviroment url...'
        );
    }
    //connecting to database
    mongoDatabaseInstance = await getConnection();
    server = app.listen(config.get('Application.Port'), () => {
        logger.info(
           
                `Server is running on port ${config.get('Application.Port')}`
        );
        if (config.util.getEnv('NODE_ENV') == 'development') {
          
                logger.info(
                    `Listening on Localhost -->  http://localhost:${config.get('Application.Port')}`
            );
          
                logger.info(
                    `Listening on  Network   -->  http://${getIpAddresses()[0]?.address}:${config.get('Application.Port')}`
                );
        } else {
            logger.verbose(`http://localhost:${config.get('Application.Port')}`);
        }
        
        logger.info('Successfully started server');
    });

    process.on('SIGINT', () => gracefullShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefullShutdown('SIGTERM'));
    process.on('SIGQUIT', () => gracefullShutdown('SIGQUIT'));
} catch (error) {
    if (server) {
        gracefullShutdown('UnCaughtException');
    }
    logger.error(error);
    process.exit(1);
}

function logServerStart() {
    logger.info('='.repeat(50));
    logger.info(`Server Startup - ${new Date().toISOString()}`);
    logger.info('='.repeat(50));
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Node.js Version: ${process.version}`);
    logger.info(`OS: ${os.type()} ${os.release()}`);
    logger.info(`Processor Architecture: ${os.arch()}`);
    logger.info(
        `Total Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`
    );
    logger.info(
        `Available Memory: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`
    );
    logger.info('='.repeat(50));
}

function getIpAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && iface.internal == false) {
                addresses.push(iface);
            }
        }
    }
    return addresses;
}

function gracefullShutdown(signal) {
    logger.warn(
       `Received ${signal}.\nStarting graceful shutdown...`
    );
    server.close(async () => {
        await mongoDatabaseInstance.disconnect();
        logger.warn('HTTP server closed.');
    });
}
