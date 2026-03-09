export function h(tag, props, ...children) {
  const normalizedChildren = children.flat(Infinity);
  const normalizedProps = props || {};

  if (typeof tag === 'function') {
    return tag({ ...normalizedProps, children: normalizedChildren });
  }

  return {
    tag,
    props: normalizedProps,
    children: normalizedChildren,
  };
}

export function Fragment({ children = [] }) {
  return children;
}

export function html(value) {
  return { __html: String(value ?? '') };
}
