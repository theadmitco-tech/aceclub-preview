const NOTION_VERSION = '2022-06-28';

function notionRequest(path) {
  // Support the existing Vercel variable name while keeping the canonical name.
  const token = process.env.NOTION_TOKEN || process.env.Notion_Token;
  if (!token) throw new Error('NOTION_TOKEN is not configured');
  return fetch(`https://api.notion.com/v1${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
    },
  });
}

async function getJson(path) {
  const response = await notionRequest(path);
  const body = await response.json();
  if (!response.ok) {
    const message = body?.message || `Notion API request failed (${response.status})`;
    throw new Error(message);
  }
  return body;
}

async function getBlocks(blockId) {
  const blocks = [];
  let cursor;
  do {
    const suffix = cursor ? `&start_cursor=${encodeURIComponent(cursor)}` : '';
    const page = await getJson(`/blocks/${blockId}/children?page_size=100${suffix}`);
    blocks.push(...page.results);
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);

  for (const block of blocks) {
    if (block.has_children) block.children = await getBlocks(block.id);
  }
  return blocks;
}

function titleFromPage(page) {
  const properties = page?.properties || {};
  for (const property of Object.values(properties)) {
    if (property?.type === 'title') {
      return property.title?.map(part => part.plain_text || part.text?.content || '').join('') || 'Untitled lesson';
    }
  }
  return 'Untitled lesson';
}

export default async function handler(request, response) {
  try {
    const pageId = request.query?.pageId;
    if (!pageId || !/^[a-f0-9-]{32,36}$/i.test(pageId)) {
      return response.status(400).json({ error: 'A valid Notion page ID is required.' });
    }
    const [page, blocks] = await Promise.all([
      getJson(`/pages/${pageId}`),
      getBlocks(pageId),
    ]);
    return response.status(200).json({
      id: page.id,
      title: titleFromPage(page),
      source: { type: 'notion', ref: page.id },
      results: blocks,
    });
  } catch (error) {
    return response.status(500).json({ error: error.message || 'Unable to load Notion content.' });
  }
}
