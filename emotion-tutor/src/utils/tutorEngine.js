// tutorEngine.js
//
// A fully LOCAL adaptive tutor — no API, no cost, no internet needed for responses.
// It picks a teaching strategy based on detected emotion, then generates a
// contextual reply using a built-in knowledge base + template system.

// ─── Emotion → teaching strategy ────────────────────────────────────────────

const STRATEGIES = {
  focused: {
    intro:  ['Great, let\'s go deep.', 'Since you\'re focused, here\'s the full picture.', 'Let\'s dive in properly.'],
    style:  'detailed',
    suffix: ['Want to go even deeper on any part of this?', 'Any specific part you\'d like me to expand?'],
  },
  engaged: {
    intro:  ['Love the energy!', 'Great question!', 'Awesome — let\'s build on that.'],
    style:  'enthusiastic',
    suffix: ['Ready for a fun challenge question?', 'Want to see a cool real-world example of this?'],
  },
  confused: {
    intro:  ['No worries, let\'s slow this down.', 'Let me break this into smaller steps.', 'Good — confusion means you\'re thinking.'],
    style:  'simple',
    suffix: ['Does that make more sense now?', 'Which part would you like me to re-explain?'],
  },
  bored: {
    intro:  ['Here\'s something surprising about this...', 'Fun fact first:', 'Let me make this more interesting —'],
    style:  'surprising',
    suffix: ['Bet you didn\'t expect that! Want to know more?', 'Here\'s a challenge: can you think of another example?'],
  },
  tired: {
    intro:  ['Quick summary:', 'Short version:', 'The key point is simple:'],
    style:  'brief',
    suffix: ['That\'s the core idea. Take a moment if needed.', 'Just remember that one key thing.'],
  },
  surprised: {
    intro:  ['Yes, this is genuinely surprising!', 'I know — it sounds wild, but here\'s why it works:', 'Great reaction — this topic is counterintuitive.'],
    style:  'reassuring',
    suffix: ['Does the explanation clear it up?', 'Want me to walk through the logic again?'],
  },
  happy: {
    intro:  ['Great mood to learn in!', 'Perfect — let\'s keep the momentum going.', 'Let\'s make the most of this!'],
    style:  'encouraging',
    suffix: ['You\'re doing great — want a harder question?', 'Try explaining it back to me in your own words!'],
  },
  neutral: {
    intro:  ['Sure.', 'Good question.', 'Here\'s the explanation:'],
    style:  'balanced',
    suffix: ['Does that answer your question?', 'Anything you\'d like me to clarify?'],
  },
};

// ─── Mini knowledge base ────────────────────────────────────────────────────
// Each topic has: a concept map + example answers for common question types.
// Questions not matched fall back to a helpful generic reply.

