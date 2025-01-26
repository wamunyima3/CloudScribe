const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@cloudscribe.com' },
      update: {},
      create: {
        email: 'admin@cloudscribe.com',
        username: 'admin',
        passwordHash: adminPassword,
        role: 'ADMIN'
      }
    });

    // Create languages
    const languages = await Promise.all([
      prisma.language.upsert({
        where: { code: 'EN' },
        update: {},
        create: {
          name: 'English',
          code: 'EN',
          isEndangered: false
        }
      }),
      prisma.language.upsert({
        where: { code: 'NY' },
        update: {},
        create: {
          name: 'Nyanja',
          code: 'NY',
          isEndangered: false
        }
      }),
      prisma.language.upsert({
        where: { code: 'BE' },
        update: {},
        create: {
          name: 'Bemba',
          code: 'BE',
          isEndangered: false
        }
      })
    ]);

    // Create some initial tags
    const tags = await Promise.all([
      prisma.tag.upsert({
        where: { name: 'greetings' },
        update: {},
        create: { name: 'greetings' }
      }),
      prisma.tag.upsert({
        where: { name: 'basic' },
        update: {},
        create: { name: 'basic' }
      }),
      prisma.tag.upsert({
        where: { name: 'common' },
        update: {},
        create: { name: 'common' }
      })
    ]);

    // Create some sample words with translations
    const sampleWords = [
      {
        original: 'hello',
        languageId: languages[0].id,
        difficulty: 1,
        addedById: admin.id,
        approved: true,
        translations: {
          create: {
            translation: 'moni',
            userId: admin.id,
            verified: true
          }
        },
        tags: {
          create: {
            tagId: tags[0].id
          }
        }
      },
      {
        original: 'muli bwanji',
        languageId: languages[1].id,
        difficulty: 1,
        addedById: admin.id,
        approved: true,
        translations: {
          create: {
            translation: 'how are you',
            userId: admin.id,
            verified: true
          }
        },
        tags: {
          create: [
            { tagId: tags[0].id },
            { tagId: tags[1].id }
          ]
        }
      }
    ];

    for (const word of sampleWords) {
      await prisma.word.upsert({
        where: {
          original_languageId: {
            original: word.original,
            languageId: word.languageId
          }
        },
        update: {},
        create: word
      });
    }

    // Create sample stories
    const sampleStories = [
      {
        title: 'The Village Tale',
        content: 'Once upon a time in a small village...',
        languageId: languages[1].id,
        userId: admin.id,
        type: 'STORY',
        verified: true
      },
      {
        title: 'Traditional Proverb',
        content: 'The wisdom of our ancestors...',
        languageId: languages[2].id,
        userId: admin.id,
        type: 'PROVERB',
        verified: true
      }
    ];

    for (const story of sampleStories) {
      await prisma.story.create({
        data: story
      });
    }

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 