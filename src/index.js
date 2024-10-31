import dotenv from "dotenv";
const result=dotenv.config({
    override:true
});
import {app} from "./app.js";
import { getConnection } from "./db/db.connection.js";
import { startLocalmongoDBserver } from "./utils/localhost-mongodb.start.js";
import os from 'node:os';
import config from 'config';
import chalk from "chalk";
try{

    console.log(chalk.greenBright("Starting Server Initialization..."));
   
      logServerStart();
      //
      console.log('='.repeat(50));

          //start localhost mongodb service 
          if(config.util.getEnv('NODE_ENV')=="development")
          {
           try
           {
            console.log(chalk.yellowBright("Development Server: Executing MongoDB  service startup script"));
            await startLocalmongoDBserver();
           }
           catch(error)
           {
            console.log(chalk.redBright(error));
            console.log(chalk.bgYellowBright(chalk.redBright("Try to manually start the mongodb service from system through command line")));
           }
          }
          else
          {
            console.log(chalk.yellowBright("Production Server: Connecting to MongoDB server on enviroment url..."));
          }
      
          //connecting to database
      await getConnection();
      
      console.log(chalk.cyan('='.repeat(50)));

    
    
    app.listen(config.get("Application.Port"),()=>{
      console.log(chalk.yellowBright(`Server is running on port ${config.get("Application.Port")}`));
      if(config.util.getEnv('NODE_ENV')=="development")
      {
        console.log(chalk.greenBright(`Listening on Localhost -->  http://localhost:${config.get("Application.Port")}`));
        console.log(chalk.cyanBright(`Listening on  Network   -->  http://${getIpAddresses()[0]?.address}:${config.get("Application.Port")}`));
      }else
      {
      console.log(`http://localhost:${config.get("Application.Port")}`);
      }
      console.log(chalk.bgGreen(chalk.blueBright("Successfully started server")));
      console.log('-'.repeat(50));
     
    });
    
    app.get('/echo', (req, res) => {
        res.json({...req.body,echoed:true});
      })


}
catch(error)
{
    console.log(error);//printing error on log/
    process.exit(1);//shutdowing the node js process directly
}

function logServerStart() {
    console.log('='.repeat(50));
    console.log(`Server Startup - ${new Date().toISOString()}`);
    console.log('='.repeat(50));
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Node.js Version: ${process.version}`);
    console.log(`OS: ${os.type()} ${os.release()}`);
    console.log(`Processor Architecture: ${os.arch()}`);
    console.log(`Total Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`Available Memory: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log('='.repeat(50));
}

function getIpAddresses()
{
const interfaces = os.networkInterfaces();
const addresses = [];

for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && iface.internal==false) {
      addresses.push(iface);
    }
  }
}
return addresses;
}