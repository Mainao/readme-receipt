export interface DayContribution {
    date: string;
    count: number;
}

export interface ReceiptStats {
    username: string;
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    totalStars: number;
    activeRepoCount: number;
    totalContributions: number;
    currentStreak: number;
    topLanguage: string;
    last10Days: DayContribution[];
}
