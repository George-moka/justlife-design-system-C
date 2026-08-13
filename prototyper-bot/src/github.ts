import { Octokit } from "@octokit/rest";
import { config, repoOwner, repoName } from "./config.js";

const octokit = new Octokit({ auth: config.githubToken });

/** Open a "Proposal: …" PR for a pushed branch. Returns the PR URL. */
export async function openProposalPR(branch: string, title: string, body: string): Promise<string> {
  const { data } = await octokit.pulls.create({
    owner: repoOwner,
    repo: repoName,
    base: config.baseBranch,
    head: branch,
    title: title.startsWith("Proposal:") ? title : `Proposal: ${title}`,
    body,
  });
  return data.html_url;
}
