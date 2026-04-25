import { db, datePlansTable, checklistItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const MOODS = (theme: string, fun: string[], sexy: string[], relaxing: string[], meditative: string[]) => [
  {
    id: "fun",
    name: "Fun",
    emoji: "🎉",
    description: "Playful, upbeat, and a little irreverent. The kind of music that makes you move without thinking about it.",
    artists: fun,
    playlistDirection: `Think high energy and joyful — ${theme} sounds that make you smile and want to dance.`,
  },
  {
    id: "sexy",
    name: "Sexy",
    emoji: "🔥",
    description: "Slow, warm, and magnetic. Music that fills the room without demanding attention.",
    artists: sexy,
    playlistDirection: `Think low tempos and rich textures — the ${theme} sounds that pull you closer.`,
  },
  {
    id: "relaxing",
    name: "Relaxing",
    emoji: "🌙",
    description: "Unhurried and soft. Background music that lets the conversation breathe.",
    artists: relaxing,
    playlistDirection: `Think gentle and ambient — ${theme} sounds that feel like exhaling.`,
  },
  {
    id: "meditative",
    name: "Meditative",
    emoji: "🧘",
    description: "Sparse, intentional, and deeply present. Music that slows everything down.",
    artists: meditative,
    playlistDirection: `Think space between the notes — ${theme} sounds that invite stillness.`,
  },
];

const DATE_PLANS = [
  {
    month: 1,
    monthName: "January",
    theme: "Japan",
    destination: "Tokyo, Japan",
    tagline: "A quiet evening in the lantern-lit alleyways of Tokyo",
    intro: "January calls for warmth and wonder. Japan is a culture of extraordinary care, quiet beauty, and food as devotion. Seth will browse the recipes and choose what calls to him. Elana will decide the feeling of the night. Together you'll explore what it means to be truly present with each other.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Shiitake & Kombu Mushroom Miso Ramen",
          cuisine: "Japanese",
          description: "A deeply savory miso broth built on kombu and shiitake dashi, topped with roasted mushrooms, soft-boiled marinated egg, nori, scallions, bamboo shoots, and sesame oil. Rich, complex, and completely plant-forward. The broth alone is worth making.",
          difficulty: "Medium",
          prepTime: "2–3 hours",
          ingredients: ["dried kombu", "dried shiitake mushrooms", "fresh shiitake", "king oyster mushrooms", "miso paste", "ramen noodles", "eggs", "nori", "scallions", "bamboo shoots", "soy sauce", "mirin", "garlic", "ginger", "sesame oil", "toasted sesame seeds"],
        },
        {
          id: 2,
          dish: "Salmon Teriyaki with Steamed Rice and Pickled Cucumber",
          cuisine: "Japanese",
          description: "Lacquered salmon glazed with homemade teriyaki sauce, served over short-grain rice with a bright, tangy cucumber salad. Clean, elegant, and weeknight-possible.",
          difficulty: "Easy",
          prepTime: "45 minutes",
          ingredients: ["salmon fillets", "soy sauce", "mirin", "sake", "sugar", "short-grain rice", "cucumber", "rice vinegar", "sesame seeds"],
        },
        {
          id: 3,
          dish: "Chicken Katsu Curry",
          cuisine: "Japanese",
          description: "Crispy panko-breaded chicken cutlet over fluffy rice, drenched in a mild, fragrant Japanese curry. Comfort food at its most satisfying. Best with a quality free-range chicken — the cutlet is the star, so sourcing well makes a real difference.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["chicken breast", "panko breadcrumbs", "eggs", "flour", "Japanese curry roux", "onion", "potato", "carrot", "short-grain rice"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Japanese",
        ["Taiyo Ky", "Daoko", "Rina Sawayama"],
        ["Kirinji", "Mariya Takeuchi", "tofubeats"],
        ["Ichiko Aoba", "Cornelius", "Rin'"],
        ["Hiroshi Yoshimura", "Satoshi Ashikawa", "Midori Takada"]
      ),
    },
    ritual: { title: "The Tea Ceremony", description: "Begin the evening by making two cups of matcha together. One person whisks while the other holds the bowl warm. Bow to each other before drinking. Let this signal that tonight is yours." },
    funFacts: [
      "Shinrin-yoku (forest bathing) was formalized in Japan in 1982 as an official form of preventive medicine — immersion in forest air measurably lowers cortisol, reduces blood pressure, and increases the immune system's natural killer cells. The forest itself is the prescription.",
      "Shinto, Japan's indigenous spirituality, holds that kami — sacred spirits — inhabit mountains, rivers, trees, and stones. The natural world is not a backdrop to the divine; it is the divine. Every place has a soul.",
      "Wabi-sabi, the Japanese aesthetic of imperfection and transience, is itself a spiritual practice. To find a cracked bowl more beautiful than a perfect one is to accept the nature of all things — and of yourself.",
      "Ikigai, the Japanese concept of a reason for being, describes the intersection of what you love, what you're good at, what the world needs, and what can sustain you. Finding it isn't a goal — it's a lifelong practice of paying attention.",
    ],
    conversationPrompts: [
      "In Japan, the forest itself is considered medicine — a walk among trees can quiet your nervous system and rebuild your immunity. When did nature last genuinely heal something in you?",
      "Shinto sees the sacred in everything — a river, a rock, a particular quality of afternoon light. What ordinary thing in your daily life feels sacred to you, even if you've never said that word for it?",
      "Wabi-sabi teaches that a cracked bowl is more beautiful than a perfect one. What's something about yourself — or about us — that you've come to love more because of its imperfection?",
      "What gives your life meaning in the ikigai sense — the overlap of what you love, what you're good at, what the world needs, and what sustains you? How close are you to living from that center?",
      "What does stillness feel like for you — is it something you find easily, or something you have to work toward?",
    ],
    activity: { title: "Write Each Other a Haiku", description: "Each of you writes a haiku — three lines, 5-7-5 syllables — about what this first month of marriage has felt like. Read them to each other slowly. Keep them." },
    localAddOn: { title: "Find a Japanese restaurant for dessert", description: "End the night at a local Japanese spot for mochi ice cream or taiyaki. Or make mochi at home together — it's messy and delightful." },
    effort: "Medium",
    cost: "~$40",
    duration: "3-4 hours",
    scheduledDate: null,
    completed: false,
    completedAt: null,
    sethPhase: 1,
    elanaPhase: 1,
    sethRecipeChoice: null,
    elanaVibeChoice: null,
  },
  {
    month: 2,
    monthName: "February",
    theme: "Morocco",
    destination: "Marrakech, Morocco",
    tagline: "Spice markets, candlelight, and the sound of a medina at dusk",
    intro: "February deserves warmth and color. Morocco offers both — its food is a love language, its music is ancient and alive, and its rituals invite you to slow down. Seth chooses the dish. Elana sets the feeling. Tonight you are travelers in a souk, and everything smells like cardamom.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Lamb Tagine with Preserved Lemon and Olives",
          cuisine: "Moroccan",
          description: "Slow-braised lamb with warming spices — cumin, coriander, cinnamon, ginger — served over couscous with a bright lemon finish. Rich, complex, and deeply romantic. Worth sourcing the lamb from a butcher — a bone-in shoulder cut makes all the difference.",
          difficulty: "High",
          prepTime: "3–4 hours",
          ingredients: ["lamb shoulder", "preserved lemon", "green olives", "onion", "garlic", "cumin", "coriander", "cinnamon", "ginger", "saffron", "couscous", "fresh cilantro"],
        },
        {
          id: 2,
          dish: "Chicken Bastilla (Pastilla)",
          cuisine: "Moroccan",
          description: "A spectacular sweet-savory pie — spiced chicken with almonds, eggs, and cinnamon wrapped in flaky warqa pastry dusted with powdered sugar. The most impressive thing you will ever make. Best made with a quality chicken — the slow-braising is everything, so it's worth asking your butcher for bone-in thighs.",
          difficulty: "High",
          prepTime: "3 hours",
          ingredients: ["chicken thighs", "phyllo dough", "almonds", "eggs", "onion", "saffron", "cinnamon", "ginger", "parsley", "butter", "powdered sugar"],
        },
        {
          id: 3,
          dish: "Harira with Flatbread and Dates",
          cuisine: "Moroccan",
          description: "Morocco's most beloved soup — a richly spiced tomato and lentil broth with chickpeas, celery, fresh herbs, and a squeeze of lemon. Traditionally made to break the fast, it's humble, deeply fragrant, and completely plant-forward. Serve with warm flatbread and a small plate of Medjool dates. One of the great vegetarian dishes of the world.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["lentils", "chickpeas", "tomatoes", "celery", "onion", "coriander", "cumin", "cinnamon", "turmeric", "lemon", "fresh cilantro", "fresh parsley", "olive oil", "flatbread", "Medjool dates"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Moroccan",
        ["Oum", "Hindi Zahra", "Hoba Hoba Spirit"],
        ["Hindi Zahra", "Hasna El Becharia", "Oum"],
        ["Tinariwen", "Aziz Sahmaoui", "Majid Bekkas"],
        ["Maâlem Mahmoud Guinia", "Nass El Ghiwane", "Fatima Tabaamrant"]
      ),
    },
    ritual: { title: "Light a Candle, Make a Wish", description: "Before dinner, light a candle together. Each of you speaks one wish for this year of marriage — not out loud if you don't want to. Then light a second candle. Keep them both burning through dinner." },
    funFacts: [
      "The Gnawa people of Morocco perform Lila — an all-night healing ceremony where music, trance, and movement are used to draw out grief, illness, and spiritual affliction. The music itself is considered medicine; sound moves what words cannot.",
      "The argan tree grows only in southwestern Morocco and is called the Tree of Life — it has been harvested by the indigenous Amazigh people for centuries as food, medicine, and ritual offering. Goats famously climb it to eat its fruit.",
      "In Sufi Islam, which has deep roots in Morocco, dhikr — the repetitive chanting of sacred names — is a path to divine awareness. The body becomes an instrument for transcendence. Repetition becomes a doorway.",
      "Hammam culture in Morocco is ancient and communal — the ritual of purification through steam and water is both physical and spiritual, a deliberate reset of the body and spirit before major transitions or celebrations.",
    ],
    conversationPrompts: [
      "Gnawa healers of Morocco use music — all night, without stopping — to draw out grief and illness they believe sound can move what words cannot. Has music ever changed something in you that nothing else could reach?",
      "In Sufi tradition, the repetition of sacred sound becomes a doorway to altered states — the same words over and over until the thinking mind dissolves. Do you have a practice like that, something that gets you out of your head?",
      "What's something you're carrying right now — some grief, some old pattern, some weight — that you'd like to put down?",
      "Hammam rituals exist to mark transitions — to arrive somewhere new by first being cleansed. What transition in your life right now feels like it deserves a ritual?",
      "What does it feel like when you're spiritually aligned — when things are flowing and you feel like yourself? How do you know when you're there?",
    ],
    activity: { title: "Make a Spice Mix Together", description: "Blend your own ras el hanout — combine the spices by hand, talking about what each one smells like and where it takes you. Bottle it and label it with tonight's date." },
    localAddOn: { title: "Find a hammam or Turkish bath", description: "If there's a Turkish bath nearby, book it. Or draw a long bath at home and add rose petals." },
    effort: "High",
    cost: "~$55",
    duration: "4-5 hours",
    scheduledDate: null,
    completed: false,
    completedAt: null,
    sethPhase: 1,
    elanaPhase: 1,
    sethRecipeChoice: null,
    elanaVibeChoice: null,
  },
  {
    month: 3,
    monthName: "March",
    theme: "Italy",
    destination: "Amalfi Coast, Italy",
    tagline: "Sunday afternoon on a terrace above the sea",
    intro: "March is for softening. Italy teaches us that the meal is never the point — the people at the table are. Seth picks what he wants to cook. Elana decides how the evening should feel. Tonight, take all night. Cook slowly. Eat slowly. Let the conversation wander.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Handmade Pasta with Clam Sauce (Spaghetti alle Vongole)",
          cuisine: "Italian",
          description: "Make fresh pasta together — flour, eggs, and elbow grease. Toss in a white wine and garlic clam sauce. Start with bruschetta. Finish with tiramisu. Don't rush any of it.",
          difficulty: "High",
          prepTime: "3 hours",
          ingredients: ["00 flour", "eggs", "littleneck clams", "white wine", "garlic", "olive oil", "parsley", "chili flakes", "lemon", "crusty bread", "mascarpone", "ladyfingers", "espresso"],
        },
        {
          id: 2,
          dish: "Braised Short Rib Ragù over Pappardelle",
          cuisine: "Italian",
          description: "Bone-in beef short ribs braised for hours in red wine, tomato, and aromatics until they fall apart. Tossed with wide ribbons of pasta. Deeply satisfying and inherently romantic. This is the dish where butcher-quality beef matters most — ask for bone-in English-cut short ribs from a proper butcher.",
          difficulty: "High",
          prepTime: "4 hours",
          ingredients: ["beef short ribs", "red wine", "canned tomatoes", "onion", "carrot", "celery", "garlic", "rosemary", "thyme", "pappardelle", "parmesan"],
        },
        {
          id: 3,
          dish: "Risotto ai Funghi Porcini",
          cuisine: "Italian",
          description: "A deeply earthy, silky porcini mushroom risotto finished with aged parmesan and cold butter. Made with dried porcini soaked until the broth turns amber, and fresh cremini for texture. One of the truly great vegetarian dishes in Italian cooking — rich, aromatic, and completely satisfying.",
          difficulty: "Medium",
          prepTime: "1 hour",
          ingredients: ["arborio rice", "dried porcini mushrooms", "fresh cremini mushrooms", "dry white wine", "shallot", "garlic", "parmesan", "butter", "vegetable stock", "fresh thyme", "olive oil", "fresh parsley"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Italian",
        ["Carmen Consoli", "Elisa", "Levante"],
        ["Paolo Conte", "Ornella Vanoni", "Mahmood"],
        ["Fabrizio De André", "Francesco De Gregori", "Luigi Tenco"],
        ["Ludovico Einaudi", "Giovanni Sollima", "Nino Rota"]
      ),
    },
    ritual: { title: "The First Toast", description: "Pour two glasses before you begin cooking. Look each other in the eye. One of you proposes a toast — not rehearsed, just honest. Whatever comes up is the right thing." },
    funFacts: [
      "Ancient Rome held that nature spirits — numina — inhabited rivers, forests, crossroads, and particular rocks. This animism predates Christianity by centuries and was practiced by ordinary people as a living, daily relationship with the world.",
      "The cult of Bacchus (Dionysus) treated ritual intoxication — wine drunk in ceremony — as a path to divine ecstasy and the dissolution of the individual self. Pleasure was not escape; it was a form of prayer.",
      "Southern Italy has a deep tradition of folk healing called guarigione — village healers used plants, prayer, ritual objects, and touch to address what medicine couldn't reach. These practices survived the Inquisition and are still remembered.",
      "The Pythagoreans founded their school in southern Italy in the 6th century BCE. They believed music had mathematical and spiritual properties — that specific harmonics could heal the body, align the soul, and reveal the hidden order of the universe.",
    ],
    conversationPrompts: [
      "The ancient Romans believed nature spirits inhabited rivers and crossroads and ancient trees — that specific places had souls. If you believed the world was inhabited by invisible presences, how would that change how you moved through it?",
      "Bacchic ritual used wine as a sacrament — a way to dissolve the boundaries between self and world. What does it feel like, for you, when those boundaries loosen a little? What brings that on for you?",
      "Old Italian folk healers used plants, prayer, and touch to heal what medicine couldn't reach. What do you personally believe can heal things that conventional medicine misses?",
      "The Pythagoreans believed certain music could align the soul. Is there a piece of music that does something to you that you genuinely can't explain?",
      "What's a form of pleasure — real, embodied, sensory pleasure — that you want more of in your life?",
    ],
    activity: { title: "Make pasta from scratch together", description: "There's something about making pasta by hand that slows everything down. Measure flour on the counter, make a well, crack the eggs, work the dough. It's tactile, meditative, and a little chaotic." },
    localAddOn: { title: "Find a wine bar for an after-dinner glass", description: "End the night with a glass of something Italian — Barolo, Nero d'Avola, or Prosecco. If you can find a wine bar with outdoor seating, even better." },
    effort: "High",
    cost: "~$50",
    duration: "4-5 hours",
    scheduledDate: null,
    completed: false,
    completedAt: null,
    sethPhase: 1,
    elanaPhase: 1,
    sethRecipeChoice: null,
    elanaVibeChoice: null,
  },
  {
    month: 4,
    monthName: "April",
    theme: "India",
    destination: "Jaipur, India",
    tagline: "The Pink City at sunset, color and chaos and quiet temples",
    intro: "April brings color. India offers it in every direction — in the food, in the music, in the textiles. Seth picks the dish. Elana picks the feeling. Tonight is loud with flavor and quiet in its ceremony. You'll use your hands. You'll slow down. You'll taste something new.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Lamb Biryani with Raita and Naan",
          cuisine: "Indian (Rajasthani)",
          description: "Layer basmati rice with slow-cooked spiced lamb, caramelized onions, saffron, and whole spices. Seal the pot. Open it at the table. The smell alone is an occasion. Sourcing the lamb from a Long Island butcher — bone-in leg pieces — makes this exceptional.",
          difficulty: "High",
          prepTime: "4 hours",
          ingredients: ["lamb leg pieces", "basmati rice", "onions", "yogurt", "saffron", "ghee", "whole spices", "fresh mint", "fried onions", "rose water", "naan", "cucumber", "yogurt"],
        },
        {
          id: 2,
          dish: "Butter Chicken (Murgh Makhani) with Garlic Naan",
          cuisine: "Indian (Punjabi)",
          description: "Tender chicken in a velvety tomato-cream sauce, warmly spiced with garam masala and fenugreek. One of the world's great comfort dishes, served with pillowy homemade naan. Best with free-range chicken thighs — the quality comes through in every bite.",
          difficulty: "Medium",
          prepTime: "2 hours",
          ingredients: ["chicken thighs", "tomatoes", "heavy cream", "butter", "garlic", "ginger", "garam masala", "fenugreek leaves", "yogurt", "naan flour", "yeast"],
        },
        {
          id: 3,
          dish: "Dal Makhani with Jeera Rice and Aloo Gobi",
          cuisine: "Indian (Punjabi)",
          description: "Black lentils slow-cooked overnight in butter and cream — one of India's most beloved dishes. Served with cumin-scented rice and a dry cauliflower and potato curry.",
          difficulty: "Medium",
          prepTime: "Overnight soak + 3 hours",
          ingredients: ["black urad lentils", "kidney beans", "butter", "cream", "tomatoes", "garlic", "ginger", "basmati rice", "cumin seeds", "cauliflower", "potato", "spices"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Indian",
        ["A.R. Rahman", "Priya Ragu", "Ritviz"],
        ["Arooj Aftab", "Shreya Ghoshal", "Sona Mohapatra"],
        ["Norah Jones", "Lucky Ali", "Shubha Mudgal"],
        ["Ravi Shankar", "Hariprasad Chaurasia", "Zakir Hussain"]
      ),
    },
    ritual: { title: "Apply Henna Together", description: "Order henna cones online. Draw simple patterns on each other's hands — nothing has to be perfect. Let them dry. Talk about what the symbols mean to you." },
    funFacts: [
      "Ayurveda, one of the world's oldest medical systems — over 5,000 years old — understands the body as a microcosm of the universe, built from the same elements as the earth. Healing is not fixing; it is realigning.",
      "The sacred Ganges River is worshipped as a living goddess, Ganga — millions of pilgrims bathe in it every year believing the river can wash away accumulated karma, heal illness, and release the dead into freedom.",
      "Ancient Vedic texts describe soma, a sacred brew consumed in ritual to touch the divine — scholars believe it may have been a psychedelic mushroom or plant preparation, the original sacrament, drunk before the gods.",
      "Jyotish — Vedic astrology — sees the birth chart as a map of the soul's journey across multiple lifetimes. It's still consulted across India for major life decisions, treating the stars not as fate but as terrain.",
    ],
    conversationPrompts: [
      "Ayurveda teaches that healing comes from realigning the elements within us — that illness is fundamentally imbalance, not just biology. What feels out of balance in your life right now, honestly?",
      "Ancient India's soma rituals used plant medicine to touch the divine — to cross a threshold that ordinary consciousness couldn't reach. Do you believe there are states of experience that everyday life doesn't offer? Have you touched that?",
      "The Ganges is worshipped as a living goddess — the river itself holds the sacred. Have you ever been to a place that felt genuinely holy, or that held some quality you couldn't explain rationally?",
      "Vedic astrology sees your birth chart as a map of karma — the soul's accumulated history. Do you believe in anything like that — past lives, destiny, the idea that you're here to learn specific things?",
      "What's a cultural or spiritual practice — from any tradition — that you'd genuinely want to bring into our life together?",
    ],
    activity: { title: "Watch a Bollywood film together", description: "Pick a classic — Dilwale Dulhania Le Jayenge, Lagaan, or something more recent. Don't take it seriously. Sing along if you can. Dance if the moment calls for it." },
    localAddOn: { title: "Visit an Indian grocery", description: "Source spices and ingredients at a local Indian grocery. Many have recommendations for fresh things you can't find elsewhere." },
    effort: "High",
    cost: "~$45",
    duration: "4-5 hours",
    scheduledDate: null,
    completed: false,
    completedAt: null,
    sethPhase: 1,
    elanaPhase: 1,
    sethRecipeChoice: null,
    elanaVibeChoice: null,
  },
  {
    month: 5,
    monthName: "May",
    theme: "Mexico",
    destination: "Oaxaca, Mexico",
    tagline: "Mezcal and mole, music in the square, the smell of copal",
    intro: "May is for celebration. Oaxaca is one of the world's great food cities — a place where recipes are passed down through generations and every meal is an act of memory. Seth finds the recipe he wants to take on. Elana decides how the room will feel. Tonight you eat with intention.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Chicken Mole Negro with Black Beans and Mexican Rice",
          cuisine: "Oaxacan",
          description: "The mole is the project — dried chiles, chocolate, spices, and patience. It takes time, which is exactly the point. Make it together over the afternoon so dinner feels like an arrival. Best with free-range chicken thighs sourced from a quality butcher — the slow braise rewards good ingredients.",
          difficulty: "High",
          prepTime: "4–6 hours",
          ingredients: ["chicken thighs", "mulato chiles", "ancho chiles", "pasilla chiles", "dark chocolate", "tomatoes", "onion", "garlic", "plantain", "raisins", "sesame seeds", "spices", "black beans", "rice"],
        },
        {
          id: 2,
          dish: "Tlayudas with Tasajo and Black Bean Paste",
          cuisine: "Oaxacan",
          description: "Oaxaca's iconic open-face flatbread — a large crisped tortilla spread with black bean paste, Oaxacan cheese, and tasajo (thin-sliced dried beef), finished with fresh toppings. Street food elevated. Tasajo is a specific Oaxacan preparation — if you can find it at a Mexican butcher or specialty market, that's the move.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["large tortillas", "black beans", "Oaxacan cheese", "tasajo or skirt steak", "avocado", "tomato", "cilantro", "lettuce", "jalapeño", "lime"],
        },
        {
          id: 3,
          dish: "Black Bean and Cheese Enchiladas in Salsa Verde",
          cuisine: "Mexican",
          description: "Corn tortillas filled with seasoned black beans and Oaxacan cheese, bathed in a roasted tomatillo salsa verde, and topped with crumbled queso fresco and crema. Vibrant, tangy, completely plant-forward, and deeply satisfying. One of the great vegetarian dishes in Mexican cooking.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["tomatillos", "black beans", "Oaxacan cheese", "corn tortillas", "queso fresco", "Mexican crema", "onion", "garlic", "jalapeño", "cilantro", "cumin", "lime", "epazote"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Mexican",
        ["Natalia Lafourcade", "Carla Morrison", "Los Ángeles Azules"],
        ["Silvana Estrada", "Lila Downs", "Julieta Venegas"],
        ["Son de Madera", "Los Cojolites", "Café Tacvba (acoustic)"],
        ["Omara Portuondo", "Silvio Rodríguez", "Soledad Bravo"]
      ),
    },
    ritual: { title: "Light Copal Incense", description: "Copal is the incense of Oaxacan ceremony — sacred, woody, ancient. Light a stick before you begin. Let its smoke fill the room. It signals that this is a different kind of evening." },
    funFacts: [
      "Cacao was sacred to the Aztec and Maya — used in ritual offerings, funeral rites, and as currency. In Oaxaca, the cacao ceremony is being revived as a heart-opening practice, using ceremonial-grade chocolate to soften the heart before medicine work.",
      "Copal incense has been burned in Mesoamerican ceremony for at least 3,000 years. Its smoke is understood to carry prayers to the spirit world and to open portals between the living and the dead.",
      "Día de los Muertos originated in Oaxaca — it's not mourning, it's reunion. On certain nights, the veil between worlds thins, and the dead are welcomed home with food, music, marigolds, and love.",
      "Oaxacan curanderos (healers) practice limpia — spiritual cleansing ceremonies using eggs, herbs, and prayer to remove energetic blockages. These practices have continued, largely unchanged, for centuries.",
    ],
    conversationPrompts: [
      "Copal smoke has been used for 3,000 years to carry prayers to the spirit world. If you could send one prayer right now — one message to the universe or to your future self — what would it be?",
      "Día de los Muertos isn't mourning — it's reunion. The dead are welcomed home, fed, celebrated. How do you think about your relationship with people you've lost? Do any of them feel present in your life?",
      "Cacao was a sacrament, not a snack — used to open the heart before ceremony. What opens your heart? What helps you drop into a more present, more feeling state?",
      "Curanderos perform cleansing rituals to remove what doesn't belong — accumulated weight, old grief, things that have outlasted their purpose. What are you ready to release?",
      "What's something you hope we carry from your family or cultural lineage into the life we're building together?",
    ],
    activity: { title: "Make your own hot sauce", description: "Blend roasted tomatillos, dried chiles, garlic, and cilantro. Season. Bottle it. Write the date on the label. You've made something that will last." },
    localAddOn: { title: "Find a local mezcal or tequila bar", description: "End the night with a proper mezcal tasting — neat, with an orange wedge and sal de gusano if available." },
    effort: "High",
    cost: "~$50",
    duration: "5-6 hours",
    scheduledDate: null,
    completed: false,
    completedAt: null,
    sethPhase: 1,
    elanaPhase: 1,
    sethRecipeChoice: null,
    elanaVibeChoice: null,
  },
  {
    month: 6,
    monthName: "June",
    theme: "Greece",
    destination: "Santorini, Greece",
    tagline: "Whitewashed walls, Aegean blue, and dinner as the sun goes down",
    intro: "June belongs to the Mediterranean. Greece is warmth and simplicity — olive oil, sea salt, lemon, and good company. Seth chooses the dish; Elana sets the tone. Tonight is slower than you think it needs to be, and that's the whole point. You'll eat outside if you can. You'll linger.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Whole Roasted Fish with Lemon, Olive Oil, and Herbs",
          cuisine: "Greek",
          description: "A whole sea bass or branzino roasted over sliced fennel and lemon, dressed with good olive oil and fresh herbs. Serve with Greek salad and tzatziki. Open a bottle of Assyrtiko.",
          difficulty: "Easy",
          prepTime: "45 minutes",
          ingredients: ["whole branzino or sea bass", "fennel", "lemon", "olive oil", "dill", "parsley", "garlic", "cherry tomatoes", "cucumber", "feta", "kalamata olives"],
        },
        {
          id: 2,
          dish: "Slow-Roasted Lamb Shoulder with Orzo (Kleftiko-Style)",
          cuisine: "Greek",
          description: "Lamb shoulder wrapped and slow-roasted with garlic, lemon, and oregano until it yields at a touch. Served with orzo cooked in the pan drippings. Hands-down impressive. This is the dish to source from a Long Island butcher — a bone-in shoulder makes it extraordinary.",
          difficulty: "High",
          prepTime: "4–5 hours",
          ingredients: ["bone-in lamb shoulder", "garlic", "lemon", "olive oil", "oregano", "rosemary", "orzo", "tomato", "feta", "parsley"],
        },
        {
          id: 3,
          dish: "Spanakopita and Mezze Spread",
          cuisine: "Greek",
          description: "Flaky spinach-and-feta pie with crisp phyllo, served alongside hummus, tzatziki, dolmades, and warm pita. A relaxed, abundant spread made for sharing.",
          difficulty: "Medium",
          prepTime: "2 hours",
          ingredients: ["phyllo dough", "spinach", "feta", "ricotta", "eggs", "butter", "chickpeas", "tahini", "yogurt", "cucumber", "dill", "grape leaves", "rice", "pita"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Greek",
        ["Eleftheria Arvanitaki", "Haris Alexiou", "Vasilis Papakonstantinou"],
        ["Dimitra Galani", "Anna Vissi", "Nikos Papazoglou"],
        ["Savina Yannatou", "Ross Daly", "Mikis Theodorakis"],
        ["Eleni Karaindrou", "Nikos Kypourgos", "Yannis Markopoulos"]
      ),
    },
    ritual: { title: "Olive Oil Toast", description: "Before dinner, pour a small dish of good olive oil. Dip bread into it together. One of you says what you're grateful for this month. The other says one thing they're looking forward to." },
    funFacts: [
      "The Eleusinian Mysteries were the most sacred rituals in the ancient Greek world — held for 2,000 years, initiates drank a brew called kykeon, believed to contain a psychedelic ergot preparation, to experience death and rebirth firsthand.",
      "The Oracle at Delphi was considered the navel of the world — a site where Pythia priestesses entered trance states to receive divine guidance. Every major city-state consulted it before war or significant decisions.",
      "Ancient Greeks practiced incubation — sleeping in sacred temples of Asclepius, the healer — to receive diagnostic dreams. The divine was believed to speak clearly through the sleeping mind.",
      "The word 'enthusiasm' comes from the Greek entheos — meaning 'filled with a god.' To be enthusiastic was, literally, to be inhabited by something larger than yourself.",
    ],
    conversationPrompts: [
      "For 2,000 years, the Greeks held secret ceremonies where initiates drank a sacred brew and encountered a genuine experience of death and rebirth — and came away transformed. What would it take for you to approach your own life with that level of intentionality?",
      "The Oracle at Delphi was consulted before every major decision in the ancient world. If you had access to genuine prophetic guidance right now, what's the one question you'd most want answered?",
      "Greek dream temples held that the divine speaks through sleep. Do you pay attention to your dreams? Has a dream ever told you something true that your waking mind was avoiding?",
      "Enthusiasm literally means 'filled with a god' — to be seized by something larger than yourself. What fills you with that? What makes you feel inhabited by something beyond ordinary consciousness?",
      "What kind of old people do you want us to be?",
    ],
    activity: { title: "Learn a few words of Greek together", description: "Spend 20 minutes learning basics — cheers (yamas!), I love you (s'agapo), thank you (efharisto). Then use them throughout dinner." },
    localAddOn: { title: "Find a rooftop or outdoor terrace for a drink", description: "If you can find somewhere with a view — even a rooftop bar or a park — go there for a drink after dinner. A view makes everything feel more expansive." },
    effort: "Medium",
    cost: "~$40",
    duration: "3-4 hours",
    scheduledDate: null,
    completed: false,
    completedAt: null,
    sethPhase: 1,
    elanaPhase: 1,
    sethRecipeChoice: null,
    elanaVibeChoice: null,
  },
  {
    month: 7,
    monthName: "July",
    theme: "Ethiopia",
    destination: "Addis Ababa, Ethiopia",
    tagline: "Eating with your hands and talking about everything at once",
    intro: "July is for something completely different. Ethiopian food is one of the most communal, abundant, and sensory dining experiences in the world — you eat from the same plate, you share everything, you feed each other. Seth picks what goes on the injera. Elana decides what fills the room.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Ethiopian Feast — Doro Wat, Misir, and Gomen on Injera",
          cuisine: "Ethiopian",
          description: "The full spread: spiced chicken stew (doro wat), red lentils (misir), braised greens (gomen), served on a large sheet of injera. No utensils. Tear the bread. Feed each other. Doro wat rewards a good free-range chicken — ask your butcher for a whole bird broken into pieces.",
          difficulty: "High",
          prepTime: "4 hours (+ injera fermentation overnight)",
          ingredients: ["chicken pieces", "berbere spice", "niter kibbeh", "red lentils", "collard greens", "onions", "garlic", "ginger", "injera teff flour", "eggs"],
        },
        {
          id: 2,
          dish: "Tibs (Sautéed Lamb) with Injera and Ayib",
          cuisine: "Ethiopian",
          description: "Quick-sautéed lamb with onions, jalapeños, rosemary, and berbere — Ethiopia's beloved bite-sized meat dish. Served with store-bought injera and fresh ayib cottage cheese. Faster and just as festive. Worth sourcing the lamb from a butcher — ask for leg or shoulder cut into small cubes.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["lamb leg or shoulder", "onion", "jalapeño", "rosemary", "berbere", "niter kibbeh or butter", "garlic", "ginger", "injera", "cottage cheese"],
        },
        {
          id: 3,
          dish: "Vegetarian Ethiopian Spread (Beyaynetu)",
          cuisine: "Ethiopian",
          description: "A colorful assortment of meatless dishes — yellow split pea alicha, red lentil misir, beet salad, collard greens, and cabbage — all served on injera. Abundant and completely extraordinary.",
          difficulty: "Medium",
          prepTime: "2.5 hours",
          ingredients: ["yellow split peas", "red lentils", "beets", "collard greens", "cabbage", "carrots", "onions", "garlic", "ginger", "berbere", "turmeric", "injera"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Ethiopian",
        ["Teddy Afro", "Aster Aweke", "Mahmoud Ahmed"],
        ["Mulatu Astatke", "Tlahoun Gèssèssè", "Hailu Mergia"],
        ["Ejigayehu 'Gigi' Shibabaw", "Dawit Yifru", "Abyssinia Infinite"],
        ["Emahoy Tsegué-Maryam Guèbrou", "Alèmu Aga", "Krar Collective"]
      ),
    },
    ritual: { title: "The Gursha", description: "In Ethiopian culture, gursha is feeding someone from your hand as an expression of love. Feed each other one bite at the beginning of the meal. Do it slowly. Make eye contact." },
    funFacts: [
      "Ethiopia is the literal birthplace of coffee — legend says a goat herder named Kaldi noticed his goats dancing after eating berries from a tree. The Ethiopian coffee ceremony (buna) is one of the most sacred social rituals in the world: three rounds, incense burning, full presence.",
      "The Ethiopian Orthodox Church — one of the oldest in the world — holds a mystical tradition that includes the Kebra Nagast, a sacred text claiming the Ark of the Covenant was brought to Aksum, Ethiopia, where it remains to this day.",
      "The bones of 'Lucy' (Australopithecus afarensis) — our earliest known human ancestor — were found in the Afar desert of Ethiopia and date to 3.2 million years ago. You are eating food from the literal cradle of humanity tonight.",
      "Ge'ez, the ancient liturgical language of the Ethiopian church, is still used in religious ceremony today — a 2,000-year-old language kept alive entirely by faith, song, and devotion.",
    ],
    conversationPrompts: [
      "Ethiopia is the birthplace of our species — 'Lucy' lived here 3.2 million years ago. When you let that depth of time land, how does it make you feel about your own small life? Does it shrink things, or does it open them?",
      "The Ethiopian coffee ceremony requires three full rounds and cannot be rushed — its explicit purpose is to create unhurried presence with the people you love. What would it look like in your life to make more time for that kind of deliberate, uninterrupted presence?",
      "Ethiopian tradition holds that the Ark of the Covenant — the holiest object in the world — is in a small chapel in Aksum, watched over by a single monk. What do you think the sacred is? Is it a place? An object? A quality of attention?",
      "The Ge'ez language has been kept alive for 2,000 years because it's sacred enough to protect. What in your own lineage — a language, a practice, a story — feels worth preserving and passing forward?",
      "What's something you believe about the nature of the universe — the really big picture — that you've never quite said out loud?",
    ],
    activity: { title: "Learn the Ethiopian coffee ceremony", description: "Ethiopia is the birthplace of coffee. Look up the traditional ceremony — roasting, grinding, multiple rounds. Make coffee together slowly and deliberately. Talk about what rituals mean in your life." },
    localAddOn: { title: "Find an Ethiopian restaurant", description: "Ethiopian food is best when someone else made the injera. Find a good local spot for a second dinner or dessert course." },
    effort: "Medium",
    cost: "~$35",
    duration: "3-4 hours",
    scheduledDate: null,
    completed: false,
    completedAt: null,
    sethPhase: 1,
    elanaPhase: 1,
    sethRecipeChoice: null,
    elanaVibeChoice: null,
  },
  {
    month: 8,
    monthName: "August",
    theme: "Thailand",
    destination: "Chiang Mai, Thailand",
    tagline: "Night markets, temple bells, and the heat of bird's eye chiles",
    intro: "August is for adventure and heat. Thailand's food is a symphony — sweet, sour, salty, spicy, all at once. The culture is gentle and precise and holds enormous depth. Seth picks his dish. Elana picks the energy of the room. Tonight you're at a northern Thai night market.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Larb Hed (Mushroom Larb) with Sticky Rice and Green Papaya Salad",
          cuisine: "Northern Thai",
          description: "A plant-forward take on the northern Thai classic — king oyster and shiitake mushrooms minced and tossed with toasted rice powder, fish sauce, lime, bird's eye chiles, fresh mint, and shallots. All the bold, herby, tangy energy of larb, built entirely on mushrooms. Serve with sticky rice and a crisp green papaya salad.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["king oyster mushrooms", "shiitake mushrooms", "toasted rice powder", "fish sauce", "lime juice", "bird's eye chiles", "fresh mint", "fresh cilantro", "shallots", "lemongrass", "glutinous rice", "green papaya", "dried shrimp", "peanuts", "palm sugar"],
        },
        {
          id: 2,
          dish: "Thai Green Curry with Jasmine Rice and Roti",
          cuisine: "Thai",
          description: "A fragrant coconut milk curry with handmade green paste, chicken, Thai eggplant, and kaffir lime leaves. Served over jasmine rice with pan-fried roti for dipping. Best with quality free-range chicken — the tenderness matters in a curry like this.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["chicken thighs", "coconut milk", "green curry paste", "Thai eggplant", "kaffir lime leaves", "fish sauce", "palm sugar", "jasmine rice", "Thai basil", "roti"],
        },
        {
          id: 3,
          dish: "Pad Thai with Shrimp",
          cuisine: "Thai",
          description: "The iconic stir-fried rice noodle dish — tangy tamarind, fish sauce, egg, shrimp, and bean sprouts, finished with peanuts, lime, and chili. Humble, perfect, and surprisingly satisfying to make from scratch.",
          difficulty: "Easy",
          prepTime: "45 minutes",
          ingredients: ["rice noodles", "large shrimp", "eggs", "tamarind paste", "fish sauce", "sugar", "bean sprouts", "scallions", "peanuts", "lime", "dried chili", "firm tofu"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Thai",
        ["Phum Viphurit", "Jeff Satur", "Stamp Apiwat"],
        ["Palmy", "Tilly Birds", "Klear"],
        ["Peck Palitchoke", "Carabao (acoustic)", "Potato"],
        ["Rasmee Wayrana", "Fong Naam", "Khun Narin's Electric Phin Band"]
      ),
    },
    ritual: { title: "Wai Each Other", description: "The Thai greeting is a bow with hands pressed together in prayer position. At the start of the evening, wai each other — a small bow, hands at heart center. A gesture of respect and presence." },
    funFacts: [
      "Thailand's forest monk tradition (phra thudong) involves wandering monks who live entirely in the forest, sleeping under trees and practicing deep meditation — the forest itself is understood as a vehicle for enlightenment.",
      "The Bodhi tree (Bo tree) — under which the Buddha achieved enlightenment — is sacred throughout Buddhist Asia. Cuttings from the original tree have been planted in monasteries around the world, each considered spiritually connected to the source.",
      "Thai Buddhism incorporates animism — phi (spirits) are believed to inhabit trees, rivers, homes, and land. Spirit houses (san phra phum) are placed outside every building to honor the spirits of the place.",
      "Muay Thai, Thailand's ancient martial art, began as a form of moving meditation and spiritual preparation — practitioners perform the Wai Kru ritual before every fight to honor teachers and invoke divine protection.",
    ],
    conversationPrompts: [
      "Thai forest monks practice an entire spiritual life through the simple act of walking slowly through trees — the forest is the practice. What does your relationship to slowness look like? Is it something you seek out, or something you resist?",
      "In Thai animism, spirits inhabit the trees, the rivers, the land itself — and you honor them with offerings. If you believed the natural world was alive and aware, what would you offer it? What would you want to say?",
      "The Bodhi tree under which the Buddha sat is considered spiritually potent across centuries — its cuttings carry something forward. What do you feel has been passed to you — from a person, a lineage, a place — that carries real weight?",
      "What's a fear you've been carrying that you're genuinely ready to put down?",
      "What would you do differently if you knew you couldn't fail and no one was watching?",
    ],
    activity: { title: "Make a Thai iced tea together", description: "Thai iced tea is a beautiful orange color and deeply satisfying. Brew the tea, add condensed milk, pour over ice. Make two and clink glasses. It's simple and feels like a treat." },
    localAddOn: { title: "Find a Thai massage studio", description: "Thai massage is one of the world's great physical arts. If there's a reputable studio nearby, book a couples session after dinner. You'll feel like new people." },
    effort: "Medium",
    cost: "~$35",
    duration: "3-4 hours",
    scheduledDate: null,
    completed: false,
    completedAt: null,
    sethPhase: 1,
    elanaPhase: 1,
    sethRecipeChoice: null,
    elanaVibeChoice: null,
  },
  {
    month: 9,
    monthName: "September",
    theme: "France",
    destination: "Paris, France",
    tagline: "Rue de Buci on a Saturday evening, wine in hand, nowhere to be",
    intro: "September calls for elegance and ease. France built an entire civilization around the idea that pleasure — in food, in company, in conversation — is a serious thing. Seth decides what goes on the table. Elana decides the feeling of the room. Tonight you take it seriously. You don't rush.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Roast Chicken with Herbes de Provence and Beurre Blanc",
          cuisine: "French",
          description: "A simple, perfect roast chicken — the French obsession, and for good reason. Trussed, dried, and roasted at high heat until the skin shatters. Served with a white wine butter sauce and roasted root vegetables. This is the dish that rewards a great bird — source a quality free-range chicken from a butcher for the full effect.",
          difficulty: "Medium",
          prepTime: "2 hours",
          ingredients: ["whole chicken", "herbes de Provence", "butter", "garlic", "shallots", "white wine", "chicken stock", "lemon", "root vegetables", "fresh thyme"],
        },
        {
          id: 2,
          dish: "Ratatouille Niçoise with Goat Cheese Crostini",
          cuisine: "French (Provençal)",
          description: "A slow-cooked Provençal vegetable stew — zucchini, eggplant, tomatoes, and peppers layered with garlic, thyme, and olive oil, finished in the oven until deeply fragrant. One of the most beautiful vegetarian dishes in French cooking. Serve with warm goat cheese crostini and a glass of Provence rosé.",
          difficulty: "Medium",
          prepTime: "2 hours",
          ingredients: ["zucchini", "eggplant", "tomatoes", "red bell pepper", "yellow bell pepper", "onion", "garlic", "fresh thyme", "fresh basil", "olive oil", "baguette", "goat cheese", "herbes de Provence"],
        },
        {
          id: 3,
          dish: "Moules Frites (Mussels and French Fries)",
          cuisine: "French",
          description: "The great Belgian-French bistro classic — mussels steamed in white wine, shallots, and herbs, served with a mountainous pile of crispy fries and aioli. Fast, festive, and utterly satisfying.",
          difficulty: "Easy",
          prepTime: "1 hour",
          ingredients: ["mussels", "white wine", "shallots", "garlic", "butter", "parsley", "thyme", "bay leaf", "russet potatoes", "frying oil", "mayonnaise", "garlic"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "French",
        ["Stromae", "Christine and the Queens", "Yelle"],
        ["Sébastien Tellier", "Jane Birkin", "Serge Gainsbourg"],
        ["Georges Brassens", "Juliette Gréco", "Henri Salvador"],
        ["Yann Tiersen", "Erik Satie", "Charlotte Gainsbourg"]
      ),
    },
    ritual: { title: "The Aperitif Hour", description: "Pour two glasses of Kir — white wine with a splash of cassis. Sit together before any cooking happens. No phones. No plans. Just drink and talk. The French call this l'apéro, and it's sacred." },
    funFacts: [
      "The Cathars of southern France, a medieval mystical sect, believed the material world was an illusion and that the soul was on a journey toward pure spirit. They practiced radical simplicity and believed in reincarnation — and were entirely wiped out in a crusade in the 13th century.",
      "The truffle grows underground in complete darkness, requiring a living symbiosis with oak tree roots — it cannot exist alone. Medieval healers called it 'earth medicine' and attributed regenerative properties to it. It is, literally, a product of relationship.",
      "France is home to the largest concentration of megalithic standing stones in the world — the Carnac stones of Brittany, over 3,000 stones in precise alignments, placed by a pre-Celtic people around 4,500 BCE. Their purpose remains genuinely unknown.",
      "Michel de Montaigne, the 16th-century French philosopher, invented the personal essay as an act of radical self-inquiry — he sat alone in a tower for years, writing honestly about what he found when he paid attention to his own experience. This was considered strange.",
    ],
    conversationPrompts: [
      "The Cathars believed the material world was a kind of beautiful trap and that the soul was on a long journey toward pure spirit. What's your relationship to the material world — do you feel at home in it, or is there some part of you always reaching for something beyond it?",
      "The truffle grows only in darkness, only in partnership with an oak — it literally cannot exist alone. What's something in your life that has only grown because of a specific relationship, a specific closeness with another person?",
      "Montaigne's whole project was honest self-observation — to sit alone and tell the truth about what he found inside himself. What's something honest you've observed about yourself recently, something your waking mind had been quietly avoiding?",
      "What does pleasure mean to you, spiritually? Is feeling good a path toward something, or is it already the thing?",
      "What's a part of yourself that you've been holding back — from me, from the world, from yourself?",
    ],
    activity: { title: "Make crêpes together", description: "Crêpes are simple and endlessly satisfying — thin, golden, filled with Nutella and banana, or savory with gruyère, egg, and spinach. Make a batch and eat them standing at the stove, taking turns." },
    localAddOn: { title: "Find a French bistro or wine bar", description: "After dinner, find a local wine bar or French bistro for a digestif — Calvados, Armagnac, or a final glass of Burgundy. Sit close together." },
    effort: "Medium",
    cost: "~$45",
    duration: "3-4 hours",
    scheduledDate: null,
    completed: false,
    completedAt: null,
    sethPhase: 1,
    elanaPhase: 1,
    sethRecipeChoice: null,
    elanaVibeChoice: null,
  },
  {
    month: 10,
    monthName: "October",
    theme: "Israel",
    destination: "Tel Aviv, Israel",
    tagline: "White City heat, Mediterranean salt, ancient earth, and a table that's always full",
    intro: "October is for depth and wonder. Tel Aviv is one of the most alive cities on earth — built on sand dunes, facing the sea, layered with thousands of years of meaning beneath a very modern surface. Its food is plant-forward and abundant, its culture is warm and argumentative and full of feeling. Seth picks the dish. Elana picks the feeling. Tonight you eat from the earth.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Israeli Mezze Spread",
          cuisine: "Israeli",
          description: "Hummus made from scratch (the real way — warm, silky, finished with good olive oil), baba ganoush roasted over an open flame, Israeli chopped salad, ful medames, soft-boiled eggs, and fresh pita from the oven. Tel Aviv has more vegans per capita than almost any city in the world, and this table is why. Completely plant-forward and utterly abundant.",
          difficulty: "High",
          prepTime: "3 hours",
          ingredients: ["dried chickpeas", "tahini", "eggplant", "garlic", "lemon", "olive oil", "tomatoes", "cucumber", "parsley", "mint", "fava beans", "cumin", "smoked paprika", "pita flour", "eggs", "za'atar"],
        },
        {
          id: 2,
          dish: "Shakshuka with Whipped Feta and Crusty Bread",
          cuisine: "Israeli",
          description: "Eggs poached in a spiced, slow-cooked tomato and pepper sauce — the most comforting thing you can make in one pan. Serve with crumbled or whipped feta on top, fresh herbs, and enough crusty bread to get every last bit. Simple, elemental, completely satisfying.",
          difficulty: "Easy",
          prepTime: "45 minutes",
          ingredients: ["eggs", "canned whole tomatoes", "red bell peppers", "onion", "garlic", "cumin", "smoked paprika", "chili flakes", "feta", "fresh herbs", "olive oil", "crusty bread"],
        },
        {
          id: 3,
          dish: "Whole Roasted Cauliflower with Tahini, Za'atar, and Pomegranate",
          cuisine: "Israeli",
          description: "A whole head of cauliflower roasted until dark and caramelized, served over whipped tahini and finished with pomegranate seeds, za'atar, and toasted pine nuts. Israeli cauliflower has had a moment — and it deserves every bit of it. Stunning, vegetarian, and deeply satisfying.",
          difficulty: "Easy",
          prepTime: "1.5 hours",
          ingredients: ["whole cauliflower", "tahini", "lemon", "garlic", "cumin", "za'atar", "smoked paprika", "pomegranate", "fresh herbs", "pine nuts", "olive oil", "flatbread"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Israeli",
        ["Omer Adam", "Noa Kirel", "Eden Alene"],
        ["Corinne Allal", "Idan Raichel", "Yael Naim"],
        ["Noa (Achinoam Nini)", "David Broza", "Dudu Tassa"],
        ["Ehud Banai", "Idan Raichel Project", "Yossi Banai"]
      ),
    },
    ritual: { title: "Olive Oil and Bread", description: "Pour a small bowl of the best olive oil you have. Tear bread and dip together before anything else happens. In Israeli culture, the table begins before the meal. Say one thing you're grateful for tonight. Then begin." },
    funFacts: [
      "Kabbalah, the Jewish mystical tradition, describes the universe as ten interconnected spheres of divine energy (the Sefirot) — a living map of consciousness and creation. It has influenced Sufism, Carl Jung, and almost every Western mystical tradition that followed.",
      "The desert surrounding Israel — the Negev and Sinai — has been used as a space for spiritual transformation for thousands of years. Moses, Jesus, and Mohammed all had their central visionary experiences in desert landscapes. Silence, heat, and emptiness are the oldest medicine.",
      "Some olive trees in Israel are over 2,000 years old and still bearing fruit. The olive branch carried by the dove to Noah was the first sign that the earth was habitable again. In Jewish tradition, to tend an olive tree is to participate in something older than any living memory.",
      "Israel is one of the only countries in the world to have reversed deforestation — it has more trees today than it did 100 years ago, planted tree by tree through collective national effort. An act of restoration as an act of prayer.",
    ],
    conversationPrompts: [
      "Kabbalah describes the universe as ten interconnected spheres of divine energy — a living map of how consciousness moves through the world and through us. If you could map your own inner life that way — the qualities that live in you — what would your map look like?",
      "Moses, Jesus, and Mohammed all went to the desert to be broken open by silence. Do you have a place, or a practice, where silence does something to you — where it's more than just quiet?",
      "Some olive trees here are 2,000 years old and still bearing fruit. What in your life do you want to tend carefully enough that it outlasts you?",
      "If you could design a ritual that brought you both back to the earth — something seasonal, something that marks time, something genuinely sacred — what would it look like?",
      "What does the word 'sacred' mean to you, in your actual experience — not as a concept, but as something you've felt?",
    ],
    activity: { title: "Make halva together", description: "Halva is one of the oldest sweets in the world — sesame paste, sugar, and time. It comes in countless variations across the Middle East. Find a recipe and make a simple version at home. It's meditative, a little alchemical, and deeply good." },
    localAddOn: { title: "Find an Israeli or Middle Eastern restaurant", description: "Look for a spot with good hummus and mezze — the kind where the food is the whole point. If you can find a place with outdoor seating, even better." },
    effort: "High",
    cost: "~$50",
    duration: "4-5 hours",
    scheduledDate: null,
    completed: false,
    completedAt: null,
    sethPhase: 1,
    elanaPhase: 1,
    sethRecipeChoice: null,
    elanaVibeChoice: null,
  },
  {
    month: 11,
    monthName: "November",
    theme: "Peru",
    destination: "Lima, Peru",
    tagline: "The city that quietly became one of the world's great food capitals",
    intro: "November calls for something bold. Peru's food is built on indigenous ingredients, Japanese technique, and West African soul. Seth picks the dish. Elana sets the mood. Lima surprised the world by being extraordinary. Tonight, let it surprise you.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Peruvian Ceviche and Lomo Saltado",
          cuisine: "Peruvian (Nikkei)",
          description: "Start with bright ceviche — fresh fish cured in lime with ají amarillo, red onion, and cilantro. Then make lomo saltado, the Peruvian-Chinese stir-fry of beef, tomatoes, and French fries. Two dishes. Two stories. The lomo saltado is elevated by quality beef sirloin — worth a butcher trip for this one.",
          difficulty: "Medium",
          prepTime: "2 hours",
          ingredients: ["fresh white fish", "lime juice", "ají amarillo", "red onion", "cilantro", "corn", "beef sirloin", "tomatoes", "soy sauce", "potatoes", "rice", "garlic"],
        },
        {
          id: 2,
          dish: "Ají de Gallina (Creamy Peruvian Chicken)",
          cuisine: "Peruvian",
          description: "Shredded chicken in a creamy, nutty ají amarillo sauce — one of Peru's most beloved dishes. Rich and warming, served over white rice with boiled eggs, olives, and potatoes. Best with a quality free-range chicken; the slow poaching is what makes the meat silky, so sourcing matters here.",
          difficulty: "Medium",
          prepTime: "2 hours",
          ingredients: ["chicken breasts", "ají amarillo paste", "bread", "walnuts", "parmesan", "milk", "onion", "garlic", "turmeric", "white rice", "eggs", "olives", "potato"],
        },
        {
          id: 3,
          dish: "Causa Limeña with Avocado and Salsa Criolla",
          cuisine: "Peruvian",
          description: "Peru's iconic cold potato terrine — layers of ají amarillo-spiked mashed potato filled with ripe avocado and topped with a bright salsa criolla of red onion, lime, and cilantro. One of the most elegant vegetarian dishes in South America, and one of the most beautiful things you'll ever plate at home.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["yellow potatoes", "ají amarillo paste", "lime", "ripe avocado", "red onion", "cilantro", "olive oil", "black olives", "hard-boiled eggs", "mayonnaise", "lettuce", "turmeric"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Peruvian",
        ["Gian Marco", "Mar de Copas", "Pedro Suárez-Vértiz"],
        ["Susana Baca", "Chabuca Granda", "Eva Ayllón"],
        ["Lucha Reyes", "Arturo Zambo Cavero", "Tania Libertad"],
        ["Andrés Prado", "Nicomedes Santa Cruz", "Carlos Hayre"]
      ),
    },
    ritual: { title: "The Pisco Sour Toast", description: "Make two pisco sours — pisco, lime juice, simple syrup, egg white, Angostura bitters. Shake hard. Pour carefully. Toast to one thing you've built together in the first eleven months." },
    funFacts: [
      "The San Pedro cactus (huachuma) has been used in Andean ceremony for at least 3,500 years — longer than almost any known plant medicine tradition on earth. It's considered a master teacher plant, used to access healing, vision, and direct contact with the sacred.",
      "Pachamama — Mother Earth — is still actively revered across the Andes. Despacho ceremonies involve intricate bundles of flowers, food, and sacred objects offered to her at moments of transition. The earth is understood as a living, feeling presence who can receive and give.",
      "The Andean concept of Sumak Kawsay (Buen Vivir) is a philosophy of life organized not around accumulation but around harmony — with community, with the natural world, and with oneself. It has influenced several South American constitutions.",
      "Ayahuasca — the vine of souls — has been used in Amazonian healing for thousands of years as a sacrament. The ceremony is understood as surgery on the soul, guided by a trained curandero, used to address trauma, illness, and spiritual disconnection.",
    ],
    conversationPrompts: [
      "The Andean tradition describes certain plants as 'teacher plants' — that they carry intelligence, and that working with them is a form of learning that cannot happen any other way. Do you believe the natural world holds wisdom we don't fully understand? Have you ever felt that?",
      "Pachamama is understood as a living, conscious being — the earth as a mother who can be wounded or grateful. When you think about your relationship to the planet — really think about it — what do you feel?",
      "Sumak Kawsay — 'good living' — organizes a life around harmony rather than accumulation. How would your life look different if that were truly your organizing principle?",
      "This is our eleventh month together. What's something about you that I know now that I couldn't have known at the beginning?",
      "What's the most alive you've ever felt? What were you doing, and what does that tell you about what you actually need?",
    ],
    activity: { title: "Design our first anniversary date", description: "Spend part of the evening planning month 12 together — your one-year celebration. Where do you want to go? What do you want to do? Make a plan, even if it's rough." },
    localAddOn: { title: "Find a Peruvian restaurant", description: "Peruvian food has had a global moment — there may be a restaurant nearby. If so, go for ceviche at the bar." },
    effort: "Medium",
    cost: "~$45",
    duration: "3-4 hours",
    scheduledDate: null,
    completed: false,
    completedAt: null,
    sethPhase: 1,
    elanaPhase: 1,
    sethRecipeChoice: null,
    elanaVibeChoice: null,
  },
  {
    month: 12,
    monthName: "December",
    theme: "Spain",
    destination: "Tenerife, Canary Islands",
    tagline: "An extinct volcano sacred to the ancients, a forest older than memory, and papas with mojo at midnight",
    intro: "December lands you in the Canary Islands — a volcanic archipelago off the African coast that belongs to Spain but feels like a world entirely its own. The Guanche people who lived here for thousands of years before Europe arrived left behind sacred mountains, ancient ceremonies, and the most primordial forest in the Western world. Seth cooks from the islands' volcanic pantry — wrinkled salted potatoes, slow-cooked meat, and the fiery green mojo that goes on everything. Elana sets the feeling of an island night.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Papas Arrugadas with Mojo Verde and Mojo Rojo + Slow-Braised Ropa Vieja Canaria",
          cuisine: "Canarian",
          description: "The defining dish of the Canary Islands: small potatoes boiled in heavily salted water until the skins wrinkle and coat in a fine salt crust. Served with two sauces — mojo verde (green herb and garlic) and mojo rojo (smoky dried pepper and cumin). Alongside, ropa vieja canaria: shredded beef or chicken braised low and slow with tomatoes, chickpeas, saffron, and wine until it falls apart. Island comfort food at its most complete.",
          difficulty: "Medium",
          prepTime: "2.5 hours",
          ingredients: ["small waxy potatoes", "coarse sea salt", "fresh cilantro", "garlic", "green pepper", "cumin", "olive oil", "white wine vinegar", "dried guindilla peppers", "beef or chicken thighs", "chickpeas", "tomatoes", "saffron", "white wine", "onion"],
        },
        {
          id: 2,
          dish: "Grilled Dorado (Mahi-Mahi) with Mojo Verde, Roasted Sweet Potatoes, and Canarian Salad",
          cuisine: "Canarian (Seafood)",
          description: "Dorado is the fish of the Canaries — firm, meaty, and perfectly suited to the grill. Score the fish deeply, rub with olive oil and sea salt, and grill over high heat until the skin crisps and the flesh pulls apart in clean flakes. Serve with mojo verde, roasted sweet potatoes from the island, and a simple salad of tomatoes, onion, and local cheese (substitute manchego). The whole plate tastes like somewhere warm and unhurried.",
          difficulty: "Medium",
          prepTime: "45 minutes",
          ingredients: ["mahi-mahi fillets (or whole fish if possible)", "olive oil", "sea salt", "fresh cilantro", "garlic", "green pepper", "cumin", "vinegar", "sweet potatoes", "cherry tomatoes", "manchego or similar firm cheese", "red onion"],
        },
        {
          id: 3,
          dish: "Canarian Stew: Puchero Canario",
          cuisine: "Canarian",
          description: "The Canary Islands version of a classic Spanish cocido — a generous pot of beef, chicken, chorizo, chickpeas, corn, green beans, potatoes, pumpkin, and cabbage cooked together in a rich broth until everything softens and the stock becomes deep and golden. Ladled into bowls with crusty bread and mojo on the side. This is the food of the islands' interior — sustaining, generous, and deeply satisfying on a cold December night.",
          difficulty: "Medium",
          prepTime: "3 hours",
          ingredients: ["beef short rib or chuck", "chicken thigh", "chorizo", "chickpeas", "corn cob", "green beans", "waxy potatoes", "pumpkin", "cabbage", "carrots", "onion", "garlic", "saffron", "fresh herbs"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Canary Islands",
        ["Totó la Momposina", "Buena Vista Social Club", "Omara Portuondo"],
        ["Chambao", "Ojos de Brujo", "Rosalía"],
        ["Niño de Elche", "Estrella Morente", "Pepe de Lucía"],
        ["La Monterías", "Benito Cabrera", "Pedro Guerra"]
      ),
    },
    ritual: { title: "Light a Candle for the Guanche", description: "Before dinner, light a candle together. The Guanche people — the original Canarians — believed that Teide, the great volcano, was a sacred mountain holding the underworld in balance. Hold the flame for a moment and offer a word of thanks to whatever ancient force is in the earth beneath where you live. Then set it in the center of the table." },
    funFacts: [
      "The Guanche people who inhabited the Canary Islands for thousands of years before European contact practiced a sophisticated form of ancestor veneration — mummifying their dead in ways strikingly similar to ancient Egypt. Their sacred mountain, Teide, was believed to be the prison of Guayota, a demon god, held in check by the sun. When the volcano erupted, the Guanche understood it as the underworld breaking free.",
      "The Laurisilva forest of La Gomera — a UNESCO World Heritage site — is a living relic of the Tertiary period, over 20 million years old. It is the largest surviving subtropical laurel forest in the world, a dense, mossy cathedral where the trees are draped in lichen and the air is made of moisture. It is one of the few places on Earth where you can walk inside a forest that once covered all of Europe.",
      "The Dragon Tree (Drago) is the sacred tree of the Canary Islands — Dracaena draco, some specimens over a thousand years old. Its sap runs blood-red, called 'dragon's blood,' used by the Guanche in ritual ceremonies, wound healing, and mummification. For the Guanche, the dragon tree was a portal between the living and the dead.",
      "The Canary Islands sit directly on the meeting point of European, African, and Atlantic currents — biologically, linguistically, and spiritually they are a crossroads. The Spanish arrived and the Guanche were absorbed; the African coast is visible on clear days. The volcanic soil grows the most mineral-rich produce in Europe. The islands are a place where elemental forces — fire, ocean, wind, and age — converge in one small archipelago.",
    ],
    conversationPrompts: [
      "The Guanche people believed that a volcano was literally holding the underworld in check — that sacred mountains were the hinges between worlds. What's your relationship to sacred geography? Is there a place on Earth that you feel holds real power, where the air is different, where something about the place changes you?",
      "The Laurisilva forest has been alive for 20 million years — it was already ancient when our species first walked upright. When you imagine a forest that has stood for that long, what does it make you feel? Does deep time make you feel small, or does it make you feel held?",
      "Dragon's blood — the red resin of the Dragon Tree — was used for healing, ceremony, and bridging the living and the dead. What do you believe about what remains after death? Not intellectually: what do you actually sense?",
      "The Canary Islands are a crossroads — Europe, Africa, and the Atlantic converging in one small volcanic chain. You both carry multiple lineages, multiple streams. When you think about where you come from, which current feels most alive in you right now?",
      "We've traveled through twelve places this year. Which one left something in you? Which one taught you something about yourself, or us, that you're still living with?",
    ],
    activity: { title: "Make mojo verde together from scratch", description: "Mojo verde is the sauce that runs through everything in the Canary Islands — cilantro, garlic, green pepper, cumin, olive oil, and vinegar, all smashed in a mortar or blended until thick and electric green. Make it by hand if you can — the mortar changes something. Taste it as you build it. It should be bright, pungent, and alive." },
    localAddOn: { title: "Find a Spanish or tapas bar", description: "After dinner, find a good local tapas bar or Spanish wine spot. Order patatas bravas, a glass of Manzanilla sherry or a Spanish red, and sit close. Pretend you're in the islands for a little while longer." },
    effort: "Medium",
    cost: "~$45",
    duration: "3-4 hours",
    scheduledDate: null,
    completed: false,
    completedAt: null,
    sethPhase: 1,
    elanaPhase: 1,
    sethRecipeChoice: null,
    elanaVibeChoice: null,
  },
];

