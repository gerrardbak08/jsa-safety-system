export type AccidentRecord = {
  year: string      // Year
  month: string     // Month
  department: string // 영업부
  team: string      // 팀명
  accidentDate: string // 재해일자
  accidentType: string // 재해 유형
  ageGroup: string  // 나이대
}

export type AccidentStatsResponse = {
  data: AccidentRecord[]
  error?: string
}
