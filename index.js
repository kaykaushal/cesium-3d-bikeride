import { Ion, Viewer, createWorldTerrain, createOsmBuildings, Cartesian3, Math } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"

// Your access token can be found at: https://cesium.com/ion/tokens.
// This is the default access token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk';


// Add Cesium terrain, a global 3D DEM layer.
viewer.scene.primitives.add(createOsmBuildings());   

const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: createWorldTerrain(), 
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
    timeline: true,
    animation: true,
    baseLayerPicker: true,
    sceneModePicker: true,
    terrainProvider: Cesium.createWorldTerrain(),
    imageryProvider: Cesium.createWorldImagery(),
    });

(async () => {
  try {
    const resource = await Cesium.IonResource.fromAssetId(1712237);
    const dataSource = await Cesium.KmlDataSource.load(resource, {
      camera: viewer.scene.camera,
      canvas: viewer.scene.canvas,
    });
    await viewer.dataSources.add(dataSource);
    await viewer.zoomTo(dataSource);

    // Get the entity representing the bike ride
    const bikeRideEntity = dataSource.entities.getById("bike_ride");

    // Set up animation properties
    bikeRideEntity.availability = new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: Cesium.JulianDate.fromIso8601("2023-05-10T05:10:06Z"),
        stop: Cesium.JulianDate.fromIso8601("2023-05-22T06:32:12Z"),
      }),
    ]);
    bikeRideEntity.addProperty("time");

    // Configure bike animation
    const bikeAnimation = new Cesium.SampledPositionProperty();
    bikeRideEntity.position = bikeAnimation;
    bikeRideEntity.point = new Cesium.PointGraphics({
      pixelSize: 5,
      color: Cesium.Color.YELLOW,
    });

    // Add bike positions at specific times
    const positions = [
      { time: "2023-05-22T00:00:00Z", position: Cesium.Cartesian3.fromDegrees(78.0440, 30.3408, 0) },
      // Add more positions as needed
    ];
    positions.forEach((pos) => {
      const time = Cesium.JulianDate.fromIso8601(pos.time);
      const position = Cesium.Cartesian3.fromDegrees(pos.position.lon, pos.position.lat, 0);
      bikeAnimation.addSample(time, position);
    });
    const pinBuilder = new Cesium.PinBuilder();

    Sandcastle.addToolbarMenu(
      [
        {
          text: "Track with Waypoints",
          onselect: function () {
            viewer.dataSources
              .add(
                Cesium.GpxDataSource.load(
                  "../SampleData/gpx/lamina.gpx",
                  {
                    clampToGround: true,
                  }
                )
              )
              .then(function (dataSource) {
                viewer.flyTo(dataSource.entities);
              });
          },
        },
        {
          text: "Route",
          onselect: function () {
            viewer.dataSources
              .add(
                Cesium.GpxDataSource.load(
                  "../SampleData/gpx/route.gpx",
                  {
                    clampToGround: true,
                  }
                )
              )
              .then(function (dataSource) {
                viewer.flyTo(dataSource.entities);
              });
          },
        },
        {
          text: "Waypoints",
          onselect: function () {
            viewer.dataSources
              .add(
                Cesium.GpxDataSource.load("./node_modules/cesium/Build/Cesium/Assets/activity_11058321956.kml", {
                  clampToGround: true,
                })
              )
              .then(function (dataSource) {
                viewer.flyTo(dataSource.entities);
              });
          },
        },
        {
          text: "Multiple Tracks with Waypoints",
          onselect: function () {
            viewer.dataSources
              .add(
                Cesium.GpxDataSource.load(
                  "./node_modules/cesium/Build/Cesium/Assets/activity_11058321956.gpx",
                  { clampToGround: true }
                )
              )
              .then(function (dataSource) {
                viewer.flyTo(dataSource.entities);
              });
          },
        },
      ],
      "toolbar"
    );

    // Play the animation
    viewer.clock.shouldAnimate = true;
    viewer.clock.startTime = bikeAnimation.startTime;
    viewer.clock.stopTime = bikeAnimation.stopTime;
    viewer.clock.currentTime = bikeAnimation.startTime;
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

    // Set the viewer's tracked entity to the bike ride entity
    viewer.trackedEntity = bikeRideEntity;
  } catch (error) {
    console.log(error);
  }
})();