const magic = require('bindings')('memwatch');
const events = require('events');

module.exports = new events.EventEmitter();

module.exports.gc = magic.gc;
module.exports.HeapDiff = magic.HeapDiff;

magic.upon_gc(function(event, data) {
  return module.exports.emit(event, data);
});
