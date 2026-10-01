import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'kagglelite.db'));

// Basic Setup
db.pragma('foreign_keys = ON');

function seed() {
  console.log('Seeding database...');
  
  // Create tables
  db.exec(`
    DROP TABLE IF EXISTS comments;
    DROP TABLE IF EXISTS replies;
    DROP TABLE IF EXISTS discussions;
    DROP TABLE IF EXISTS models;
    DROP TABLE IF EXISTS notebooks;
    DROP TABLE IF EXISTS dataset_columns;
    DROP TABLE IF EXISTS datasets;
    DROP TABLE IF EXISTS leaderboard;
    DROP TABLE IF EXISTS submissions;
    DROP TABLE IF EXISTS competition_members;
    DROP TABLE IF EXISTS competitions;
    DROP TABLE IF EXISTS course_progress;
    DROP TABLE IF EXISTS courses;
    DROP TABLE IF EXISTS upvotes;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      bio TEXT,
      tier TEXT DEFAULT 'Novice',
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE competitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      prize TEXT,
      category TEXT,
      deadline DATETIME,
      teams_count INTEGER DEFAULT 0,
      tags TEXT
    );

    CREATE TABLE submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      competition_id INTEGER NOT NULL,
      score REAL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (competition_id) REFERENCES competitions (id)
    );

    CREATE TABLE leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      competition_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      team_name TEXT,
      score REAL,
      entries INTEGER DEFAULT 1,
      last_submission DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (competition_id) REFERENCES competitions (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE competition_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      competition_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (competition_id) REFERENCES competitions (id)
    );

    CREATE TABLE datasets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      owner_id INTEGER NOT NULL,
      description TEXT,
      size TEXT,
      usability REAL DEFAULT 10.0,
      upvotes INTEGER DEFAULT 0,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users (id)
    );

    CREATE TABLE dataset_columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dataset_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (dataset_id) REFERENCES datasets (id)
    );

    CREATE TABLE notebooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      dataset_id INTEGER,
      language TEXT,
      upvotes INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      content_json TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id),
      FOREIGN KEY (dataset_id) REFERENCES datasets (id)
    );

    CREATE TABLE models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      framework TEXT,
      downloads INTEGER DEFAULT 0,
      upvotes INTEGER DEFAULT 0,
      description TEXT
    );

    CREATE TABLE discussions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT,
      author_id INTEGER NOT NULL,
      category TEXT,
      votes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id)
    );

    CREATE TABLE replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discussion_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (discussion_id) REFERENCES discussions (id),
      FOREIGN KEY (author_id) REFERENCES users (id)
    );

    CREATE TABLE comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notebook_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (notebook_id) REFERENCES notebooks (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE upvotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      target_type TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      UNIQUE(user_id, target_type, target_id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      lessons_count INTEGER NOT NULL
    );

    CREATE TABLE course_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      completed_lessons INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (course_id) REFERENCES courses (id)
    );
  `);

  const insertUser = db.prepare('INSERT INTO users (username, email, password_hash, tier, email_verified) VALUES (?, ?, ?, ?, ?)');
  const defaultPassword = bcrypt.hashSync('password123', 10);
  
  insertUser.run('demo', 'demo@kagglelite.com', defaultPassword, 'Master', 1);
  for (let i = 1; i <= 14; i++) {
    insertUser.run(`user${i}`, `user${i}@test.com`, defaultPassword, i % 3 === 0 ? 'Expert' : 'Novice', 1);
  }

  const insertComp = db.prepare('INSERT INTO competitions (slug, title, subtitle, description, prize, category, deadline, teams_count, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertComp.run('titanic', 'Titanic - Machine Learning from Disaster', 'Start here! Predict survival on the Titanic', 'Description for Titanic...', '$10,000', 'Getting Started', '2026-12-31 23:59:59', 14500, 'Classification, Beginner');
  insertComp.run('house-prices', 'House Prices - Advanced Regression Techniques', 'Predict sales prices and practice feature engineering', 'Description...', 'Knowledge', 'Getting Started', '2027-01-01 23:59:59', 8200, 'Regression, Beginner');
  for (let i = 1; i <= 6; i++) {
    insertComp.run(`comp-${i}`, `Featured Competition ${i}`, `Subtitle for comp ${i}`, `Description...`, `$${i}0,000`, 'Featured', '2027-06-01 23:59:59', i * 100, 'CV, Deep Learning');
  }

  const insertDataset = db.prepare('INSERT INTO datasets (slug, title, owner_id, description, size, usability, upvotes, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertDataset.run('netflix-movies', 'Netflix Movies and TV Shows', 1, 'Data on Netflix content', '3 MB', 10.0, 500, 'Movies, NLP');
  insertDataset.run('covid-19', 'COVID-19 Open Research Dataset', 2, 'Research literature', '500 MB', 9.5, 1200, 'Health, Text');
  for(let i = 3; i <= 20; i++) {
    insertDataset.run(`dataset-${i}`, `Dummy Dataset ${i}`, i % 14 + 1, `Description for dataset ${i}`, `${i * 10} MB`, 8.5 + (i%10)/10, i * 5, 'Data, Tabular');
  }

  const insertCol = db.prepare('INSERT INTO dataset_columns (dataset_id, name, type, description) VALUES (?, ?, ?, ?)');
  insertCol.run(1, 'show_id', 'string', 'Unique ID for every Movie/Tv Show');
  insertCol.run(1, 'type', 'string', 'Identifier - A Movie or TV Show');
  insertCol.run(1, 'title', 'string', 'Title of the Movie/Tv Show');

  const insertNotebook = db.prepare('INSERT INTO notebooks (slug, title, author_id, dataset_id, language, upvotes, comments_count, content_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const dummyContent = JSON.stringify([{ type: 'markdown', source: '# Hello World' }, { type: 'code', source: 'print("Hello KaggleLite")', output: 'Hello KaggleLite' }]);
  insertNotebook.run('titanic-tutorial', 'Titanic Comprehensive Tutorial', 1, null, 'Python', 450, 25, dummyContent);
  insertNotebook.run('eda-netflix', 'Netflix EDA and visualization', 2, 1, 'R', 120, 10, dummyContent);
  for(let i = 3; i <= 25; i++) {
    insertNotebook.run(`notebook-${i}`, `Analysis Notebook ${i}`, i%14+1, i%20+1, i%2===0 ? 'Python' : 'R', i*10, i, dummyContent);
  }

  const insertModel = db.prepare('INSERT INTO models (slug, name, framework, downloads, upvotes, description) VALUES (?, ?, ?, ?, ?, ?)');
  insertModel.run('llama-3', 'Llama 3 8B', 'PyTorch', 15000, 3000, 'Meta Llama 3 model');
  insertModel.run('gemma-2', 'Gemma 2', 'TensorFlow', 8000, 1200, 'Google Gemma model');
  for(let i = 3; i <= 10; i++) {
    insertModel.run(`model-${i}`, `Model Version ${i}`, 'JAX', i*100, i*10, 'Some description');
  }

  const insertDisc = db.prepare('INSERT INTO discussions (title, body, author_id, category, votes) VALUES (?, ?, ?, ?, ?)');
  insertDisc.run('Welcome to KaggleLite', 'This is a demo clone.', 1, 'General', 50);
  insertDisc.run('How to improve CV score?', 'I am stuck at 0.85.', 2, 'Questions', 15);
  for(let i = 3; i <= 30; i++) {
    insertDisc.run(`Discussion Topic ${i}`, 'Some random text about data science.', i%14+1, 'General', i*2);
  }

  const insertCourse = db.prepare('INSERT INTO courses (title, description, lessons_count) VALUES (?, ?, ?)');
  insertCourse.run('Python', 'Learn the most important language for data science.', 14);
  insertCourse.run('Pandas', 'Solve short hands-on challenges to perfect your data manipulation skills.', 6);
  insertCourse.run('Intro to Machine Learning', 'Learn the core ideas in machine learning.', 7);
  insertCourse.run('SQL', 'Learn SQL to interact with databases.', 6);
  insertCourse.run('Data Visualization', 'Make great data visualizations.', 6);

  const insertLeaderboard = db.prepare('INSERT INTO leaderboard (competition_id, user_id, team_name, score, entries) VALUES (?, ?, ?, ?, ?)');
  insertLeaderboard.run(1, 1, 'Demo Team', 0.85231, 5);
  insertLeaderboard.run(1, 2, 'Random Foresters', 0.84112, 12);
  insertLeaderboard.run(1, 3, 'Overfitters', 0.83555, 3);

  console.log('Database seeding complete!');
}

seed();
