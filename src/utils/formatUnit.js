export const formatUnit = (value, unit) => {
  if (!value) return '-'
  
  const formatted = typeof value === 'number' ? value.toFixed(1) : value
  
  const unitMap = {
    kg: 'kg',
    reps: 'reps',
    seconds: 's',
    minutes: 'min',
    cm: 'cm',
    percent: '%',
  }
  
  return `${formatted} ${unitMap[unit] || unit}`
}
