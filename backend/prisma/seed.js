const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const seedConfig = require('./seed.config');
const prisma = new PrismaClient();

async function cleanTestData() {
  console.log('Cleaning up test data...');
  
  // Delete all test data (prefixed with TEST_)
  await Promise.all([
    prisma.story.deleteMany({
      where: {
        OR: [
          { title: { startsWith: 'TEST_' } },
          { content: { startsWith: 'TEST:' } }
        ]
      }
    }),
    prisma.word.deleteMany({
      where: { original: { startsWith: 'TEST_' } }
    }),
    prisma.translation.deleteMany({
      where: { translation: { startsWith: 'TEST_' } }
    })
  ]);
}

async function createUsers() {
  const users = {};
  
  for (const [key, userData] of Object.entries(seedConfig.users)) {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    users[key] = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        username: userData.username,
        passwordHash,
        role: userData.role
      }
    });
    console.log(`Created user: ${userData.username} (${userData.role})`);
  }
  
  return users;
}

async function createLanguages() {
  const languages = {};
  
  for (const langData of seedConfig.languages) {
    languages[langData.code] = await prisma.language.upsert({
      where: { code: langData.code },
      update: {},
      create: langData
    });
    console.log(`Created language: ${langData.name} (${langData.code})`);
  }
  
  return languages;
}

async function createTags() {
  const tags = {};
  
  for (const tagName of seedConfig.tags) {
    tags[tagName] = await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName }
    });
    console.log(`Created tag: ${tagName}`);
  }
  
  return tags;
}

async function main() {
  try {
    // Clean existing test data
    await cleanTestData();

    // Create base data
    const users = await createUsers();
    const languages = await createLanguages();
    const tags = await createTags();

    // Create words with translations
    for (const wordData of seedConfig.words) {
      const word = await prisma.word.create({
        data: {
          original: wordData.original,
          languageId: languages[wordData.language].id,
          difficulty: wordData.difficulty,
          addedById: users.admin.id,
          approved: true,
          translations: {
            create: wordData.translations.map(t => ({
              translation: t.text,
              userId: users.admin.id,
              verified: true
            }))
          },
          tags: {
            create: wordData.tags.map(tagName => ({
              tagId: tags[tagName].id
            }))
          }
        }
      });
      console.log(`Created word: ${wordData.original}`);
    }

    // Create stories
    for (const storyData of seedConfig.stories) {
      await prisma.story.create({
        data: {
          title: storyData.title,
          content: storyData.content,
          languageId: languages[storyData.language].id,
          userId: users.admin.id,
          type: storyData.type,
          verified: true
        }
      });
      console.log(`Created story: ${storyData.title}`);
    }

    console.log('\nSeed data created successfully!');
    console.log('\nTest Credentials:');
    Object.entries(seedConfig.users).forEach(([role, user]) => {
      console.log(`\n${role.toUpperCase()}:`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
    });

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