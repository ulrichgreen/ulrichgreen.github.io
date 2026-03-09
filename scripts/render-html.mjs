const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

function normalizeAttributeName(name) {
  if (name === 'className') return 'class';
  if (name === 'htmlFor') return 'for';
  if (name === 'charSet') return 'charset';
  return name;
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderAttribute([name, value]) {
  if (value == null || value === false || name === 'children') {
    return '';
  }

  const attribute = normalizeAttributeName(name);

  if (value === true) {
    return ` ${attribute}`;
  }

  return ` ${attribute}="${escapeHtml(value)}"`;
}

export function renderToString(node) {
  if (node == null || node === false) {
    return '';
  }

  if (Array.isArray(node)) {
    return node.map(renderToString).join('');
  }

  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint') {
    return escapeHtml(node);
  }

  if (typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, '__html')) {
    return String(node.__html ?? '');
  }

  if (typeof node.tag === 'function') {
    return renderToString(node.tag({ ...(node.props || {}), children: node.children || [] }));
  }

  const props = node.props || {};
  const attrs = Object.entries(props).map(renderAttribute).join('');
  const children = node.children || [];

  if (VOID_ELEMENTS.has(node.tag)) {
    return `<${node.tag}${attrs}>`;
  }

  return `<${node.tag}${attrs}>${children.map(renderToString).join('')}</${node.tag}>`;
}
