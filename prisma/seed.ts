import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌍 Seeding Globe Trotter database...");

  // ============================================================
  // CITIES
  // ============================================================
  const cities = [
    {
      name: "Paris",
      country: "France",
      description:
        "The City of Light, renowned for its art, fashion, gastronomy, and iconic Eiffel Tower.",
      imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
      latitude: 48.8566,
      longitude: 2.3522,
    },
    {
      name: "Tokyo",
      country: "Japan",
      description:
        "A vibrant metropolis blending ultramodern technology with traditional temples and gardens.",
      imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
      latitude: 35.6762,
      longitude: 139.6503,
    },
    {
      name: "New York",
      country: "United States",
      description:
        "The Big Apple — a global hub of finance, culture, art, and entertainment.",
      imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
      latitude: 40.7128,
      longitude: -74.006,
    },
    {
      name: "London",
      country: "United Kingdom",
      description:
        "A historic city known for the British Museum, Big Ben, and the River Thames.",
      imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
      latitude: 51.5074,
      longitude: -0.1278,
    },
    {
      name: "Rome",
      country: "Italy",
      description:
        "The Eternal City, filled with ancient ruins, Renaissance art, and world-class cuisine.",
      imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
      latitude: 41.9028,
      longitude: 12.4964,
    },
    {
      name: "Barcelona",
      country: "Spain",
      description:
        "A Mediterranean gem known for Gaudí's architecture, beaches, and vibrant nightlife.",
      imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800",
      latitude: 41.3874,
      longitude: 2.1686,
    },
    {
      name: "Sydney",
      country: "Australia",
      description:
        "A stunning harbor city famous for the Opera House, Harbour Bridge, and golden beaches.",
      imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800",
      latitude: -33.8688,
      longitude: 151.2093,
    },
    {
      name: "Dubai",
      country: "United Arab Emirates",
      description:
        "A futuristic city of skyscrapers, luxury shopping, and desert adventures.",
      imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
      latitude: 25.2048,
      longitude: 55.2708,
    },
    {
      name: "Bangkok",
      country: "Thailand",
      description:
        "A bustling capital known for ornate temples, street food, and floating markets.",
      imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
      latitude: 13.7563,
      longitude: 100.5018,
    },
    {
      name: "Cape Town",
      country: "South Africa",
      description:
        "A coastal city at the foot of Table Mountain with stunning nature and rich history.",
      imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800",
      latitude: -33.9249,
      longitude: 18.4241,
    },
    {
      name: "Istanbul",
      country: "Turkey",
      description:
        "Where East meets West — a city bridging two continents with bazaars, mosques, and palaces.",
      imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
      latitude: 41.0082,
      longitude: 28.9784,
    },
    {
      name: "Bali",
      country: "Indonesia",
      description:
        "A tropical paradise known for lush rice terraces, ancient temples, and stunning beaches.",
      imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
      latitude: -8.3405,
      longitude: 115.092,
    },
  ];

  const createdCities: Record<string, string> = {};

  for (const city of cities) {
    const created = await prisma.city.upsert({
      where: { name_country: { name: city.name, country: city.country } },
      update: { ...city },
      create: { ...city },
    });
    createdCities[city.name] = created.id;
    console.log(`  ✅ City: ${city.name}, ${city.country}`);
  }

  // ============================================================
  // ACTIVITIES (4-5 per city)
  // ============================================================
  const activities = [
    // Paris
    { name: "Eiffel Tower Visit", description: "Ascend the iconic iron lattice tower for panoramic views of Paris.", cityName: "Paris", category: "sightseeing", estimatedCost: 26, duration: 120 },
    { name: "Louvre Museum", description: "Explore the world's largest art museum housing the Mona Lisa.", cityName: "Paris", category: "culture", estimatedCost: 17, duration: 180 },
    { name: "Seine River Cruise", description: "Enjoy a scenic boat ride along the Seine past landmarks.", cityName: "Paris", category: "tour", estimatedCost: 15, duration: 90 },
    { name: "Montmartre Walking Tour", description: "Stroll through the artistic hilltop neighborhood and visit Sacré-Cœur.", cityName: "Paris", category: "tour", estimatedCost: 0, duration: 120 },
    { name: "French Cooking Class", description: "Learn to prepare classic French dishes with a local chef.", cityName: "Paris", category: "food", estimatedCost: 85, duration: 180 },

    // Tokyo
    { name: "Senso-ji Temple", description: "Visit Tokyo's oldest and most famous Buddhist temple in Asakusa.", cityName: "Tokyo", category: "culture", estimatedCost: 0, duration: 90 },
    { name: "Shibuya Crossing Experience", description: "Walk the world's busiest pedestrian crossing and explore Shibuya.", cityName: "Tokyo", category: "sightseeing", estimatedCost: 0, duration: 60 },
    { name: "Tsukiji Outer Market Food Tour", description: "Sample fresh sushi, tamagoyaki, and street food at the famous market.", cityName: "Tokyo", category: "food", estimatedCost: 40, duration: 120 },
    { name: "Meiji Shrine", description: "Walk through forested paths to a serene Shinto shrine in Harajuku.", cityName: "Tokyo", category: "culture", estimatedCost: 0, duration: 60 },
    { name: "TeamLab Borderless", description: "Immerse yourself in a digital art museum with interactive installations.", cityName: "Tokyo", category: "entertainment", estimatedCost: 32, duration: 120 },

    // New York
    { name: "Statue of Liberty & Ellis Island", description: "Ferry to the iconic Statue of Liberty and immigration museum.", cityName: "New York", category: "sightseeing", estimatedCost: 24, duration: 240 },
    { name: "Central Park Walk", description: "Explore the massive urban park with lakes, gardens, and bridges.", cityName: "New York", category: "nature", estimatedCost: 0, duration: 120 },
    { name: "Broadway Show", description: "Watch a world-class theatrical performance in the Theater District.", cityName: "New York", category: "entertainment", estimatedCost: 120, duration: 180 },
    { name: "Metropolitan Museum of Art", description: "Visit one of the world's greatest art museums spanning 5,000 years.", cityName: "New York", category: "culture", estimatedCost: 30, duration: 180 },
    { name: "Brooklyn Bridge Walk", description: "Walk across the historic bridge with stunning Manhattan skyline views.", cityName: "New York", category: "sightseeing", estimatedCost: 0, duration: 60 },

    // London
    { name: "British Museum", description: "Explore a vast collection spanning two million years of human history.", cityName: "London", category: "culture", estimatedCost: 0, duration: 180 },
    { name: "Tower of London", description: "Discover the historic castle housing the Crown Jewels.", cityName: "London", category: "sightseeing", estimatedCost: 33, duration: 150 },
    { name: "West End Theatre", description: "Catch a world-famous musical or play in London's theatre district.", cityName: "London", category: "entertainment", estimatedCost: 75, duration: 180 },
    { name: "Thames River Walk", description: "Stroll along the South Bank from Westminster to Tower Bridge.", cityName: "London", category: "tour", estimatedCost: 0, duration: 90 },

    // Rome
    { name: "Colosseum Tour", description: "Step inside the ancient amphitheater that hosted gladiator battles.", cityName: "Rome", category: "sightseeing", estimatedCost: 18, duration: 120 },
    { name: "Vatican Museums & Sistine Chapel", description: "Admire Michelangelo's masterpiece and centuries of papal art.", cityName: "Rome", category: "culture", estimatedCost: 20, duration: 180 },
    { name: "Trastevere Food Walk", description: "Taste authentic Roman cuisine in the charming Trastevere neighborhood.", cityName: "Rome", category: "food", estimatedCost: 55, duration: 150 },
    { name: "Pantheon Visit", description: "Marvel at the best-preserved ancient Roman building with its oculus dome.", cityName: "Rome", category: "sightseeing", estimatedCost: 5, duration: 60 },

    // Barcelona
    { name: "Sagrada Familia", description: "Tour Gaudí's extraordinary unfinished basilica, a UNESCO World Heritage site.", cityName: "Barcelona", category: "sightseeing", estimatedCost: 26, duration: 120 },
    { name: "Park Güell", description: "Wander through Gaudí's colorful mosaic park overlooking the city.", cityName: "Barcelona", category: "sightseeing", estimatedCost: 10, duration: 90 },
    { name: "La Boqueria Market", description: "Browse fresh produce, tapas, and local delicacies at the famous market.", cityName: "Barcelona", category: "food", estimatedCost: 20, duration: 90 },
    { name: "Gothic Quarter Walk", description: "Explore narrow medieval streets, plazas, and hidden courtyards.", cityName: "Barcelona", category: "tour", estimatedCost: 0, duration: 120 },

    // Sydney
    { name: "Sydney Opera House Tour", description: "Go behind the scenes of Australia's most iconic building.", cityName: "Sydney", category: "culture", estimatedCost: 43, duration: 90 },
    { name: "Bondi to Coogee Coastal Walk", description: "Hike the stunning cliff-top trail between Sydney's famous beaches.", cityName: "Sydney", category: "nature", estimatedCost: 0, duration: 150 },
    { name: "Harbour Bridge Climb", description: "Climb to the top of the Sydney Harbour Bridge for breathtaking views.", cityName: "Sydney", category: "adventure", estimatedCost: 174, duration: 210 },
    { name: "Taronga Zoo", description: "Visit native Australian wildlife with a Sydney harbour backdrop.", cityName: "Sydney", category: "nature", estimatedCost: 49, duration: 240 },

    // Dubai
    { name: "Burj Khalifa Observation Deck", description: "Visit the observation deck of the world's tallest building.", cityName: "Dubai", category: "sightseeing", estimatedCost: 42, duration: 90 },
    { name: "Desert Safari", description: "Experience dune bashing, camel rides, and a Bedouin camp dinner.", cityName: "Dubai", category: "adventure", estimatedCost: 65, duration: 360 },
    { name: "Dubai Mall & Aquarium", description: "Shop and visit one of the world's largest indoor aquariums.", cityName: "Dubai", category: "entertainment", estimatedCost: 35, duration: 180 },
    { name: "Old Dubai Spice Souk", description: "Explore the traditional market filled with exotic spices and gold.", cityName: "Dubai", category: "culture", estimatedCost: 0, duration: 90 },

    // Bangkok
    { name: "Grand Palace", description: "Tour the dazzling royal palace complex and Temple of the Emerald Buddha.", cityName: "Bangkok", category: "culture", estimatedCost: 16, duration: 150 },
    { name: "Floating Market Tour", description: "Navigate canals and buy food from vendors in traditional boats.", cityName: "Bangkok", category: "tour", estimatedCost: 25, duration: 240 },
    { name: "Street Food Night Tour", description: "Sample Thailand's famous street food from Chinatown to Khao San.", cityName: "Bangkok", category: "food", estimatedCost: 30, duration: 180 },
    { name: "Wat Pho Temple", description: "See the magnificent reclining Buddha and enjoy a traditional Thai massage.", cityName: "Bangkok", category: "culture", estimatedCost: 8, duration: 90 },

    // Cape Town
    { name: "Table Mountain Cable Car", description: "Ride to the summit of Table Mountain for stunning panoramic views.", cityName: "Cape Town", category: "nature", estimatedCost: 18, duration: 150 },
    { name: "Robben Island Tour", description: "Visit the prison where Nelson Mandela was incarcerated for 18 years.", cityName: "Cape Town", category: "culture", estimatedCost: 28, duration: 210 },
    { name: "Cape Peninsula Day Trip", description: "Drive the scenic coast to Cape Point and the Cape of Good Hope.", cityName: "Cape Town", category: "tour", estimatedCost: 45, duration: 480 },
    { name: "V&A Waterfront", description: "Enjoy shopping, dining, and entertainment at the vibrant harbor district.", cityName: "Cape Town", category: "entertainment", estimatedCost: 0, duration: 120 },

    // Istanbul
    { name: "Hagia Sophia", description: "Visit the awe-inspiring 6th-century cathedral turned mosque.", cityName: "Istanbul", category: "culture", estimatedCost: 25, duration: 90 },
    { name: "Grand Bazaar", description: "Shop in one of the world's oldest and largest covered markets.", cityName: "Istanbul", category: "shopping", estimatedCost: 0, duration: 120 },
    { name: "Bosphorus Cruise", description: "Sail between two continents along the scenic Bosphorus strait.", cityName: "Istanbul", category: "tour", estimatedCost: 20, duration: 120 },
    { name: "Turkish Bath Experience", description: "Relax in a historic hammam with traditional bathing rituals.", cityName: "Istanbul", category: "wellness", estimatedCost: 50, duration: 90 },

    // Bali
    { name: "Ubud Rice Terraces", description: "Walk through the stunning Tegallalang rice terraces.", cityName: "Bali", category: "nature", estimatedCost: 5, duration: 120 },
    { name: "Uluwatu Temple Sunset", description: "Watch a Kecak dance performance at sunset above dramatic sea cliffs.", cityName: "Bali", category: "culture", estimatedCost: 10, duration: 150 },
    { name: "Mount Batur Sunrise Trek", description: "Hike an active volcano for a spectacular sunrise above the clouds.", cityName: "Bali", category: "adventure", estimatedCost: 45, duration: 360 },
    { name: "Balinese Cooking Class", description: "Learn traditional Balinese recipes using fresh local ingredients.", cityName: "Bali", category: "food", estimatedCost: 30, duration: 240 },
  ];

  for (const act of activities) {
    const cityId = createdCities[act.cityName];
    if (!cityId) {
      console.warn(`  ⚠️ City not found for activity: ${act.name}`);
      continue;
    }

    await prisma.activity.upsert({
      where: {
        id: `${act.cityName.toLowerCase()}-${act.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      },
      update: {
        name: act.name,
        description: act.description,
        category: act.category,
        estimatedCost: act.estimatedCost,
        duration: act.duration,
        cityId,
      },
      create: {
        id: `${act.cityName.toLowerCase()}-${act.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        name: act.name,
        description: act.description,
        category: act.category,
        estimatedCost: act.estimatedCost,
        duration: act.duration,
        cityId,
      },
    });
    console.log(`  ✅ Activity: ${act.name} (${act.cityName})`);
  }

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
