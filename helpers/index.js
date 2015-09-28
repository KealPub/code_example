/**
 * @module index
 */
'use strict';
let crypto = require('crypto');
let _ = require('lodash');

/**
 * Generate md5 hash
 * @param {string} data - hashed data
 * @returns {string} - md5 hash
 */
exports.md5 = function (data) {
  return crypto.createHash('md5').update(data.toString()).digest('hex');
};

// TODO: Подумать насчет генерации хеша
/**
 * Get uniq random hash
 * @returns {string} - hash
 */
exports.getUniqHash = function () {
  return exports.md5((Date.now() + _.random()).toString());
};
