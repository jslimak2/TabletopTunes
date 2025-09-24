// TabletopTunes - Board Game to Movie Soundtrack Matching Database
// This comprehensive database maps board games to matching movie soundtracks

const BOARD_GAMES_DATABASE = {
  // Strategy Games
  'Settlers of Catan': {
    category: 'strategy',
    themes: ['exploration', 'building', 'medieval', 'peaceful'],
    suggestedSoundtracks: [
      { movie: 'Lord of the Rings: The Fellowship of the Ring', reason: 'Epic journey and fellowship building', tracks: ['Concerning Hobbits', 'The Bridge of Khazad Dum', 'May It Be'] },
      { movie: 'How to Train Your Dragon', reason: 'Adventure and discovery themes', tracks: ['This Is Berk', 'Dragon Training', 'Test Drive'] },
      { movie: 'Pirates of the Caribbean', reason: 'Exploration and adventure', tracks: ['He\'s a Pirate', 'To the Pirates\' Cave', 'Up Is Down'] }
    ]
  },
  
  'Ticket to Ride': {
    category: 'strategy',
    themes: ['travel', 'adventure', 'historical', 'journey'],
    suggestedSoundtracks: [
      { movie: 'Around the World in 80 Days', reason: 'Perfect travel adventure theme', tracks: ['Main Theme', 'The Journey Begins', 'Racing Against Time'] },
      { movie: 'The Polar Express', reason: 'Train journey atmosphere', tracks: ['The Polar Express', 'Hot Chocolate', 'Believe'] },
      { movie: 'Indiana Jones', reason: 'Adventure and exploration', tracks: ['Raiders March', 'The Map Room', 'Truck Chase'] }
    ]
  },

  'Wingspan': {
    category: 'strategy',
    themes: ['nature', 'peaceful', 'scientific', 'birds'],
    suggestedSoundtracks: [
      { movie: 'March of the Penguins', reason: 'Beautiful nature documentary feel', tracks: ['Antarctic Landscape', 'The Journey', 'New Life'] },
      { movie: 'Rio', reason: 'Colorful bird themes', tracks: ['Real in Rio', 'Fly Love', 'Morning in Rio'] },
      { movie: 'My Neighbor Totoro', reason: 'Gentle nature and wonder', tracks: ['The Path of the Wind', 'My Neighbor Totoro', 'Cat Bus'] }
    ]
  },

  // Adventure Games  
  'Gloomhaven': {
    category: 'adventure',
    themes: ['fantasy', 'combat', 'dungeon', 'epic', 'dark'],
    suggestedSoundtracks: [
      { movie: 'The Lord of the Rings: The Two Towers', reason: 'Epic fantasy battles and darkness', tracks: ['Forth Eorlingas', 'The Battle of Helm\'s Deep', 'Isengard Unleashed'] },
      { movie: 'Conan the Barbarian', reason: 'Dark fantasy adventure', tracks: ['Anvil of Crom', 'Riddle of Steel', 'The Kitchen'] },
      { movie: 'The Hobbit: An Unexpected Journey', reason: 'Fantasy adventure and mystery', tracks: ['Misty Mountains', 'Radagast the Brown', 'Out of the Frying Pan'] }
    ]
  },

  'Pandemic': {
    category: 'cooperative',
    themes: ['tension', 'urgency', 'global', 'medical', 'crisis'],
    suggestedSoundtracks: [
      { movie: 'Contagion', reason: 'Perfect pandemic theme match', tracks: ['The Blue Day', 'Erin Mears', 'For Dan'] },
      { movie: '28 Days Later', reason: 'Intense crisis atmosphere', tracks: ['The Beginning', 'Rage', 'In the House - In a Heartbeat'] },
      { movie: 'World War Z', reason: 'Global crisis and urgency', tracks: ['The Lane Family', 'Zombie Swarm', 'Hand to Hand'] }
    ]
  },

  'Betrayal at House on the Hill': {
    category: 'horror',
    themes: ['horror', 'mystery', 'supernatural', 'haunted', 'betrayal'],
    suggestedSoundtracks: [
      { movie: 'The Conjuring', reason: 'Classic haunted house horror', tracks: ['Main Theme', 'There\'s Something Horrible Happening in My House', 'The Music Box'] },
      { movie: 'Insidious', reason: 'Supernatural horror atmosphere', tracks: ['Main Theme', 'Tiptoe Through the Tulips', 'The Further'] },
      { movie: 'Sinister', reason: 'Dark mystery and dread', tracks: ['Main Theme', 'Night Terrors', 'Deputy So & So'] }
    ]
  },

  // Thematic Games
  'Azul': {
    category: 'abstract',
    themes: ['artistic', 'peaceful', 'mediterranean', 'beauty'],
    suggestedSoundtracks: [
      { movie: 'The Secret Garden', reason: 'Beautiful and artistic themes', tracks: ['Main Title', 'The Garden', 'Roses'] },
      { movie: 'Life of Pi', reason: 'Colorful and meditative', tracks: ['Pi\'s Lullaby', 'God Storm', 'Anandi'] },
      { movie: 'Amélie', reason: 'Whimsical and artistic', tracks: ['Comptine d\'un autre été', 'La Valse d\'Amélie', 'Sur le fil'] }
    ]
  },

  'Scythe': {
    category: 'strategy',
    themes: ['steampunk', 'alternative history', 'mechs', 'farming', 'war'],
    suggestedSoundtracks: [
      { movie: 'Mortal Engines', reason: 'Steampunk mechanical themes', tracks: ['London', 'Hester Shaw', 'The Hunting Ground'] },
      { movie: 'Wild Wild West', reason: 'Alternative history steampunk', tracks: ['Wild Wild West Theme', 'The Spider', 'Mechanical Mayhem'] },
      { movie: 'The League of Extraordinary Gentlemen', reason: 'Victorian steampunk adventure', tracks: ['Main Theme', 'Nautilus', 'The Final Battle'] }
    ]
  },

  'Dead of Winter': {
    category: 'survival',
    themes: ['zombies', 'survival', 'winter', 'betrayal', 'tension'],
    suggestedSoundtracks: [
      { movie: 'The Thing (1982)', reason: 'Isolated winter survival horror', tracks: ['Main Theme', 'Humanity', 'Contamination'] },
      { movie: 'The Walking Dead (TV)', reason: 'Zombie apocalypse survival', tracks: ['Main Theme', 'The Pulse', 'Cherokee Rose'] },
      { movie: '30 Days of Night', reason: 'Winter survival horror', tracks: ['Main Theme', 'God\'s Country', 'The Attackers'] }
    ]
  },

  // Classic Games
  'Monopoly': {
    category: 'classic',
    themes: ['business', 'capitalism', 'real estate', 'competition'],
    suggestedSoundtracks: [
      { movie: 'The Wolf of Wall Street', reason: 'Business and money themes', tracks: ['The Wolf of Wall Street', 'Belfort', 'Money Chant'] },
      { movie: 'Wall Street', reason: 'Financial world atmosphere', tracks: ['Main Theme', 'Greed Is Good', 'The Money Never Sleeps'] },
      { movie: 'Trading Places', reason: 'Business comedy themes', tracks: ['Main Theme', 'Trading Places', 'Looking Good Billy Ray'] }
    ]
  },

  'Risk': {
    category: 'strategy',
    themes: ['warfare', 'conquest', 'global', 'military', 'epic'],
    suggestedSoundtracks: [
      { movie: 'Gladiator', reason: 'Epic warfare and conquest', tracks: ['The Battle', 'Earth', 'Now We Are Free'] },
      { movie: 'Braveheart', reason: 'Strategic warfare themes', tracks: ['Main Theme', 'The Battle of Stirling', 'Freedom'] },
      { movie: 'Alexander', reason: 'World conquest themes', tracks: ['Introduction', 'Roxane\'s Veil', 'The Final Charge'] }
    ]
  },

  'Clue': {
    category: 'mystery',
    themes: ['mystery', 'murder', 'investigation', 'deduction', 'mansion'],
    suggestedSoundtracks: [
      { movie: 'Murder on the Orient Express', reason: 'Classic murder mystery', tracks: ['Main Theme', 'The Murder', 'Poirot'] },
      { movie: 'Knives Out', reason: 'Modern mystery in mansion setting', tracks: ['Main Theme', 'Donut Hole', 'Benoit Blanc'] },
      { movie: 'The Maltese Falcon', reason: 'Classic detective atmosphere', tracks: ['Main Theme', 'The Detective Story', 'Sam Spade'] }
    ]
  },

  // Modern Classics
  'Splendor': {
    category: 'strategy',
    themes: ['renaissance', 'trading', 'gems', 'merchants', 'elegant'],
    suggestedSoundtracks: [
      { movie: 'The Merchant of Venice', reason: 'Renaissance trading themes', tracks: ['Main Theme', 'Venice', 'The Ring'] },
      { movie: 'Amadeus', reason: 'Renaissance elegance and artistry', tracks: ['Main Theme', 'Dies Irae', 'Masonic Funeral Music'] },
      { movie: 'Romeo and Juliet (1968)', reason: 'Renaissance period atmosphere', tracks: ['What Is a Youth', 'The Balcony Scene', 'Death of Romeo'] }
    ]
  },

  'King of Tokyo': {
    category: 'dice',
    themes: ['kaiju', 'monsters', 'tokyo', 'destruction', 'fun'],
    suggestedSoundtracks: [
      { movie: 'Godzilla (2014)', reason: 'Perfect kaiju monster themes', tracks: ['Godzilla!', 'The Atomic Breath', 'Nuclear Fallout'] },
      { movie: 'Pacific Rim', reason: 'Giant monsters vs civilization', tracks: ['Main Theme', 'Kaiju', 'Go Big or Go Extinct'] },
      { movie: 'Rampage', reason: 'Monster destruction themes', tracks: ['Main Theme', 'Rampage', 'George and the Wolf'] }
    ]
  }
};

