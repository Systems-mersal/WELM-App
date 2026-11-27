#!/usr/bin/env python3
"""Tajeer+ secret & environment guard for Claude Code hooks (Phase 0, layer L3/L4/L5).

Canonical copy: Tajeer-plus/.claude/hooks/tajeer_guard.py
Identical copies live in the other Tajeer+ repos and in ~/.claude/hooks/. Keep them in sync
(the copy check in test_tajeer_guard.py compares hashes when siblings are present).

Modes (first argument):
  pre     PreToolUse   - block tool calls that would read secret files, dump the environment,
                         reach production hosts or run destructive commands.   (exit 2 = block)
  post    PostToolUse  - redact secret-shaped values from tool output before the model sees it.
  prompt  UserPromptSubmit - warn when a pasted prompt contains a secret-shaped value.
Flag:
  --user  running from ~/.claude/settings.json: defer to the project's own copy if present.

Design rules:
  * Never print the offending command, path value or secret in messages.
  * Fail closed in `pre` mode (any internal error blocks; settings also set onFailure=block).
  * Python 3.9 compatible, standard library only, run with `python3 -I`.
"""
import json
import os
import re
import sys

VERSION = "1.0.0"
CANARY = "CANARY-0000-NOT-A-SECRET"

# --------------------------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------------------------

# Production Supabase project ref (public URL component, already present in V2R1 source).
PROD_SUPABASE_REFS = ["jzqyjeoaqivfkmfdkzwz"]
# Demo/replica Supabase ref. Network access from Bash is blocked until decision D2 classifies it.
DEMO_SUPABASE_REFS = ["cduocoouavydkenodbqn"]
# Owner TODO: add ELM / Tajeer production hostnames (regex strings) once confirmed.
EXTRA_PROD_HOST_PATTERNS = []  # type: list

MERSAL_HOST_RE = re.compile(r"(?<![\w-])((?:[\w-]+\.)*)mersal\.com\.sa(?![\w-])", re.I)

# Value-like placeholders that are not secrets.
PLACEHOLDER_RE = re.compile(
    r"^(?:\$|process\.env|import\.meta|<|\{|your|xxx|replace|changeme|example|placeholder|"
    r"true$|false$|null$|undefined$|none$|\*+$)",
    re.I,
)

# --------------------------------------------------------------------------------------------
# Secret path detection (applied to file paths and Bash command text)
# --------------------------------------------------------------------------------------------

ENV_FILE_RE = re.compile(r"(?<![\w$.-])\.env((?:\.[\w-]+)*)(?![\w-])")
ENV_SAFE_SUFFIXES = {"example", "sample", "template", "dist", "schema"}

PATH_PATTERNS = [
    ("envrc", re.compile(r"(?<![\w-])\.envrc(?![\w-])")),
    ("key-file", re.compile(r"\.(?:p8|p12|pfx|pem|jks|keystore|mobileprovision)(?![\w.-])", re.I)),
    ("apple-auth-key", re.compile(r"AuthKey_[A-Z0-9]+", re.I)),
    ("prod-postman-env", re.compile(r"Production[\w.-]*\.postman_environment", re.I)),
    ("next-build-output", re.compile(r"(?:^|[\s/'\"=])\.next(?:/|$|[\s'\"])")),
    ("worktrees", re.compile(r"(?:^|[\s/'\"=])\.worktrees(?:/|$|[\s'\"])")),
    (
        "home-credentials",
        re.compile(
            r"(?:~|\$HOME|\$\{HOME\}|/Users/[^/\s'\"]+)/"
            r"(?:\.supabase|\.vercel|\.expo|\.aws|\.ssh|\.config/gh|\.docker/config\.json|"
            r"\.npmrc|\.netrc|\.git-credentials|\.zsh_history|\.bash_history|"
            r"Library/Application Support/com\.vercel\.cli|Library/Keychains)"
        ),
    ),
    ("claude-transcripts", re.compile(r"\.claude/projects/\S*\.jsonl|/tasks/[\w-]+\.output")),
]

