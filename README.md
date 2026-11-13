# zukunft-fuer-kinder.net

Website of the Schönebeck-Stiftung „Zukunft für Kinder“: a static site
built with Hugo, edited in the browser with Sveltia CMS by people who don't
need to know anything about Hugo, git or HTML.

- **Editors** open `https://www.zukunft-fuer-kinder.net/admin/`, log in
  with their GitHub token, fill in forms, click "Publish". Every publish
  is a commit to this repo.
- **The site** is plain HTML/CSS/images built by Hugo - no server-side
  code, no cookies, no tracking, fonts self-hosted.

Open decisions: deployment (GitHub Actions -> GitHub Pages), repo owner
(personal account vs. an organisation for the foundation), the domain.

## Editing (CMS)
Sveltia CMS, configured in `static/admin/config.yml`:
- **Startseite**: start page texts/photos and the **Website-Einstellungen**
  (colour palette, fonts, logo, menu, contact, bank account).
- **Projekte**: one entry per project; new ones appear in the timeline on
  `/projekte.html` automatically, sorted by date. Reports (PDF) are added
  in the project's "Berichte und Downloads" list.
- **Weitere Seiten**, **Nepal-Besuch 2016 (Unterseiten)**, **English pages**.

Login: "Sign in with token" - one fine-grained GitHub token per editor,
limited to this repository, permission "Contents: Read and write". No
OAuth app, so no server-side login helper. Tokens expire; renew them in
time.

Photos are shrunk to WebP in the browser before upload; Hugo creates the
sizes the pages need. PDFs are published as uploaded.

## Customization (level 1)
Editors change the look only through the settings form, never free CSS:
- `data/settings.yaml` - chosen palette and fonts, logo, menu, contact,
  bank account.
- `data/palettes.yaml` - the tested colour palettes (contrast checked).
- `data/fonts.yaml` - the font choices, self-hosted in `static/fonts/`.

A new palette or font goes into those files *and* into the select options
in `static/admin/config.yml`.

The CMS rewrites the files it saves: comments in `data/settings.yaml` are
dropped, long texts end up on one line, empty optional fields appear
(`image: ''`, `build: null`). Hugo handles all of that; keep explanations
here, not as comments in content or data files.

`data/settings.yaml` keys: `palette` (key from `palettes.yaml`),
`heading_font`/`body_font` (keys from `fonts.yaml`), `logo` (image path,
empty = text logo), `site_name`, `site_name_small`, `menu` (label + url),
`donate_button`, `contact`, `bank`, `footer_note`.

## Working on the site
Open this folder in its devcontainer (`.devcontainer/`: Hugo, Python,
ImageMagick, cwebp, Ghostscript):

    hugo server --bind 0.0.0.0 --port 1314   # http://localhost:1314, CMS at /admin/
    hugo --gc --minify && python3 tools/check_links.py public

In the preview the CMS can "Work with Local Repository" (Chrome/Edge): it
edits the files in this folder directly instead of committing.

### When the preview needs a restart
`hugo server` normally rebuilds by itself when files change - content,
data, layouts, CSS and `hugo.toml` edited in an editor (tested
2026-11-12). Restart it (Ctrl+C, start again; `docker restart <name>` if
it runs in its own container):
- **after saving in the CMS in local mode** - the browser replaces the
  file (new inode, permissions `600`), and the preview usually misses
  that. Reproducible, cause not pinned down further.
- **whenever the preview shows something older than the files** - it
  also once stopped noticing any change at all until restarted.

Not an issue on the published site: every publish there is a fresh build.
To check a state independently of the preview:
`hugo --gc --minify && python3 tools/check_links.py public`.

CMS uploads: photos -> `assets/images/` (converted to WebP, at most
2400 px), PDFs -> `static/downloads/`. Stock photo services are switched
off on purpose (licensing); new file names are plain ASCII.

## Structure
- `content/` - one Markdown file per page; all page texts and photos are
  front matter fields or Markdown, editable in the CMS.
  - `_index.md` - start page.
  - `projekte/` - projects. `date` orders the timeline; `downloads` lists
    the reports; entries with `build.render: never` appear in the timeline
    without a page of their own. `_index.md` is the overview's intro.
  - `reise-2016/` - subpages of the 2016 trip report.
  - `english/` - English pages.
- URLs: every page is `/<file name>.html`, also for pages in subfolders
  (`[permalinks.page]` in `hugo.toml`). Published URLs must keep working:
  when a page moves or is removed, add an alias.
- Links: content, `data/settings.yaml` and the CMS write site paths
  (`/projekte.html`, `/downloads/x.pdf`); templates print every URL through
  `partial "site-url.html"` (or a resource's `.RelPermalink`), never as
  `href="/..."`, so the site also works below a path such as
  `https://ne-o.github.io/zukunft-fuer-kinder/`. Check a subpath build with
  `hugo -b https://ne-o.github.io/zukunft-fuer-kinder/ && python3
  tools/check_links.py --base /zukunft-fuer-kinder/ public`.
- Per-page structure (layout, URL, aliases, language) lives in
  `[[cascade]]` entries in `hugo.toml`, not in front matter, so saving a
  page in the CMS can't drop it.
- `layouts/` - the theme (Hugo >= 0.146 layout structure):
  - `home.html`, `page.html`, `kontakt.html`, `spenden.html`,
    `projekte/section.html` (overview + timeline), `projekte/page.html`.
  - `_markup/render-image.html` - Markdown images from `assets/` become
    responsive WebP; several images in one paragraph form a gallery. Each
    image links to its full size; `assets/js/lightbox.js` (loaded only on
    pages with such images) opens it in a lightbox: back/forward through
    all images of the page, arrow keys, swipe, Esc. Picks the smallest
    WebP that covers the screen, never upscales. Start page images are not
    zoomable.
  - `_markup/render-link.html` - links to PDFs get an icon and their size.
- `assets/css/main.css` - uses only the CSS variables from the settings.
- `assets/images/` - photos (CMS uploads land here).
- `static/downloads/` - PDF reports (CMS uploads land here).
- `tools/check_links.py` - after a build: no broken internal link, image
  or PDF; optionally compares against the published sitemap.
