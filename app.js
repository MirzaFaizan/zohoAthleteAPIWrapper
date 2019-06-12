const express = require('express');
const cors = require('cors');


const config = require("./config/config");

const athleteRouter = require('./routers/athlete');

console.log(config.development.nodeJSSettings);

const api = express();

// use CORS middleware, for cross-domain requests,
api.use(cors(config.corsSettings) );

// add middleware to parse incoming requests that have JSON payloads,
api.use(express.json());





const port = process.env.PORT || config.development.nodeJSSettings.port;

////////////////////////////////////////////////////////////////////////
api.use('/athlete', athleteRouter);



// listen for requests coming in on the specified port:
api.listen(port, () => {

  console.log(`Now listening on port ${port}`);

});