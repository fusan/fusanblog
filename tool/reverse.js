//object prop value swap

var REVERSE_OPS = function (OPS) {
  var result = {}
  for (var op in OPS) {
    var code = OPS[op]
    result[code] = op
  }
  return result
};

module.exports = REVERSE_OPS;
