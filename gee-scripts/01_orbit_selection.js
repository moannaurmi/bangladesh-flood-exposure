// Project 2 — Monsoon Surface Water Signal Analysis, Barisal Division
// Script 1: Orbit Selection and Scene Count Audit
// Date: May 2026

var barisal = ee.FeatureCollection("FAO/GAUL/2015/level1")
  .filter(ee.Filter.eq('ADM1_NAME', 'Barisal'));

// Scene counts per year, all orbits combined
var collection = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(barisal)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.calendarRange(7, 9, 'month'))
  .filter(ee.Filter.calendarRange(2015, 2025, 'year'))
  .select('VV');

// Confirmed orbit 114 — ASCENDING — full spatial coverage of Barisal
// Orbit 12 eliminated: zero counts in most years
// Orbit 77 eliminated: only 50% spatial coverage
// Orbit 150 eliminated: ~90% spatial coverage, missing southern edge
var orbit114 = collection
  .filter(ee.Filter.eq('relativeOrbitNumber_start', 114));

// Scene counts per year for locked orbit
var years = ee.List.sequence(2015, 2025);
var sceneCount = years.map(function(year) {
  var count = orbit114
    .filter(ee.Filter.calendarRange(year, year, 'year'))
    .size();
  return ee.Feature(null, {year: year, scene_count: count});
});

print('Orbit 114 scene counts 2015-2025:', ee.FeatureCollection(sceneCount));
print('Pass direction:', orbit114.aggregate_array('orbitProperties_pass').distinct());

Map.centerObject(barisal, 8);
Map.addLayer(barisal, {color: 'blue'}, 'Barisal Division');
Map.addLayer(orbit114.mosaic(), {min: -25, max: 0}, 'Orbit 114 ASCENDING coverage');
