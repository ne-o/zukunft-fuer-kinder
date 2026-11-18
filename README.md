# zukunft-fuer-kinder.net

Website of the Schönebeck-Stiftung „Zukunft für Kinder“: a static site
built with Hugo, edited in the browser with Sveltia CMS by people who don't
need to know anything about Hugo, git or HTML.

- **Editors** open `https://www.zukunft-fuer-kinder.net/admin/`, log in
  with their GitHub token, fill in forms, click "Save". Every save is a
  commit to this repo. Guide for editors (with screenshots):
  [German](docs/anleitung-redaktion.md), [English](docs/editor-guide.md).
- **The site** is plain HTML/CSS/images built by Hugo - no server-side
  code, no cookies, no tracking, fonts self-hosted.

Published with GitHub Actions on GitHub Pages ("Publishing" below), for
now at `https://ne-o.github.io/zukunft-fuer-kinder/` until the domain moves.
**Setting up a computer to work on the site: [DEVELOPMENT.md](DEVELOPMENT.md).**

## Editing (CMS)
Sveltia CMS, configured in `static/admin/config.yml`:
- **Startseite**: start page texts/photos and the **Website-Einstellungen**
  (colour palette, fonts, logo, menu, contact, bank account).
- **Projekte**: one entry per project; new ones appear in the timeline on
  `/projekte.html` automatically, sorted by date. Reports (PDF) are added
  in the project's "Berichte und Downloads" list.
- **Aktuelles (Beiträge)**, **Weitere Seiten**, **Nepal-Besuch 2016
  (Unterseiten)**.
- **English pages**: the English versions of the main pages, with the same
  fields as the German ones.

Login: "Sign in with token" - each editor is a collaborator on this repo
and uses their own **classic** GitHub token: fine-grained tokens can't be
used for someone else's personal repository. Scope `public_repo` should be
enough for a public repository (narrower than `repo`; to be confirmed with
the first editor), always with an expiry date - renew in time. No OAuth
app, so no server-side login helper; `auth_methods: [token]` in the CMS
config hides the "Sign In with GitHub" button.

Photos are shrunk to WebP in the browser before upload; Hugo creates the
sizes the pages need. PDFs are published as uploaded.

## Customization (level 1)
Editors change the look only through the settings form, never free CSS:
- `data/settings.yaml` - chosen palette and fonts, logo, menu, contact,
  bank account.
- `data/palettes.yaml` - the tested colour palettes (contrast checked).
  Optional `cta`/`cta_dark`/`on_cta`: donate buttons and the small
  uppercase line above titles (default: the primary colours).
- `data/fonts.yaml` `heading_weight` (optional, default 800): weight of
  headings in that font - serif fonts look better lighter (Fraunces: 600).
- `data/fonts.yaml` - the font choices, self-hosted in `static/fonts/`.

A new palette or font goes into those files *and* into the select options
in `static/admin/config.yml`.

The CMS rewrites the files it saves: comments in `data/settings.yaml` are
dropped, long texts end up on one line, empty optional fields appear
(`image: ''`, `build: null`). Hugo handles all of that; keep explanations
here, not as comments in content or data files.

`data/settings.yaml` keys: `palette` (key from `palettes.yaml`),
`heading_font`/`body_font` (keys from `fonts.yaml`), `logo` (image path,
empty = text logo; with a logo the name isn't printed next to it, so the
logo should contain it), `logo_light` (variant for the dark footer,
empty = name as text), `site_name`, `site_name_small`, `menu` (label + url),
`donate_button`, `contact`, `bank`, `costs`, `footer_note`.

