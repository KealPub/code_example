/**
 * @module server/tcpServer
 */
'use strict';

let Server = require('./server');
let net = require('net');
var WebSocketServer = require('websocket').server;
var http = require('http');
let helpers = require('../helpers');
let Request = require('./request');

let writeData = function (connection) {
  return function (data) {
    if (data instanceof Buffer) {
      return connection.sendBytes(data);
    }

    connection.sendUTF(data);
  };
};

/**
 * Ws server class
 * @class
 */
class wsServer extends Server {

  /**
   * @constructor
   */
  constructor(protocol, maxChank) {
    super();

    this.http = http.createServer(function(request, response) {
      console.log((new Date()) + ' Received request for ' + request.url);
      response.writeHead(404);
      response.end();
    });

    this.server = new WebSocketServer({
      httpServer: this.http,
      autoAcceptConnections: false,
      maxReceivedFrameSize: maxChank
    });

    this.events = {
      connection: 'request',
      data: 'message',
      error: 'error',
      close: 'close'
    };


    let defaultDataListener = this.settings.dataListener;
    this.settings.dataListener = function (req) {

      if (req.data.type === 'binary') {
        req.isBinary = true;
        req.data = req.data.binaryData;
      } else {
        req.data = req.data.utf8Data;
      }

      defaultDataListener(req);
    };
  }

  /**
   * Connect listener
   * @return {undefined} - no return
   */
  onConnect() {

    this.server.on(this.events.connection, function (socket) {

      let connection = socket.accept(null, socket.origin);

      let hash = helpers.getUniqHash();
      connection.hashId = hash;
      connection.write = writeData(connection);
      this.sockets[hash] = connection;
      this.setListeners(connection);
      this.settings.connectListener(new Request(socket));
    }.bind(this));

  }

  /**
   * Start server
   * @param {Number} port - listen port
   * @param {Function} [cb] - listen event callback
   * @return {undefined} - no return
   */
  listen(port, cb) {
    this.onConnect();
    this.http.listen(port, cb);
  }

}

module.exports = wsServer;