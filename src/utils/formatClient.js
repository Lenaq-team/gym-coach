const FITNESS_LABELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

export const getFitnessLabel = (level) => FITNESS_LABELS[level] || level || '-'
