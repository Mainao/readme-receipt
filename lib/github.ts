/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReceiptStats, DayContribution } from "./types";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const QUERY = `
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
      repositories(
        first: 100
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        totalCount
        nodes {
          stargazerCount
          primaryLanguage {
            name
          }
        }
      }
    }
  }
`;

class GithubStatsError extends Error {}

export async function getReceiptStats(username: string): Promise<ReceiptStats> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new GithubStatsError("Missing GITHUB_TOKEN environment variable");
    }

    const res = await fetch(GITHUB_GRAPHQL_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: QUERY, variables: { username } }),
        cache: "no-store",
    });

    if (!res.ok) {
        throw new GithubStatsError(`GitHub API responded with ${res.status}`);
    }

    const json = await res.json();

    if (json.errors?.length) {
        throw new GithubStatsError(
            json.errors[0]?.message ?? "GitHub GraphQL error",
        );
    }

    const user = json.data?.user;
    if (!user) {
        throw new GithubStatsError(`No such GitHub user: ${username}`);
    }

    const cc = user.contributionsCollection;
    const calendar = cc.contributionCalendar;

    const allDays: DayContribution[] = calendar.weeks.flatMap((w: any) =>
        w.contributionDays.map((d: any) => ({
            date: d.date,
            count: d.contributionCount,
        })),
    );

    const currentStreak = computeCurrentStreak(allDays);
    const last10Days = allDays.slice(-10);

    const repoNodes: Array<{
        stargazerCount: number;
        primaryLanguage: { name: string } | null;
    }> = user.repositories.nodes ?? [];

    const totalStars = repoNodes.reduce(
        (sum, r) => sum + (r.stargazerCount ?? 0),
        0,
    );
    const topLanguage = computeTopLanguage(repoNodes);

    return {
        username,
        totalCommits: cc.totalCommitContributions,
        totalPRs: cc.totalPullRequestContributions,
        totalIssues: cc.totalIssueContributions,
        totalStars,
        activeRepoCount: user.repositories.totalCount,
        totalContributions: calendar.totalContributions,
        currentStreak,
        topLanguage,
        last10Days,
    };
}

function computeCurrentStreak(daysChronological: DayContribution[]): number {
    let streak = 0;
    for (let i = daysChronological.length - 1; i >= 0; i--) {
        if (daysChronological[i].count > 0) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

function computeTopLanguage(
    repos: Array<{ primaryLanguage: { name: string } | null }>,
): string {
    const counts = new Map<string, number>();
    for (const r of repos) {
        const name = r.primaryLanguage?.name;
        if (!name) continue;
        counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    let top = "N/A";
    let max = 0;
    for (const [name, count] of counts) {
        if (count > max) {
            max = count;
            top = name;
        }
    }
    return top;
}
