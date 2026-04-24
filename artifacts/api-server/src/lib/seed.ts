import { db, datePlansTable, checklistItemsTable } from "@workspace/db";
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
          dish: "Miso Ramen with Chashu Pork",
          cuisine: "Japanese",
          description: "A rich miso broth, slow-cooked pork belly, soft-boiled marinated egg, nori, scallions, and bamboo shoots. Deeply comforting and worth every hour.",
          difficulty: "Medium",
          prepTime: "2–3 hours",
          ingredients: ["pork belly", "miso paste", "ramen noodles", "eggs", "nori", "scallions", "bamboo shoots", "soy sauce", "mirin", "garlic", "ginger"],
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
          description: "Crispy panko-breaded chicken cutlet over fluffy rice, drenched in a mild, fragrant Japanese curry. Comfort food at its most satisfying.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["chicken breast", "panko breadcrumbs", "eggs", "flour", "Japanese curry roux", "onion", "potato", "carrot", "short-grain rice"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Japanese",
        ["Nujabes", "Shing02", "Kan Sano"],
        ["Hiromi Uehara", "Ryo Fukui", "Haruomi Hosono"],
        ["Ólafur Arnalds", "Nils Frahm", "Midori Takada"],
        ["Kodo", "Satoshi Ashikawa", "Hiroshi Yoshimura"]
      ),
    },
    ritual: { title: "The Tea Ceremony", description: "Begin the evening by making two cups of matcha together. One person whisks while the other holds the bowl warm. Bow to each other before drinking. Let this signal that tonight is yours." },
    conversationPrompts: [
      "What's something about your upbringing that still shapes how you love people today?",
      "If we could live anywhere in the world for one year, where would you want to go and why?",
      "What's one thing you want to understand about me that you haven't figured out yet?",
      "What does a perfect ordinary Tuesday look like to you, five years from now?",
      "What's something you've never told anyone that you'd feel safe telling me?",
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
          description: "Slow-braised lamb with warming spices — cumin, coriander, cinnamon, ginger — served over couscous with a bright lemon finish. Rich, complex, and deeply romantic.",
          difficulty: "High",
          prepTime: "3–4 hours",
          ingredients: ["lamb shoulder", "preserved lemon", "green olives", "onion", "garlic", "cumin", "coriander", "cinnamon", "ginger", "saffron", "couscous", "fresh cilantro"],
        },
        {
          id: 2,
          dish: "Chicken Bastilla (Pastilla)",
          cuisine: "Moroccan",
          description: "A spectacular sweet-savory pie — spiced chicken with almonds, eggs, and cinnamon wrapped in flaky warqa pastry dusted with powdered sugar. The most impressive thing you will ever make.",
          difficulty: "High",
          prepTime: "3 hours",
          ingredients: ["chicken thighs", "phyllo dough", "almonds", "eggs", "onion", "saffron", "cinnamon", "ginger", "parsley", "butter", "powdered sugar"],
        },
        {
          id: 3,
          dish: "Harira Soup with Kefta and Flatbread",
          cuisine: "Moroccan",
          description: "Morocco's beloved tomato and lentil soup, rich with herbs and spices, served alongside lamb kefta meatballs and warm flatbread. Humble, nourishing, and deeply flavored.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["lamb mince", "lentils", "chickpeas", "tomatoes", "celery", "onion", "coriander", "cumin", "cinnamon", "lemon", "fresh herbs", "flatbread"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Moroccan",
        ["Gnawa Diffusion", "Hoba Hoba Spirit", "Oum"],
        ["Hassan Hakmoun", "Maalem Mahmoud Guinia", "Amina Alaoui"],
        ["Tinariwen", "Aziz Sahmaoui", "Group Doueh"],
        ["Nass El Ghiwane", "Maâlem Abdeslam Alikane", "Fatima Tabaamrant"]
      ),
    },
    ritual: { title: "Light a Candle, Make a Wish", description: "Before dinner, light a candle together. Each of you speaks one wish for this year of marriage — not out loud if you don't want to. Then light a second candle. Keep them both burning through dinner." },
    conversationPrompts: [
      "What tradition from your family do you most want to carry into ours?",
      "What's something you've changed your mind about since we got together?",
      "When do you feel most seen by me?",
      "What's a dream you've never said aloud to anyone, that you're willing to say now?",
      "If we could do one completely spontaneous thing tomorrow, what would it be?",
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
          description: "Bone-in beef short ribs braised for hours in red wine, tomato, and aromatics until they fall apart. Tossed with wide ribbons of pasta. Deeply satisfying and inherently romantic.",
          difficulty: "High",
          prepTime: "4 hours",
          ingredients: ["beef short ribs", "red wine", "canned tomatoes", "onion", "carrot", "celery", "garlic", "rosemary", "thyme", "pappardelle", "parmesan"],
        },
        {
          id: 3,
          dish: "Risotto al Limone with Pan-Seared Scallops",
          cuisine: "Italian",
          description: "A silky, bright lemon risotto finished with parmesan and butter, topped with perfectly seared sea scallops. Elegant, achievable, and stunning.",
          difficulty: "Medium",
          prepTime: "1 hour",
          ingredients: ["arborio rice", "dry white wine", "lemon", "parmesan", "butter", "onion", "sea scallops", "chicken stock", "fresh thyme", "olive oil"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Italian",
        ["Lucio Battisti", "Mina", "Adriano Celentano"],
        ["Paolo Conte", "Nino Rota", "Ornella Vanoni"],
        ["Ludovico Einaudi", "Fabrizio De André", "Francesco De Gregori"],
        ["Giovanni Sollima", "Arvo Pärt", "Max Richter"]
      ),
    },
    ritual: { title: "The First Toast", description: "Pour two glasses before you begin cooking. Look each other in the eye. One of you proposes a toast — not rehearsed, just honest. Whatever comes up is the right thing." },
    conversationPrompts: [
      "What's something that happened in our first months of marriage that surprised you in a good way?",
      "What's your earliest memory of knowing you loved me?",
      "If you could go back and tell your younger self one thing about relationships, what would it be?",
      "What does home mean to you, and are we there yet?",
      "What's one thing I do that makes you feel deeply cared for?",
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
          description: "Layer basmati rice with slow-cooked spiced lamb, caramelized onions, saffron, and whole spices. Seal the pot. Open it at the table. The smell alone is an occasion.",
          difficulty: "High",
          prepTime: "4 hours",
          ingredients: ["lamb leg pieces", "basmati rice", "onions", "yogurt", "saffron", "ghee", "whole spices", "fresh mint", "fried onions", "rose water", "naan", "cucumber", "yogurt"],
        },
        {
          id: 2,
          dish: "Butter Chicken (Murgh Makhani) with Garlic Naan",
          cuisine: "Indian (Punjabi)",
          description: "Tender chicken in a velvety tomato-cream sauce, warmly spiced with garam masala and fenugreek. One of the world's great comfort dishes, served with pillowy homemade naan.",
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
        ["A.R. Rahman", "Shankar-Ehsaan-Loy", "Pritam"],
        ["Norah Jones", "Anoushka Shankar", "Shubha Mudgal"],
        ["Ravi Shankar", "Hariprasad Chaurasia", "L. Subramaniam"],
        ["Zakir Hussain", "Niladri Kumar", "Vishwa Mohan Bhatt"]
      ),
    },
    ritual: { title: "Apply Henna Together", description: "Order henna cones online. Draw simple patterns on each other's hands — nothing has to be perfect. Let them dry. Talk about what the symbols mean to you." },
    conversationPrompts: [
      "What's something about South Asian culture — the food, art, or philosophy — that's always drawn you in?",
      "When was the last time you felt truly joyful, without any reason to hold back?",
      "What's something you're afraid of that you've never said to me?",
      "How do you want us to handle disagreement differently than you've seen it handled before?",
      "What's a cultural practice or ritual from any tradition that you'd love to bring into our life?",
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
          description: "The mole is the project — dried chiles, chocolate, spices, and patience. It takes time, which is exactly the point. Make it together over the afternoon so dinner feels like an arrival.",
          difficulty: "High",
          prepTime: "4–6 hours",
          ingredients: ["chicken thighs", "mulato chiles", "ancho chiles", "pasilla chiles", "dark chocolate", "tomatoes", "onion", "garlic", "plantain", "raisins", "sesame seeds", "spices", "black beans", "rice"],
        },
        {
          id: 2,
          dish: "Tlayudas with Tasajo and Black Bean Paste",
          cuisine: "Oaxacan",
          description: "Oaxaca's iconic open-face flatbread — a large crisped tortilla spread with black bean paste, Oaxacan cheese, and tasajo (thin-sliced dried beef), finished with fresh toppings. Street food elevated.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["large tortillas", "black beans", "Oaxacan cheese", "tasajo or skirt steak", "avocado", "tomato", "cilantro", "lettuce", "jalapeño", "lime"],
        },
        {
          id: 3,
          dish: "Enchiladas in Salsa Verde with Queso Fresco",
          cuisine: "Mexican",
          description: "Corn tortillas filled with braised chicken, bathed in a roasted tomatillo salsa verde, and topped with crumbled queso fresco and crema. Vibrant, tangy, and impossible not to love.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["tomatillos", "chicken thighs", "corn tortillas", "queso fresco", "Mexican crema", "onion", "garlic", "jalapeño", "cilantro", "lime"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Mexican",
        ["Natalia Lafourcade", "Carla Morrison", "Los Ángeles Azules"],
        ["Lila Downs", "Julieta Venegas", "Tania Libertad"],
        ["Los Cojolites", "Son de Madera", "Café Tacvba (acoustic)"],
        ["Silvio Rodríguez", "Omara Portuondo", "Niña Pastori"]
      ),
    },
    ritual: { title: "Light Copal Incense", description: "Copal is the incense of Oaxacan ceremony — sacred, woody, ancient. Light a stick before you begin. Let its smoke fill the room. It signals that this is a different kind of evening." },
    conversationPrompts: [
      "What's a family recipe — from anyone in your family — that means something to you?",
      "What's one story from your childhood that you haven't told me yet?",
      "If you could have dinner with anyone who's passed away from your family, who would it be and what would you ask them?",
      "What does generosity mean to you, and who taught it to you?",
      "What part of your cultural identity do you most want our home to reflect?",
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
          description: "Lamb shoulder wrapped and slow-roasted with garlic, lemon, and oregano until it yields at a touch. Served with orzo cooked in the pan drippings. Hands-down impressive.",
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
        ["George Dalaras", "Haris Alexiou", "Vasilis Papakonstantinou"],
        ["Nikos Papazoglou", "Dimitra Galani", "Marinella"],
        ["Savina Yannatou", "Stelios Keromytis", "Mikis Theodorakis"],
        ["Ross Daly", "Nikos Kypourgos", "Yannis Markopoulos"]
      ),
    },
    ritual: { title: "Olive Oil Toast", description: "Before dinner, pour a small dish of good olive oil. Dip bread into it together. One of you says what you're grateful for this month. The other says one thing they're looking forward to." },
    conversationPrompts: [
      "What does simplicity mean to you in the context of a life well-lived?",
      "What's a place you've been to that changed how you see the world?",
      "If we had a whole week with nothing scheduled, how would you want to spend it?",
      "What's something about how I see the world that you find genuinely surprising or admirable?",
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
          description: "The full spread: spiced chicken stew (doro wat), red lentils (misir), braised greens (gomen), served on a large sheet of injera. No utensils. Tear the bread. Feed each other.",
          difficulty: "High",
          prepTime: "4 hours (+ injera fermentation overnight)",
          ingredients: ["chicken pieces", "berbere spice", "niter kibbeh", "red lentils", "collard greens", "onions", "garlic", "ginger", "injera teff flour", "eggs"],
        },
        {
          id: 2,
          dish: "Tibs (Sautéed Lamb) with Injera and Ayib",
          cuisine: "Ethiopian",
          description: "Quick-sautéed lamb with onions, jalapeños, rosemary, and berbere — Ethiopia's beloved bite-sized meat dish. Served with store-bought injera and fresh ayib cottage cheese. Faster and just as festive.",
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
        ["Mahmoud Ahmed", "Aster Aweke", "Teddy Afro"],
        ["Mulatu Astatke", "Hailu Mergia", "Tlahoun Gèssèssè"],
        ["Ejigayehu 'Gigi' Shibabaw", "Alèmu Aga", "Dawit Yifru"],
        ["Krar Collective", "Hailu Mergia (solo)", "Emahoy Tsegué-Maryam Guèbrou"]
      ),
    },
    ritual: { title: "The Gursha", description: "In Ethiopian culture, gursha is feeding someone from your hand as an expression of love. Feed each other one bite at the beginning of the meal. Do it slowly. Make eye contact." },
    conversationPrompts: [
      "What's something about how your family expressed love that you want to carry forward?",
      "What does it mean to you to be truly generous with another person?",
      "What's an assumption you've made about me that turned out to be wrong?",
      "What's something that consistently brings you joy that has nothing to do with achievement?",
      "What do you think we'll be talking about at this same table in 30 years?",
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
          dish: "Northern Thai Larb Moo with Sticky Rice and Papaya Salad",
          cuisine: "Northern Thai",
          description: "Larb is a minced meat salad with toasted rice powder, fish sauce, lime, chilies, and fresh herbs. Serve with sticky rice and green papaya salad. Eat with your hands.",
          difficulty: "Medium",
          prepTime: "1.5 hours",
          ingredients: ["ground pork", "toasted rice powder", "fish sauce", "lime juice", "bird's eye chiles", "mint", "shallots", "glutinous rice", "green papaya", "dried shrimp", "peanuts", "palm sugar"],
        },
        {
          id: 2,
          dish: "Thai Green Curry with Jasmine Rice and Roti",
          cuisine: "Thai",
          description: "A fragrant coconut milk curry with handmade green paste, chicken, Thai eggplant, and kaffir lime leaves. Served over jasmine rice with pan-fried roti for dipping.",
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
        ["Bird Thongchai", "Palmy", "Tilly Birds"],
        ["Carabao (acoustic)", "Peck Palitchoke", "Potato"],
        ["Fong Naam", "Khun Narin's Electric Phin Band", "Rasmee Wayrana"]
      ),
    },
    ritual: { title: "Wai Each Other", description: "The Thai greeting is a bow with hands pressed together in prayer position. At the start of the evening, wai each other — a small bow, hands at heart center. A gesture of respect and presence." },
    conversationPrompts: [
      "What's something about Buddhist ideas — mindfulness, impermanence, nonattachment — that resonates with you?",
      "What's a belief you hold about the world that most people in your life would find surprising?",
      "When do you feel most like yourself?",
      "What's a fear you've been carrying that you're ready to put down?",
      "What would you do with your life if you knew you couldn't fail?",
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
          description: "A simple, perfect roast chicken — the French obsession, and for good reason. Trussed, dried, and roasted at high heat until the skin shatters. Served with a white wine butter sauce and roasted root vegetables.",
          difficulty: "Medium",
          prepTime: "2 hours",
          ingredients: ["whole chicken", "herbes de Provence", "butter", "garlic", "shallots", "white wine", "chicken stock", "lemon", "root vegetables", "fresh thyme"],
        },
        {
          id: 2,
          dish: "Duck Confit with Lentilles du Puy and Frisée Salad",
          cuisine: "French",
          description: "Duck legs slow-cooked in their own fat until impossibly tender, pan-crisped to order, and served over earthy French green lentils and a mustardy vinaigrette salad. Bistro food at its finest.",
          difficulty: "High",
          prepTime: "24 hours (confit) + 1 hour",
          ingredients: ["duck legs", "duck fat", "thyme", "garlic", "bay leaf", "Puy lentils", "Dijon mustard", "frisée", "lardons", "shallot", "red wine vinegar"],
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
        ["Stromae", "Christine and the Queens", "Daft Punk"],
        ["Édith Piaf", "Serge Gainsbourg", "Jane Birkin"],
        ["Henri Salvador", "Georges Brassens", "Juliette Gréco"],
        ["Charlotte Gainsbourg", "Erik Satie", "Yann Tiersen"]
      ),
    },
    ritual: { title: "The Aperitif Hour", description: "Pour two glasses of Kir — white wine with a splash of cassis. Sit together before any cooking happens. No phones. No plans. Just drink and talk. The French call this l'apéro, and it's sacred." },
    conversationPrompts: [
      "What's something about the French approach to life — pleasure, leisure, beauty — that you want more of in ours?",
      "What's the most romantic thing anyone has ever done for you?",
      "What does luxury mean to you? Is it a feeling? A thing? A way of time?",
      "What's a part of your personality that you've been holding back in our relationship?",
      "If we had a home in Paris for a summer, what would our days look like?",
    ],
    activity: { title: "Make crêpes together", description: "Crêpes are simple and endlessly satisfying — thin, golden, filled with Nutella and banana or savory with ham and cheese. Make a batch and eat them standing at the stove, taking turns." },
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
    theme: "Lebanon",
    destination: "Beirut, Lebanon",
    tagline: "A city of contradictions, extraordinary food, and irrepressible life",
    intro: "October is for depth. Beirut's food tells stories of countless civilizations, its music bridges East and West. Seth picks the centerpiece. Elana picks the feeling. A mezze meal is made for sharing — dozens of small dishes, none of them the main course, all of them together the point.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Lebanese Mezze Feast",
          cuisine: "Lebanese",
          description: "Hummus from scratch, baba ganoush, fattoush salad, kibbeh, lamb kofta, and warm pita from the oven. An abundant, sharing table where the conversation is the main dish.",
          difficulty: "High",
          prepTime: "3 hours",
          ingredients: ["chickpeas", "tahini", "eggplant", "lamb mince", "bulgur", "pine nuts", "pita", "tomatoes", "cucumber", "sumac", "parsley", "pomegranate molasses"],
        },
        {
          id: 2,
          dish: "Kafta bil Saniyeh (Baked Meatballs with Tomato and Tahini)",
          cuisine: "Lebanese",
          description: "Spiced lamb meatballs baked in a tray with sliced tomatoes, onions, and a drizzle of tahini. A Lebanese home classic — simple to make, completely satisfying.",
          difficulty: "Easy",
          prepTime: "1 hour",
          ingredients: ["lamb mince", "onion", "parsley", "cumin", "cinnamon", "allspice", "tomatoes", "tahini", "lemon", "flatbread"],
        },
        {
          id: 3,
          dish: "Whole Roasted Cauliflower with Tahini and Pomegranate",
          cuisine: "Lebanese",
          description: "A whole head of cauliflower marinated in Middle Eastern spices and roasted until dark and caramelized. Served with whipped tahini, pomegranate seeds, and fresh herbs. Stunning and vegetarian.",
          difficulty: "Easy",
          prepTime: "1.5 hours",
          ingredients: ["whole cauliflower", "tahini", "lemon", "garlic", "cumin", "smoked paprika", "pomegranate", "fresh herbs", "pine nuts", "flatbread"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Lebanese",
        ["Mashrou' Leila", "Ziad Rahbani", "Julia Boutros"],
        ["Fairuz", "Wadih El Safi", "Sabah"],
        ["Marcel Khalife", "Abdel Halim Hafez", "Wadi El Safi"],
        ["Khalil Chahine", "Simon Shaheen", "Tania Kassis"]
      ),
    },
    ritual: { title: "The Orange Blossom Welcome", description: "Lebanese hospitality often begins with orange blossom water. Add a few drops to sparkling water in two glasses and sip together before dinner. Welcome each other to the evening." },
    conversationPrompts: [
      "What's a belief about yourself that you've held for a long time that you're not sure is still true?",
      "When have you felt most proud of how I handled something?",
      "What's a difficult thing we've been avoiding talking about that we should probably talk about?",
      "What does resilience look like to you in a marriage?",
      "What's something you want to forgive yourself for?",
    ],
    activity: { title: "Make knafeh together", description: "Knafeh is a Lebanese cheese pastry soaked in rose water syrup — extraordinary. It requires some effort but the reward is worth it. If you can't find the ingredients, make baklava instead." },
    localAddOn: { title: "Find a Lebanese or Middle Eastern restaurant", description: "Many Lebanese restaurants have live music on weekends. If yours does, plan the reservation accordingly." },
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
          description: "Start with bright ceviche — fresh fish cured in lime with ají amarillo, red onion, and cilantro. Then make lomo saltado, the Peruvian-Chinese stir-fry of beef, tomatoes, and French fries. Two dishes. Two stories.",
          difficulty: "Medium",
          prepTime: "2 hours",
          ingredients: ["fresh white fish", "lime juice", "ají amarillo", "red onion", "cilantro", "corn", "beef sirloin", "tomatoes", "soy sauce", "potatoes", "rice", "garlic"],
        },
        {
          id: 2,
          dish: "Ají de Gallina (Creamy Peruvian Chicken)",
          cuisine: "Peruvian",
          description: "Shredded chicken in a creamy, nutty ají amarillo sauce — one of Peru's most beloved dishes. Rich and warming, served over white rice with boiled eggs, olives, and potatoes.",
          difficulty: "Medium",
          prepTime: "2 hours",
          ingredients: ["chicken breasts", "ají amarillo paste", "bread", "walnuts", "parmesan", "milk", "onion", "garlic", "turmeric", "white rice", "eggs", "olives", "potato"],
        },
        {
          id: 3,
          dish: "Causa Limeña and Anticuchos",
          cuisine: "Peruvian",
          description: "A layered cold potato terrine filled with tuna or avocado (causa), served alongside grilled anticuchos — marinated beef heart skewers that are Lima's beloved street food. Bold and extraordinary.",
          difficulty: "Medium",
          prepTime: "2 hours",
          ingredients: ["yellow potatoes", "ají amarillo", "lime", "canned tuna or avocado", "mayonnaise", "beef heart or chicken", "cumin", "garlic", "vinegar", "dried chiles"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "Peruvian",
        ["Gian Marco", "Mar de Copas", "Pedro Suárez-Vértiz"],
        ["Chabuca Granda", "Susana Baca", "Tania Libertad"],
        ["Lucha Reyes", "Eva Ayllón", "Arturo Zambo Cavero"],
        ["Andrés Prado", "Carlos Hayre", "Nicomedes Santa Cruz"]
      ),
    },
    ritual: { title: "The Pisco Sour Toast", description: "Make two pisco sours — pisco, lime juice, simple syrup, egg white, Angostura bitters. Shake hard. Pour carefully. Toast to one thing you've built together in the first eleven months." },
    conversationPrompts: [
      "What's something we've built together this year that you didn't expect?",
      "What has been the hardest moment so far, and what did it teach you?",
      "What's a part of yourself you feel you've found — or rediscovered — since we got married?",
      "What's one thing you want to do differently next year?",
      "What's the best thing about being married to me, in your honest opinion?",
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
    theme: "Anywhere You Want",
    destination: "Your First Anniversary",
    tagline: "Twelve months, twelve worlds, one extraordinary year",
    intro: "December belongs entirely to you. You've cooked your way around the world, set the mood for twelve evenings, and found things out about each other you didn't know before. Tonight, Seth cooks whatever he's been thinking about for months. Elana sets the tone for the year ahead.",
    dinner: {
      options: [
        {
          id: 1,
          dish: "Your Favorite Dish from This Year",
          cuisine: "The World",
          description: "Go back to the recipe that made you stop and look at each other. The one you talked about for days after. Make it again — better this time, because you know each other better now.",
          difficulty: "Your call",
          prepTime: "However long it takes",
          ingredients: ["everything you've learned this year"],
        },
        {
          id: 2,
          dish: "A Six-Course Tasting Menu (Your Own)",
          cuisine: "Global",
          description: "Design a six-course menu together — one bite from each continent you've explored this year. Small portions. Big flavors. A love letter to everything you've learned.",
          difficulty: "High",
          prepTime: "All day",
          ingredients: ["your twelve months of knowledge"],
        },
        {
          id: 3,
          dish: "Something You've Never Tried Before",
          cuisine: "Unknown",
          description: "Pick a cuisine you haven't explored this year. Research it together. Cook it without a recipe if you're brave. Year two begins the moment you decide to keep going.",
          difficulty: "Unknown",
          prepTime: "As long as it takes",
          ingredients: ["curiosity", "courage", "each other"],
        },
      ],
    },
    music: {
      moods: MOODS(
        "celebratory",
        ["Your Year's Best Discoveries", "Everything That Made You Dance", "The Songs You'll Always Remember"],
        ["The Songs That Made You Feel Something", "The Artists You Found Together", "Music That Will Always Mean This Year"],
        ["The Quieter Moments", "Songs That Let You Just Be Together", "Music That Needs No Occasion"],
        ["The Most Beautiful Thing You Heard This Year", "Music You'll Return to Forever", "Something That Silenced the Room"]
      ),
    },
    ritual: { title: "Write Each Other a Letter", description: "Before dinner, separately write a short letter — what this year meant to you, what you learned about the other person, what you're grateful for. Read them to each other slowly, over the first glass of wine." },
    conversationPrompts: [
      "What's the thing you'll remember most about our first year of marriage?",
      "What's something I did this year that you will never forget?",
      "What's the most important thing you learned about yourself?",
      "What do you want our second year to feel like?",
      "What are you most excited to build together in the years ahead?",
    ],
    activity: { title: "Make a time capsule", description: "Write down three things each: one thing you hope is true in five years, one thing you're most proud of this year, and one word that describes your marriage right now. Seal it. Open it on your fifth anniversary." },
    localAddOn: { title: "Go somewhere that feels like yours", description: "A restaurant where you had your first date, a bar where you fell in love with each other, a neighborhood that means something. Go back. Mark the year." },
    effort: "Your call",
    cost: "Whatever it deserves",
    duration: "All night",
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
    { label: "Seth: Source ingredients — find an Asian grocery if possible", phase: 2, person: "seth" },
    { label: "Elana: Build your playlist based on your chosen vibe", phase: 2, person: "elana" },
    { label: "Both: Schedule the date night and set the table together", phase: 3, person: "both" },
  ],
  2: [
    { label: "Seth: Read all three recipes and pick the one that excites you most", phase: 1, person: "seth" },
    { label: "Elana: Choose your vibe for the evening", phase: 1, person: "elana" },
    { label: "Seth: Source preserved lemons, ras el hanout spices, and any specialty items", phase: 2, person: "seth" },
    { label: "Elana: Build your Moroccan playlist around your chosen mood", phase: 2, person: "elana" },
    { label: "Both: Light candles, put out cushions or rugs if you have them, set the table Moroccan-style", phase: 3, person: "both" },
  ],
  3: [
    { label: "Seth: Choose the Italian dish — are you feeling pasta, fish, or something rich?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — Italian evenings can go many ways", phase: 1, person: "elana" },
    { label: "Seth: Buy good wine, fresh pasta ingredients or high-quality dried pasta", phase: 2, person: "seth" },
    { label: "Elana: Curate your Italian playlist to match the vibe you chose", phase: 2, person: "elana" },
    { label: "Both: Open the wine before you cook. That's the rule.", phase: 3, person: "both" },
  ],
  4: [
    { label: "Seth: Pick your Indian dish — are you up for biryani, or keeping it weeknight?", phase: 1, person: "seth" },
    { label: "Elana: Choose the feeling — India has many moods", phase: 1, person: "elana" },
    { label: "Seth: Visit an Indian grocery for fresh spices and any specialty items", phase: 2, person: "seth" },
    { label: "Elana: Build your playlist, maybe order henna cones for tonight", phase: 2, person: "elana" },
    { label: "Both: Clear the table, lay out some color — India is not a minimalist country", phase: 3, person: "both" },
  ],
  5: [
    { label: "Seth: Decide — do you want to tackle mole, or go for something you can fully execute?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — Mexican evenings can be joyful or deeply soulful", phase: 1, person: "elana" },
    { label: "Seth: Source dried chiles, Mexican chocolate, and any specialty items", phase: 2, person: "seth" },
    { label: "Elana: Build your Oaxacan playlist around your chosen mood", phase: 2, person: "elana" },
    { label: "Both: Light the copal incense and set out mezcal if you have it", phase: 3, person: "both" },
  ],
  6: [
    { label: "Seth: Choose the Greek dish — whole fish, slow lamb, or a mezze spread?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — the Mediterranean has many faces", phase: 1, person: "elana" },
    { label: "Seth: Find good Greek olive oil, feta, and any fresh fish if going that route", phase: 2, person: "seth" },
    { label: "Elana: Build your Greek playlist and find a good bottle of Assyrtiko or rosé", phase: 2, person: "elana" },
    { label: "Both: Eat outside if possible. Greece is not an indoor sport.", phase: 3, person: "both" },
  ],
  7: [
    { label: "Seth: Choose your Ethiopian spread — how ambitious are you feeling?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — Ethiopian music is full of feeling", phase: 1, person: "elana" },
    { label: "Seth: Source berbere spice, teff flour or store-bought injera, niter kibbeh", phase: 2, person: "seth" },
    { label: "Elana: Build your Ethiopian playlist for the evening", phase: 2, person: "elana" },
    { label: "Both: Clear the table — no plates, just the injera. Eat with your hands.", phase: 3, person: "both" },
  ],
  8: [
    { label: "Seth: Choose your Thai dish — are you feeling light or bold tonight?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — Thai music runs from meditative to electric", phase: 1, person: "elana" },
    { label: "Seth: Source fish sauce, galangal, kaffir lime leaves, and Thai basil if possible", phase: 2, person: "seth" },
    { label: "Elana: Build your Thai playlist for the evening", phase: 2, person: "elana" },
    { label: "Both: Make Thai iced tea for welcome drinks before cooking", phase: 3, person: "both" },
  ],
  9: [
    { label: "Seth: Choose the French dish — are you feeling classic, bistro, or indulgent?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — French evenings have enormous range", phase: 1, person: "elana" },
    { label: "Seth: Buy a good French wine and any specialty ingredients you need", phase: 2, person: "seth" },
    { label: "Elana: Build your French playlist for the evening", phase: 2, person: "elana" },
    { label: "Both: Pour the kir before any cooking starts. L'apéro is law.", phase: 3, person: "both" },
  ],
  10: [
    { label: "Seth: Pick the Lebanese centerpiece — ambitious mezze, simple kafta, or dramatic cauliflower?", phase: 1, person: "seth" },
    { label: "Elana: Choose the feeling — Beirut has a heartbreaking beauty to it", phase: 1, person: "elana" },
    { label: "Seth: Source tahini, pomegranate molasses, sumac, and flatbread", phase: 2, person: "seth" },
    { label: "Elana: Build your Lebanese playlist for the evening", phase: 2, person: "elana" },
    { label: "Both: Prepare the orange blossom water welcome drinks before guests arrive", phase: 3, person: "both" },
  ],
  11: [
    { label: "Seth: Choose your Peruvian adventure — ceviche, ají de gallina, or causa?", phase: 1, person: "seth" },
    { label: "Elana: Pick the vibe — Peru has layers", phase: 1, person: "elana" },
    { label: "Seth: Source ají amarillo paste, pisco, and any specialty ingredients", phase: 2, person: "seth" },
    { label: "Elana: Build your Peruvian playlist for the evening", phase: 2, person: "elana" },
    { label: "Both: Make pisco sours before the meal. Toast to eleven months.", phase: 3, person: "both" },
  ],
  12: [
    { label: "Seth: Look back at all 12 months — which dish was the best? Which do you want to revisit?", phase: 1, person: "seth" },
    { label: "Elana: Think about what this year has sounded like. What do you want year two to feel like?", phase: 1, person: "elana" },
    { label: "Seth: Source the ingredients for the dish you've chosen to make tonight", phase: 2, person: "seth" },
    { label: "Elana: Build the final playlist for the year — make it worthy of the occasion", phase: 2, person: "elana" },
    { label: "Both: Write your letters to each other before dinner. Read them over the first glass.", phase: 3, person: "both" },
  ],
};

export async function seed() {
  const existing = await db.select().from(datePlansTable).limit(1);
  if (existing.length > 0) {
    const firstRow = existing[0];
    const dinner = firstRow.dinner as Record<string, unknown>;
    const hasNewFormat = Array.isArray(dinner?.options);
    if (hasNewFormat) {
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
          logger.info("Seed data already exists in new format with phase/person data, skipping");
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
