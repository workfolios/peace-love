from __future__ import annotations

import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
APP = REPO / ".source/peace-love-app-source"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


def replace_between(
    text: str,
    start_marker: str,
    end_marker: str,
    replacement: str,
    label: str,
    *,
    include_end: bool = False,
    search_from: int = 0,
) -> str:
    start = text.find(start_marker, search_from)
    if start < 0:
        raise RuntimeError(f"{label}: start marker not found")
    end = text.find(end_marker, start + len(start_marker))
    if end < 0:
        raise RuntimeError(f"{label}: end marker not found")
    if include_end:
        end += len(end_marker)
    return text[:start] + replacement + text[end:]


def update_package_manifest() -> None:
    path = APP / "package.json"
    package = json.loads(path.read_text())
    package["engines"] = {"node": "22.x", "npm": "10.x"}
    package["packageManager"] = "npm@10.9.2"
    path.write_text(json.dumps(package, indent=2) + "\n")


def update_request_view() -> None:
    path = APP / "src/components/RequestView.tsx"
    text = path.read_text()

    text = replace_once(
        text,
        "  const [submitted, setSubmitted] = useState(false);\n  const [showInquiryLog, setShowInquiryLog] = useState(false);",
        "  const [submitted, setSubmitted] = useState(false);\n  const [showInquiryLog, setShowInquiryLog] = useState(false);\n  const [submitting, setSubmitting] = useState(false);\n  const [submitError, setSubmitError] = useState<string | null>(null);",
        "RequestView submission state",
    )

    submit_handler = '''  // Handle Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !phone || !email || !travelDates || !neighborhood) {
      alert('Please fill out all required basic contact fields (Name, Phone, Email, Dates, and Neighborhood) to proceed.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const requestPayload = {
      _subject: 'New Peace Love Home + Pet Watch inquiry',
      name,
      phone,
      email,
      serviceNeeded,
      travelDates,
      frequencyNeeded,
      neighborhood,
      clientType,
      petsInvolved: serviceNeeded === 'Pet Care Only' || serviceNeeded === 'Both House Watch And Pet Care' ? 'Yes' : petsInvolved,
      petsDescription: serviceNeeded === 'House Watch Only' ? '' : petsDescription,
      specialHomeInstructions: serviceNeeded === 'Pet Care Only' ? '' : specialHomeInstructions,
      specialPetInstructions: serviceNeeded === 'House Watch Only' ? '' : specialPetInstructions,
      emergencyContact,
      preferredUpdateMethod,
      additionalNotes
    };

    try {
      const response = await fetch('https://formspree.io/f/mqervbwa', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        let errorMessage = 'Your request could not be delivered. Please review your details and try again.';
        try {
          const result = await response.json() as {
            error?: string;
            errors?: Array<{ message?: string }>;
          };
          const providerMessage = result.errors
            ?.map((item) => item.message)
            .filter(Boolean)
            .join(' ');
          if (providerMessage) errorMessage = providerMessage;
          else if (result.error) errorMessage = result.error;
        } catch {
          // Preserve the safe fallback when Formspree does not return JSON.
        }
        throw new Error(errorMessage);
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Formspree submission failed', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Your request could not be delivered. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

'''
    text = replace_between(
        text,
        "  // Handle Submit\n",
        "  const resetForm = () => {",
        submit_handler,
        "RequestView submit handler",
    )

    text = replace_once(
        text,
        "    setAdditionalNotes('');\n    setSubmitted(false);",
        "    setAdditionalNotes('');\n    setSubmitError(null);\n    setSubmitting(false);\n    setSubmitted(false);",
        "RequestView reset state",
    )

    text = replace_once(
        text,
        "Staging this booking automatically flags it for Jamie's immediate attention.",
        "This care detail will be included in your request for Jamie's review.",
        "RequestView critical-care accuracy copy",
    )

    submit_section = text.index('id="submit-action-div"')
    controls_start_marker = '              <div className="flex items-center justify-end">\n                <button\n                  type="submit"\n                  id="submit-form-button"'
    controls_start = text.find(controls_start_marker, submit_section)
    if controls_start < 0:
        raise RuntimeError("RequestView submit controls: opening marker not found")
    controls_end_marker = "              </div>\n            </div>\n\n          </form>"
    controls_end = text.find(controls_end_marker, controls_start)
    if controls_end < 0:
        raise RuntimeError("RequestView submit controls: closing marker not found")

    controls = '''              {submitError && (
                <div
                  id="form-submission-error"
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold leading-relaxed text-red-800"
                >
                  {submitError}
                </div>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  id="submit-form-button"
                  disabled={submitting}
                  aria-busy={submitting}
                  className={`w-full sm:w-auto px-8 py-3.5 bg-[#100720] hover:bg-brand-plum-hover text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md border-0 flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70 disabled:hover:bg-[#100720] ${submitting ? 'cursor-wait' : 'cursor-pointer'}`}
                >
                  <ClipboardCheck className="w-4 h-4 text-white" />
                  <span>{submitting ? 'Sending Your Request...' : 'Save Your Vacation Block'}</span>
                </button>
              </div>
'''
    text = text[:controls_start] + controls + text[controls_end:]
    path.write_text(text)


