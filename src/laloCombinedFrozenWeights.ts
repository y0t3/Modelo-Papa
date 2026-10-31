/** Parámetros fijos obtenidos con junio-julio 2026; nunca recalibrar con resultados del día. */
import type {GeometricEvidence} from './labLaloBayesGeometriaVT3';
export const COMBINED_MODEL_VERSION='LALO_VT3_BAYES_GEOMETRIA_V1';
export const COMBINED_TRAINED_THROUGH='2026-07-31';
export const FROZEN_GEOMETRY:GeometricEvidence={
  "original": {
    "TOP10": {
      "expected": 24.46000000000099,
      "observed": 23,
      "exposures": 2547
    },
    "11_20": {
      "expected": 23.870000000000903,
      "observed": 23,
      "exposures": 2458
    },
    "21_PLUS": {
      "expected": 73.70000000000115,
      "observed": 82,
      "exposures": 7863
    },
    "UNRANKED": {
      "expected": 200.54499999995878,
      "observed": 198,
      "exposures": 21416
    }
  },
  "form": {
    "TOP10": {
      "expected": 24.18000000000089,
      "observed": 27,
      "exposures": 2550
    },
    "11_30": {
      "expected": 48.419999999999156,
      "observed": 42,
      "exposures": 5100
    },
    "31_100": {
      "expected": 138.3050000000148,
      "observed": 148,
      "exposures": 14683
    },
    "OUTSIDE": {
      "expected": 111.6700000000165,
      "observed": 109,
      "exposures": 11951
    }
  },
  "frontier": {
    "ONE_COLUMN": {
      "expected": 27.71000000000136,
      "observed": 21,
      "exposures": 2939
    },
    "ONLY_NEW": {
      "expected": 70.1549999999997,
      "observed": 75,
      "exposures": 7485
    },
    "ONLY_OLD": {
      "expected": 201.94999999995753,
      "observed": 213,
      "exposures": 21501
    },
    "BOTH": {
      "expected": 22.760000000000733,
      "observed": 17,
      "exposures": 2359
    }
  },
  "paths": {
    "ONE": {
      "expected": 166.28999999998834,
      "observed": 169,
      "exposures": 18104
    },
    "MULTI": {
      "expected": 156.28500000000113,
      "observed": 157,
      "exposures": 16180
    }
  }
};