Favicons (`static/favicon.ico` 16/32/48 px, `icon-192.png`, `icon-512.png`,
`apple-touch-icon.png` 180 px on the palette's background `#fbf7f0`; linked
in `baseof.html`) are the logo's emblem without the lettering. They don't
follow a logo change in the CMS - recreate them from the new logo (the
emblem is the part left of the lettering; crop, trim, pad to a square):

    convert assets/images/logo-zukunft-fuer-kinder.png -crop 310x360+0+0 +repage -trim +repage cut.png
    d=$(identify -format '%[fx:round(max(w,h)*1.04)]' cut.png)
    convert cut.png -background none -gravity center -extent ${d}x${d} emblem.png
    convert emblem.png -resize 512x512 static/icon-512.png
    convert emblem.png -resize 192x192 static/icon-192.png
    convert emblem.png -resize 156x156 -background '#fbf7f0' -gravity center -extent 180x180 -alpha remove static/apple-touch-icon.png
    convert emblem.png \( -clone 0 -resize 16x16 \) \( -clone 0 -resize 32x32 \) \( -clone 0 -resize 48x48 \) -delete 0 static/favicon.ico

`costs` (box "Unsere Kosten" on `/ihre-hilfe.html`, `_partials/costs.html`):
`fixed_per_year` (euros, a number), `fee_percent` (a number - the
"Bei 100 € Spende …" example is calculated from it), `text`. Both numbers
empty: no box.

## Working on the site
Open this folder in its devcontainer (`.devcontainer/`: Hugo, Python,
ImageMagick, cwebp, Ghostscript) - from scratch, incl. installing Docker
and VS Code: [DEVELOPMENT.md](DEVELOPMENT.md). Without installing
anything, in the browser: [GitHub Codespaces](docs/codespaces.md).

    preview   # hugo server on :1314 (http://localhost:1314, CMS at /admin/), right options in Codespaces too
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

## Publishing (GitHub Pages)
`.github/workflows/pages.yml` builds and publishes on every push to `main`
- saving in the CMS is a commit, so edits go live a minute or two later.
Run it by hand: Actions -> Pages -> Run workflow.
- **Address:** comes from the repo's Pages settings, passed to Hugo as
  `--baseURL` - `https://ne-o.github.io/zukunft-fuer-kinder/` until a
  custom domain is set there. Every other address than
  `params.production_url` (`hugo.toml`) gets `noindex`, so the test
  address stays out of search engines.
- **Hugo version:** `.hugo-version` is the source; CI fails if
  `.devcontainer/Dockerfile` (`ARG HUGO_VERSION`) differs - bump both.
- **Checks before deploying** (`tools/check_links.py`): a broken link
  inside a page stops the deployment (the run fails, GitHub emails whoever
  made the commit; the site stays as it was). Published URLs that are gone
  - compared with the sitemap online right now - only warn (annotation in
  the run): an editor may delete a page on purpose. To keep such a URL
  working, add an alias in `hugo.toml`. Redirect-only URLs (aliases) aren't
  in the sitemap, so they aren't covered - don't remove an alias.
- Resized photos (`resources/_gen`) are cached between runs.

