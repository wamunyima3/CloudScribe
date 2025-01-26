const templates = {
  contributionApproved: (data) => ({
    title: 'Contribution Approved',
    body: `Your ${data.type.toLowerCase()} "${data.title || data.content}" has been approved!`,
    icon: '✅',
    link: `/${data.type.toLowerCase()}s/${data.id}`
  }),

  newComment: (data) => ({
    title: 'New Comment',
    body: `${data.commenter} commented on your ${data.type.toLowerCase()}`,
    icon: '💬',
    link: `/${data.type.toLowerCase()}s/${data.id}#comment-${data.commentId}`
  }),

  achievementUnlocked: (data) => ({
    title: 'Achievement Unlocked!',
    body: `You've earned the "${data.name}" achievement!`,
    icon: '🏆',
    link: '/profile/achievements'
  }),

  translationSuggested: (data) => ({
    title: 'New Translation Suggestion',
    body: `${data.translator} suggested a translation for "${data.word}"`,
    icon: '🔤',
    link: `/words/${data.wordId}/translations`
  }),

  streakReminder: (data) => ({
    title: 'Keep Your Streak Going!',
    body: `Don't forget to contribute today to maintain your ${data.days}-day streak!`,
    icon: '🔥',
    link: '/contribute'
  }),

  systemUpdate: (data) => ({
    title: 'System Update',
    body: data.message,
    icon: '📢',
    link: data.link || '/'
  })
};

module.exports = templates; 