/**
 * @module Server/request
 */
'use strict';
let _ = require('lodash');

/**
 * Request class
 * @class
 */
class Request {

  /**
   * @constructor
   * @param {net.Socket} socket - See {@link https://iojs.org/api/net.html#net_class_net_socket|net.Socket}
   * @param {*} [data] - incoming data
   */
  constructor(socket, data) {
    this.status = 404;
    this.responseData = null;
    this.socket = socket;
    this.data = data;
    this.error = null;
  }

}

module.exports = Request;