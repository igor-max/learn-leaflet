import "leaflet/dist/leaflet.css"
import L from "leaflet";

// icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";


const defaultConfigs = {
  icon: {
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12,41]
  },
  marker: {
    autoAddIcon: true,
    autoAddMap: true
  }
};

const createMap = (container, options) => {
  let map = L.map(container, options);
  return map;
};

const createIcon = (options) => {
  return L.icon({
    ...defaultConfigs.icon,
    ...options
  })
};

const createMarker = (map, lonlat, options) => {
  if (defaultConfigs.marker.autoAddIcon || options.autoAddIcon) {
    options = {
      icon: createIcon(),
      ...options,
    }
  }
  const marker = L.marker(lonlat, options);

  if (defaultConfigs.marker.autoAddMap || options.autoAddMap) {
    marker.addTo(map);
  }
  return marker;
};

// 创建地图
const createMarkers = (lonlats, options) => {
  return lonlats.map(lonlat => createMarker(lonlat, options));
};

const createTileLayer = async (map, OSMUrl, options) => {
  let tileLayer = await L.tileLayer(OSMUrl, options);
  tileLayer.addTo(map);
  map.setView([28.34, 115.56], 7);
};

export default {
  createMap,
  createIcon,
  createMarker,
  createMarkers,
  createTileLayer
};

// 技术开发：1. 学历：一步错步步错（一步晚步步晚） 2：基础 （开发这条路走不长远）（走长远要付出更多的时间和努力）（赛道不长，灵活性欠缺。市场不大，多数不太重视）
// 技术 + 管理 （和人打交道，很多都是无意义的交道, 管理）

// 管理： 只能从书本上学到知识，实操差的远，小公司没有完善的管理（管理交流）

// 如何跳出环境带来的圈（来源我的认知，眼界）（时间不等人）

// 工作的份上（职业的思考，）（在技术上和公司内部管理上）（都没有跳出这个框架）