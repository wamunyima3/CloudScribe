const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');

class OAuthService {
  constructor() {
    this.initializeStrategies();
  }

  initializeStrategies() {
    // Google Strategy
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/auth/google/callback`
    }, this.handleOAuthLogin.bind(this, 'google')));

    // GitHub Strategy
    passport.use(new GithubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/auth/github/callback`
    }, this.handleOAuthLogin.bind(this, 'github')));
  }

  async handleOAuthLogin(provider, accessToken, refreshToken, profile, done) {
    try {
      // Find or create user
      const user = await prisma.user.upsert({
        where: {
          [`${provider}Id`]: profile.id
        },
        update: {
          lastLogin: new Date()
        },
        create: {
          [`${provider}Id`]: profile.id,
          email: profile.emails[0].value,
          username: profile.displayName,
          emailVerified: true,
          avatar: profile.photos?.[0]?.value,
          role: 'USER'
        }
      });

      done(null, user);
    } catch (error) {
      logger.error(`${provider} OAuth error:`, error);
      done(error, null);
    }
  }

  // Helper methods for token management
  async storeOAuthTokens(userId, provider, tokens) {
    await prisma.oauthTokens.upsert({
      where: {
        userId_provider: {
          userId,
          provider
        }
      },
      update: tokens,
      create: {
        userId,
        provider,
        ...tokens
      }
    });
  }

  async getOAuthTokens(userId, provider) {
    return prisma.oauthTokens.findUnique({
      where: {
        userId_provider: {
          userId,
          provider
        }
      }
    });
  }
}

module.exports = new OAuthService(); 