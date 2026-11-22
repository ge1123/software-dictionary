import { createApp, computed, watch, onUnmounted, ref } from 'vue/dist/vue.esm-bundler.js';
import { resolveEntryId, relatedTerms, domains, plannedTopics, terms } from './terms.js';
import './style.css';

const withdrawnEntries = new Set([
  'commerce/distribution-agreement', 'commerce/channel-allocation',
  'commerce/proof-of-delivery', 'commerce/promotion-funding'
]);
const sorted = [...terms].sort((a, b) => a.en.localeCompare(b.en, 'en'));
createApp({
  setup() {
    const query = ref('');
    const category = ref('全部');
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
    const modelCases = computed(() => domainTerms.value.filter(term => term.modelCase));
    const categories = computed(() => ['全部', ...new Set(domainTerms.value.map(term => term.category))]);
    const filtered = computed(() => {
      const text = query.value.trim().toLowerCase();
      return domainTerms.value.filter(term =>
        (category.value === '全部' || term.category === category.value) &&
        [term.en, term.zh, term.lookupQuestion ?? '', term.category, term.definition, term.example, ...(term.practice ? [term.practice.principle, ...term.practice.steps, term.practice.verify, term.practice.tradeoff] : [])].some(value => value.toLowerCase().includes(text))
      );
    });
    function reset() {
      category.value = '全部';
      query.value = '';
    }
    function readHash() {
      slug.value = resolveEntryId(location.hash.slice(1));
    }
    window.addEventListener('hashchange', readHash);
    onUnmounted(() => window.removeEventListener('hashchange', readHash));
    watch(domain, reset);
    watch(slug, (_, previous) => {
      const previousLink = document.getElementById(previous);
      if (previousLink) previousLink.focus();
      else {
        title.value?.focus({ preventScroll: true });
        window.scrollTo(0, 0);
      }
    }, { flush: 'post' });
    watch([selected, domain], ([term, topic]) => {
      document.title = (term?.en ?? topic?.name ?? '主題索引') + ' · Software Dictionary';
    }, { immediate: true });
    const related = computed(() => relatedTerms(slug.value));
    return { modelCases, questions, comparison, withdrawn, domains, plannedTopics, domain, related, query, category, categories, filtered, reset, selected, title };
  }
}).mount('#app');
