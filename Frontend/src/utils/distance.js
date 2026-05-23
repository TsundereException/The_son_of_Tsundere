// Frontend/src/utils/distance.js

const UKRAINE_CITIES = {
  'Київ': { lat: 50.4501, lon: 30.5234 },
  'Харків': { lat: 50.0057, lon: 36.2292 },
  'Одеса': { lat: 46.4825, lon: 30.7233 },
  'Дніпро': { lat: 48.4647, lon: 35.0462 },
  'Донецьк': { lat: 48.0159, lon: 37.8028 },
  'Запоріжжя': { lat: 47.8388, lon: 35.1396 },
  'Львів': { lat: 49.8397, lon: 24.0297 },
  'Кривий Ріг': { lat: 47.9105, lon: 33.3918 },
  'Миколаїв': { lat: 46.9750, lon: 31.9946 },
  'Маріуполь': { lat: 47.0971, lon: 37.5434 },
  'Луганськ': { lat: 48.5740, lon: 39.3078 },
  'Вінниця': { lat: 49.2331, lon: 28.4682 },
  'Макіївка': { lat: 48.0416, lon: 37.9733 },
  'Сімферополь': { lat: 44.9521, lon: 34.1024 },
  'Херсон': { lat: 46.6354, lon: 32.6169 },
  'Полтава': { lat: 49.5883, lon: 34.5514 },
  'Чернігів': { lat: 51.4982, lon: 31.2893 },
  'Черкаси': { lat: 49.4444, lon: 32.0598 },
  'Житомир': { lat: 50.2547, lon: 28.6587 },
  'Суми': { lat: 50.9077, lon: 34.7981 },
  'Хмельницький': { lat: 49.4230, lon: 26.9871 },
  'Чернівці': { lat: 48.2915, lon: 25.9348 },
  'Рівне': { lat: 50.6199, lon: 26.2516 },
  'Івано-Франківськ': { lat: 48.9226, lon: 24.7111 },
  'Тернопіль': { lat: 49.5535, lon: 25.5948 },
  'Луцьк': { lat: 50.7469, lon: 25.3262 },
  'Ужгород': { lat: 48.6208, lon: 22.2879 }
};

export const CITIES_LIST = Object.keys(UKRAINE_CITIES).sort();

function toRad(value) {
  return value * Math.PI / 180;
}

export function calculateDistance(city1, city2) {
  if (!city1 || !city2 || city1 === city2) return 0;
  
  const c1 = UKRAINE_CITIES[city1];
  const c2 = UKRAINE_CITIES[city2];
  
  if (!c1 || !c2) return null;
  
  const R = 6371; // Earth radius km
  const dLat = toRad(c2.lat - c1.lat);
  const dLon = toRad(c2.lon - c1.lon);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  
  return Math.round(d);
}

export function getDistanceText(buyerCity, sellerCity) {
  if (!buyerCity) return sellerCity;
  if (buyerCity === sellerCity) return `${sellerCity} (Ваше місто)`;
  
  const distance = calculateDistance(buyerCity, sellerCity);
  if (distance === null) return sellerCity;
  
  return `${sellerCity} (${distance} км від вас)`;
}