# Tokens that legitimately mention secret paths in order to EXCLUDE them (stripped before matching).
EXCLUSION_TOKEN_RES = [
    re.compile(r"(['\"]?)(?::\(exclude\)|:!)[^\s'\"]*\1"),
    re.compile(r"--exclude(?:-dir)?=(['\"]?)[^\s'\"]*\1"),
    re.compile(r"--exclude(?:-dir)?\s+(['\"]?)[^\s'\"]*\1"),
    re.compile(r"(?:-g|--glob|--iglob)(?:=|\s+)(['\"])![^'\"]*\1"),
    re.compile(r"(?:-g|--glob|--iglob)(?:=|\s+)![^\s]+"),
]


def strip_exclusions(text):
    for rx in EXCLUSION_TOKEN_RES:
        text = rx.sub(" ", text)
    return text


def secret_path_hits(text):
    """Return rule labels for secret-path references in `text` (exclusion tokens ignored)."""
    if not text:
        return []
    text = strip_exclusions(str(text))
    hits = []
    for m in ENV_FILE_RE.finditer(text):
        seg = m.group(1)
        first = seg.split(".")[1].lower() if seg else ""
        if first in ENV_SAFE_SUFFIXES:
            continue
        hits.append("env-file")
        break
    for label, rx in PATH_PATTERNS:
        if rx.search(text):
            hits.append(label)
    return hits


# --------------------------------------------------------------------------------------------
# Host detection
# --------------------------------------------------------------------------------------------


def host_class(text):
    """Return 'prod', 'demo' or None for the most sensitive host referenced in text."""
    if not text:
        return None
    text = str(text)
    result = None
    for m in MERSAL_HOST_RE.finditer(text):
        sub = (m.group(1) or "").lower()
        if sub == "demo.":
            result = result or "demo"
        else:
            return "prod"
    low = text.lower()
    if any(ref in low for ref in PROD_SUPABASE_REFS):
        return "prod"
    for pat in EXTRA_PROD_HOST_PATTERNS:
        if re.search(pat, text, re.I):
            return "prod"
    if any(ref in low for ref in DEMO_SUPABASE_REFS):
        result = result or "demo"
    return result


NETWORK_TOOL_RE = re.compile(
    r"(?<![\w-])(?:curl|wget|https?|xh|httpie|nc|ncat|netcat|telnet|openssl|ssh|scp|sftp|rsync|"
    r"ftp|psql|pg_dump|pg_restore|supabase|node|python3?|deno|bun|npx|pnpm|npm|yarn|ruby|perl|"
    r"php|osascript|open|eas|expo|vercel|gh)(?![\w-])"
)

# --------------------------------------------------------------------------------------------
# Secret VALUE detection (redaction in outputs; blocking in Bash commands / URLs)
# --------------------------------------------------------------------------------------------

LOCAL_HOST_RE = re.compile(r"@(?:localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0|host\.docker\.internal)(?:[:/]|$)")

VALUE_PATTERNS = [
    ("jwt", re.compile(r"eyJ[A-Za-z0-9_-]{5,}\.eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]*")),
    ("supabase-secret", re.compile(r"sb_secret_[A-Za-z0-9_-]{8,}")),
    ("private-key", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)")),
    ("stripe", re.compile(r"(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{10,}|whsec_[A-Za-z0-9]{10,}")),
    ("google-api-key", re.compile(r"AIza[0-9A-Za-z_-]{35}")),
    ("github-token", re.compile(r"gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}")),
    ("slack-token", re.compile(r"xox[abprs]-[A-Za-z0-9-]{10,}")),
    ("aws-access-key", re.compile(r"(?<![A-Z0-9])AKIA[0-9A-Z]{16}(?![A-Z0-9])")),
    ("basic-auth", re.compile(r"(?<![\w])Basic\s+[A-Za-z0-9+/]{16,}={0,2}")),
    ("bearer", re.compile(r"(?<![\w])Bearer\s+[A-Za-z0-9._~+/-]{20,}=*")),
]
DB_URL_RE = re.compile(r"((?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis)://)([^\s:@/'\"]+):([^\s@/'\"]+)(@[^\s'\"]*)", re.I)
ENV_ASSIGN_RE = re.compile(
    r"(?<![A-Za-z0-9_])([A-Z][A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD|PASSWD|PASS|AUTH|PRIVATE|CREDENTIALS?)"
    r"[A-Z0-9_]*)([\"']?\s*[=:]\s*)([\"']?)([^\s\"'#,;]{6,})"
)


