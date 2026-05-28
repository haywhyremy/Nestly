import db from './dexie'

export async function getDeviceId() {
  try {
    const record = await db.metadata.get('deviceId')
    if (record) {
      return record.value
    }

    const newId = crypto.randomUUID()
    await db.metadata.put({ key: 'deviceId', value: newId })
    return newId
  } catch (error) {
    console.error('Failed to get or generate device ID from IndexedDB:', error)
    
    // Fail-safe fallback to localStorage if IndexedDB is temporarily blocked
    const fallbackKey = 'nestly_device_id_fallback'
    let fallbackId = localStorage.getItem(fallbackKey)
    if (!fallbackId) {
      fallbackId = crypto.randomUUID()
      localStorage.setItem(fallbackKey, fallbackId)
    }
    return fallbackId
  }
}
