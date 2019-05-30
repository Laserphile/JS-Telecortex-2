const promisify = require('./promisify');
const extendWithJsSources = require('./src');

let cv = require('../build/Release/opencv4nodejs.node');

// promisify async methods
cv = promisify(cv);
cv = extendWithJsSources(cv);

module.exports = cv;