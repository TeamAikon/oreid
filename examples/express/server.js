const express = require('express');
const bodyParser = require('body-parser');
import { displayUser, helpPrompt, loginHandler } from './serverRoutes';
import dotenv from 'dotenv';
dotenv.config();

import { OreId, authCallbackHandler, signCallbackHandler } from 'oreid-js';

//Load settings from file
var settings = process.env;
const PORT = settings.PORT || 8888;
const { OREID_APP_ID, OREID_API_KEY, OREID_SERVICE_KEY, OREID_URL } = process.env;

// Instantiate oreId
// serviceKey is optional - it is required for some advanced features including autoSign and custodial accounts
let oreId = new OreId({ appId: OREID_APP_ID, apiKey: OREID_API_KEY, serviceKey:OREID_SERVICE_KEY, oreIdUrl: OREID_URL });

const app = express();

//handle sample oreid-enabled routes
app.use('/login/:logintype', loginHandler(oreId));

app.use('/authcallback', authCallbackHandler(oreId), displayUser());
app.use('/signcallback', signCallbackHandler(oreId));

app.use('/', helpPrompt());

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
