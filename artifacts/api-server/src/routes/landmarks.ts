import { Router, type IRouter } from "express";

const router: IRouter = Router();

const landmarks = [
  {
    id: "giza-pyramids",
    name: "Pyramids of Giza",
    nameAr: "أهرامات الجيزة",
    description: "The last surviving wonder of the ancient world, these massive pyramids were built as royal tombs for pharaohs Khufu, Khafre, and Menkaure over 4,500 years ago.",
    category: "ancient",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/1280px-Kheops-Pyramid.jpg",
    rating: 4.9,
    location: { city: "Giza", region: "Giza Governorate", latitude: 29.9792, longitude: 31.1342 },
    tags: ["UNESCO", "Seven Wonders", "Pyramid", "Pharaonic"],
    openingHours: "8:00 AM – 5:00 PM",
    ticketPrice: "$15 (foreigners)",
    historicalPeriod: "Old Kingdom, 2560–2510 BC",
    highlights: ["Great Pyramid of Khufu", "Sphinx", "Solar Boat Museum", "Pyramid of Khafre"],
    tips: ["Visit at sunrise to avoid crowds", "Hire a licensed guide", "Watch out for camel touts"]
  },
  {
    id: "karnak-temple",
    name: "Karnak Temple Complex",
    nameAr: "معبد الكرنك",
    description: "The largest ancient religious site in the world, Karnak is a vast temple complex dedicated to the Theban triad of Amun, Mut, and Khonsu, built over 2,000 years.",
    category: "ancient",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Karnak_temple_%28Egypt%29.jpg/1280px-Karnak_temple_%28Egypt%29.jpg",
    rating: 4.8,
    location: { city: "Luxor", region: "Luxor Governorate", latitude: 25.7188, longitude: 32.6573 },
    tags: ["UNESCO", "Temple", "Pharaonic", "Thebes"],
    openingHours: "6:00 AM – 5:30 PM",
    ticketPrice: "$8 (foreigners)",
    historicalPeriod: "Middle Kingdom to Ptolemaic Period, 2055 BC–395 AD",
    highlights: ["Hypostyle Hall", "Sacred Lake", "Avenue of Sphinxes", "Obelisk of Hatshepsut"],
    tips: ["Go early morning for cooler temperatures", "Attend the Sound & Light show at night", "Wear comfortable shoes"]
  },
  {
    id: "abu-simbel",
    name: "Abu Simbel Temples",
    nameAr: "معابد أبو سمبل",
    description: "Two massive rock temples carved into a mountainside by Ramesses II in 1264 BC, relocated in one of the greatest engineering feats of the 20th century to save them from rising Nile waters.",
    category: "ancient",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Abu_Simbel%2C_relocated_temple_front.jpg/1280px-Abu_Simbel%2C_relocated_temple_front.jpg",
    rating: 4.9,
    location: { city: "Abu Simbel", region: "Aswan Governorate", latitude: 22.3372, longitude: 31.6258 },
    tags: ["UNESCO", "Temple", "Ramesses II", "Nubia"],
    openingHours: "5:00 AM – 6:00 PM",
    ticketPrice: "$15 (foreigners)",
    historicalPeriod: "New Kingdom, 1264 BC",
    highlights: ["Great Temple of Ramesses II", "Temple of Nefertari", "Solar alignment on Feb 22 & Oct 22"],
    tips: ["Best visited on a sunrise tour from Aswan", "Book in advance if visiting during solar alignment dates"]
  },
  {
    id: "egyptian-museum",
    name: "Egyptian Museum",
    nameAr: "المتحف المصري",
    description: "Home to the world's most extensive collection of ancient Egyptian artifacts, including the treasures of Tutankhamun and over 120,000 items spanning 5,000 years.",
    category: "museum",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Egyptian_Museum%2C_Cairo%2C_Egypt.jpg/1280px-Egyptian_Museum%2C_Cairo%2C_Egypt.jpg",
    rating: 4.7,
    location: { city: "Cairo", region: "Cairo Governorate", latitude: 30.0478, longitude: 31.2336 },
    tags: ["Museum", "Tutankhamun", "Mummies", "Artifacts"],
    openingHours: "9:00 AM – 5:00 PM",
    ticketPrice: "$8 (foreigners)",
    historicalPeriod: "Opened 1902",
    highlights: ["Tutankhamun's Gold Mask", "Royal Mummies Hall", "Narmer Palette", "Rosetta Stone replica"],
    tips: ["Allow at least 3 hours", "Hire a guide for better context", "Photography fee required inside"]
  },
  {
    id: "valley-of-kings",
    name: "Valley of the Kings",
    nameAr: "وادي الملوك",
    description: "The royal burial ground of ancient Egypt's New Kingdom pharaohs, containing over 60 tombs of kings including Tutankhamun and Ramesses II, decorated with elaborate hieroglyphs.",
    category: "ancient",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Valley_of_the_Kings_from_above.jpg/1280px-Valley_of_the_Kings_from_above.jpg",
    rating: 4.8,
    location: { city: "Luxor", region: "Luxor Governorate", latitude: 25.7402, longitude: 32.6014 },
    tags: ["UNESCO", "Pharaonic", "Tombs", "New Kingdom"],
    openingHours: "6:00 AM – 5:00 PM",
    ticketPrice: "$10 includes 3 tombs",
    historicalPeriod: "New Kingdom, 1539–1075 BC",
    highlights: ["Tomb of Tutankhamun (KV62)", "Tomb of Ramesses VI", "Tomb of Seti I"],
    tips: ["Take the train inside to avoid the heat", "Buy tickets for Tutankhamun's tomb separately", "Go early morning"]
  },
  {
    id: "luxor-temple",
    name: "Luxor Temple",
    nameAr: "معبد الأقصر",
    description: "A magnificent ancient Egyptian temple complex located on the east bank of the Nile, known for its giant statues of Ramesses II and stunning illumination at night.",
    category: "ancient",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Luxor_temple_entrance.jpg/1280px-Luxor_temple_entrance.jpg",
    rating: 4.7,
    location: { city: "Luxor", region: "Luxor Governorate", latitude: 25.6994, longitude: 32.6392 },
    tags: ["Temple", "Pharaonic", "Ramesses II", "UNESCO"],
    openingHours: "6:00 AM – 10:00 PM",
    ticketPrice: "$8 (foreigners)",
    historicalPeriod: "New Kingdom, 1400 BC",
    highlights: ["Avenue of Sphinxes", "Obelisk of Ramesses II", "Abu al-Haggag Mosque"],
    tips: ["Visit at night for stunning illuminations", "Walk the full Avenue of Sphinxes to Karnak"]
  },
  {
    id: "philae-temple",
    name: "Temple of Philae",
    nameAr: "معبد فيلة",
    description: "A beautiful island temple complex dedicated to the goddess Isis, relocated to Agilkia Island to save it from the rising waters of Lake Nasser after the Aswan Dam was built.",
    category: "ancient",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Philae_temple_front.jpg/1280px-Philae_temple_front.jpg",
    rating: 4.7,
    location: { city: "Aswan", region: "Aswan Governorate", latitude: 24.0244, longitude: 32.8827 },
    tags: ["UNESCO", "Temple", "Isis", "Island"],
    openingHours: "7:00 AM – 4:00 PM",
    ticketPrice: "$11 (foreigners) + boat fee",
    historicalPeriod: "Ptolemaic Period, 380–362 BC",
    highlights: ["Kiosk of Trajan", "Inner Sanctuary of Isis", "Sound & Light Show"],
    tips: ["Arrive by boat from Aswan", "Visit in the evening for the Sound & Light Show"]
  },
  {
    id: "khan-el-khalili",
    name: "Khan el-Khalili Bazaar",
    nameAr: "خان الخليلي",
    description: "Cairo's legendary medieval marketplace, a labyrinth of narrow streets packed with shops selling spices, jewelry, papyrus, lanterns, and authentic Egyptian handicrafts since 1382.",
    category: "market",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Cairo-Khan_el_Khalili.jpg/1280px-Cairo-Khan_el_Khalili.jpg",
    rating: 4.5,
    location: { city: "Cairo", region: "Cairo Governorate", latitude: 30.0478, longitude: 31.2628 },
    tags: ["Market", "Bazaar", "Shopping", "Islamic Cairo"],
    openingHours: "10:00 AM – 12:00 AM",
    ticketPrice: "Free entry",
    historicalPeriod: "Mamluk Period, 1382 AD",
    highlights: ["Spice Souq", "El Fishawi Café", "Al-Hussein Square", "Gold Bazaar"],
    tips: ["Bargain always – start at 40% of asking price", "Try tea at El Fishawi Café", "Beware of overpricing for tourists"]
  },
  {
    id: "siwa-oasis",
    name: "Siwa Oasis",
    nameAr: "واحة سيوة",
    description: "A remote and magical oasis town in Egypt's Western Desert, famous for its salt lakes, Berber culture, Oracle of Amun temple where Alexander the Great visited, and stunning desert sunsets.",
    category: "nature",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/SiwaMountainFortress.jpg/1280px-SiwaMountainFortress.jpg",
    rating: 4.8,
    location: { city: "Siwa", region: "Matrouh Governorate", latitude: 29.2031, longitude: 25.5197 },
    tags: ["Oasis", "Desert", "Nature", "Berber"],
    openingHours: "Open all day",
    ticketPrice: "Free (site fees may apply)",
    historicalPeriod: "Ancient – Oracle consulted by Alexander the Great, 331 BC",
    highlights: ["Temple of the Oracle", "Shali Fortress ruins", "Cleopatra's Bath", "Great Sand Sea"],
    tips: ["Rent a bike or donkey cart", "Visit sunset at the Great Sand Sea", "Dress modestly – conservative area"]
  },
  {
    id: "al-azhar-mosque",
    name: "Al-Azhar Mosque",
    nameAr: "مسجد الأزهر",
    description: "One of the oldest and most prestigious mosques in the world, built in 970 AD. Home to Al-Azhar University, the world's second-oldest continuously operating university.",
    category: "mosque",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Cairo%2C_Al_Azhar_Mosque%2C_minaret_pano.jpg/1280px-Cairo%2C_Al_Azhar_Mosque%2C_minaret_pano.jpg",
    rating: 4.6,
    location: { city: "Cairo", region: "Cairo Governorate", latitude: 30.0456, longitude: 31.2627 },
    tags: ["Mosque", "Islamic", "UNESCO", "Historic"],
    openingHours: "9:00 AM – 5:00 PM (closed Friday afternoon)",
    ticketPrice: "Free",
    historicalPeriod: "Fatimid Period, 970 AD",
    highlights: ["Five minarets", "Madrasa courtyard", "Riwaq of the Blind"],
    tips: ["Dress modestly – robes provided at entrance", "Remove shoes before entering", "Visit nearby Al-Hussein Mosque too"]
  },
  {
    id: "white-desert",
    name: "White Desert National Park",
    nameAr: "الصحراء البيضاء",
    description: "An otherworldly landscape of brilliant white chalk rock formations shaped by wind and sand erosion, creating surreal mushroom and ice cream cone shapes in the Egyptian desert.",
    category: "nature",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/White_desert%2C_Egypt.jpg/1280px-White_desert%2C_Egypt.jpg",
    rating: 4.9,
    location: { city: "Farafra", region: "New Valley Governorate", latitude: 27.2800, longitude: 28.1500 },
    tags: ["Nature", "Desert", "National Park", "Rock Formations"],
    openingHours: "Open 24 hours",
    ticketPrice: "$5 entry fee",
    historicalPeriod: "Natural formation",
    highlights: ["Crystal Mountain", "White chalk formations", "Stargazing at night", "Bedouin camps"],
    tips: ["Camp overnight for the best experience", "Join a tour from Bahariya Oasis", "Bring warm clothes for cold desert nights"]
  },
  {
    id: "coptic-cairo",
    name: "Coptic Cairo",
    nameAr: "القاهرة القبطية",
    description: "One of the world's oldest Christian communities, featuring the Hanging Church, Ben Ezra Synagogue, and the Church of Saint Sergius built over the cave where the Holy Family sheltered.",
    category: "church",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Hanging_Church%2C_Coptic_Cairo%2C_Egypt.jpg/1280px-Hanging_Church%2C_Coptic_Cairo%2C_Egypt.jpg",
    rating: 4.5,
    location: { city: "Cairo", region: "Cairo Governorate", latitude: 30.0059, longitude: 31.2296 },
    tags: ["Church", "Coptic", "Historic", "Christian"],
    openingHours: "9:00 AM – 5:00 PM",
    ticketPrice: "Free",
    historicalPeriod: "Roman Period onwards, 3rd–7th century AD",
    highlights: ["Hanging Church (Al-Muallaqah)", "Ben Ezra Synagogue", "Church of St. Sergius & Bacchus"],
    tips: ["Combine with the Coptic Museum visit", "Dress modestly", "Go early to beat tour groups"]
  }
];


function normalizeLandmark(l: typeof landmarks[number]) {
  return { ...l, entryFee: l.ticketPrice, descriptionAr: l.nameAr };
}

router.get("/landmarks", (req, res) => {
  const { search, category } = req.query;

  let filtered = landmarks;

  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    filtered = filtered.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.location.city.toLowerCase().includes(q) ||
      l.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (category && typeof category === "string") {
    filtered = filtered.filter(l => l.category === category);
  }

  res.json(filtered.map(normalizeLandmark));
});

router.get("/landmarks/:id", (req, res) => {
  const landmark = landmarks.find(l => l.id === req.params.id);
  if (!landmark) {
    res.status(404).json({ error: "Landmark not found" });
    return;
  }
  res.json(normalizeLandmark(landmark));
});

export default router;
