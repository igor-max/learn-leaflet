<template>
  <div id="app">
    <!-- <BaseMap /> -->
  </div>
</template>

<script>
// import BaseMap from '@/components/common/BaseMap';
import mapUtils from "@/libs/map.js";
export default {
  name: "App",
  components: {
    // BaseMap
  },
  data() {
    return {
      map: null,
    };
  },
  methods: {
    initMap() {
      this.map = mapUtils.createMap("app", {
        zoomControl: false,
        maxZoom: 18,
      });
      mapUtils.createTileLayer(
        this.map,
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      );
    },
    initEvent() {
      this.map.on('click', (e) => {
        mapUtils.createMarker(this.map, e.latlng);
      });
    }
  },
  mounted() {
    this.initMap();
    this.initEvent();
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  height: 100%;
}
</style>
