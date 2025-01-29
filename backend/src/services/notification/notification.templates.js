const templates = {
  // User-related notifications
  USER_WELCOME: {
    title: 'Welcome to CloudScribe',
    template: 'Welcome {{username}}! Thank you for joining CloudScribe.'
  },
  
  // Dictionary-related notifications
  WORD_ADDED: {
    title: 'New Word Added',
    template: 'A new word "{{word}}" has been added to the dictionary.'
  },
  
  WORD_UPDATED: {
    title: 'Word Updated',
    template: 'The word "{{word}}" has been updated in the dictionary.'
  },
  
  WORD_APPROVED: {
    title: 'Word Approved',
    template: 'Your submitted word "{{word}}" has been approved.'
  },
  
  // System notifications
  SYSTEM_MAINTENANCE: {
    title: 'System Maintenance',
    template: 'CloudScribe will undergo maintenance on {{date}}. Expected downtime: {{duration}}.'
  }
};

module.exports = templates; 