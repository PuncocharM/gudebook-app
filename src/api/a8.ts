export interface A8SearchItem {
    zlaggableId: number
    zlaggableName: string
    zlaggableSlug: string
    cragSlug: string
    cragName: string
    countrySlug: string
    countryName: string
    areaSlug: string
    areaName: string
    sectorSlug: string
    sectorName: string
    category: number
    difficulty: string
    gradeIndex: number
    totalAscents: number
    flashOnsightRate: number
    totalRecommendedRate: number
    averageRating: number
    totalZlaggables: number
    score: number
    type: number
}

export interface A8SearchResults {
    items: A8SearchItem[]
    totals: any
    totalAreas: number
    totalCrags: number
    totalSectors: number
    totalZlaggables: number
    totalUsers: number
    totalNews: number
}


