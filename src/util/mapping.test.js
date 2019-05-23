import {
  normalizePixMap,
  transformPanelMap,
  generatePanelMaps,
  GENERATOR_DOME_OVERHEAD,
  PIXEL_MAP_DOME_OUTER,
  PIXEL_MAP_DOME_SMOL,
  MAPS_DOME,
  PANEL_0_SKEW,
  CTRL_1_ROT,
  PANEL_0_OFFSET,
  PANEL_2_SKEW,
  PANEL_2_OFFSET,
  rotateVector,
  matScale2DY,
  matRotation2D,
  GLOBAL_SCALE,
  matMult,
  matScale2D,
  transposeMapper,
  scaleOrTransformSelector,
  rotateMapper
} from './mapping';

const testPixMap = [[100, 100], [100, 300], [200, 100], [200, 300], [150, 200]];
const expectPixMap = [[0, 0], [0, 1], [0.5, 0], [0.5, 1], [0.25, 0.5]];
const badPixMap = [[1, 2, 3], [3]];
const normPixMap = [[0.3, 0.4], [0.4, 0.3]];

expect.extend({
  toBeCloseToMatrix(received, argument) {
    // console.log(received);
    const pass = received.length === argument.length;
    if (!pass) {
      return {
        message: () =>
          `expected ${JSON.stringify(received)} to be the same length as ${JSON.stringify(
            argument
          )}`,
        pass
      };
    }
    received.forEach((vector, index) => {
      expect(vector.length).toEqual(argument[index].length);
      vector.forEach((element, subIndex) => {
        expect(element).toBeCloseTo(argument[index][subIndex]);
      });
    });
    return {
      message: () =>
        `expected ${JSON.stringify(received)} to be close to matrix ${JSON.stringify(argument)}`,
      pass
    };
  }
});

describe('normalizePixMap', () => {
  [
    {
      name: 'works',
      source: testPixMap,
      validate: expectation => expectation.toBeCloseToMatrix(expectPixMap)
    },
    {
      name: 'normalizes smol map',
      source: PIXEL_MAP_DOME_SMOL,
      validate: expectation => expectation.toMatchSnapshot()
    },
    {
      name: 'normalizes outer map',
      source: PIXEL_MAP_DOME_OUTER,
      validate: expectation => expectation.toMatchSnapshot()
    }
  ].forEach(({ name, source, validate }) => {
    it(name, () => {
      const result = normalizePixMap(source);
      // if (name == 'normalizes outer map') {
      //   throw new Error(`source ${JSON.stringify(source)} \n\n result ${JSON.stringify(result)}`);
      // }
      validate(expect(result));
    });
  });
  it('handles bad pixmap', () => {
    expect(() => {
      normalizePixMap(badPixMap);
    }).toThrow();
  });
});

describe('transposeMapper', () => {
  [
    {
      name: 'works',
      offset: [0.5, 0.5],
      expected: [[0.8, 0.9], [0.9, 0.8]]
    }
  ].forEach(({ name, offset, expected }) => {
    it(name, () => {
      expect(normPixMap.map(transposeMapper(offset))).toBeCloseToMatrix(expected);
    });
  });
});

describe('scaleOrTransformSelector', () => {
  [
    {
      name: 'works with scalar',
      scale: 0.5,
      expected: [[0.15, 0.2], [0.2, 0.15]]
    }
  ].forEach(({ name, scale, expected }) => {
    it(name, () => {
      expect(normPixMap.map(scaleOrTransformSelector(scale))).toBeCloseToMatrix(expected);
    });
  });
});

describe('rotateMapper', () => {
  [
    {
      name: 'rotates 90 degrees',
      rotation: 90,
      expected: [[-0.4, 0.3], [-0.3, 0.4]]
    }
  ].forEach(({ name, rotation, expected }) => {
    it(name, () => {
      expect(normPixMap.map(rotateMapper(rotation))).toBeCloseToMatrix(expected);
    });
  });
});

describe('matScale2D', () => {
  it('works', () => {
    expect(matScale2D(0.5 * GLOBAL_SCALE)).toBeCloseToMatrix([[0.3, 0], [0, 0.3]]);
  });
});

describe('matScale2DY', () => {
  it('works', () => {
    expect(matScale2DY(0.8)).toBeCloseToMatrix([[1, 0], [0, 0.8]]);
  });
});

describe('matRotation2D', () => {
  it('works', () => {
    expect(matRotation2D(-60)).toBeCloseToMatrix([[0.5, 0.8660254], [-0.8660254, 0.5]]);
  });
});

describe('matMult', () => {
  [
    {
      name: 'calculates panel 0 skew',
      matrices: [matScale2DY(0.8), matRotation2D(-60), matScale2D(0.5 * GLOBAL_SCALE)],
      expected: [[0.15, 0.25980762], [-0.2078461, 0.12]]
    }
  ].forEach(({ name, matrices, expected }) => {
    it(name, () => {
      expect(matMult(...matrices)).toBeCloseToMatrix(expected);
    });
  });
});

describe('transformPanelMap', () => {
  [
    {
      name: 'scales after origin translation',
      source: normPixMap,
      transformations: { scale: 2 },
      validate: expectation => expectation.toBeCloseToMatrix([[0.1, 0.3], [0.3, 0.1]])
    },
    {
      name: 'rotates after origin translation',
      source: normPixMap,
      transformations: { angle: 90 },
      validate: expectation => expectation.toBeCloseToMatrix([[0.6, 0.3], [0.7, 0.4]])
    },
    {
      name: 'translates',
      source: normPixMap,
      transformations: { offset: [-0.1, -0.1] },
      validate: expectation => expectation.toBeCloseToMatrix([[0.2, 0.3], [0.3, 0.2]])
    },
    {
      name: 'transforms big-0-0',
      source: MAPS_DOME.big,
      transformations: {
        scale: PANEL_0_SKEW,
        angle: CTRL_1_ROT,
        offset: rotateVector(PANEL_0_OFFSET, CTRL_1_ROT)
      },
      validate: expectation => expectation.toMatchSnapshot()
    },
    {
      name: 'transforms outer-0-2',
      source: MAPS_DOME.outer,
      transformations: {
        scale: PANEL_2_SKEW,
        angle: CTRL_1_ROT,
        offset: rotateVector(PANEL_2_OFFSET, CTRL_1_ROT)
      },
      validate: expectation => expectation.toMatchSnapshot()
    }
  ].forEach(({ name, source, transformations, validate }) => {
    it(name, () => {
      const result = transformPanelMap(source, transformations);
      // if (name == 'transforms outer-0-2') {
      //   throw new Error();
      // }
      validate(expect(result));
    });
  });
});

describe('generatePanelMaps', () => {
  // const [MAPS_DOME_OVERHEAD, PANELS_DOME_OVERHEAD] = generatePanelMaps(GENERATOR_DOME_OVERHEAD);
  it('works', () => {
    expect(generatePanelMaps(GENERATOR_DOME_OVERHEAD)).toMatchSnapshot();
    // expect(MAPS_DOME_OVERHEAD).toMatchSnapshot();
    // expect(PANELS_DOME_OVERHEAD).toMatchSnapshot();
    // console.error(MAPS_DOME_OVERHEAD);
  });
});
