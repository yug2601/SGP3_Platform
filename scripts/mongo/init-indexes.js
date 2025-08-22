// init-indexes.js
// Use with mongosh or Atlas Playgrounds
// Switch to your DB (ensure this matches process.env.MONGODB_DB)
db = db.getSiblingDB('togetherflow');

// Ensure collections exist
db.createCollection('projects');
db.createCollection('tasks');
db.createCollection('notifications');
db.createCollection('activities');
db.createCollection('chatmessages');

// Projects indexes - align with src/lib/models.ts
// ownerId + updatedAt used in listing
try { db.projects.dropIndex('owner_updatedAt'); } catch (e) {}
try { db.projects.dropIndex('ownerId_1_updatedAt_-1'); } catch (e) {}
db.projects.createIndexes([
  { key: { ownerId: 1, updatedAt: -1 }, name: 'owner_updatedAt' },
]);

// Tasks indexes - align with src/lib/models.ts
try { db.tasks.dropIndex('project_updatedAt'); } catch (e) {}
try { db.tasks.dropIndex('projectId_1_updatedAt_-1'); } catch (e) {}
db.tasks.createIndexes([
  { key: { projectId: 1, updatedAt: -1 }, name: 'project_updatedAt' },
]);

// Notifications indexes - align with src/lib/models.ts
try { db.notifications.dropIndex('user_time'); } catch (e) {}
try { db.notifications.dropIndex('userId_1_time_-1'); } catch (e) {}
db.notifications.createIndexes([
  { key: { userId: 1, time: -1 }, name: 'user_time' },
]);

// Activities indexes - align with src/lib/models.ts
try { db.activities.dropIndex('time_desc'); } catch (e) {}
try { db.activities.dropIndex('time_-1'); } catch (e) {}
db.activities.createIndexes([
  { key: { time: -1 }, name: 'time_desc' },
]);

// Chat messages indexes - align with src/lib/models.ts
try { db.chatmessages.dropIndex('project_timestamp'); } catch (e) {}
try { db.chatmessages.dropIndex('projectId_1_timestamp_1'); } catch (e) {}
db.chatmessages.createIndexes([
  { key: { projectId: 1, timestamp: 1 }, name: 'project_timestamp' },
]);

print('Indexes ensured for togetherflow');