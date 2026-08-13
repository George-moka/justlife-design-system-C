'use strict';

/**
 * eslint-plugin-justlife
 *
 * Governance rules that keep the design system free of arbitrary values.
 * The flagship rule, `no-raw-values`, forbids hard-coded colours and raw
 * dimension numbers inside component/pattern source. Everything visual must
 * come from `@justlife/tokens`.
 */

// #rgb, #rgba, #rrggbb, #rrggbbaa
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
// rgb()/rgba()/hsl()/hsla()
const FUNC_COLOR = /^(?:rgb|rgba|hsl|hsla)\s*\(/i;

// Allowed non-token colour keywords (semantically safe, platform-neutral).
const ALLOWED_COLOR_KEYWORDS = new Set(['transparent', 'currentColor', 'inherit', 'none']);

// Style props whose numeric values must reference spacing/size/radius tokens.
const DIMENSION_PROPS = new Set([
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingHorizontal',
  'paddingVertical',
  'paddingStart',
  'paddingEnd',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'marginStart',
  'marginEnd',
  'gap',
  'rowGap',
  'columnGap',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderWidth',
  'fontSize',
  'lineHeight',
  'letterSpacing',
]);

// Small magic numbers that are universally safe (resets / hairlines / flex).
const ALLOWED_DIMENSION_NUMBERS = new Set([0, 1]);

const noRawValues = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hard-coded colours and raw dimension values; use design tokens instead.',
    },
    schema: [],
    messages: {
      rawColor:
        'Raw colour "{{value}}" is not allowed. Use a token from @justlife/tokens (e.g. theme.color.*).',
      rawDimension:
        'Raw dimension {{value}} on "{{prop}}" is not allowed. Use a spacing/size/radius token from @justlife/tokens.',
    },
  },
  create(context) {
    function checkString(node, value) {
      if (typeof value !== 'string') return;
      if (ALLOWED_COLOR_KEYWORDS.has(value)) return;
      if (HEX_COLOR.test(value) || FUNC_COLOR.test(value)) {
        context.report({ node, messageId: 'rawColor', data: { value } });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          checkString(node, node.value);
        }
      },
      TemplateLiteral(node) {
        // Flag template strings that begin with a hex colour, e.g. `#${x}`.
        const first = node.quasis[0];
        if (first && /^#[0-9a-fA-F]{0,8}/.test(first.value.raw) && first.value.raw.startsWith('#')) {
          context.report({ node, messageId: 'rawColor', data: { value: first.value.raw + '…' } });
        }
      },
      Property(node) {
        const key =
          node.key && (node.key.name || (node.key.type === 'Literal' && node.key.value));
        if (!key || !DIMENSION_PROPS.has(key)) return;
        const value = node.value;
        if (
          value &&
          value.type === 'Literal' &&
          typeof value.value === 'number' &&
          !ALLOWED_DIMENSION_NUMBERS.has(value.value)
        ) {
          context.report({
            node: value,
            messageId: 'rawDimension',
            data: { value: String(value.value), prop: key },
          });
        }
      },
    };
  },
};


// ── scroller-gutter-inside ──────────────────────────────────────────────────────────────────────
//
// A horizontal scroller must SPAN the full width and carry its gutter in `contentContainerStyle`.
// Padding on the scroller itself — or on a view wrapped around it — shrinks the viewport, so items
// are clipped at the padding line with a dead strip beside them instead of scrolling past the edge.
// (Design-system rule #60.)

const SCROLLER_NAMES = new Set(['ScrollView', 'FlatList', 'SectionList', 'Animated.ScrollView', 'Animated.FlatList']);
const H_PADDING_PROPS = new Set(['padding', 'paddingHorizontal', 'paddingLeft', 'paddingRight', 'paddingStart', 'paddingEnd']);

function jsxName(node) {
  const n = node.name;
  if (!n) return '';
  if (n.type === 'JSXIdentifier') return n.name;
  if (n.type === 'JSXMemberExpression') return `${n.object.name}.${n.property.name}`;
  return '';
}

function attr(node, name) {
  return node.attributes.find((a) => a.type === 'JSXAttribute' && a.name && a.name.name === name);
}

/** `horizontal` / `horizontal={true}` — a bare attribute means true. */
function isHorizontal(opening) {
  const a = attr(opening, 'horizontal');
  if (!a) return false;
  if (!a.value) return true;
  return a.value.type === 'JSXExpressionContainer' && a.value.expression.value !== false;
}

/** The horizontal-padding property inside a style value (object, or array of them). Null if none. */
function horizontalPaddingIn(value) {
  if (!value) return null;
  const expr = value.type === 'JSXExpressionContainer' ? value.expression : value;
  const objects =
    expr.type === 'ArrayExpression'
      ? expr.elements.filter(Boolean)
      : [expr];
  for (const o of objects) {
    if (!o || o.type !== 'ObjectExpression') continue;
    for (const prop of o.properties) {
      const key = prop.key && (prop.key.name || (prop.key.type === 'Literal' && prop.key.value));
      if (key && H_PADDING_PROPS.has(key)) return prop;
    }
  }
  return null;
}

/** Direct JSX element children, seeing through a single expression container. */
function childElements(node) {
  const out = [];
  for (const c of node.children || []) {
    if (c.type === 'JSXElement') out.push(c);
    else if (c.type === 'JSXExpressionContainer' && c.expression && c.expression.type === 'JSXElement') {
      out.push(c.expression);
    }
  }
  return out;
}

const scrollerGutterInside = {
  meta: {
    type: 'problem',
    docs: { description: 'Horizontal scrollers span the full width and pad their CONTENT, not their box.' },
    schema: [],
    messages: {
      onScroller:
        'A horizontal scroller pads its CONTENT, not its box: move `{{prop}}` from `style` into `contentContainerStyle`, or its first/last item is clipped at the padding line instead of scrolling past the edge (#60).',
      onWrapper:
        'This view pads a horizontal scroller from the outside (`{{prop}}`), so the scroller can never reach the screen edge — items get clipped at the padding line with a dead strip beside them. Let the scroller span the full width and give it the gutter via `contentContainerStyle` (#60).',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = jsxName(node);

        if (SCROLLER_NAMES.has(name) && isHorizontal(node)) {
          const style = attr(node, 'style');
          const pad = style && horizontalPaddingIn(style.value);
          if (pad) {
            context.report({
              node: pad,
              messageId: 'onScroller',
              data: { prop: pad.key.name || String(pad.key.value) },
            });
          }
          return;
        }

        // A padded wrapper around a scroller — the shape the bug actually takes.
        const style = attr(node, 'style');
        const pad = style && horizontalPaddingIn(style.value);
        if (!pad || !node.parent || node.parent.type !== 'JSXElement') return;
        const scroller = childElements(node.parent).find(
          (c) => SCROLLER_NAMES.has(jsxName(c.openingElement)) && isHorizontal(c.openingElement),
        );
        if (scroller) {
          context.report({
            node: pad,
            messageId: 'onWrapper',
            data: { prop: pad.key.name || String(pad.key.value) },
          });
        }
      },
    };
  },
};

module.exports = {
  meta: { name: 'eslint-plugin-justlife', version: '0.0.0' },
  rules: {
    'no-raw-values': noRawValues,
    'scroller-gutter-inside': scrollerGutterInside,
  },
};
