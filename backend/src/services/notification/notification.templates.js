const templates = {
  WORD_APPROVED: (data) => ({
    title: 'Word Approved',
    message: `Your word submission has been approved`,
    data
  }),
  TRANSLATION_ADDED: (data) => ({
    title: 'New Translation',
    message: `A new translation has been added to your word`,
    data
  }),
  STORY_COMMENT: (data) => ({
    title: 'New Comment',
    message: `Someone commented on your story`,
    data
  })
};

module.exports = templates; 