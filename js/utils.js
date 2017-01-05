export function getURLParam(name) {
  const url = location.href;
  name = name.replace(/[[]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return true;
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function shuffle(a) {
  const res = a.concat();
  for (let i = res.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

// Normal modulo operator (%) returns negative numbers if value is negative. We don't want this. E.g.:
// -5 % 100 === -5
// mod(-5, 100) === 95.
export function mod(v, n) {
  return ((v % n) + n) % n;
}