def redact_text(text):
    """Return (redacted_text, count)."""
    if not isinstance(text, str) or not text:
        return text, 0
    count = 0

    def sub_db(m):
        nonlocal count
        count += 1
        return m.group(1) + "[REDACTED]" + m.group(4)

    text = DB_URL_RE.sub(sub_db, text)
    for label, rx in VALUE_PATTERNS:
        def sub_v(m, _label=label):
            nonlocal count
            count += 1
            return "[REDACTED:%s]" % _label
        text = rx.sub(sub_v, text)

    def sub_env(m):
        nonlocal count
        value = m.group(4)
        if PLACEHOLDER_RE.match(value) or "(" in value or value.startswith("[REDACTED"):
            return m.group(0)
        count += 1
        return m.group(1) + m.group(2) + m.group(3) + "[REDACTED]"

    text = ENV_ASSIGN_RE.sub(sub_env, text)
    return text, count


def redact_obj(obj):
    """Recursively redact strings inside JSON-like structures, preserving shape."""
    if isinstance(obj, str):
        return redact_text(obj)
    if isinstance(obj, list):
        total = 0
        out = []
        for item in obj:
            new, n = redact_obj(item)
            out.append(new)
            total += n
        return out, total
    if isinstance(obj, dict):
        total = 0
        out = {}
        for k, v in obj.items():
            new, n = redact_obj(v)
            out[k] = new
            total += n
        return out, total
    return obj, 0


def contains_secret_value(text):
    if not text:
        return None
    text = str(text)
    for m in DB_URL_RE.finditer(text):
        if not LOCAL_HOST_RE.search(m.group(4)):
            return "credentialed-db-url"
    for label, rx in VALUE_PATTERNS:
        if label in ("basic-auth", "bearer"):
            continue  # too common in docs/code; handled by redaction only
        if rx.search(text):
            return label
    return None


# --------------------------------------------------------------------------------------------
# Bash command rules
# --------------------------------------------------------------------------------------------

SEP = r"(?:^|[;&|(]\s*|\$\(\s*|`\s*|\bsudo\s+|\bthen\s+|\bdo\s+)"
END = r"\s*(?:$|[;&|)>`])"

DANGEROUS_BASH = [
    ("cloud-reset-script", re.compile(r"cloud:reset", re.I)),
    ("remote-supabase-mutation", re.compile(
        r"\bsupabase\s+(?:db\s+(?:push|reset\b[^;&|]*--(?:linked|db-url))|link\b|projects\s+delete|"
        r"secrets\s+(?:list|set|unset)|db\s+dump\b[^;&|]*--(?:linked|db-url))")),
    ("git-force-push", re.compile(
        r"\bgit\b[^;&|]*\bpush\b[^;&|]*(?:\s--force(?:-with-lease)?\b|\s-f\b|\s-[a-zA-Z]*f[a-zA-Z]*\b|\s\+[\w/.-]+)")),
    ("git-history-rewrite", re.compile(r"\bgit\s+filter-(?:repo|branch)\b|\bbfg\b|java\s+-jar\s+\S*bfg")),
    ("env-dump", re.compile(SEP + r"(?:env|set|export\s+-p|declare\s+-[a-z]*[px][a-z]*|typeset\s+-[a-z]*x|compgen\s+-[ve])" + END)),
    ("env-dump", re.compile(r"(?<![\w-])printenv(?![\w-])")),
    ("secret-env-expansion", re.compile(
        r"\$\{?[A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD|PASSWD|PASS|AUTH|PRIVATE|CREDENTIAL)[A-Z0-9_]*\}?")),
    ("process-env-dump", re.compile(r"(?<![\w-])ps\b[^;&|]*\s-?[a-zA-Z]*[eE][a-zA-Z]*ww")),
    ("mobile-live-target", re.compile(
        r"start:prod|start:live|EXPO_PUBLIC_DATA_ENV\s*=\s*['\"]?production|EXPO_PUBLIC_ALLOW_LIVE", re.I)),
    ("store-release", re.compile(r"\beas\s+(?:submit|update)\b|\beas\s+build\b[^;&|]*production")),
    ("vercel-cli", re.compile(SEP + r"(?:npx\s+|pnpm\s+(?:dlx\s+|exec\s+)?|yarn\s+(?:dlx\s+)?|bunx\s+)?vercel(?:\s|$)")),
    ("destructive-sql-script", re.compile(r"delete_all_auth_users|delete_specific_users", re.I)),
    ("credential-store-access", re.compile(
        r"\bsecurity\s+(?:find|dump|export)-|\bgit\s+credential\b|\bgh\s+auth\s+token\b|"
        r"\bgit\s+config\b[^;&|]*credential|\bsupabase\s+login\b[^;&|]*--token")),
]

