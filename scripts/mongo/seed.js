// seed.js
// Quick seed script for togetherflow using current Mongoose model shapes
// Run with: mongosh "<your_connection_string>" --file scripts/mongo/seed.js

// Choose DB
const DB_NAME = 'togetherflow';
db = db.getSiblingDB(DB_NAME);

const ownerId = 'user_owner_123'; // replace with real Clerk userId
const memberId = 'user_member_456'; // replace with real Clerk userId

// Pre-create collections if not present
['projects','tasks','notifications','activities','chatmessages'].forEach((c)=>{
  if (!db.getCollectionNames().includes(c)) db.createCollection(c);
});

const now = new Date();
const projectId = new ObjectId();

// Seed project (aligns with src/lib/models.ts)
db.projects.insertOne({
  _id: projectId,
  name: 'Demo Project',
  description: 'Seeded project for togetherflow',
  status: 'active',
  progress: 20,
  dueDate: new Date(Date.now() + 1000*60*60*24*14),
  members: [
    { id: ownerId, name: 'Owner User', avatar: '' },
    { id: memberId, name: 'Member User', avatar: '' },
  ],
  tasksCount: 0,
  ownerId,
  createdAt: now,
  updatedAt: now,
});

// Seed tasks (aligns with src/lib/models.ts)
db.tasks.insertMany([
  {
    projectId,
    title: 'Design homepage',
    description: 'Create wireframes and hi-fi mockups',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 1000*60*60*24*7),
    assignee: { id: memberId, name: 'Member User', avatar: '' },
    creatorId: ownerId,
    createdAt: now,
    updatedAt: now,
  },
  {
    projectId,
    title: 'Setup CI/CD',
    description: 'Configure GitHub Actions',
    status: 'todo',
    priority: 'medium',
    assignee: { id: ownerId, name: 'Owner User', avatar: '' },
    creatorId: ownerId,
    createdAt: now,
    updatedAt: now,
  },
]);

// Update tasks count
db.projects.updateOne({ _id: projectId }, { $set: { tasksCount: db.tasks.countDocuments({ projectId }) }, $setOnInsert: {} });

// Notifications (aligns with src/lib/models.ts)
db.notifications.insertMany([
  {
    userId: ownerId,
    type: 'task',
    title: 'New Task Assigned',
    message: 'You were assigned a task',
    isRead: false,
    time: now,
    sender: { id: memberId, name: 'Member User', avatar: '' },
    createdAt: now,
    updatedAt: now,
  },
]);

// Activity (generic)
db.activities.insertOne({
  type: 'project_created',
  message: 'Project created',
  time: now,
  user: { id: ownerId, name: 'Owner User', avatar: '' },
  createdAt: now,
  updatedAt: now,
});

// Chat messages (aligns with src/lib/models.ts)
db.chatmessages.insertOne({
  projectId,
  content: 'Hello team! Welcome to the project.',
  sender: { id: memberId, name: 'Member User', avatar: '' },
  timestamp: now,
  createdAt: now,
  updatedAt: now,
});

print('Seeded togetherflow demo data. Replace user IDs with real Clerk user IDs as needed.');