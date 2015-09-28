/**
 * @module server/index
 */
'use strict';

module.exports = {
    tcpServer: require('./lib/tcpServer'),
    wsServer: require('./lib/wsServer')
};

