export function getURLParam(name) {
  const url = window.location.href;
  name = name.replace(/[[]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return true;
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function shuffle(a) {
  const res = a.concat();
  for (let i = res.length; i; i -= 1) {
    const j = Math.floor(Math.random() * i);
    [res[i - 1], res[j]] = [res[j], res[i - 1]];
  }
  return res;
}