GIT_PATCH_RE = re.compile(
    r"\bgit\b(?:\s+-C\s+\S+|\s+-c\s+\S+|\s+--no-pager|\s+--git-dir=\S+|\s+--work-tree=\S+)*\s+"
    r"(show|diff|whatchanged|format-patch|log|grep|cat-file|stash\s+show|blame|archive|bundle)\b"
)
GIT_SAFE_FLAGS_RE = re.compile(r"\s--(?:stat|name-only|name-status|numstat|shortstat|summary|oneline|quiet|exit-code)\b")
GIT_LOG_PATCH_RE = re.compile(r"\s(?:-p|-u|--patch|--full-diff|-L\S*|--word-diff\S*)\b")
GIT_ENV_EXCLUDE_RE = re.compile(r"(?::\(exclude\)|:!)[^\s]*env", re.I)
RECURSIVE_GREP_RE = re.compile(r"(?<![\w-])(?:e|f)?grep\b[^;&|]*\s(?:-[a-zA-Z]*[rR][a-zA-Z]*\b|--recursive\b|--dereference-recursive\b)")
RG_NOIGNORE_RE = re.compile(r"(?<![\w-])(?:rg|ag|ack)\b[^;&|]*\s(?:-u+\b|--no-ignore\S*|--hidden\b|--unrestricted\b|-a\b|--all-types\b)")
GREP_ENV_EXCLUDE_RE = re.compile(r"(?:--exclude(?:-dir)?[= ]\S*env|(?:-g|--glob|--iglob)[= ]\s*['\"]?!\S*env)", re.I)


def split_subcommands(cmd):
    return [p for p in re.split(r"\|\||&&|[;|&\n]", cmd) if p.strip()]


def check_git(cmd):
    for part in split_subcommands(cmd):
        m = GIT_PATCH_RE.search(part)
        if not m:
            continue
        sub = m.group(1)
        if sub in ("archive", "bundle"):
            return "git-export"
        if sub == "cat-file":
            if re.search(r"\s-p\b", part):
                return "git-content-without-env-exclusion"
            continue
        if sub == "log" and not GIT_LOG_PATCH_RE.search(part):
            continue
        if sub == "blame":
            continue  # secret paths already caught by path rules
        if GIT_ENV_EXCLUDE_RE.search(part):
            continue
        if sub in ("show", "diff", "whatchanged", "log", "stash show") and GIT_SAFE_FLAGS_RE.search(part) \
                and not GIT_LOG_PATCH_RE.search(part):
            continue
        # `git show <rev>:<path>` of a non-secret path is fine (secret paths caught earlier)
        if sub == "show" and re.search(r"\s[\w./~^-]+:[^\s:]+", part) and not GIT_LOG_PATCH_RE.search(part):
            continue
        return "git-content-without-env-exclusion"
    return None