// Movie soundtrack categories for browsing
const MOVIE_SOUNDTRACK_CATEGORIES = {
  adventure: {
    name: 'Adventure',
    icon: 'fas fa-compass',
    movies: [
      'Indiana Jones', 'Pirates of the Caribbean', 'The Mummy', 'National Treasure',
      'Jurassic Park', 'King Kong', 'Tomb Raider', 'The Jungle Book'
    ]
  },
  fantasy: {
    name: 'Fantasy',
    icon: 'fas fa-dragon',
    movies: [
      'Lord of the Rings', 'Harry Potter', 'The Chronicles of Narnia', 'The Hobbit',
      'Game of Thrones', 'The Princess Bride', 'Willow', 'The NeverEnding Story'
    ]
  },
  scifi: {
    name: 'Sci-Fi',
    icon: 'fas fa-rocket',
    movies: [
      'Star Wars', 'Star Trek', 'Blade Runner', 'The Matrix', 'Alien',
      'Interstellar', 'Tron', 'The Terminator', 'Close Encounters'
    ]
  },
  horror: {
    name: 'Horror',
    icon: 'fas fa-ghost',
    movies: [
      'Halloween', 'The Exorcist', 'Psycho', 'The Shining', 'Jaws',
      'The Conjuring', 'Insidious', 'Sinister', 'It', 'A Nightmare on Elm Street'
    ]
  },
  mystery: {
    name: 'Mystery',
    icon: 'fas fa-search',
    movies: [
      'Sherlock Holmes', 'Murder on the Orient Express', 'The Maltese Falcon',
      'Knives Out', 'Gone Girl', 'The Girl with the Dragon Tattoo'
    ]
  },
  epic: {
    name: 'Epic',
    icon: 'fas fa-mountain',
    movies: [
      'Gladiator', 'Braveheart', 'Ben-Hur', 'Lawrence of Arabia',
      'The Last Samurai', 'Alexander', '300', 'Troy'
    ]
  }
};

