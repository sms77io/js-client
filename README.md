![Sms77.io Logo](https://www.sms77.io/wp-content/uploads/2019/07/sms77-Logo-400x79.png "Sms77.io Logo")
# JavaScript API Client for the Sms77.io SMS Gateway

## Installation
This library relies on the the global fetch API.
In order to to use it with NodeJS u need to install [node-fetch](https://github.com/node-fetch/node-fetch).
For NodeJS versions < 12 use the [globalThis polyfill](https://github.com/es-shims/globalThis).

**Yarn** ```yarn add sms77-client node-fetch```

**NPM** ```npm install sms77-client node-fetch```

**Browser**
```html
<script src="https://unpkg.com/browse/sms77-client/dist/Sms77Client.umd.js"></script>
```

### Example
```javascript
//const globalThis = require('globalthis')(); // uncomment if NodeJS < NodeJS versions < 12
//globalThis.fetch = require('node-fetch').default; // uncomment in NodeJS environments
//const Sms77Client = require('sms77-client'); // uncomment in NodeJS environments

new Client('MY_SUPER_SECRET_SMS77_IO_API_KEY!')
.balance()
.then(balance => console.log(`My balance is: ${balance}`))
.catch(error => console.error(`Error while fetching: ${balance}`));
```