## Structure
- `content/` - one Markdown file per page; all page texts and photos are
  front matter fields or Markdown, editable in the CMS.
  - `_index.md` - start page.
  - `projekte/` - projects. `date` orders the timeline; `downloads` lists
    the reports; entries with `build.render: never` appear in the timeline
    without a page of their own. `current: true` (CMS checkbox "Aktuelles
    Projekt") features the project on the start page, the overview and the
    donation page (`_partials/current-project.html`; several marked: the
    newest wins, none: no feature). `_index.md` is the overview's intro.
  - `aktuelles/` - news posts (`category`, `lead` = card text, optional
    `image`, `project` = slug of a project the proceeds went to). Listed
    as cards on `/fundraising.html` (the "Aktuelles" page, layout
    `aktuelles-seite.html`: front matter `events` = upcoming events, then
    the cards, then the page text with the older news); each post has its
    own page (`aktuelles/page.html`). The section has no list page.
  - `reise-2016/` - subpages of the 2016 trip report.
- Languages: German at the root, English below `/en/` (Hugo multilingual,
  `[languages]` in `hugo.toml`). An English page is the German file with
  `.en` before `.md` (`wir.md` -> `wir.en.md`); Hugo pairs them, so the
  `Deutsch | English` switch (`_partials/lang-switch.html`) goes to the
  matching page, or to the other language's start page. English addresses
  (`/en/about-us.html` etc.) are set by `[[cascade]]` entries with
  `sites.matrix` (a `url` isn't prefixed with `/en/` automatically).
  Translated: start page, Über uns, So können Sie helfen, Kontakt, Vision,
  project overview intro, Aktuelles (`/en/news.html`), Impressum,
  Datenschutz, and the projects. The 2016 trip exists in German only.
  - **English is optional, German is the fallback.** Projects and news
    posts: the English file (`x.en.md`) holds only the translated fields
    (title, text; posts also `lead`, `image_alt`) - date, country, photo,
    downloads, category, project link stay in the German file and the
    templates read them there (`_partials/de-page.html`). Every German
    project and post is also built for `/en/` (cascade with
    `sites.matrix` in `hugo.toml`, targeting the German files only), so
    each has an English page and the language switch never lands
    elsewhere; an English file replaces that page. Such a page, or an
    English file without text, shows the German text with a note
    (`_partials/translated-content.html`) and names the German page as
    canonical; `_partials/is-german-file.html` / `is-fallback.html` tell
    these cases apart, German titles are marked `lang="de"`. Lists (project
    timeline, news cards, current project, a post's project box) start from
    the German pages and take the page in the current language
    (`_partials/in-lang.html`, looked up by path - pages with
    `build.render: never` aren't in `.Translations`). On the Aktuelles
    page, empty English `events` or page text fall back to the German ones.
    Country names and news categories are translated in `i18n/en.yaml`
    (`country_<German name>`, `category_<German name, spaces as _>`).
  - CMS: projects and news posts use Sveltia's i18n (`i18n:` at the top of
    `static/admin/config.yml`, `multiple_files` with
    `omit_default_locale_from_file_path`, so the files are `x.md` +
    `x.en.md`); new entries start German only (`initial_locales`), fields
    with `i18n: true` are translated, `build` is duplicated. The main
    pages are separate entries under "English pages".
  - Template texts: `i18n/de.yaml`, `i18n/en.yaml` (`T "key"`); the
    lightbox gets its labels from data attributes on its script tag, the
    copy buttons from `data-copied`.
  - Settings with an English counterpart: `menu_en`, `donate_button_en`,
    `footer_note_en`, `bank.note_en`, `costs.text_en`.
  - `_partials/page-url.html` - a page's URL in the current language,
    else the German one (footer, 404, buttons).
  - Old English addresses (`/home-engl.html`, `/wir-engl.html`,
    `/projekte-engl.html`, `/unsere-vision-engl.html`) forward via small
    HTML files in `static/` (relative targets, so they work below a path
    too); Hugo aliases on English pages would land below `/en/`.
  - The sitemap is an index (`/sitemap.xml` -> `/de/sitemap.xml`,
    `/en/sitemap.xml`); `tools/check_links.py` follows such an index.
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
- Email addresses never appear with "@" in the HTML (against address
  harvesters): `_partials/email.html` writes "kontakt (at) …" with the two
  halves in data attributes, `assets/js/email.js` (on every page) turns it
  into a `mailto:` link. The footer and Kontakt page use the partial; email
  links in Markdown - `[x](mailto:…)`, `<…@…>` or a plain typed address -
  go through `_markup/render-link.html`, so editors write them normally.
- `layouts/` - the theme (Hugo >= 0.146 layout structure):
  - `home.html`, `page.html`, `kontakt.html`, `spenden.html`,
    `projekte/section.html` (overview + timeline), `projekte/page.html`,
    `ueber-uns.html` (`/wir.html`: `sections` = text with an optional photo
    beside it, `tone: band` for a coloured background, `anchor` = id
    for links like `/wir.html#in-erinnerung-an-herbert-schoenebeck`).
  - `spenden.html` (`/ihre-hilfe.html`): bank account with copy buttons
    (`assets/js/copy.js`, hidden where the browser can't copy; IBAN copied
    without spaces), current project, `steps`, costs, `receipt` as a
    foldable `<details>` section, `active` tiles (optional
    `link_label`/`link_url`) - all front matter.
  - Pages may set `kicker` and `headline` (big heading instead of the title).
  - Start page `help`: tiles with an icon (`_partials/icon.html`: heart,
    gift, people), then the donate and contact buttons.
  - Header: the donate button sits outside the collapsible menu, so it
    stays visible (right-most) on narrow screens.
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
