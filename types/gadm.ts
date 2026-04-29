/**
 * TypeScript types for Spain GADM administrative boundary GeoJSON files.
 *
 * Files and their contents:
 *   spain-administrative-0.json   1 feature    – country outline (simplified)
 *   spain-administrative-1.json   1 feature    – country outline (alternative simplification)
 *   spain-administrative-2.json   52 features  – provinces
 *   spain-administrative-3.json   369 features – districts / comarcas
 *   spain-administrative-4.json   8302 features – municipalities
 *
 * Note: GADM uses the string "NA" to indicate a field has no data.
 * Fields documented below that are always or mostly "NA" in this dataset are noted.
 */

import type { Feature, FeatureCollection, MultiPolygon } from "geojson";

/** Country-level fields shared across all administrative levels. */
export interface GadmBaseProperties {
  /** ISO 3166-1 alpha-3 country code. Always "ESP". */
  GID_0: string;
  /** Country name. Always "Spain". */
  COUNTRY: string;
}

// ---------------------------------------------------------------------------
// Admin level 0 – Country boundary (spain-administrative-0.json)
// ---------------------------------------------------------------------------

export interface GadmLevel0Properties extends GadmBaseProperties {}

// ---------------------------------------------------------------------------
// Admin level 1 – Country boundary, alternative simplification
//                 (spain-administrative-1.json)
//
// Structurally identical to level 0 in this dataset. Both files contain a
// single MultiPolygon feature representing the full Spanish territory.
// ---------------------------------------------------------------------------

export type GadmLevel1Properties = GadmLevel0Properties;

// ---------------------------------------------------------------------------
// Admin level 2 – Provinces (spain-administrative-2.json, 52 features)
// ---------------------------------------------------------------------------

export interface GadmLevel2Properties extends GadmBaseProperties {
  /** GADM identifier for the autonomous community. e.g. "ESP.1_1" */
  GID_1: string;
  /** Autonomous community name. e.g. "Andalucía" */
  NAME_1: string;
  /** Native-language autonomous community name. Always "NA" in this dataset. */
  NL_NAME_1: string;
  /** GADM identifier for the province. e.g. "ESP.1.1_1" */
  GID_2: string;
  /** Province name. e.g. "Almería" */
  NAME_2: string;
  /** Variant / alternative province names. "NA" if none. */
  VARNAME_2: string;
  /** Native-language province name. Always "NA" in this dataset. */
  NL_NAME_2: string;
  /** Province type in Spanish. e.g. "Provincia" */
  TYPE_2: string;
  /** Province type in English. e.g. "Province" */
  ENGTYPE_2: string;
  /** Country code for the province. */
  CC_2: string;
  /** Hierarchical Administrative Subdivision Code. e.g. "ES.AN.AL" */
  HASC_2: string;
}

// ---------------------------------------------------------------------------
// Admin level 3 – Districts / comarcas (spain-administrative-3.json, 369 features)
// ---------------------------------------------------------------------------

export interface GadmLevel3Properties extends GadmBaseProperties {
  /** GADM identifier for the autonomous community. */
  GID_1: string;
  /** Autonomous community name. */
  NAME_1: string;
  /** Native-language autonomous community name. Always "NA" in this dataset. */
  NL_NAME_1: string;
  /** GADM identifier for the province. */
  GID_2: string;
  /** Province name. */
  NAME_2: string;
  /** Native-language province name. Always "NA" in this dataset. */
  NL_NAME_2: string;
  /** GADM identifier for the district / comarca. e.g. "ESP.1.1.1_1" */
  GID_3: string;
  /** District or comarca name. May be "n.a." for unnamed administrative units. */
  NAME_3: string;
  /** Variant / alternative district names. Always "NA" in this dataset. */
  VARNAME_3: string;
  /** Native-language district name. Always "NA" in this dataset. */
  NL_NAME_3: string;
  /** District type in Spanish. */
  TYPE_3: string;
  /** District type in English. */
  ENGTYPE_3: string;
  /** Country code for the district. Always "NA" in this dataset. */
  CC_3: string;
  /** Hierarchical Administrative Subdivision Code. Always "NA" in this dataset. */
  HASC_3: string;
}

// ---------------------------------------------------------------------------
// Admin level 4 – Municipalities (spain-administrative-4.json, 8302 features)
// ---------------------------------------------------------------------------

export interface GadmLevel4Properties extends GadmBaseProperties {
  /** GADM identifier for the autonomous community. */
  GID_1: string;
  /** Autonomous community name. */
  NAME_1: string;
  /** GADM identifier for the province. */
  GID_2: string;
  /** Province name. */
  NAME_2: string;
  /** GADM identifier for the district / comarca. */
  GID_3: string;
  /** District or comarca name. */
  NAME_3: string;
  /** GADM identifier for the municipality. e.g. "ESP.1.1.1.1_1" */
  GID_4: string;
  /** Municipality name. */
  NAME_4: string;
  /** Variant / alternative municipality names. "NA" if none. */
  VARNAME_4: string;
  /** Municipality type in Spanish. */
  TYPE_4: string;
  /** Municipality type in English. */
  ENGTYPE_4: string;
  /** Country code for the municipality. Always "NA" in this dataset. */
  CC_4: string;
}

// ---------------------------------------------------------------------------
// GeoJSON Feature types
// ---------------------------------------------------------------------------

export type GadmLevel0Feature = Feature<MultiPolygon, GadmLevel0Properties>;
export type GadmLevel1Feature = Feature<MultiPolygon, GadmLevel1Properties>;
export type GadmLevel2Feature = Feature<MultiPolygon, GadmLevel2Properties>;
export type GadmLevel3Feature = Feature<MultiPolygon, GadmLevel3Properties>;
export type GadmLevel4Feature = Feature<MultiPolygon, GadmLevel4Properties>;

// ---------------------------------------------------------------------------
// GeoJSON FeatureCollection types (matching the JSON file shapes)
// ---------------------------------------------------------------------------

export type GadmLevel0FeatureCollection = FeatureCollection<
  MultiPolygon,
  GadmLevel0Properties
>;
export type GadmLevel1FeatureCollection = FeatureCollection<
  MultiPolygon,
  GadmLevel1Properties
>;
export type GadmLevel2FeatureCollection = FeatureCollection<
  MultiPolygon,
  GadmLevel2Properties
>;
export type GadmLevel3FeatureCollection = FeatureCollection<
  MultiPolygon,
  GadmLevel3Properties
>;
export type GadmLevel4FeatureCollection = FeatureCollection<
  MultiPolygon,
  GadmLevel4Properties
>;

// ---------------------------------------------------------------------------
// Union types for code that handles any admin level
// ---------------------------------------------------------------------------

export type GadmAnyProperties =
  | GadmLevel0Properties
  | GadmLevel2Properties
  | GadmLevel3Properties
  | GadmLevel4Properties;

export type GadmAnyFeature =
  | GadmLevel0Feature
  | GadmLevel1Feature
  | GadmLevel2Feature
  | GadmLevel3Feature
  | GadmLevel4Feature;

export type GadmAnyFeatureCollection =
  | GadmLevel0FeatureCollection
  | GadmLevel1FeatureCollection
  | GadmLevel2FeatureCollection
  | GadmLevel3FeatureCollection
  | GadmLevel4FeatureCollection;
