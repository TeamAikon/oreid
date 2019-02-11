const express = require('express');
const bodyParser = require('body-parser');
import {displayUser, loginHandler} from './serverRoutes'
import dotenv from 'dotenv';
dotenv.config();

import {OreId, authCallbackHandler, signCallbackHandler} from '@apimarket/oreid-js';

//Load settings from file
var settings = process.env;
const PORT = settings.PORT || 8888;
const {OREID_APP_ID, OREID_API_KEY, OREID_URI} =  process.env;

//Instantiate oreId
let oreId = new OreId({appId:OREID_APP_ID, apiKey: OREID_API_KEY, oreIdUrl: OREID_URI});

const app = express();

//handle sample oreid-enabled routes
app.use('/login/:logintype', loginHandler(oreId));

app.use('/authcallback', authCallbackHandler(oreId), displayUser());
app.use('/signcallback', signCallbackHandler(oreId));

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
