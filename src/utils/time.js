import { format } from 'date-fns'

export function formatTimeSince(dateString) {
  if (!dateString) return ''
  
  const totalMinutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
  
  if (totalMinutes < 1) {
    return 'just now'
  }
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  
  return `${minutes}m`
}

export function formatDuration(minutes) {
  if (minutes === undefined || minutes === null) return ''
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`
  }
  
  return `${remainingMinutes}m`
}

export function formatTimeOfDay(dateString) {
  if (!dateString) return ''
  return format(new Date(dateString), 'HH:mm')
}
