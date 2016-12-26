let id = -1;
function getContinentID() {
  id += 1;
  return id;
}

export default class Continent {
  constructor() {
    this.points = [];
    this.id = getContinentID();
  }

  get size() {
    return this.points.length;
  }

  addPoint(p) {
    this.points.push(p);
  }
}

export function calcContinents(surface) {
  const queue = [];
  const continents = [];
  // DFS-like algorithm calculating continents.
  surface.forEachPoint((p) => {
    if (p.isContinent && p.continent === null) {
      const cont = new Continent();
      continents.push(cont);
      p.continent = cont;
      cont.addPoint(p);
      queue.push(p);
      // Add neighbouring points to queue and to the same continent.
      while (queue.length > 0) {
        const point = queue.pop();
        const x0 = point.x;
        const y0 = point.y;
        for (let x = x0 - 1; x <= x0 + 1; x += 1) {
          for (let y = y0 - 1; y <= y0 + 1; y += 1) {
            const points = surface.getPoints(x, y);
            if (points) {
              for (let i = 0; i < points.length; i += 1) {
                const neighbour = points[i];
                // Neighbouring points are only part of the same continent if they belong to the same plate.
                if (neighbour.isContinent && neighbour.continent === null && neighbour.plate === point.plate) {
                  neighbour.continent = cont;
                  cont.addPoint(neighbour);
                  queue.push(neighbour);
                }
              }
            }
          }
        }
      }
    }
  });
  return continents;
}
