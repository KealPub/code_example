/**
 * @module Server/server
 */
'use strict';

let helpers = require('../helpers');
let Request = require('./request');
let co = require('co');
let debug = require('debug');

// Defaults listeners
let defaultDataListener = function (req) {
  co(function *() {
    yield this.request(req.socket, req);
  }.bind(this));
};

let defaultErrorListener = function (req) {
  throw req.error;
};

let defaultCloseListener = function (req) {
  debug(req.socket.hashId + ' closed');
};

let defaultConnectListener = function (req) {
  debug(req.socket.hashId + ' connected');
};
// End default listeners


/**
 * Based class for create server
 * @class
 */
class Server {

  /**
   * @constructor
   */
  constructor() {
    this.midleware = [];
    this.sockets = {};

    this.settings = {
      errorListener: defaultErrorListener.bind(this),
      dataListener: defaultDataListener.bind(this),
      connectListener: defaultConnectListener.bind(this),
      closeListener: defaultCloseListener.bind(this)
    };
  }

  /**
   * Add middleware
   * @param {Function} fn - middleware function
   * @return {undefined} - no return
   */
  use(fn) {
    this.midleware.push(fn);
  }

  /**
   * Start execute middleware
   * @param {net.Socket} socket - See {@link https://iojs.org/api/net.html#net_class_net_socket|net.Socket}
   * @param {*} data - incoming data
   * @return {undefined} - no return
   */
  *request(socket, data) {
    let req = data instanceof Request ? data : new Request(socket, data);
    for (let key in this.midleware) {
      try {
        yield this.midleware[key](req);
      } catch (e) {
        req.error = e;
        this.settings.errorListener(req);
        break;
      }
    }
  }

  /**
   * Connect listener
   * @return {undefined} - no return
   */
  onConnect() {
    this.server.on(this.events.connection, function (socket) {
      let hash = helpers.getUniqHash();
      socket.hashId = hash;
      this.sockets[hash] = socket;
      this.setListeners(socket);
      this.settings.connectListener(new Request(socket));
    }.bind(this));
  }

  /**
   * Set listener on socket connection
   * @param {net.Socket} socket - See {@link https://iojs.org/api/net.html#net_class_net_socket|net.Socket}
   * @return {undefined} - no return
   */
  setListeners(socket) {

    socket.on(this.events.data, function (data) {
      this.settings.dataListener(new Request(socket, data));
    }.bind(this));

    socket.on(this.events.error, function (e) {
      let req = new Request(socket);
      req.error = e;
      this.settings.errorListener(req);
    }.bind(this));

    socket.on(this.events.close, function () {
      delete this.sockets[socket.hashId];
      this.settings.closeListener(new Request(socket));
    }.bind(this));
  }

  /**
   * Set of get config params
   * @param {string} key - param key
   * @param {*} [data] - param value
   * @returns {*|undefined} - return value params or undefined
   */
  config(key, data) {
    if (!data) {
      return this.settings[key];
    }
    this.settings[key] = data;
  }

}

module.exports = Server;
