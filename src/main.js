import { createApp, computed, watch, onUnmounted, ref } from 'vue/dist/vue.esm-bundler.js';
import { resolveEntryId, relatedTerms, domains, plannedTopics, terms } from './terms.js';
import { guides } from './guides.js';
import modelIndex from './model-atlas/index.json' with { type: 'json' };
import './style.css';

const withdrawnEntries = new Set([
  'commerce/distribution-agreement', 'commerce/channel-allocation',
  'commerce/proof-of-delivery', 'commerce/promotion-funding'
]);
const isolationAnomalies = ['dirty-read', 'non-repeatable-read', 'phantom-read'];
const isolationLevels = [
  { id: 'read-uncommitted', allowed: [true, true, true] },
  { id: 'read-committed', allowed: [false, true, true] },
  { id: 'repeatable-read', allowed: [false, false, true] },
  { id: 'serializable', allowed: [false, false, false] }
];
const isolationEntries = new Set(['isolation-level', ...isolationAnomalies, ...isolationLevels.map(level => level.id)]);
const isolationColumns = isolationAnomalies.map(id => terms.find(term => term.id === id));
const isolationRows = isolationLevels.map(level => ({ ...level, term: terms.find(term => term.id === level.id) }));
const sorted = [...terms].sort((a, b) => a.en.localeCompare(b.en, 'en'));
createApp({
  setup() {
    function saveEntry(changes) {
      history.replaceState({
        ...history.state,
        dictionary: { ...history.state?.dictionary, ...changes }
      }, '');
    }
    // Direct links start a fresh visit. Reloads keep the existing entry.
    if (!history.state?.dictionary) {
      const navigation = window.navigation;
      const previous = navigation?.currentEntry && navigation.entries()[navigation.currentEntry.index - 1];
      const siteRoot = new URL('.', location.href).href;
      saveEntry({ hasPrevious: previous?.url?.startsWith(siteRoot) ?? false });
    }
    const entry = history.state.dictionary;
    const hasPrevious = ref(entry.hasPrevious);
    const query = ref(entry.query ?? '');
    const category = ref(entry.category ?? '全部');
    const slug = ref(resolveEntryId(location.hash.slice(1)));
    const title = ref(null);
    const withdrawn = computed(() => withdrawnEntries.has(slug.value));
    const selected = computed(() => terms.find(term => term.id === slug.value));
    const domain = computed(() => domains.find(item =>
      selected.value?.domain === item.id || slug.value === '/topics/' + item.id
    ));
    const domainTerms = computed(() => sorted.filter(term => term.domain === domain.value?.id));
    const comparison = computed(() => {
      const group = selected.value?.comparison?.group;
      return group ? domainTerms.value.filter(term => term.comparison?.group === group) : [];
    });
    const questions = computed(() => domainTerms.value.filter(term => term.lookupQuestion));
    const linkedModels = computed(() => modelIndex.chapters.filter(chapter => chapter.term === selected.value?.id));
    const linkedGuides = computed(() => guides.filter(guide => selected.value
      ? guide.terms.includes(selected.value.id)
      : domainTerms.value.some(term => guide.terms.includes(term.id))));
    const modelCases = computed(() => domainTerms.value.filter(term => term.modelCase));
    const categories = computed(() => ['全部', ...new Set(domainTerms.value.map(term => term.category))]);
    const filtered = computed(() => {
      const text = query.value.trim().toLowerCase();
      return domainTerms.value.filter(term =>
        (category.value === '全部' || term.category === category.value) &&
        [term.en, term.zh, ...(term.aliases ?? []), term.lookupQuestion ?? '', term.category, term.definition, term.example, ...(term.practice ? [term.practice.principle, ...term.practice.steps, term.practice.verify, term.practice.tradeoff] : [])].some(value => value.toLowerCase().includes(text))
      );
    });
    function reset() {
      category.value = '全部';
      query.value = '';
    }
    function rememberPage() {
      saveEntry({ query: query.value, category: category.value, scrollY: window.scrollY });
    }
    function followLink(event) {
      if (event.target.closest('a[href]')) rememberPage();
    }
    function goBack() {
      rememberPage();
      history.back();
    }
    function readHash() {
      // A new native hash navigation has no state. Back/Forward restores its saved entry.
      if (!history.state?.dictionary) saveEntry({ hasPrevious: true });
      const current = history.state.dictionary;
      hasPrevious.value = current.hasPrevious;
      query.value = current.query ?? '';
      category.value = current.category ?? '全部';
      slug.value = resolveEntryId(location.hash.slice(1));
    }
    window.addEventListener('hashchange', readHash);
    document.addEventListener('click', followLink, true);
    onUnmounted(() => {
      window.removeEventListener('hashchange', readHash);
      document.removeEventListener('click', followLink, true);
    });
    watch(slug, (_, previous) => {
      const previousLink = document.getElementById(previous);
      const scrollY = history.state?.dictionary?.scrollY;
      const focusTarget = previousLink ?? title.value;
      focusTarget?.focus({ preventScroll: scrollY !== undefined || !previousLink });
      if (scrollY !== undefined || !previousLink) window.scrollTo(0, scrollY ?? 0);
    }, { flush: 'post' });
    watch([selected, domain], ([term, topic]) => {
      document.title = (term?.en ?? topic?.name ?? '主題索引') + ' · Software Dictionary';
    }, { immediate: true });
    const related = computed(() => relatedTerms(slug.value));
    return { goBack, hasPrevious, isolationEntries, isolationColumns, isolationRows, linkedModels, linkedGuides, modelCases, questions, comparison, withdrawn, domains, plannedTopics, domain, related, query, category, categories, filtered, reset, selected, title };
  }
}).mount('#app');
