export const SUPPORTED_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
  { value: 'Asia/Kolkata', label: 'IST (India Standard Time)', offset: '+05:30' },
  { value: 'America/New_York', label: 'EST (Eastern Standard Time)', offset: '-05:00' },
  { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)', offset: '+00:00' },
  { value: 'America/Los_Angeles', label: 'PST (Pacific Standard Time)', offset: '-08:00' },
  { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)', offset: '+09:00' },
  { value: 'Australia/Sydney', label: 'AEDT (Australian Eastern Time)', offset: '+11:00' },
  { value: 'Europe/Paris', label: 'CET (Central European Time)', offset: '+01:00' }
]

export function formatTimeInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

export function getCurrentTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function getTimezoneOffset(timezone: string): string {
  const now = new Date()
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
  const targetTime = new Date(utc.toLocaleString("en-US", {timeZone: timezone}))
  const diff = targetTime.getTime() - utc.getTime()
  const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60))
  const minutes = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60))
  const sign = diff >= 0 ? '+' : '-'
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}