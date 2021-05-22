function addEscape(path) {
  let res = "";
  const frag = path.split("\\");
  for (var i = 0; i < frag.length - 1; i++) {
    res += frag[i] + "\\\\";
  }
  res += frag[frag.length - 1];
  return res;
}

module.exports = utils;
