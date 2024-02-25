interface DifficultyEntry {
  time: number
  height: number
  difficulty: number
  adjustment: number
}

interface HashratesEntry {
  timestamp: number
  avgHashrate: number
}

export class HashrateResponseDto {
  data: {
    progressPercent: number
    difficultyChange: number
    estimatedRetargetDate: number
    remainingBlocks: number
    remainingTime: number
    previousRetarget: number
    previousTime: number
    nextRetargetHeight: number
    timeAvg: number
    adjustedTimeAvg: number
    timeOffset: number
    expectedBlocks: number
    hashrates: HashratesEntry[]
    difficulty: DifficultyEntry[]
    currentHashrate: number
    currentDifficulty: number
  }
}
