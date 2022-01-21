<template>
  <div class="map_wrapper">
    <div :id="container" class="map_container"></div>
    <MapTools
      class="map_utils"
      @drawPoint="drawPoint"
      @drawPolyline="drawPolyline"
      @drawPolygon="drawPolygon"
      @endDraw="removeMapClickEvent"
    />
  </div>
</template>

<script>
import MapTools from "./MapTools.vue";
import { createMap } from "@/libs/map.js";
import $L from "leaflet";
// 引入地图自带marker
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
export default {
  name: "BaseMap",
  components: { MapTools },
  props: {
    container: {
      type: String,
      default: "map",
    },
    options: {
      type: Object,
      default: () => ({
        zoomControl: false,
        maxZoom: 18,
      }),
    },
  },
  data() {
    return {
      map: null,
      OSMUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      polygonData: {
        latlngs: [],
        latlngsLen: 0,
        tempMarkers: [],
        tempPolygon: null, // 临时的线
      },
      overLayer: {
        polylines: [],
        polygons: [],
      },
      lineData: {
        linelatlngs: [],
        linelatlngsLen: 0,
        tempLine: null,
        tempMarkers: [],
      },
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    createMakerCluster() {
      return $L.markerClusterGroup();
    },
    getRandomLatLng() {
      let bounds = this.map.getBounds(),
        southWest = bounds.getSouthWest(),
        northEast = bounds.getNorthEast(),
        lngSpan = northEast.lng - southWest.lng,
        latSpan = northEast.lat - southWest.lat;

      return $L.latLng(
        southWest.lat + latSpan * Math.random(),
        southWest.lng + lngSpan * Math.random()
      );
    },
    initMap() {
      this.map = createMap(this.container, this.options);
      // 加载 open street map 图层服务(地图图层)
      this.createTileLayer();
      // 设施地图视图 中心位置
      this.map.setView([28.34, 115.56], 7);

      let cluster = this.createMakerCluster();
      for (let i = 0; i < 400; i++) {
        let latlng = this.getRandomLatLng(this.map);
        console.log(latlng);
        let maker = this.createMarker(latlng, { onceAdd: false });
        cluster.addLayer(maker);
      }
      this.map.addLayer(cluster);

      const marker = this.createMarker([30.34, 115.56]);
      marker.bindPopup(
        this.createPopup(
          [30.34, 115.56],
          "<p>Hello world!<br />This is a nice popup.</p>"
        )
      );

      const markers = this.createMarkers([
        [28.34, 115.56],
        [27.34, 115.56],
      ]);
      this.createTooltip(markers);
      this.createPolyline([
        [28.34, 119.56],
        [32.14, 114.56],
      ]);
      this.createPolygon([
        [27.34, 116.565],
        [27.34, 117.565],
        [26.34, 117.565],
        [26.34, 116.565],
      ]);
    },
    // 创建图层是异步方法
    async createTileLayer() {
      let tileLayer = await $L.tileLayer(this.OSMUrl, {});
      tileLayer.addTo(this.map);
    },
    // 创建markers
    createMarkers(paths, options) {
      let temp = [];
      paths.forEach((v) => {
        const marker = this.createMarker(v, options);

        temp.push(marker);
      });
      return temp;
    },
    // 创建marker
    createMarker(path, options) {
      const marker = $L.marker(path, this.createIcon(options));
      // options.onceAdd && marker.addTo(this.map);
      return marker;
    },

    // 创建 Tooltip
    createTooltip(markers) {
      if (Object.prototype.toString.call(markers) === "[object Object]")
        markers = [markers];
      markers.forEach((marker) =>
        marker
          .bindTooltip(
            `
          <div class='container'>
            <div class="inner">inner</div>
            <div class="item">item</div>
          </div>
        `,
            { className: "wrapper" }
          )
          .openTooltip()
      );
    },
    // 创建 Popup
    createPopup(path, layer) {
      const popup = L.popup().setLatLng(path).setContent(layer);
      return popup;
    },

    // 创建icon
    createIcon(options = { iconUrl: icon }) {
      return {
        icon: $L.icon({
          iconAnchor: [13, 41],
          shadowUrl: iconShadow,
          ...options,
        }),
      };
    },
    // 创建折线
    createPolyline(path, options = { color: "red", weight: 8 }) {
      const polyline = L.polyline(path, options);
      polyline.addTo(this.map);
      return polyline;
    },
    // 创建面
    createPolygon(path, options = { color: "red", fillColor: "blue" }) {
      const polygon = L.polygon(path, options);
      polygon.addTo(this.map);
      return polygon;
    },

    addMapClickEvent(type) {
      const mapObj = {
        point: this.drawPoint,
        polyline: this.drawPolyline,
      };
      this.removeMapClickEvent();
      this.map.on("click", (e) => mapObj[type](e));
    },
    removeMapClickEvent() {
      this.map.off("click");
      this.map.off("mousemove");
      this.map.off("dblclick");
    },

    // 动态画点
    drawPoint() {
      this.removeMapClickEvent();
      this.map.on("click", (e) => {
        const marker = this.createMarker(e.latlng);
        marker.bindPopup(
          this.createPopup([e.latlng.lat, e.latlng.lng], "hellop")
        );
      });
    },

    // 动态画线
    drawPolyline() {
      this.removeMapClickEvent();
      this.map.on("click", (e) => {
        // 添加经纬度到数组中(用于绘制线)
        this.lineData.linelatlngs.push([e.latlng.lat, e.latlng.lng]);
        this.lineData.linelatlngsLen = this.lineData.linelatlngs.length;
        // 添加起始 marker 到地图中，并且保留引用便于后面的销毁
        this.lineData.tempMarkers.push(
          this.createMarker([e.latlng.lat, e.latlng.lng])
        );
      });

      this.map.on("mousemove", (e) => {
        // 如果临时的线存在，就删除掉之前的那个线
        if (this.lineData.tempLine) {
          this.lineData.tempLine.remove();
        }
        if (this.lineData.linelatlngsLen === 1) {
          // 保存第二个点
          this.lineData.linelatlngs[this.lineData.linelatlngsLen] = [
            e.latlng.lat,
            e.latlng.lng,
          ];
          // 绘制线
          this.lineData.tempLine = this.createPolyline(
            this.lineData.linelatlngs,
            {
              color: "green",
              weight: 8,
            }
          );
        } else if (this.lineData.linelatlngsLen >= 2) {
          this.lineData.linelatlngs[this.lineData.linelatlngsLen] = [
            e.latlng.lat,
            e.latlng.lng,
          ];
          this.lineData.tempLine = this.createPolyline(
            this.lineData.linelatlngs,
            {
              color: "green",
              weight: 8,
            }
          );
        }
      });

      this.map.on("dblclick", () => {
        // 存储线，以后可能要销毁
        this.overLayer.polylines.push(
          this.createPolyline(this.lineData.linelatlngs.slice(0, -2), {
            color: "red",
            weight: 8,
          })
        );
        this.lineData.linelatlngs = [];
        this.lineData.linelatlngsLen = 0;
        this.lineData.tempLine.remove();
        // 删除markers
        this.lineData.tempMarkers.map((el) => el.remove());
      });
    },
    // 动态画面
    drawPolygon() {
      this.removeMapClickEvent();
      this.map.on("click", (e) => {
        // 添加经纬度到数组中(用于绘制线)
        this.polygonData.latlngs.push([e.latlng.lat, e.latlng.lng]);
        this.polygonData.latlngsLen = this.polygonData.latlngs.length;
        // 添加起始 marker 到地图中，并且保留引用便于后面的销毁
        this.polygonData.tempMarkers.push(
          this.createMarker([e.latlng.lat, e.latlng.lng])
        );
      });

      this.map.on("mousemove", (e) => {
        const curLatLng = [e.latlng.lat, e.latlng.lng];
        // 如果临时的线存在，就删除掉之前的那个线
        if (this.polygonData.tempPolygon) this.polygonData.tempPolygon.remove();

        // 添加了初始点（点击了）
        if (this.polygonData.latlngsLen == 1) {
          // 将第二个点push到数组中
          this.polygonData.latlngs[1] = curLatLng;
          // 绘制线
          this.polygonData.tempPolygon = this.createPolyline(
            this.polygonData.latlngs
          );
        } else if (this.polygonData.latlngsLen >= 2) {
          this.polygonData.latlngs[this.polygonData.latlngsLen] = curLatLng;
          // 绘制面
          this.polygonData.tempPolygon = this.createPolygon(
            this.polygonData.latlngs
          );
        }
      });

      this.map.on("dblclick", () => {
        this.overLayer.polygons.push(
          this.createPolygon(this.polygonData.latlngs.slice(0, -2), {})
        );
        this.polygonData.latlngs = [];
        this.polygonData.latlngsLen = 0;
        this.polygonData.tempPolygon.remove();
        // 删除markers
        this.polygonData.tempMarkers.map((el) => el.remove());
      });
    },
    // 动态划线辅助函数（画圆）
    addNode(pathObj) {
      return this.createMarker(pathObj);
    },
  },
};
</script>

<style>
.map_wrapper {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
}
.map_container {
  width: 100%;
  height: 100%;
}

.container {
  font-weight: 700 !important;
  font-size: 28px !important;
}

.container .inner {
  color: red;
}

.map_utils {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 999;
  width: 300px;
  height: 100px;
}
</style>