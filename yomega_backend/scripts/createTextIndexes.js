// Script to create MongoDB text indexes for full-text search
// Run: node scripts/createTextIndexes.js

require('dotenv').config();
const mongoose = require('mongoose');
const News = require('../models/News');
const Program = require('../models/Program');
const Resource = require('../models/Resource');
const BoardMember = require('../models/BoardMember');

async function createTextIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get collections
    const newsCollection = mongoose.connection.collection('news');
    const programsCollection = mongoose.connection.collection('programs');
    const resourcesCollection = mongoose.connection.collection('resources');
    const boardmembersCollection = mongoose.connection.collection('boardmembers');

    // Drop existing text indexes if they exist (optional - comment out if you want to keep)
    try {
      await newsCollection.dropIndex('title_text_content_text');
      console.log('Dropped existing News text index');
    } catch (e) {
      console.log('News text index does not exist or already dropped');
    }

    try {
      await programsCollection.dropIndex('speaker.name_text_title_text_description_text_shortDescription_text');
      console.log('Dropped existing Program text index');
    } catch (e) {
      console.log('Program text index does not exist or already dropped');
    }

    try {
      await resourcesCollection.dropIndex('title_text_description_text_tags_text');
      console.log('Dropped existing Resource text index');
    } catch (e) {
      console.log('Resource text index does not exist or already dropped');
    }

    try {
      await boardmembersCollection.dropIndex('name_text_position_text_bio_text_expertise_text');
      console.log('Dropped existing BoardMember text index');
    } catch (e) {
      console.log('BoardMember text index does not exist or already dropped');
    }

    // Create text indexes
    console.log('\n📝 Creating text indexes...\n');

    // News: title + content
    await newsCollection.createIndex(
      { title: 'text', content: 'text', summary: 'text' },
      { name: 'news_text_index' }
    );
    console.log('✅ Created News text index (title, content, summary)');

    // Programs: speaker.name + title + description
    await programsCollection.createIndex(
      { 'speaker.name': 'text', title: 'text', description: 'text', shortDescription: 'text' },
      { name: 'programs_text_index' }
    );
    console.log('✅ Created Program text index (speaker.name, title, description, shortDescription)');

    // Resources: title + description + tags
    await resourcesCollection.createIndex(
      { title: 'text', description: 'text', tags: 'text' },
      { name: 'resources_text_index' }
    );
    console.log('✅ Created Resource text index (title, description, tags)');

    // Board Members: name + position + bio + expertise
    await boardmembersCollection.createIndex(
      { name: 'text', position: 'text', bio: 'text', expertise: 'text' },
      { name: 'boardmembers_text_index' }
    );
    console.log('✅ Created BoardMember text index (name, position, bio, expertise)');

    console.log('\n🎉 All text indexes created successfully!');
    console.log('\nNote: Indexes are created automatically when models are loaded,');
    console.log('but this script ensures they exist with the correct fields.\n');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed');
    process.exit(0);
  }
}

createTextIndexes();