import { spawn } from "node:child_process";

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

/**
 * Run a command, capturing output. Never rejects on a non-zero exit — inspect
 * `code`. Rejects only if the binary can't be spawned. PATH is extended with
 * ~/.local/bin so the repo's pnpm shim resolves.
 */
export function run(
  cmd: string,
  args: string[],
  opts: { cwd?: string; env?: NodeJS.ProcessEnv; timeoutMs?: number } = {},
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: {
        ...process.env,
        PATH: `${process.env.HOME}/.local/bin:${process.env.PATH ?? ""}`,
        COREPACK_ENABLE_DOWNLOAD_PROMPT: "0",
        ...opts.env,
      },
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));

    const timer = setTimeout(
      () => child.kill("SIGKILL"),
      opts.timeoutMs ?? 15 * 60 * 1000,
    );

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

export async function runOrThrow(cmd: string, args: string[], opts?: Parameters<typeof run>[2]): Promise<RunResult> {
  const r = await run(cmd, args, opts);
  if (r.code !== 0) {
    throw new Error(`\`${cmd} ${args.join(" ")}\` exited ${r.code}\n${r.stderr.slice(-2000)}`);
  }
  return r;
}

/** The repo pins pnpm via corepack (packageManager: pnpm@9.15.0), like its CI. */
export const pnpm = (args: string[], cwd: string) => runOrThrow("corepack", ["pnpm@9.15.0", ...args], { cwd });