const KNOWLEDGE = {
  // ── Math ──
  'what is photosynthesis': {
    core: 'Photosynthesis is the process plants use to convert sunlight, water, and carbon dioxide into glucose (food) and oxygen.',
    detail: 'It happens in the chloroplasts using a green pigment called chlorophyll. The equation is: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.',
    simple: 'Plants eat sunlight. They take in CO₂ and water, use sunlight to combine them, and produce sugar for energy and oxygen as a by-product.',
    surprising: 'Fun fact: photosynthesis produces ALL the oxygen in Earth\'s atmosphere. Without plants, there would be no air to breathe!',
    brief: 'Plants + sunlight + CO₂ + water → sugar + oxygen.',
  },
  'what is mitosis': {
    core: 'Mitosis is how a cell divides to produce two identical daughter cells, each with the same number of chromosomes as the parent.',
    detail: 'It has 4 phases: Prophase (chromosomes condense), Metaphase (align in the middle), Anaphase (pulled apart), Telophase (two nuclei form).',
    simple: 'Imagine photocopying yourself — mitosis is a cell making an exact copy of itself. Same DNA, same everything.',
    surprising: 'Your body performs about 25 million cell divisions every second through mitosis!',
    brief: 'Cell copies itself → two identical cells. Phases: Prophase → Metaphase → Anaphase → Telophase.',
  },
  'what is newton\'s first law': {
    core: 'Newton\'s First Law states that an object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted on by a net external force.',
    detail: 'This is also called the Law of Inertia. Inertia is the tendency of an object to resist changes to its state of motion. More mass = more inertia.',
    simple: 'Things are lazy — they keep doing what they\'re already doing unless something pushes or pulls them.',
    surprising: 'In space, with no friction, a thrown ball would travel in a straight line forever — Newton\'s first law in action!',
    brief: 'Objects keep doing what they\'re doing unless a force stops them. That\'s inertia.',
  },
  'what is gravity': {
    core: 'Gravity is a fundamental force of attraction between any two objects that have mass. The greater the mass and the closer the objects, the stronger the gravitational pull.',
    detail: 'Newton\'s law: F = Gm₁m₂/r². Einstein later redefined it as the curvature of spacetime caused by mass.',
    simple: 'Every object pulls every other object toward it. Earth is so massive it pulls you toward it — that\'s why you don\'t float away.',
    surprising: 'Gravity travels at the speed of light! If the Sun disappeared, we\'d still orbit it for about 8 minutes before feeling the change.',
    brief: 'Force that pulls objects with mass toward each other. F = Gm₁m₂/r².',
  },
  'what is osmosis': {
    core: 'Osmosis is the movement of water molecules through a semi-permeable membrane from an area of low solute concentration to an area of high solute concentration.',
    detail: 'It continues until equilibrium is reached. This drives water uptake in plant roots and controls cell volume in animals.',
    simple: 'Water naturally moves toward where there\'s more dissolved stuff, trying to balance things out — like mixing until even.',
    surprising: 'Osmosis is why drinking seawater makes you MORE dehydrated — your cells lose water trying to dilute all that salt!',
    brief: 'Water moves through a membrane toward higher concentration. Equalizes solute levels.',
  },
  'what is the water cycle': {
    core: 'The water cycle describes the continuous movement of water through Earth\'s systems via evaporation, condensation, precipitation, and collection.',
    detail: 'Steps: Evaporation (water → vapor), Condensation (vapor → clouds), Precipitation (rain/snow), Collection (rivers, groundwater, oceans). Energy from the sun drives the whole process.',
    simple: 'Water evaporates from oceans → forms clouds → falls as rain → flows back to oceans. Repeat forever.',
    surprising: 'The water you drink today might have been drunk by a dinosaur 65 million years ago — water is constantly recycled!',
    brief: 'Evaporation → clouds → rain → rivers → ocean → repeat.',
  },
  'what is dna': {
    core: 'DNA (Deoxyribonucleic Acid) is a molecule that carries the genetic instructions for the development, functioning, and reproduction of all known living organisms.',
    detail: 'It\'s a double helix made of nucleotide bases: Adenine pairs with Thymine, Cytosine pairs with Guanine. Genes are specific sequences of DNA that encode proteins.',
    simple: 'DNA is like an instruction manual written in a 4-letter alphabet (A, T, C, G). It tells your body how to build and run itself.',
    surprising: 'If you unrolled all the DNA in one human cell, it would be about 2 metres long — and your body has 37 trillion cells!',
    brief: 'Double helix molecule carrying genetic code. A-T and C-G base pairs.',
  },
  'what is the pythagorean theorem': {
    core: 'The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: a² + b² = c².',
    detail: 'Where c is the hypotenuse (longest side, opposite the right angle). Example: a=3, b=4 → c=√(9+16)=√25=5.',
    simple: 'For a right triangle with sides 3 and 4, the long side is 5. The rule: square both short sides, add them, take the square root.',
    surprising: 'This theorem was known in Babylon 1,000 years before Pythagoras! He just got the credit for proving it formally.',
    brief: 'a² + b² = c². Square both legs, add, square root = hypotenuse.',
  },
  'what is climate change': {
    core: 'Climate change refers to long-term shifts in global temperatures and weather patterns, primarily caused by human activities releasing greenhouse gases like CO₂ and methane.',
    detail: 'Greenhouse gases trap heat in the atmosphere (the greenhouse effect). This raises average temperatures, changes precipitation patterns, and increases extreme weather events.',
    simple: 'We\'re adding a thick blanket (CO₂) around the Earth. More blanket = more heat trapped = warmer planet.',
    surprising: 'The last time CO₂ levels were this high was over 3 million years ago — sea levels were 25 metres higher then.',
    brief: 'Greenhouse gases trap heat → global temperatures rise → weather patterns change.',
  },
};

// ─── Question matcher ────────────────────────────────────────────────────────

function findAnswer(question) {
  const q = question.toLowerCase().replace(/[?!.,]/g, '').trim();

  // Direct match
  for (const [key, val] of Object.entries(KNOWLEDGE)) {
    if (q.includes(key.replace('what is ', '')) || q === key) {
      return val;
    }
  }

  // Partial keyword match
  for (const [key, val] of Object.entries(KNOWLEDGE)) {
    const keywords = key.replace('what is ', '').split(' ');
    if (keywords.some(kw => kw.length > 3 && q.includes(kw))) {
      return val;
    }
  }

  return null;
}

// ─── Response generator ──────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateResponse(question, emotion, topic) {
  const strategy = STRATEGIES[emotion] || STRATEGIES.neutral;
  const answer   = findAnswer(question);
  const intro    = pick(strategy.intro);
  const suffix   = pick(strategy.suffix);

  let body;

  if (answer) {
    // Choose detail level based on emotion
    switch (strategy.style) {
      case 'detailed':     body = `${answer.core}\n\n${answer.detail}`; break;
      case 'simple':       body = answer.simple; break;
      case 'brief':        body = answer.brief; break;
      case 'surprising':   body = `${answer.surprising}\n\n${answer.core}`; break;
      case 'enthusiastic': body = `${answer.core}\n\nHere\'s what makes this cool: ${answer.detail}`; break;
      default:             body = answer.core; break;
    }
  } else {
    // Fallback for unknown questions
    body = generateFallback(question, topic, strategy.style);
  }

  return `${intro}\n\n${body}\n\n${suffix}`;
}

function generateFallback(question, topic, style) {
  const q = question.trim();

  if (style === 'brief') {
    return `That's a great question about ${topic || 'this topic'}. Break it into two parts: first understand the core definition, then look at a real-world example. That usually clears things up fast.`;
  }
  if (style === 'simple') {
    return `Let's tackle "${q}" step by step. First — what do you already know about it? Sometimes the best way to learn something new is to connect it to something familiar.`;
  }
  if (style === 'surprising') {
    return `"${q}" is actually one of those topics with a surprising twist. The obvious answer isn't always right! Try looking it up with the phrase "counterintuitive facts about..." — you'll be surprised.`;
  }
  return `"${q}" is a solid question${topic ? ` in ${topic}` : ''}. The key is to understand the underlying principle, not just memorize the answer. Can you rephrase the question in your own words? That often helps!`;
}