def evaluate_bash(cmd):
    if not cmd:
        return None
    for label, rx in DANGEROUS_BASH:
        if rx.search(cmd):
            return label
    hits = secret_path_hits(cmd)
    if hits:
        return "secret-path:" + hits[0]
    secret = contains_secret_value(cmd)
    if secret:
        return "secret-literal:" + secret
    git_rule = check_git(cmd)
    if git_rule:
        return git_rule
    if RECURSIVE_GREP_RE.search(cmd) and not GREP_ENV_EXCLUDE_RE.search(cmd):
        return "recursive-grep-without-env-exclusion"
    if RG_NOIGNORE_RE.search(cmd) and not GREP_ENV_EXCLUDE_RE.search(cmd):
        return "unrestricted-search-without-env-exclusion"
    if NETWORK_TOOL_RE.search(cmd):
        hc = host_class(cmd)
        if hc == "prod":
            return "production-host"
        if hc == "demo":
            return "demo-host-network-pending-D2"
    return None


# --------------------------------------------------------------------------------------------
# Tool dispatch
# --------------------------------------------------------------------------------------------

URL_KEYS = re.compile(r"(?:^|_)(?:url|uri|href|link|target|domain|host|endpoint|address)s?$", re.I)
PATH_KEYS = re.compile(r"(?:^|_)(?:path|paths|file|files|file_path|filepath|filename|notebook_path|dir|directory|cwd)$", re.I)


def iter_strings(obj, key=""):
    if isinstance(obj, str):
        yield key, obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            for item in iter_strings(v, str(k)):
                yield item
    elif isinstance(obj, list):
        for v in obj:
            for item in iter_strings(v, key):
                yield item


def evaluate_pre(payload):
    """Return a rule label if the call must be blocked, else None."""
    tool = str(payload.get("tool_name") or "")
    ti = payload.get("tool_input") or {}
    if not isinstance(ti, dict):
        ti = {"value": ti}

    if tool == "Bash":
        return evaluate_bash(str(ti.get("command") or ""))

    if tool in ("Read", "Edit", "Write", "MultiEdit", "NotebookEdit", "NotebookRead"):
        for key in ("file_path", "notebook_path", "path"):
            hits = secret_path_hits(ti.get(key))
            if hits:
                return "secret-path:" + hits[0]
        return None

    if tool in ("Grep", "Glob"):
        for key in ("path", "glob", "pattern" if tool == "Glob" else "glob", "type"):
            hits = secret_path_hits(ti.get(key))
            if hits:
                return "secret-path:" + hits[0]
        return None

    if tool == "WebFetch":
        url = str(ti.get("url") or "")
        if host_class(url) == "prod":
            return "production-host"
        secret = contains_secret_value(url)
        if secret:
            return "secret-literal:" + secret
        return None

    if tool.startswith("mcp__"):
        low = tool.lower()
        if "computer-use" in low or "claude-in-chrome" in low:
            return "mcp-server-denied"
        for key, value in iter_strings(ti):
            if URL_KEYS.search(key) or value.strip().lower().startswith(("http://", "https://")):
                if host_class(value) == "prod":
                    return "production-host"
            if PATH_KEYS.search(key):
                hits = secret_path_hits(value)
                if hits:
                    return "secret-path:" + hits[0]
            if contains_secret_value(value):
                return "secret-literal"
        return None

    return None


MESSAGES = {
    "env-dump": "dumping the process environment can expose credentials",
    "secret-env-expansion": "expanding secret-named environment variables is not allowed",
    "production-host": "production hosts are off-limits for agents (Phase 0 rule)",
    "demo-host-network-pending-D2": "network calls to the demo/replica environment wait for decision D2; use LOCAL",
    "git-content-without-env-exclusion": (
        "git content commands must exclude env files, e.g. append  -- . ':(exclude)**/.env*' ':(exclude).env*'  "
        "or use --stat/--name-only"),
    "recursive-grep-without-env-exclusion": "recursive grep must add --exclude='.env*' (or use the Grep tool)",
    "unrestricted-search-without-env-exclusion": "unrestricted search must add -g '!.env*'",
    "mobile-live-target": "running mobile apps against live data is not allowed for agents",
    "mcp-server-denied": "this MCP server is denied in Tajeer+ repos",
}


