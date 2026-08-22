import { getCityImage } from "../utils/travelImages";

export const CITY_CATALOG = [
  { name: "Agra", country: "India", region: "North India", costIndex: "₹₹" },
  { name: "Amritsar", country: "India", region: "North India", costIndex: "₹" },
  { name: "Bengaluru", country: "India", region: "South India", costIndex: "₹₹" },
  { name: "Delhi", country: "India", region: "North India", costIndex: "₹₹" },
  { name: "Goa", country: "India", region: "West India", costIndex: "₹₹" },
  { name: "Jaipur", country: "India", region: "West India", costIndex: "₹₹" },
  { name: "Kolkata", country: "India", region: "East India", costIndex: "₹" },
  { name: "Mumbai", country: "India", region: "West India", costIndex: "₹₹₹" },
  { name: "Paris", country: "France", region: "Europe", costIndex: "₹₹₹" },
  { name: "Rome", country: "Italy", region: "Europe", costIndex: "₹₹₹" },
  { name: "Singapore", country: "Singapore", region: "Southeast Asia", costIndex: "₹₹₹" },
  { name: "Tokyo", country: "Japan", region: "East Asia", costIndex: "₹₹₹" },
  { name: "Udaipur", country: "India", region: "West India", costIndex: "₹₹" },
  { name: "Varanasi", country: "India", region: "North India", costIndex: "₹" },
].map((city) => ({ ...city, image: getCityImage(city.name) }));

export const ACTIVITY_CATALOG = [
  { name: "Heritage walk", category: "Sightseeing", cost: 800 },
  { name: "Local food tour", category: "Food", cost: 1500 },
  { name: "Museum visit", category: "Culture", cost: 500 },
  { name: "Sunset boat ride", category: "Adventure", cost: 1200 },
  { name: "Beach day", category: "Relaxation", cost: 0 },
  { name: "Street photography", category: "Sightseeing", cost: 0 },
  { name: "Temple visit", category: "Culture", cost: 200 },
  { name: "Shopping market", category: "Shopping", cost: 1000 },
  { name: "Cooking class", category: "Food", cost: 1800 },
  { name: "Nature hike", category: "Adventure", cost: 700 },
  { name: "Live music evening", category: "Entertainment", cost: 900 },
  { name: "Local café crawl", category: "Food", cost: 600 },
];
