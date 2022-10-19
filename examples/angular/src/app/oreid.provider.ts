import { Injectable } from '@angular/core';
// Oreid
import { OreId } from 'oreid-js';
// For web widget (popup)
import { WebPopup } from 'oreid-webpopup';

@Injectable({ providedIn: 'root' })
export class OreidProvider {
  _oreId: OreId;

  constructor() {
    // Your key. Probably should be in environment.ts/.env or similar
    const OREID_APP_ID = 'demo_0097ed83e0a54e679ca46d082ee0e33a';

    // Initialize OreId object
    this._oreId = new OreId({
      appName: 'ORE ID Sample App',
      appId: OREID_APP_ID,
      plugins: {
        popup: WebPopup(),
      },
    });

    // Before use any popup (or other plugins), you need to run init() method.
    // So let's do it here.
    this._oreId.init();
  }

  get oreId() {
    // Ideally, we should use the same object for the entire app (OreId is a stateful object)
    return this._oreId;
  }
}
