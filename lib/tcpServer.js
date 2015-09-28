/**
 * @module server/tcpServer
 */
'use strict';

let Server = require('./server');
let net = require('net');

/**
 * Tcp server class
 * @class
 */
class tcpServer extends Server {

  /**
   * @constructor
   */
  constructor() {
    super();
    this.server = new net.Server();
  }

  /**
   * Start server
   * @param {Number} port - listen port
   * @param {Function} [cb] - listen event callback
   * @return {undefined} - no return
   */
  listen(port, cb) {
    this.onConnect();
    this.server.listen(port, cb);
  }

}

module.exports = tcpServer;