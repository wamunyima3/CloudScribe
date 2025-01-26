// Define granular permissions
const Permissions = {
  // Dictionary permissions
  WORD_CREATE: 'word:create',
  WORD_READ: 'word:read',
  WORD_UPDATE: 'word:update',
  WORD_DELETE: 'word:delete',
  WORD_APPROVE: 'word:approve',

  // Translation permissions
  TRANSLATION_CREATE: 'translation:create',
  TRANSLATION_READ: 'translation:read',
  TRANSLATION_UPDATE: 'translation:update',
  TRANSLATION_DELETE: 'translation:delete',
  TRANSLATION_VERIFY: 'translation:verify',

  // Story permissions
  STORY_CREATE: 'story:create',
  STORY_READ: 'story:read',
  STORY_UPDATE: 'story:update',
  STORY_DELETE: 'story:delete',
  STORY_MODERATE: 'story:moderate',

  // User permissions
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',

  // Admin permissions
  ADMIN_ACCESS: 'admin:access',
  SYSTEM_SETTINGS: 'system:settings'
};

// Define role-based permissions
const RolePermissions = {
  ADMIN: [
    ...Object.values(Permissions) // Admins have all permissions
  ],
  
  CURATOR: [
    Permissions.WORD_CREATE,
    Permissions.WORD_READ,
    Permissions.WORD_UPDATE,
    Permissions.WORD_APPROVE,
    Permissions.TRANSLATION_CREATE,
    Permissions.TRANSLATION_READ,
    Permissions.TRANSLATION_UPDATE,
    Permissions.TRANSLATION_VERIFY,
    Permissions.STORY_CREATE,
    Permissions.STORY_READ,
    Permissions.STORY_UPDATE,
    Permissions.STORY_MODERATE,
    Permissions.USER_READ
  ],
  
  CONTRIBUTOR: [
    Permissions.WORD_CREATE,
    Permissions.WORD_READ,
    Permissions.WORD_UPDATE,
    Permissions.TRANSLATION_CREATE,
    Permissions.TRANSLATION_READ,
    Permissions.TRANSLATION_UPDATE,
    Permissions.STORY_CREATE,
    Permissions.STORY_READ,
    Permissions.STORY_UPDATE
  ],
  
  USER: [
    Permissions.WORD_READ,
    Permissions.TRANSLATION_READ,
    Permissions.TRANSLATION_CREATE,
    Permissions.STORY_READ,
    Permissions.STORY_CREATE
  ],
  
  VISITOR: [
    Permissions.WORD_READ,
    Permissions.TRANSLATION_READ,
    Permissions.STORY_READ
  ]
};

module.exports = {
  Permissions,
  RolePermissions
}; 