const CHECKLIST_ITEMS: Record<number, { label: string; phase: number; person: "seth" | "elana" | "both" }[]> = {
  1: [
    { label: "Seth: Browse the recipe options and decide which dish calls to you", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe for the evening — what are you in the mood for?", phase: 1, person: "elana" },
    { label: "Seth: Source ingredients — find an Asian grocery if possible", phase: 1, person: "seth" },
    { label: "Seth: Make dashi stock, clean and slice all vegetables, and measure out your soy and mirin", phase: 2, person: "seth" },
    { label: "Elana: Build your playlist based on your chosen vibe", phase: 2, person: "elana" },
    { label: "Both: Schedule the date night and set the table together", phase: 3, person: "both" },
  ],
  2: [
    { label: "Seth: Read all three recipes and pick the one that excites you most", phase: 1, person: "seth" },
    { label: "Elana: Choose your vibe for the evening", phase: 1, person: "elana" },
    { label: "Seth: Source preserved lemons, ras el hanout spices, and any specialty items", phase: 1, person: "seth" },
    { label: "Seth: Marinate any proteins, toast and grind spices, and prep your mise en place", phase: 2, person: "seth" },
    { label: "Elana: Build your Moroccan playlist around your chosen mood", phase: 2, person: "elana" },
    { label: "Both: Light candles, put out cushions or rugs if you have them, set the table Moroccan-style", phase: 3, person: "both" },
  ],
  3: [
    { label: "Seth: Choose the Italian dish — are you feeling pasta, fish, or something rich?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — Italian evenings can go many ways", phase: 1, person: "elana" },
    { label: "Seth: Buy good wine, fresh pasta ingredients or high-quality dried pasta", phase: 1, person: "seth" },
    { label: "Seth: If making fresh pasta, rest the dough; pre-make sauce and grate cheese — Italian timing is everything", phase: 2, person: "seth" },
    { label: "Elana: Curate your Italian playlist to match the vibe you chose", phase: 2, person: "elana" },
    { label: "Both: Open the wine before you cook. That's the rule.", phase: 3, person: "both" },
  ],
  4: [
    { label: "Seth: Pick your Indian dish — are you up for biryani, or keeping it weeknight?", phase: 1, person: "seth" },
    { label: "Elana: Choose the feeling — India has many moods", phase: 1, person: "elana" },
    { label: "Seth: Visit an Indian grocery for fresh spices and any specialty items", phase: 1, person: "seth" },
    { label: "Seth: Toast and bloom your spices, marinate proteins overnight or for a few hours, and pre-cook any lentils", phase: 2, person: "seth" },
    { label: "Elana: Build your playlist, maybe order henna cones for tonight", phase: 2, person: "elana" },
    { label: "Both: Clear the table, lay out some color — India is not a minimalist country", phase: 3, person: "both" },
  ],
  5: [
    { label: "Seth: Decide — do you want to tackle mole, or go for something you can fully execute?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — Mexican evenings can be joyful or deeply soulful", phase: 1, person: "elana" },
    { label: "Seth: Source dried chiles, Mexican chocolate, and any specialty items", phase: 1, person: "seth" },
    { label: "Seth: Rehydrate dried chiles, make your mole or salsa base — it improves with time", phase: 2, person: "seth" },
    { label: "Elana: Build your Oaxacan playlist around your chosen mood", phase: 2, person: "elana" },
    { label: "Both: Light the copal incense and set out mezcal if you have it", phase: 3, person: "both" },
  ],
  6: [
    { label: "Seth: Choose the Greek dish — whole fish, slow lamb, or a mezze spread?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — the Mediterranean has many faces", phase: 1, person: "elana" },
    { label: "Seth: Find good Greek olive oil, feta, and any fresh fish if going that route", phase: 1, person: "seth" },
    { label: "Seth: Marinate proteins in lemon and herbs, prep your vegetables, and make any dips or spreads ahead of time", phase: 2, person: "seth" },
    { label: "Elana: Build your Greek playlist and find a good bottle of Assyrtiko or rosé", phase: 2, person: "elana" },
    { label: "Both: Eat outside if possible. Greece is not an indoor sport.", phase: 3, person: "both" },
  ],
  7: [
    { label: "Seth: Choose your Ethiopian spread — how ambitious are you feeling?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — Ethiopian music is full of feeling", phase: 1, person: "elana" },
    { label: "Seth: Source berbere spice, teff flour or store-bought injera, niter kibbeh", phase: 1, person: "seth" },
    { label: "Seth: Make your injera batter if from scratch (needs fermentation time), prep your stew base", phase: 2, person: "seth" },
    { label: "Elana: Build your Ethiopian playlist for the evening", phase: 2, person: "elana" },
    { label: "Both: Clear the table — no plates, just the injera. Eat with your hands.", phase: 3, person: "both" },
  ],
  8: [
    { label: "Seth: Choose your Thai dish — are you feeling light or bold tonight?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — Thai music runs from meditative to electric", phase: 1, person: "elana" },
    { label: "Seth: Source fish sauce, galangal, kaffir lime leaves, and Thai basil if possible", phase: 1, person: "seth" },
    { label: "Seth: Make your curry paste or bloom aromatics, prep rice and any garnishes", phase: 2, person: "seth" },
    { label: "Elana: Build your Thai playlist for the evening", phase: 2, person: "elana" },
    { label: "Both: Make Thai iced tea for welcome drinks before cooking", phase: 3, person: "both" },
  ],
  9: [
    { label: "Seth: Choose the French dish — are you feeling classic, bistro, or indulgent?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — French evenings have enormous range", phase: 1, person: "elana" },
    { label: "Seth: Buy a good French wine and any specialty ingredients you need", phase: 1, person: "seth" },
    { label: "Seth: Prep any slow-cook components first — ratatouille base, braise, or sauce — French cooking rewards patience", phase: 2, person: "seth" },
    { label: "Elana: Build your French playlist for the evening", phase: 2, person: "elana" },
    { label: "Both: Pour the kir before any cooking starts. L'apéro is law.", phase: 3, person: "both" },
  ],
  10: [
    { label: "Seth: Pick the Israeli centerpiece — full mezze spread, shakshuka, or dramatic roasted cauliflower?", phase: 1, person: "seth" },
    { label: "Elana: Choose the feeling — Tel Aviv has enormous range, from electric to deeply still", phase: 1, person: "elana" },
    { label: "Seth: Source dried chickpeas (not canned), tahini, za'atar, and good olive oil", phase: 1, person: "seth" },
    { label: "Seth: Soak chickpeas overnight if making hummus from scratch — it makes all the difference", phase: 2, person: "seth" },
    { label: "Elana: Build your Israeli playlist for the evening", phase: 2, person: "elana" },
    { label: "Both: Set out the olive oil and bread before anything else. The table starts before the meal.", phase: 3, person: "both" },
  ],
  11: [
    { label: "Seth: Choose your Peruvian adventure — ceviche, ají de gallina, or causa?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — Peru has layers", phase: 1, person: "elana" },
    { label: "Seth: Source ají amarillo paste, pisco, and any specialty ingredients", phase: 1, person: "seth" },
    { label: "Seth: Marinate proteins, make your ají amarillo base, prep any ceviche brine", phase: 2, person: "seth" },
    { label: "Elana: Build your Peruvian playlist for the evening", phase: 2, person: "elana" },
    { label: "Both: Make pisco sours before the meal. Toast to eleven months.", phase: 3, person: "both" },
  ],
  12: [
    { label: "Seth: Choose your recipe — papas arrugadas with ropa vieja, grilled dorado, or the full Canarian stew", phase: 1, person: "seth" },
    { label: "Elana: Choose the vibe for your island night — flamenco-electric, warm and sexy, slow and oceanic, or deeply still", phase: 1, person: "elana" },
    { label: "Seth: Source waxy small potatoes, coarse sea salt, and fresh cilantro for the mojo", phase: 1, person: "seth" },
    { label: "Seth: Make the mojo verde by hand if possible — mortar and pestle, layer by layer; start any braises early", phase: 2, person: "seth" },
    { label: "Elana: Build your Canarian playlist around your chosen mood — it should feel like warm wind off volcanic stone", phase: 2, person: "elana" },
    { label: "Both: Light a candle for the Guanche and set the table before dinner", phase: 3, person: "both" },
  ],
};

export async function seed() {
  const existing = await db.select().from(datePlansTable).limit(1);
  if (existing.length > 0) {
    const firstRow = existing[0];
    const dinner = firstRow.dinner as Record<string, unknown>;
    const hasNewFormat = Array.isArray(dinner?.options);
    if (hasNewFormat) {
      const existingFunFacts = firstRow.funFacts as unknown[];
      const missingFunFacts = !existingFunFacts || existingFunFacts.length === 0;
      if (missingFunFacts) {
        logger.info("Date plans exist but funFacts are missing — updating content for all 12 months...");
        for (const plan of DATE_PLANS) {
          await db
            .update(datePlansTable)
            .set({ funFacts: plan.funFacts, conversationPrompts: plan.conversationPrompts })
            .where(eq(datePlansTable.month, plan.month));
        }
        logger.info("Content update complete — funFacts and conversation prompts refreshed");
      }

      const month12Row = await db.select().from(datePlansTable).where(eq(datePlansTable.month, 12)).limit(1);
      if (month12Row.length > 0 && month12Row[0].theme === "Anywhere You Want") {
        logger.info("Month 12 still has anniversary placeholder — replacing with Spain/Canary Islands content...");
        const spain = DATE_PLANS.find(p => p.month === 12)!;
        await db
          .update(datePlansTable)
          .set({
            theme: spain.theme,
            destination: spain.destination,
            tagline: spain.tagline,
            intro: spain.intro,
            dinner: spain.dinner,
            music: spain.music,
            ritual: spain.ritual,
            funFacts: spain.funFacts,
            conversationPrompts: spain.conversationPrompts,
            activity: spain.activity,
            localAddOn: spain.localAddOn,
            effort: spain.effort,
            cost: spain.cost,
            duration: spain.duration,
          })
          .where(eq(datePlansTable.month, 12));
        logger.info("Month 12 updated to Spain/Canary Islands");
      }
      const firstChecklist = await db.select().from(checklistItemsTable).limit(1);
      const checklistHasPersonData = firstChecklist.length > 0 && firstChecklist[0].person !== "both";
      if (checklistHasPersonData || firstChecklist.length === 0) {
        if (firstChecklist.length === 0) {
          logger.info("Date plans exist but checklist is empty — seeding checklist items...");
          for (const [monthStr, items] of Object.entries(CHECKLIST_ITEMS)) {
            const month = parseInt(monthStr, 10);
            for (const item of items) {
              await db.insert(checklistItemsTable).values({ month, label: item.label, completed: false, phase: item.phase, person: item.person });
            }
          }
          logger.info("Checklist seed complete");
        } else {
          logger.info("Seed data already exists in new format, skipping");
        }
        return;
      }
      logger.info("Checklist items lack phase/person data — clearing and re-seeding checklist...");
      await db.delete(checklistItemsTable);
      for (const [monthStr, items] of Object.entries(CHECKLIST_ITEMS)) {
        const month = parseInt(monthStr, 10);
        for (const item of items) {
          await db.insert(checklistItemsTable).values({ month, label: item.label, completed: false, phase: item.phase, person: item.person });
        }
      }
      logger.info("Checklist re-seed complete");
      return;
    }
    logger.info("Legacy seed data detected — clearing and re-seeding with new format...");
    await db.delete(checklistItemsTable);
    await db.delete(datePlansTable);
  }

  logger.info("Seeding date plans...");
  for (const plan of DATE_PLANS) {
    await db.insert(datePlansTable).values(plan);
  }

  logger.info("Seeding checklist items...");
  for (const [monthStr, items] of Object.entries(CHECKLIST_ITEMS)) {
    const month = parseInt(monthStr, 10);
    for (const item of items) {
      await db.insert(checklistItemsTable).values({
        month,
        label: item.label,
        completed: false,
        phase: item.phase,
        person: item.person,
      });
    }
  }

  logger.info("Seed complete — 12 date plans and checklist items loaded");
}
