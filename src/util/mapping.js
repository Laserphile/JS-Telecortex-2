const fs = require('fs');
// const cv = require('opencv4nodejs');

const PIXEL_MAP_SMOL = Object.values(
  JSON.parse(fs.readFileSync('test_data/pixel_map_smol.json', 'utf8'))
);
const PIXEL_MAP_DOME_SMOL = PIXEL_MAP_SMOL;
const PIXEL_MAP_BIG = Object.values(
  JSON.parse(fs.readFileSync('test_data/pixel_map_big.json', 'utf8'))
);
const PIXEL_MAP_DOME_BIG = PIXEL_MAP_BIG;

// Return a normalized copy of `pixel map` all x, y between 0, 1.
export const normalizePixMap = pixMap => {
  if (pixMap[0].length != 2) {
    throw new Error(
      `pixMap should be an array of 2d coordinates, instead pixMap[0] = ${JSON.stringify(
        pixMap[0]
      )}`
    );
  }

  let [pixMinX, pixMaxX, pixMinY, pixMaxY] = [Infinity, -Infinity, Infinity, -Infinity];
  pixMap.forEach(([x, y]) => {
    if (x < pixMinX) pixMinX = x;
    if (x > pixMaxX) pixMaxX = x;
    if (y < pixMinY) pixMinY = y;
    if (y > pixMaxY) pixMaxY = y;
  });

  const [pixBreadthX, pixBreadthY] = [pixMaxX - pixMinX, pixMaxY - pixMinY];
  const pixBreadthMax = Math.max(pixBreadthX, pixBreadthY);

  // console.log(
  //   `mins: (${pixMinX}, ${pixMinY}), maxs: (${pixMaxX}, ${pixMaxY}), breadth ${pixBreadthMax}`
  // );

  return pixMap.map(([x, y]) => {
    return [(x - pixMinX) / pixBreadthMax, (y - pixMinY) / pixBreadthMax];
  });
};

export const MAPS_DOME_SIMPLIFIED = {
  smol: normalizePixMap(PIXEL_MAP_DOME_SMOL),
  big: normalizePixMap(PIXEL_MAP_DOME_BIG)
};
