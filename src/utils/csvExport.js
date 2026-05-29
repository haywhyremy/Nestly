import db from '../db/dexie'
import { format } from 'date-fns'

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function escapeCSV(val) {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function exportToCSV(householdId) {
  if (!householdId) throw new Error('No household ID provided for CSV export')

  // Query all non-deleted events from Dexie for this householdId
  const rawEvents = await db.events
    .where('householdId')
    .equals(householdId)
    .toArray()

  const activeEvents = rawEvents.filter(e => !e.deletedAt)
  
  // Sort ascending by eventTime
  activeEvents.sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime))

  const headers = ['Date', 'Time', 'Type', 'Subtype', 'Details', 'Logged By']
  const rows = [headers.join(',')]

  for (const event of activeEvents) {
    const eventDate = new Date(event.eventTime)
    const dateStr = format(eventDate, 'yyyy-MM-dd')
    const timeStr = format(eventDate, 'HH:mm')
    const typeStr = capitalize(event.eventType)
    const subtypeStr = capitalize(event.eventSubtype)
    const loggedByStr = event.loggedByName || ''

    let detailsStr = ''
    if (event.eventType === 'feed') {
      if (event.eventSubtype === 'bottle') {
        detailsStr = `Bottle, ${event.metadata?.volume_ml || 0}ml`
      } else if (event.eventSubtype === 'breast') {
        detailsStr = `Breast, ${capitalize(event.metadata?.side || '')}, ${event.metadata?.duration_minutes || 0}min`
      }
    } else if (event.eventType === 'nappy') {
      detailsStr = capitalize(event.eventSubtype)
    } else if (event.eventType === 'sleep') {
      if (event.eventSubtype === 'start') {
        detailsStr = 'Started'
      } else if (event.eventSubtype === 'end') {
        detailsStr = event.metadata?.duration_minutes !== undefined ? `${event.metadata.duration_minutes}min` : ''
      }
    } else if (event.eventType === 'conflict_resolved') {
      detailsStr = `Resolved: ${event.metadata?.resolution || ''}`
    }

    const row = [
      escapeCSV(dateStr),
      escapeCSV(timeStr),
      escapeCSV(typeStr),
      escapeCSV(subtypeStr),
      escapeCSV(detailsStr),
      escapeCSV(loggedByStr)
    ]
    rows.push(row.join(','))
  }

  const csvString = rows.join('\n')
  const filename = `nestly-export-${format(new Date(), 'yyyy-MM-dd')}.csv`

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
