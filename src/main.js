import { createApp, computed, watch, onUnmounted, ref } from 'vue/dist/vue.esm-bundler.js';
import { relatedTerms, domains, terms } from './terms.js';
import './style.css';

const sorted = [...terms].sort((a, b) => a.en.localeCompare(b.en, 'en'));
createApp({
  setup() {
    const query = ref('');
    const category = ref('全部');
    const domainId = ref(domains[0].id);
    const domainName = computed(() => domains.find(domain => domain.id === domainId.value).name);
    const domainTerms = computed(() => sorted.filter(term => term.domain === domainId.value));
    const categories = computed(() => ['全部', ...new Set(domainTerms.value.map(term => term.category))]);
    const filtered = computed(() => {
      const text = query.value.trim().toLowerCase();
      return domainTerms.value.filter(term =>
        (category.value === '全部' || term.category === category.value) &&
        [term.en, term.zh, term.definition, term.example].some(value => value.toLowerCase().includes(text))
      );
    });
    function reset() {
      category.value = '全部';
      query.value = '';
    }
    const slug = ref(location.hash.slice(1));
    const title = ref(null);
    const selected = computed(() => terms.find(term => term.id === slug.value));
    function readHash() {
      slug.value = location.hash.slice(1);
    }
    window.addEventListener('hashchange', readHash);
    onUnmounted(() => window.removeEventListener('hashchange', readHash));
    watch(selected, (term, previous) => {
      if (term && term.domain !== domainId.value) {
        domainId.value = term.domain;
        reset();
      }
      if (term) {
        title.value?.focus({ preventScroll: true });
        window.scrollTo(0, 0);
      } else if (previous) {
        document.getElementById(previous.id)?.focus();
      }
    }, { immediate: true, flush: 'post' });
    watch([selected, domainName], ([term, name]) => {
      document.title = (term ? term.en : name + ' 詞典') + ' · Software Dictionary';
    }, { immediate: true });
    const related = computed(() => relatedTerms(slug.value));
    return { domains, domainId, domainName, related, query, category, categories, filtered, reset, selected, title };
  }
}).mount('#app');
