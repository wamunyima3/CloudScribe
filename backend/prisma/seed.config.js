module.exports = {
  // Test user credentials
  users: {
    admin: {
      email: 'admin@cloudscribe.com',
      username: 'admin',
      password: 'admin123', // Store plain password here for testing
      role: 'ADMIN'
    },
    curator: {
      email: 'curator@cloudscribe.com',
      username: 'curator',
      password: 'curator123',
      role: 'CURATOR'
    },
    contributor: {
      email: 'contributor@cloudscribe.com',
      username: 'contributor',
      password: 'contributor123',
      role: 'CONTRIBUTOR'
    }
  },

  // Languages
  languages: [
    { name: 'English', code: 'EN', isEndangered: false },
    { name: 'Nyanja', code: 'NY', isEndangered: false },
    { name: 'Bemba', code: 'BE', isEndangered: false },
    { name: 'Tonga', code: 'TO', isEndangered: true }
  ],

  // Tags for categorizing words
  tags: ['greetings', 'basic', 'common', 'family', 'numbers', 'food'],

  // Sample words with translations
  words: [
    {
      original: 'TEST_hello',
      language: 'EN',
      difficulty: 1,
      translations: [
        { text: 'TEST_moni', language: 'NY' },
        { text: 'TEST_shani', language: 'BE' }
      ],
      tags: ['greetings', 'basic']
    },
    {
      original: 'TEST_muli_bwanji',
      language: 'NY',
      difficulty: 1,
      translations: [
        { text: 'TEST_how_are_you', language: 'EN' }
      ],
      tags: ['greetings', 'common']
    }
  ],

  // Sample stories
  stories: [
    {
      title: 'TEST_Village_Tale',
      content: 'TEST: Once upon a time in a small village...',
      language: 'NY',
      type: 'STORY'
    },
    {
      title: 'TEST_Traditional_Proverb',
      content: 'TEST: The wisdom of our ancestors...',
      language: 'BE',
      type: 'PROVERB'
    }
  ]
}; 