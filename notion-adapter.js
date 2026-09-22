const PLACEHOLDER = /^\s*\[(?:placeholder|questions?|mcqs?|to be added)[^\]]*\]\s*$/i;

const richText = value => Array.isArray(value)
  ? value.map(part => { if (typeof part === 'string') return part; const text = part?.type === 'equation' ? `@@MATH:${part.equation?.expression || ''}@@` : part?.plain_text ?? part?.text?.content ?? ''; const a = part?.annotations || {}; let out=text; if(a.underline)out=`__${out}__`; if(a.italic)out=`*${out}*`; if(a.bold)out=`**${out}**`; return out; }).join('')
  : String(value ?? '');

const id = (prefix, index, raw) => raw?.id || `${prefix}-${index + 1}`;

function notionBlock(raw, index, diagnostics) {
  const type = raw?.type;
  const data = raw?.[type] || raw;
  const text = richText(data?.rich_text || data?.title || data?.text || data?.expression || raw?.text);
  const children = (raw?.children || data?.children || []).map((child, i) => notionBlock(child, i, diagnostics));
  const base = { id: id('notion-block', index, raw), text, children, metadata: { rawType: type } };
  if (['heading-2','heading-3','heading-4','paragraph','bulleted-list','numbered-list','equation','callout','activity','toggle','media','divider','checkbox','unsupported','recap'].includes(type)) {
    const sourceIcon = data?.icon?.type === 'emoji' ? data.icon.emoji : data?.icon?.type === 'external' ? data.icon.external?.url : data?.icon?.type === 'file' ? data.icon.file?.url : undefined;
    return { ...raw, id: raw.id || base.id, text: raw.text ?? text, children, metadata: { ...(raw.metadata || {}), ...(sourceIcon ? { icon: sourceIcon } : {}) } };
  }
  if (PLACEHOLDER.test(text)) base.metadata.placeholder = true;
  if (type === 'heading_2' || type === 'heading-2') return { ...base, type: 'heading-2' };
  if (type === 'heading_3' || type === 'heading-3') return { ...base, type: 'heading-3' };
  if (type === 'heading_4' || type === 'heading-4') return { ...base, type: 'heading-4' };
  if (type === 'paragraph') return { ...base, type: 'paragraph' };
  if (type === 'bulleted_list_item' || type === 'bulleted-list') return { ...base, type: 'bulleted-list' };
  if (type === 'numbered_list_item' || type === 'numbered-list') return { ...base, type: 'numbered-list' };
  if (type === 'equation') return { ...base, type: 'equation', text: data.expression || text };
  if (type === 'divider') return { ...base, type: 'divider' };
  if (type === 'image' || type === 'video' || type === 'file') return { ...base, type: 'media', metadata: { ...base.metadata, url: data.file?.url || data.external?.url || data.url, alt: data.caption ? richText(data.caption) : text } };
  if (type === 'toggle' || type === 'to_do_toggle') return { ...base, type: 'toggle' };
  if (type === 'to_do') return { ...base, type: 'checkbox', metadata: { ...base.metadata, checked: !!data.checked } };
  if (type === 'callout') {
    const annotations = data.annotations || data.metadata || {};
    const activity = annotations.activity || annotations.activityType || data.activityType;
    if (activity) return { ...base, type: 'activity', metadata: { ...base.metadata, ...(annotations.activity || {}), activityType: typeof activity === 'string' ? activity : activity.activityType } };
    if (annotations.kind === 'recap' || annotations.kind === 'memory-check') return { ...base, type: 'recap', metadata: { ...base.metadata, kind: annotations.kind } };
    return { ...base, type: 'callout' };
  }
  diagnostics.push({ blockId: base.id, sourceType: type || 'unknown', message: 'Preserved as unsupported content.' });
  return { ...base, type: 'unsupported' };
}

function preserveNotionBlocks(block) {
  const children = (block.children || []).flatMap(preserveNotionBlocks);
  if (children.length || !block.text || !String(block.text).includes('$$')) return { ...block, children };
  const parts = String(block.text).split(/(\$\$[\s\S]*?\$\$)/g).filter(Boolean);
  const expanded = parts.map((part, i) => part.startsWith('$$')
    ? { id: `${block.id}-equation-${i}`, type: 'equation', text: part.replace(/^\$\$|\$\$$/g, '').trim() }
    : { id: `${block.id}-text-${i}`, type: ['callout', 'recap'].includes(block.type) ? 'paragraph' : block.type, text: part.trim(), metadata: block.metadata || {} });
  return expanded.length === 1 ? { ...block, children } : { ...block, text: '', children: expanded };
}

export function normalizeLesson(source, ref = 'notion-export') {
  const rawBlocks = source?.blocks || source?.results || source?.children || [];
  const diagnostics = [];
  const lesson = { id: source?.id || ref, title: source?.title || source?.properties?.title || 'Untitled lesson', source: { type: source?.source?.type || 'notion-export', ref }, blocks: rawBlocks.map((b, i) => notionBlock(b, i, diagnostics)).map(preserveNotionBlocks) };
  lesson.diagnostics = diagnostics;
  return lesson;
}

export async function loadLesson(pageId, query = new URLSearchParams(location.search)) {
  const sourceUrl = query.get('source');
  if (sourceUrl) {
    const response = await fetch(sourceUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load source export (${response.status})`);
    return normalizeLesson(await response.json(), sourceUrl);
  }
  if (!query.has('fixture')) {
    const liveResponse = await fetch(`/api/notion/page/${encodeURIComponent(pageId)}`, { cache: 'no-store' });
    if (liveResponse.ok) return normalizeLesson(await liveResponse.json(), `notion:${pageId}`);
  }
  const fixture = pageId === 'interaction-components-demo' || query.has('demo') ? 'interaction-components-demo' : pageId === '3d88595d9d4c80fbbd97df2f625f35d1' ? 'even-and-odd-live' : 'even-and-odd-testing';
  const response = await fetch(`/docs/fixtures/${fixture}.json?v=20260911-2`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not load lesson ${pageId} (${response.status})`);
  return normalizeLesson(await response.json(), fixture);
}