def block(rule):
    base = rule.split(":", 1)[0]
    reason = MESSAGES.get(rule) or MESSAGES.get(base) or "matches a Tajeer+ Phase 0 safety rule"
    sys.stderr.write(
        "[tajeer-guard %s] BLOCKED (%s): %s. If this is legitimate work, ask the human; "
        "do not try to work around the guard.\n" % (VERSION, rule, reason)
    )
    sys.exit(2)


# --------------------------------------------------------------------------------------------
# Entry points
# --------------------------------------------------------------------------------------------


def run_pre(payload):
    rule = evaluate_pre(payload)
    if rule:
        block(rule)
    sys.exit(0)


def run_post(payload):
    tool = str(payload.get("tool_name") or "")
    resp = payload.get("tool_response")
    blob = json.dumps(resp, ensure_ascii=False) if not isinstance(resp, str) else resp
    canary = CANARY in (blob or "")
    redacted, count = redact_obj(resp)
    out = {}
    messages = []
    if count:
        key = "updatedMCPToolOutput" if tool.startswith("mcp__") else "updatedToolOutput"
        out["hookSpecificOutput"] = {
            "hookEventName": "PostToolUse",
            key: redacted,
            "additionalContext": (
                "tajeer-guard redacted %d secret-shaped value(s) from this %s output. Do not try to recover, "
                "reconstruct or repeat them; refer to credentials by key name only." % (count, tool)
            ),
        }
        messages.append("tajeer-guard redacted %d secret-shaped value(s) from %s output" % (count, tool))
    if canary:
        messages.append("tajeer-guard: CANARY string visible in %s output (guardrail test evidence)" % tool)
    if messages:
        out["systemMessage"] = "; ".join(messages)
    if out:
        sys.stdout.write(json.dumps(out))
    sys.exit(0)


def run_prompt(payload):
    prompt = str(payload.get("prompt") or "")
    found = contains_secret_value(prompt)
    if not found:
        _, n = redact_text(prompt)
        found = "secret-shaped value" if n else None
    if found:
        sys.stdout.write(json.dumps({
            "systemMessage": "tajeer-guard: your message appears to contain a secret-shaped value (%s). "
                             "Treat it as exposed and rotate it." % found,
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "additionalContext": (
                    "The user's message appears to contain a secret-shaped value. Do not repeat, store, log, "
                    "commit or use it. Refer to it by name only and recommend rotation."
                ),
            },
        }))
    sys.exit(0)


def defer_to_project_copy():
    proj = os.environ.get("CLAUDE_PROJECT_DIR") or ""
    if not proj:
        return False
    candidate = os.path.join(proj, ".claude", "hooks", "tajeer_guard.py")
    try:
        return os.path.isfile(candidate) and os.path.realpath(candidate) != os.path.realpath(__file__)
    except OSError:
        return False


def main(argv):
    mode = argv[1] if len(argv) > 1 else ""
    if "--user" in argv and defer_to_project_copy():
        sys.exit(0)
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
    except Exception:
        if mode == "pre":
            sys.stderr.write("[tajeer-guard] BLOCKED: could not parse hook input (fail closed).\n")
            sys.exit(2)
        sys.exit(0)
    try:
        if mode == "pre":
            run_pre(payload)
        elif mode == "post":
            run_post(payload)
        elif mode == "prompt":
            run_prompt(payload)
        else:
            sys.exit(0)
    except SystemExit:
        raise
    except Exception as exc:  # fail closed for pre, open for the others
        if mode == "pre":
            sys.stderr.write("[tajeer-guard] BLOCKED: internal guard error (%s); fail closed.\n" % type(exc).__name__)
            sys.exit(2)
        sys.exit(0)


if __name__ == "__main__":
    main(sys.argv)