def update_home_view() -> None:
    path = APP / "src/components/HomeView.tsx"
    text = path.read_text()
    text = replace_once(
        text,
        "Your public testimonial has been submitted. Because we respect local reputation, submissions go to Jamie Giedd for approval before spotlighting.",
        "Your testimonial has been saved in this browser as a website demonstration. It was not transmitted to Jamie Giedd or added to a shared approval queue.",
        "HomeView testimonial accuracy copy",
    )
    path.write_text(text)


def update_header() -> None:
    path = APP / "src/components/Header.tsx"
    text = path.read_text()

    text = replace_once(
        text,
        "import { useState, useEffect } from 'react';",
        "import { useState, useEffect, useRef } from 'react';",
        "Header React import",
    )
    text = replace_once(
        text,
        "  const [availabilityOpen, setAvailabilityOpen] = useState(false);\n  const [startDate, setStartDate] = useState<number | null>(null);",
        "  const [availabilityOpen, setAvailabilityOpen] = useState(false);\n  const availabilityTriggerRef = useRef<HTMLButtonElement | null>(null);\n  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);\n  const [startDate, setStartDate] = useState<number | null>(null);",
        "Header focus refs",
    )

    existing_event_effect = '''  // Handle triggered custom event from Footer or other widgets
  useEffect(() => {
    const handleOpenAvailability = () => {
      setAvailabilityOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('open-availability-check', handleOpenAvailability);
    return () => {
      window.removeEventListener('open-availability-check', handleOpenAvailability);
    };
  }, []);
'''
    accessible_effects = '''  // Handle triggered custom event from Footer or other widgets
  useEffect(() => {
    const handleOpenAvailability = () => {
      availabilityTriggerRef.current = null;
      setAvailabilityOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('open-availability-check', handleOpenAvailability);
    return () => {
      window.removeEventListener('open-availability-check', handleOpenAvailability);
    };
  }, []);

  useEffect(() => {
    if (!availabilityOpen && !mobileMenuOpen) return;

    const handleExpandedNavigationKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (availabilityOpen) {
        const returnFocusTarget = availabilityTriggerRef.current;
        setAvailabilityOpen(false);
        window.requestAnimationFrame(() => returnFocusTarget?.focus());
        return;
      }

      setMobileMenuOpen(false);
      window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
    };

    document.addEventListener('keydown', handleExpandedNavigationKeyDown);
    return () => document.removeEventListener('keydown', handleExpandedNavigationKeyDown);
  }, [availabilityOpen, mobileMenuOpen]);
'''
    text = replace_once(
        text,
        existing_event_effect,
        accessible_effects,
        "Header Escape and focus-return behavior",
    )

    text = replace_once(
        text,
        '''          <div 
            onClick={() => handleNavClickWithClose('home')} 
            className="flex flex-col cursor-pointer group select-none pr-4"
          >''',
        '''          <button
            type="button"
            onClick={() => handleNavClickWithClose('home')}
            className="flex flex-col cursor-pointer group select-none pr-4 p-0 bg-transparent border-0 text-left"
            aria-label="Go to Peace Love Home + Pet Watch home page"
          >''',
        "Header semantic home control opening tag",
    )
    text = replace_once(
        text,
        '''          </div>

          {/* Desktop Navigation */}''',
        '''          </button>

          {/* Desktop Navigation */}''',
        "Header semantic home control closing tag",
    )

    text = replace_once(
        text,
        '''            <button
              id="header-check-availability-btn"
              onClick={() => setAvailabilityOpen(!availabilityOpen)}''',
        '''            <button
              id="header-check-availability-btn"
              onClick={(event) => {
                availabilityTriggerRef.current = event.currentTarget;
                setAvailabilityOpen(!availabilityOpen);
              }}
              aria-expanded={availabilityOpen}
              aria-controls="reservation-availability-dropdown"''',
        "Header desktop availability semantics",
    )
    text = replace_once(
        text,
        '''            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}''',
        '''            <button
              ref={mobileMenuButtonRef}
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"''',
        "Header mobile menu semantics",
    )
    text = replace_once(
        text,
        '''        <div 
          id="reservation-availability-dropdown"
          className="absolute''',
        '''        <div
          id="reservation-availability-dropdown"
          role="region"
          aria-label="Reservation availability calendar"
          className="absolute''',
        "Header availability panel semantics",
    )
    text = replace_once(
        text,
        '''            <button
              id="mobile-nav-check-availability"
              onClick={() => {
                setAvailabilityOpen(!availabilityOpen);
                setMobileMenuOpen(false);
              }}''',
        '''            <button
              id="mobile-nav-check-availability"
              onClick={(event) => {
                availabilityTriggerRef.current = event.currentTarget;
                setAvailabilityOpen(!availabilityOpen);
                setMobileMenuOpen(false);
              }}
              aria-expanded={availabilityOpen}
              aria-controls="reservation-availability-dropdown"''',
        "Header mobile availability semantics",
    )

    path.write_text(text)


