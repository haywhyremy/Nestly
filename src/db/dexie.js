import Dexie from 'dexie'

const db = new Dexie('Nestly')

// Define version(1) schema stores and indexes
db.version(1).stores({
  events: 'clientId, eventType, eventTime, householdId, syncStatus, conflictStatus, [householdId+eventType+eventTime]',
  syncQueue: '++id, clientId, createdAt',
  metadata: 'key',
  profiles: 'id',
  households: 'id',
  babies: 'id, householdId'
})

export default db
