import { createHighlightComponent } from 'instantsearch-ui-components';
import {
  getHighlightedParts,
  getPropertyByPath,
  unescape,
} from 'instantsearch.js/es/lib/utils';
import { h, Fragment } from 'vue'

const createElement = (tag, props, children) => {
  if (!children) {
    return h(tag, props);
  }

  if (tag === Fragment) {
    return h(tag, Array.isArray(children) ? children : [children]);
  }

  // It does work to just pass a string but outputs a warning about performance issues
  const newChildren =
    typeof children === 'string' ? { default: () => children } : children;
  // Passing a `children` prop to a DOM element outputs a warning
  const newProps =
    typeof tag === 'string' ? props : Object.assign(props, { children });

  return h(tag, newProps, newChildren);
};

const Highlight = createHighlightComponent({ createElement, Fragment });

export default {
  name: 'AisHighlighter',
  props: {
    hit: {
      type: Object,
      required: true,
    },
    attribute: {
      type: String,
      required: true,
    },
    highlightedTagName: {
      type: String,
      default: 'mark',
    },
    suit: {
      type: Function,
      required: true,
    },
    highlightProperty: {
      type: String,
      required: true,
    },
    preTag: {
      type: String,
      required: true,
    },
    postTag: {
      type: String,
      required: true,
    },
  },
  render() {
    const property =
      getPropertyByPath(this.hit[this.highlightProperty], this.attribute) || [];
    const properties = Array.isArray(property) ? property : [property];

    const parts = properties.map((singleValue) =>
      getHighlightedParts(unescape(singleValue.value || '')).map(
        ({ value, isHighlighted }) => ({
          // We have to do this because Vue gets rid of TextNodes with a single white space
          value: value === ' ' ? '  ' : value,
          isHighlighted,
        })
      )
    );

    return createElement(Highlight, {
      classNames: {
        root: this.suit(),
        highlighted: this.suit('highlighted'),
      },
      highlightedTagName: this.highlightedTagName,
      nonHighlightedTagName: Fragment,
      parts,
    });
  },
};
