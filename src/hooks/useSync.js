import { useState, useCallback, useEffect, useRef } from 'react'
import { processUploadQueue, downloadNewEvents, getQueueLength } from '../db/syncQueue'
import { useOnlineStatus } from './useOnlineStatus'

export function useSync(householdId) {
  const { isOnline } = useOnlineStatus()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  const syncingRef = useRef(false)

  const syncNow = useCallback(async () => {
    if (!isOnline || syncingRef.current || !householdId) {
      return
    }

    syncingRef.current = true
    setIsSyncing(true)
    try {
      await processUploadQueue(householdId)
      await downloadNewEvents(householdId)
      setLastSynced(new Date())
      const count = await getQueueLength()
      setPendingCount(count)
    } catch (err) {
      console.error('Synchronization failed:', err)
    } finally {
      syncingRef.current = false
      setIsSyncing(false)
    }
  }, [isOnline, householdId])

  // Initial sync on mount or householdId change
  useEffect(() => {
    let active = true
    const fetchQueueCount = async () => {
      const count = await getQueueLength()
      if (active) {
        setPendingCount(count)
      }
    }
    fetchQueueCount()

    if (householdId) {
      syncNow()
    }

    return () => {
      active = false
    }
  }, [householdId, syncNow])

  // Re-sync on network reconnection
  useEffect(() => {
    const handleOnline = () => {
      syncNow()
    }
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [syncNow])

  // Periodically refresh pending count every 30 seconds
  useEffect(() => {
    let active = true
    const interval = setInterval(async () => {
      const count = await getQueueLength()
      if (active) {
        setPendingCount(count)
      }
    }, 30000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  return { syncNow, isSyncing, lastSynced, pendingCount }
}

export default useSync;
