import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — synopsys.com chrome: utility bar (Synopsys | Ansys, language, Ask) above a
 * transparent nav that floats over the hero and turns frosted (`.overlapping`) once the
 * page is scrolled past 80px (threshold lifted from synopsys-headlibs.js).
 *
 * /nav sections (template-slotted, EW1): 1 brand link · 2 nav item list · 3 tools
 * (search icon, Contact Sales CTA) · 4 utility bar (logos, language, Ask).
 * @ew-exempt none — every authored node is moved, never rebuilt.
 */

// media query match that indicates mobile/tablet width (synopsys collapses the nav < 1130)
const isDesktop = window.matchMedia('(min-width: 1130px)');
const OVERLAP_AT = 80;
const UTILITY_HEIGHT = 53;

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget) && !isDesktop.matches) {
    const navSections = nav.querySelector('.nav-sections');
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, navSections, false);
  }
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/** scroll-state chrome: nav sticks under the utility bar, frosted past OVERLAP_AT */
function trackScroll(header, nav) {
  const sync = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle('overlapping', y > OVERLAP_AT);
    const util = header.querySelector('.utility-bar');
    const top = util && isDesktop.matches ? Math.max(0, UTILITY_HEIGHT - y) : 0;
    header.style.setProperty('--nav-top', `${top}px`);
  };
  window.addEventListener('scroll', sync, { passive: true });
  isDesktop.addEventListener('change', sync);
  sync();
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  const sections = [...fragment.children];
  const [brand, links, tools, utility] = sections;

  if (brand) {
    brand.className = 'nav-brand';
    nav.append(brand);
  }
  if (links) {
    links.className = 'nav-sections';
    nav.append(links);
  }
  if (tools) {
    tools.className = 'nav-tools';
    nav.append(tools);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, links));
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, links, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, links, isDesktop.matches));

  if (utility) {
    utility.className = 'utility-bar';
    block.append(utility);
  }
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  trackScroll(block, nav);
}