def update_seo() -> None:
    path = APP / "index.html"
    text = path.read_text()
    seo = '''    <meta name="robots" content="index,follow,max-image-preview:large" />
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "name": "Peace Love Home + Pet Watch",
            "url": "https://workfolios.github.io/peace-love/",
            "description": "Peace Love Home + Pet Watch provides thoughtful House Watch and Pet Care support for Rapid City and the Black Hills."
          },
          {
            "@type": "Organization",
            "name": "Peace Love Home + Pet Watch",
            "url": "https://workfolios.github.io/peace-love/"
          }
        ]
      }
    </script>
    <link rel="sitemap" type="application/xml" href="https://workfolios.github.io/peace-love/sitemap.xml" />
'''
    text = replace_once(
        text,
        '    <link rel="canonical" href="https://workfolios.github.io/peace-love/" />',
        seo + '    <link rel="canonical" href="https://workfolios.github.io/peace-love/" />',
        "index.html SEO discovery metadata",
    )
    path.write_text(text)

    public = APP / "public"
    public.mkdir(parents=True, exist_ok=True)
    (public / "robots.txt").write_text(
        "User-agent: *\n"
        "Allow: /peace-love/\n\n"
        "Sitemap: https://workfolios.github.io/peace-love/sitemap.xml\n"
    )
    (public / "sitemap.xml").write_text(
        '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://workfolios.github.io/peace-love/</loc>
    <lastmod>2026-08-01</lastmod>
  </url>
</urlset>
'''
    )


def update_gitignore() -> None:
    (REPO / ".gitignore").write_text(
        '''node_modules/
dist/
*.log
npm-debug.log*
.env
.env.*
!.env.example
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
'''
    )


def update_workflows() -> None:
    deploy = '''name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    defaults:
      run:
        working-directory: .source/peace-love-app-source
    steps:
      - name: Checkout
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7

      - name: Restore and verify social preview
        run: python scripts/restore_social_preview.py

      - name: Verify exact Google AI Studio source
        run: |
          test -f package.json
          test -f package-lock.json
          test -f src/App.tsx
          test -f src/components/HomeView.tsx
          test -f src/components/AdminView.tsx
          test -f src/components/ClientPortalView.tsx
          test -f src/components/AssociatePortalView.tsx
          test -f public/assets/images/og-preview-hero-v6.png
          test -f public/robots.txt
          test -f public/sitemap.xml

      - name: Setup Node.js
        uses: actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38 # v6
        with:
          node-version: 22.16.0
          package-manager-cache: false

      - name: Install dependencies
        run: npm ci --no-audit --no-fund

      - name: Audit production dependency graph
        run: npm audit --audit-level=high

      - name: Validate TypeScript
        run: npm run lint

      - name: Build application
        run: npm run build

      - name: Configure GitHub Pages
        uses: actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d # v6

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5
        with:
          path: ./.source/peace-love-app-source/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    permissions:
      pages: write
      id-token: write
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128 # v5

  report:
    name: Report deployment status
    runs-on: ubuntu-latest
    if: always()
    needs:
      - build
      - deploy
    permissions:
      statuses: write
    steps:
      - name: Publish commit status
        env:
          GH_TOKEN: ${{ github.token }}
          BUILD_RESULT: ${{ needs.build.result }}
          DEPLOY_RESULT: ${{ needs.deploy.result }}
        run: |
          if [ "$BUILD_RESULT" = "success" ] && [ "$DEPLOY_RESULT" = "success" ]; then
            STATE="success"
            DESCRIPTION="GitHub Pages deployment completed"
          else
            STATE="failure"
            DESCRIPTION="GitHub Pages deployment failed"
          fi

          gh api \
            --method POST \
            -H "Accept: application/vnd.github+json" \
            "/repos/${GITHUB_REPOSITORY}/statuses/${GITHUB_SHA}" \
            -f state="$STATE" \
            -f context="pages/deploy" \
            -f description="$DESCRIPTION" \
            -f target_url="https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
'''

    validate = '''name: Validate Exact Mirror

on:
  pull_request:
    branches:
      - main
  workflow_dispatch:

jobs:
  validate:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    defaults:
      run:
        working-directory: .source/peace-love-app-source
    steps:
      - name: Checkout
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7

      - name: Restore and verify social preview
        run: python scripts/restore_social_preview.py

      - name: Verify exact Google AI Studio source
        run: |
          test -f package.json
          test -f package-lock.json
          test -f src/App.tsx
          test -f src/components/HomeView.tsx
          test -f src/components/AdminView.tsx
          test -f src/components/ClientPortalView.tsx
          test -f src/components/AssociatePortalView.tsx
          test -f public/assets/images/og-preview-hero-v6.png
          test -f public/robots.txt
          test -f public/sitemap.xml

      - name: Setup Node.js
        uses: actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38 # v6
        with:
          node-version: 22.16.0
          package-manager-cache: false

      - name: Install dependencies
        run: npm ci --no-audit --no-fund

      - name: Audit dependency graph
        run: npm audit --audit-level=high

      - name: Validate TypeScript
        run: npm run lint

      - name: Build application
        run: npm run build
'''

    (REPO / ".github/workflows/deploy.yml").write_text(deploy)
    (REPO / ".github/workflows/validate.yml").write_text(validate)


def main() -> None:
    update_package_manifest()
    update_request_view()
    update_home_view()
    update_header()
    update_seo()
    update_gitignore()
    update_workflows()


if __name__ == "__main__":
    main()
