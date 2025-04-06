# Theme Development Guide

## Shopify-Compatible Theme Structure

This project uses a theme system designed to be compatible with Shopify theme patterns. This allows for:

1. Easier migration from Shopify
2. Familiarity for developers with Shopify experience
3. Potential reuse of Shopify themes with minimal adjustments

## Theme Structure

Themes are organized in a way that mirrors Shopify's theme structure:

```
/themes/
  /default/
    /components/    # Reusable components (like Shopify snippets)
    /templates/     # Page templates (like Shopify templates)
    /sections/      # Content sections (like Shopify sections)
    theme.json      # Theme configuration
    manifest.json   # Asset mapping
  /other-theme/
    ...
```

## Component Naming Conventions

For compatibility with Shopify conventions:

- Use `product-card.tsx` instead of `ProductCard.tsx`
- Use `collection-list.tsx` instead of `CollectionList.tsx`
- Use `cart-drawer.tsx` instead of `CartDrawer.tsx`

## Template Structure

Templates follow Shopify's standard templates:

- `index.tsx` - Home page template
- `product.tsx` - Product detail page
- `collection.tsx` - Category/collection page
- `cart.tsx` - Cart page
- `page.tsx` - Generic page template
- etc.

## Section Compatibility

Sections are designed to be compatible with Shopify's section architecture:

- Each section has a schema that defines its customization options
- Sections can be added to templates dynamically
- Sections can accept blocks (sub-components)

Example section structure:

```tsx
// sections/featured-collection.tsx
import { Section } from '@/types/theme';

interface FeaturedCollectionProps {
    heading: string;
    collection: string;
    products_to_show: number;
}

export const FeaturedCollection: Section<FeaturedCollectionProps> = ({
    heading = 'Featured Collection',
    collection = '',
    products_to_show = 4,
}) => {
    // Implementation
};

// Define schema for admin customization
FeaturedCollection.schema = {
    name: 'Featured Collection',
    settings: [
        {
            type: 'text',
            id: 'heading',
            label: 'Heading',
            default: 'Featured Collection',
        },
        {
            type: 'collection',
            id: 'collection',
            label: 'Collection',
        },
        {
            type: 'range',
            id: 'products_to_show',
            label: 'Products to show',
            min: 2,
            max: 12,
            step: 2,
            default: 4,
        },
    ],
};
```

## Theme Translation

If you're migrating a Shopify theme:

1. Convert Liquid templates to React components
2. Transform Liquid conditionals to JSX conditionals
3. Replace Liquid loops with JavaScript maps
4. Convert Liquid filters to JavaScript functions

Example of a Liquid to React transformation:

```liquid
<!-- Shopify Liquid -->
<div class="product-card">
  <a href="{{ product.url }}">
    <img src="{{ product.featured_image | img_url: '400x' }}" alt="{{ product.title }}">
    <h3>{{ product.title }}</h3>
    <p>{{ product.price | money }}</p>
  </a>
  {% if product.available %}
    <button>Add to cart</button>
  {% else %}
    <button disabled>Sold out</button>
  {% endif %}
</div>
```

Becomes:

```tsx
// React component
<div className="product-card">
    <Link href={`/products/${product.slug}`}>
        <img
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={400}
        />
        <h3>{product.name}</h3>
        <p>{formatPrice(product.price)}</p>
    </Link>
    {product.stock > 0 ? (
        <Button onClick={() => addToCart(product)}>Add to cart</Button>
    ) : (
        <Button disabled>Sold out</Button>
    )}
</div>
```

## Using Shopify as a Backend

This platform can also be configured to use Shopify as a backend while maintaining your custom frontend:

1. Set the environment variables:

    - `NEXT_PUBLIC_USE_SHOPIFY=true`
    - `NEXT_PUBLIC_SHOPIFY_DOMAIN=your-store.myshopify.com`
    - `NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN=your-storefront-api-token`

2. The platform will then use Shopify's Storefront API for data while maintaining your custom UI.

## Theme Settings

Theme settings are defined in `theme.json` in a format compatible with Shopify's theme settings:

```json
{
    "name": "Default Theme",
    "settings": [
        {
            "type": "header",
            "content": "Colors"
        },
        {
            "type": "color",
            "id": "colors_primary",
            "label": "Primary Color",
            "default": "#0f766e"
        },
        {
            "type": "color",
            "id": "colors_secondary",
            "label": "Secondary Color",
            "default": "#2563eb"
        }
    ]
}
```

These settings are then used to generate CSS variables and theme options in the admin UI.
