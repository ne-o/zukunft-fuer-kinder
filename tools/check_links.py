"""Check a Hugo build for broken links.

    python3 tools/check_links.py [--base /path/] public [published-sitemap.xml]

1. Every internal href/src/srcset in the built pages resolves to a file.
   --base: the path the build is served under (baseURL's path, e.g.
   /zukunft-fuer-kinder/ on github.io). Links must stay below it - a
   root-absolute "/x.html" exists in public/ but would 404 there.
2. Optional: every URL in a sitemap.xml of the published site (e.g. the
   live one, fetched before deploying) still exists in the new build -
   published addresses must never break; add an alias in hugo.toml when a
   page moves or is removed. Checked relative to the build's root,
   independent of --base.
Exit code 1 if anything is broken."""
import os, re, sys, urllib.parse
from html.parser import HTMLParser

args = sys.argv[1:]
prefix = "/"
if args[:1] == ["--base"]:
    prefix = "/" + args[1].strip("/") + "/" if args[1].strip("/") else "/"
    args = args[2:]
root = args[0]
class P(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []
    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if k in ("href", "src") and v:
                self.refs.append(v)
            if k == "srcset" and v:
                self.refs += [s.strip().split(" ")[0] for s in v.split(",")]

def exists(url):
    path = urllib.parse.unquote(urllib.parse.urlparse(url).path)
    f = os.path.join(root, path.lstrip("/"))
    return os.path.isfile(f) or os.path.isfile(os.path.join(f, "index.html"))

bad, pages = 0, 0
for d, _, files in os.walk(root):
    for fn in files:
        if not fn.endswith(".html") or d.startswith(os.path.join(root, "admin")):
            continue
        pages += 1
        p = P(); p.feed(open(os.path.join(d, fn), encoding="utf-8").read())
        for r in p.refs:
            if re.match(r"^(https?:|mailto:|#|data:|tel:)", r):
                continue
            base = prefix + os.path.relpath(os.path.join(d, fn), root)
            url = urllib.parse.urlparse(urllib.parse.urljoin(base, r)).path
            if not (url + "/").startswith(prefix) or not exists(url[len(prefix) - 1:]):
                bad += 1; print(f"BROKEN {base}: {r}")
print(f"{pages} pages checked, {bad} broken internal references")
if len(args) > 1:
    olds = re.findall(r"<loc>https?://[^/]+(/[^<]*)</loc>", open(args[1]).read())
    missing = [u for u in olds if not exists(u)]
    print(f"published URLs: {len(olds)}, missing: {len(missing)}", *missing, sep="\n  ")
    bad += len(missing)
sys.exit(1 if bad else 0)