// Game theme to movie genre mapping
const THEME_TO_GENRE_MAPPING = {
  // Game themes -> Movie genres
  'medieval': ['fantasy', 'epic'],
  'fantasy': ['fantasy', 'adventure'],
  'horror': ['horror'],
  'mystery': ['mystery', 'thriller'],
  'scifi': ['scifi', 'adventure'],
  'space': ['scifi'],
  'pirates': ['adventure'],
  'western': ['western', 'adventure'],
  'zombies': ['horror', 'thriller'],
  'survival': ['thriller', 'horror'],
  'war': ['epic', 'drama'],
  'exploration': ['adventure'],
  'dungeon': ['fantasy', 'adventure'],
  'steampunk': ['scifi', 'adventure'],
  'cyberpunk': ['scifi', 'thriller'],
  'detective': ['mystery', 'thriller'],
  'spy': ['thriller', 'action'],
  'racing': ['action', 'sports'],
  'sports': ['sports', 'drama']
};

// Mood-based soundtrack suggestions
const MOOD_BASED_SUGGESTIONS = {
  relaxed: {
    description: 'Calm and peaceful gaming sessions',
    soundtracks: [
      { movie: 'Studio Ghibli Collection', tracks: ['One Summer\'s Day', 'The Promise of the World', 'Merry-Go-Round of Life'] },
      { movie: 'The Secret Garden', tracks: ['Main Title', 'The Garden', 'How Does Your Garden Grow'] },
      { movie: 'Pride and Prejudice', tracks: ['Dawn', 'Liz on Top of the World', 'Darcy\'s Letter'] }
    ]
  },
  tense: {
    description: 'High-stakes and suspenseful games',
    soundtracks: [
      { movie: 'The Dark Knight', tracks: ['Why So Serious?', 'Like a Dog Chasing Cars', 'A Dark Knight'] },
      { movie: 'Inception', tracks: ['Time', 'Dream Is Collapsing', 'Mombasa'] },
      { movie: 'Mad Max: Fury Road', tracks: ['Survive', 'Immortan Joe', 'Brothers in Arms'] }
    ]
  },
  epic: {
    description: 'Grand adventures and heroic quests',
    soundtracks: [
      { movie: 'Avengers', tracks: ['The Avengers', 'Assemble', 'One Way Trip'] },
      { movie: 'Gladiator', tracks: ['The Battle', 'Earth', 'Now We Are Free'] },
      { movie: 'The Lord of the Rings', tracks: ['Concerning Hobbits', 'The Bridge of Khazad Dum', 'The Return of the King'] }
    ]
  },
  mysterious: {
    description: 'Intriguing puzzles and hidden secrets',
    soundtracks: [
      { movie: 'Sherlock Holmes', tracks: ['Discombobulate', 'My Mind Rebels at Stagnation', 'Psychological Recovery'] },
      { movie: 'The Prestige', tracks: ['The Pledge', 'Analyse', 'The Final Prestige'] },
      { movie: 'Zodiac', tracks: ['Zodiac Main Title', 'The Basement', 'Toschi at Home'] }
    ]
  }
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BOARD_GAMES_DATABASE,
    MOVIE_SOUNDTRACK_CATEGORIES,
    THEME_TO_GENRE_MAPPING,
    MOOD_BASED_SUGGESTIONS
  };
}