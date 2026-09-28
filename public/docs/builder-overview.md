# Infinitely Studio — Complete User & AI Agent Documentation

This is the corrected single-file documentation for Infinitely Studio.

This version separates the following systems correctly:

- Animation Builder
- Motion Builder
- Interactions
- Commands
- Dynamic Content
- Symbols
- Templates
- WordPress tools
- Libraries
- Fonts
- Files
- Export and publishing

The most important correction in this file is:

Animation Builder is not the same as Motion Builder.

Animation Builder is used for CSS-based animation behavior.

Motion Builder is used for GSAP-based motion behavior.

Interactions are event-driven behaviors and are separate from both.

---

## 1. What Infinitely Studio Is

Infinitely Studio is a visual website builder.

You build pages by adding blocks, selecting elements, editing styles, configuring traits, creating reusable components, connecting dynamic data, and previewing the result.

The builder supports two project modes:

1. Normal projects  
   Local visual projects that can be exported.

2. WordPress projects  
   Projects connected to WordPress content and publishing.

The main editing rule is:

Select an element first, then edit it.

Most panels apply changes to the currently selected element.

---

## 2. Core Concepts

### Page

A page is a complete editable document inside a project.

### Block

A block is a ready-made element or section that you add to the canvas.

### Component

A component is any element inside the page structure.

### Layer

A layer is the tree representation of a component.

### Trait

A trait is an editable property of a component.

### Style

A style is a visual CSS property applied to an element, class, state, or breakpoint.

### Class

A class is a reusable style selector.

### State

A state is a style condition such as hover, focus, active, visited, or disabled.

### Symbol

A symbol is a reusable named component.

### Template

A template is reusable saved page content.

### Dynamic Template

A dynamic template is reusable content designed for dynamic data, API data, loops, or variables.

### Token

A token is a dynamic value placeholder.

Example:

{{ post.title }}

### Animation Builder

Animation Builder is used for CSS-based animations.

It works with animation styles, keyframe concepts, and utility animation behavior.

### Motion Builder

Motion Builder is used for GSAP-based motion recipes.

It works with motion IDs, motion instances, ScrollTrigger, SplitText, and runtime motion attributes.

### Interaction

An interaction is an event-driven behavior.

It can respond to click, hover, load, scroll, change, or other events.

### Command

A command is an action used inside interactions or automation.

---

## 3. The Main Difference Between Animation Builder and Motion Builder

This is the most important distinction.

| System | Purpose | Technology | Typical Use |
|---|---|---|---|
| Animation Builder | CSS animation behavior | CSS animations, keyframes, utility animation classes | Simple repeating or lightweight animations |
| Motion Builder | Advanced motion behavior | GSAP, ScrollTrigger, SplitText | Timelines, scroll effects, text splitting, complex motion |
| Interactions | Event behavior | Commands, runtime events | Click, hover, show/hide, class toggling, navigation |

### Simple Rule

Use Animation Builder when you need simple CSS animation behavior.

Use Motion Builder when you need advanced GSAP motion behavior.

Use Interactions when you need behavior triggered by user events or page events.

---

## 4. Workspace

The Workspace is the project management screen.

From the Workspace you can:

- create a new project
- open an existing project
- import project or page files
- manage saved projects
- return to projects from the editor

### Create a Project

1. Open the Workspace.
2. Click New site.
3. Enter a project name.
4. Enter a description if needed.
5. Choose the project type.
6. Confirm.

For WordPress projects, you also provide WordPress connection details.

### Import Rules

When importing a page or project file, the file must be valid.

A valid page import needs:

- valid JSON data
- a page name
- valid paths
- HTML content
- CSS content when required

If the page name already exists in the project, the import will be rejected.

---

## 5. Editor Layout

The editor contains:

1. Top Toolbar  
2. Left Sidebar  
3. Canvas  
4. Right Sidebar  
5. Panels and popups for advanced tools

### Top Toolbar

Common controls include:

- Desktop view
- Tablet view
- Mobile view
- media condition selector
- custom width
- custom height
- zoom
- Pages
- Code Manager
- Preview
- Frontend
- Save
- Share
- Export
- add blocks
- component editing controls

### Left Sidebar

The Left Sidebar gives access to:

- Pages
- Dynamic Templates
- Symbols & Templates
- REST API Models
- Library Installer
- Fonts Installer
- Files Manager
- WordPress tools
- Infinitely AI
- Themes
- Settings
- return to Workspace

### Canvas

The canvas is the visual page area.

Inside the canvas you can:

- select elements
- move elements
- edit text
- drop blocks
- reorder content
- test layout
- preview visual changes
- create reusable resources

### Right Sidebar

The right side contains editing panels for the selected element.

Common right-panel areas:

- Styles
- Traits
- Classes
- States
- Attributes
- component-specific controls

---

## 6. Selecting Elements

Most actions require a selected element.

To select an element:

1. Click it on the canvas.
2. Or click it in the Layers panel.
3. Or use hierarchy navigation if the element is nested.

If an element is difficult to click:

- use Layers
- select its parent first
- check if it is hidden, locked, or covered by another element
- use a container or wrapper layer

---

## 7. Pages

Pages are the main editable documents inside a project.

### Create a Page

1. Open the Pages panel.
2. Type the page name.
3. Press Enter or click create.

### Search Pages

Use the Pages search field to find pages by name.

### Switch Pages

Click a page name to load it in the canvas.

### Page Settings

Each page can have settings such as:

- page name
- description
- title
- author
- keywords
- custom meta tags
- body attributes
- page-specific JavaScript
- page-specific CSS
- page paths

### Page SEO / Helmet Fields

Pages support metadata fields commonly used for SEO.

Available metadata concepts include:

- title
- description
- author
- keywords
- custom meta tags

Example page metadata usage:

- Title: Product Landing Page
- Description: A responsive landing page for product features.
- Keywords: landing, product, responsive
- Author: Studio Team

### Download a Page

Use the Download page action to export a page file.

### Upload Pages

Use the upload action to import a page file.

Validation rules:

- file must be valid
- page data must be a plain object
- page name must exist
- page paths must exist
- page name must not already exist in the project

### Delete a Page

Use the page actions to delete a page. Confirm before deleting.

---

## 8. WordPress Template Types

For WordPress projects, pages can behave like WordPress templates.

### Global Templates

| Template | Purpose |
|---|---|
| index | Fallback template for all content |

### Singular Templates

| Template | Purpose |
|---|---|
| singular | All single posts, pages, and custom post types |
| single | Blog posts only |
| page | Static pages only |

### System Templates

| Template | Purpose |
|---|---|
| search | Search results page |
| 404 | Not found page |

### Custom Post Type Templates

For each custom post type, the builder can support:

- Single {post type}
- {post type} Archive

Example:

If the post type is product, the builder can support:

- Single product
- product Archive

Template slugs follow the pattern:

- single-product
- archive-product

---

## 9. Blocks

Blocks are pre-made pieces you add to the canvas.

### Add a Block

1. Open Blocks.
2. Choose a category.
3. Drag the block to the canvas.
4. Drop it where you want it.

### Common Block Types

| Block | Purpose |
|---|---|
| Section | Full-width structural area |
| Container | Generic wrapper |
| Text | Paragraph or rich text |
| Heading | H1 to H6 heading |
| Link | Anchor element |
| Button | Clickable button |
| Image | Image element |
| Media | Media wrapper |
| Video | Video element |
| Audio | Audio element |
| Input | Form input |
| Slider | Carousel/slider |
| Iframe | Embedded external content |
| SVG | Vector graphic |
| Splitter | Split layout |
| Spline | 3D scene viewer |
| Dynamic Content | Token/API-driven content |
| Looper | Repeated content container |
| Load More | Loads more items |
| Next / Previous | Pagination navigation |
| Symbol | Reusable component instance |
| Template | Saved reusable section |
| Table | Table structure |
| Form Elements | Inputs and form controls |

### Edit a Block

After adding a block:

1. Select it.
2. Edit text directly if it is editable.
3. Use Traits for attributes.
4. Use Styles for visual design.
5. Use Layers to move or reorder it.

### Remove a Block

Select the block and delete it.

### Duplicate a Block

Use copy and paste.

### Move a Block

Drag it on the canvas or reorder it in Layers.

---

## 10. Layers

The Layers panel shows the hierarchy of all elements on the page.

Use Layers to:

- select nested elements
- rename elements
- move elements
- reorder elements
- change parent elements
- inspect structure
- avoid clicking issues on the canvas

### Select from Layers

Click a layer to select the matching component.

### Rename a Layer

Double-click the layer name and type a new name.

Use meaningful names like:

- Header Nav
- Hero Section
- Product Card
- Footer Links

### Reorder Layers

Drag layers to change their order.

### Reparent Layers

Drag a layer into another layer to move it inside that element.

---

## 11. Traits

Traits are properties and attributes of the selected element.

### Common Traits

| Trait | Used For |
|---|---|
| tagName | HTML element type |
| id | Unique element ID |
| classes | CSS classes |
| src | Image, video, iframe source |
| href | Link destination |
| target | Link target |
| alt | Image alternative text |
| title | Tooltip or accessible title |
| placeholder | Input placeholder |
| value | Input value |
| name | Form field name |
| type | Input type |
| controls | Media controls |
| autoplay | Media autoplay |
| loop | Media loop |
| muted | Media muted state |

### Edit an Attribute

1. Select the element.
2. Open Traits.
3. Find the attribute.
4. Change its value.

### Add a Custom Attribute

1. Select the element.
2. Open Traits.
3. Open Attributes.
4. Add the attribute name.
5. Add the attribute value.

### Attribute Examples

Link example:

- href: /pricing
- target: _blank
- rel: noopener

Image example:

- src: /images/product.jpg
- alt: Product screenshot
- loading: lazy

Input example:

- type: email
- name: user_email
- placeholder: Enter your email
- required: true

---

## 12. Styles

The Styles panel controls visual presentation.

### Edit a Style

1. Select an element.
2. Open Styles.
3. Choose a style group.
4. Change the value.

### Style Groups

Common style groups include:

- Layout
- Size
- Spacing
- Typography
- Background
- Border
- Effects
- Transform
- Transition
- Animation
- Scroll
- Flexbox
- Grid

### Animation Style Group

The Animation style group is related to CSS animation behavior.

It is commonly used with Animation Builder concepts.

It may include properties such as:

- animation name
- animation duration
- animation delay
- animation timing function
- animation iteration count
- animation direction
- animation fill mode
- animation play state

Do not confuse this with Motion Builder.

Motion Builder uses GSAP motion recipes and motion attributes.

### Layout Examples

Set display:

- block
- flex
- grid
- inline-block
- none

Set position:

- static
- relative
- absolute
- fixed
- sticky

Set overflow:

- auto
- hidden
- scroll
- visible

### Size Examples

Set width:

- 100%
- 300px
- 50vw
- auto

Set height:

- auto
- 200px
- 100vh

### Spacing Examples

Set padding:

- 10px
- 1rem
- 20px 40px
- 0 auto

Set margin:

- 0
- 16px
- 1rem auto

### Typography Examples

Set font family, font size, font weight, line height, letter spacing, text align, and color.

Example:

- Font size: 18px
- Font weight: 600
- Line height: 1.6
- Text align: center

### Background Examples

Set background color, background image, gradient, background size, background position, and background repeat.

### Border Examples

Set border width, border style, border color, and border radius.

### Effects Examples

Set opacity, box shadow, filter, backdrop filter, and visibility.

---

## 13. Classes

Classes let you reuse styles.

### Create a Class

1. Select an element.
2. Open the Classes area.
3. Type a class name.
4. Apply it.

Example class names:

- btn
- btn-primary
- section-padding
- card
- hero-title
- footer-link

### Apply an Existing Class

1. Select the element.
2. Open Classes.
3. Search for the class.
4. Click to apply it.

### Remove a Class

Remove the class from the element class list.

### Best Practice

Use classes for repeated styling. Do not duplicate the same style manually on many elements.

---

## 14. States

States allow styling under specific conditions.

Common states:

- hover
- focus
- active
- visited
- disabled
- first-child
- last-child
- nth-child
- before
- after

### Use a State

1. Select the element.
2. Open Styles.
3. Choose a state.
4. Edit styles for that state.
5. Return to the normal state when done.

Example:

Button normal state:

- background: blue
- color: white

Button hover state:

- background: dark blue
- transform: translateY(-2px)

---

## 15. Copy and Paste Styles

The editor supports copying styles from the current selected element and selector context.

### Copy Styles

Use Copy Styles when you want to reuse the styles of the selected element.

The copied styles are based on:

- selected element
- current selector
- current media/device context

If there are no styles to copy, the editor shows a warning.

### Paste Styles

Use Paste Styles to apply copied styles to another element.

Before pasting, confirm overwrite if asked.

Pasting overwrites existing styles for the selected context.

---

## 16. Responsive Design

Infinitely Studio supports responsive editing through device views and media conditions.

### Device Views

Use:

- Desktop
- Tablet
- Mobile

You can also set custom width and height.

### Responsive Editing Workflow

1. Choose a device view.
2. Select the element.
3. Change styles.
4. Those styles apply to that device context.

### Responsive Checklist

For Desktop:

- check section width
- check navigation
- check typography
- check spacing
- check images
- check grids and columns

For Tablet:

- check wrapping
- check menu behavior
- check card layout
- check spacing
- check images

For Mobile:

- check text readability
- check button size
- check horizontal scroll
- check stacking order
- check forms
- check fixed elements
- check menus

### Custom Width and Height

Use custom width and height to test special viewport sizes.

Examples:

- 360px width
- 390px width
- 768px width
- 1024px width
- 1280px width
- 1440px width

---

## 17. Assets and Media

Assets are files used inside the project, such as images, videos, fonts, and documents.

For WordPress projects, media can come from the WordPress media library.

### Media Actions

Common media actions include:

- select media
- preview media
- copy media link
- download media
- delete media
- load more media
- search media

### Copy Media Link

Use copy link to copy the media source URL.

### Download Media

Use download to save the media file locally.

### Delete Media

Use delete to remove media. Confirm before deleting.

### Insert Media

1. Select an image or media component.
2. Open media selection.
3. Choose the file.
4. Apply it.

---

## 18. Tokens

Tokens are dynamic placeholders.

Token format:

{{ path.to.value }}

Tokens can be used in:

- text content
- attributes
- links
- image sources
- alt text
- conditions
- loops
- queries
- templates
- dynamic components

### Common WordPress Tokens

| Token | Meaning |
|---|---|
| {{ post.ID }} | Post ID |
| {{ post.id }} | Post ID |
| {{ post.title }} | Post title |
| {{ post.post_title }} | Post title |
| {{ post.content }} | Post content |
| {{ post.post_content }} | Post content |
| {{ post.excerpt }} | Post excerpt |
| {{ post.post_excerpt }} | Post excerpt |
| {{ post.url }} | Post URL |
| {{ post.link }} | Post link |
| {{ post.date }} | Post date |
| {{ post.thumbnail }} | Featured image |
| {{ post.author }} | Author |
| {{ post.meta }} | Post meta |
| {{ post.acf.field }} | ACF field |

### User Tokens

| Token | Meaning |
|---|---|
| {{ user.display_name }} | Current user display name |
| {{ user.user_email }} | Current user email |
| {{ user.roles }} | Current user roles |

### Site Tokens

| Token | Meaning |
|---|---|
| {{ site.name }} | Site name |
| {{ site.description }} | Site description |
| {{ site.url }} | Site URL |
| {{ site.home_url }} | Home URL |
| {{ site.language }} | Site language |
| {{ site.timezone }} | Site timezone |

### Theme Tokens

Theme tokens can expose active theme information.

Example concept:

{{ theme.name }}

### Loop Tokens

Inside a loop, use the loop item variable.

Example:

If the loop item name is product_loop:

- {{ product_loop.title }}
- {{ product_loop.price }}
- {{ product_loop.image }}

Do not use {{ post.title }} inside a loop if the loop variable is different.

### Pagination Tokens

| Token | Meaning |
|---|---|
| {{ pagination.current }} | Current page number |
| {{ pagination.max_number }} | Total page count |
| {{ pagination.prev_link }} | Previous page link |
| {{ pagination.next_link }} | Next page link |
| {{ pagination.pagination_links }} | Page links list |
| {{ pagination_link.url }} | Page link URL inside pagination loop |
| {{ pagination_link.text }} | Page link text inside pagination loop |

### Token Picker

When typing inside supported fields, type:

{{

The token picker can appear and show available tokens.

Use the token picker to avoid typing mistakes.

### CSS Token Picker

Some style fields support CSS variable tokens.

These tokens usually start with:

--

Example concept:

var(--color-primary)

The CSS token picker helps you choose theme CSS variables.

---

## 19. Conditions

Conditions control whether an element should render.

Conditions are commonly managed through the inf-if-json attribute.

### Condition Structure

A condition checks:

- a variable/token
- an operator
- a value

### Condition Object Concept

var: token.path  
operator: operator_name  
value: compare_value

### Operators

Common operators:

| Operator | Meaning |
|---|---|
| equals | Exact match |
| includes | Array contains value |
| contains | String contains value |

### Logic Operators

Use:

- and
- or

### Condition Examples

Example 1: Show only for administrators

Check:

user roles includes administrator

Example 2: Show only for logged-in editors or administrators

Check:

user roles includes administrator
or
user roles includes editor

Example 3: Show only published posts

Check:

post status equals publish

Example 4: Combined condition

Check:

user roles includes administrator
and
request query name_user equals yousef1
or
post id equals 79

Logic reads as:

(user.roles includes administrator)  
AND  
(request.query.name_user equals yousef1)  
OR  
(post.id equals 79)

### How to Add a Condition

1. Select the element.
2. Open Traits.
3. Find Inf If.
4. Add a condition.
5. Choose the variable/token.
6. Choose the operator.
7. Enter the value.
8. Add and/or logic if needed.

### Important Rule

The inf-if-json value is a JSON string inside an attribute.

Inner quotes must be escaped when generating component data.

---

## 20. Loops

Loops repeat content for each item in a list.

Loop behavior is commonly controlled with:

- inf-for
- inf-for-item
- inf-for-index

### Loop Attributes

| Attribute | Purpose |
|---|---|
| inf-for | The array/token to loop |
| inf-for-item | Variable name for each item |
| inf-for-index | Variable name for the index |

### Create a Loop

1. Select the element that should repeat.
2. Open Traits.
3. Set inf-for to the data list.
4. Set inf-for-item to a variable name.
5. Optionally set inf-for-index.

### Loop Example

Loop over products.

Loop array:

{{ products }}

Item variable:

product_loop

Index variable:

i

Inside the loop use:

- {{ product_loop.name }}
- {{ product_loop.price }}
- {{ product_loop.description }}
- {{ i }}

### Nested Loops

You can place a loop inside another loop.

Use different variable names for each loop.

Example:

Outer item: category_loop  
Inner item: product_loop

Use:

- {{ category_loop.name }}
- {{ product_loop.title }}

---

## 21. Dynamic Queries

Dynamic queries fetch WordPress content and render them dynamically.

Query behavior is commonly controlled with:

- inf-query
- inf-query-id
- inf-query-item
- use-ajax

### Query Attributes

| Attribute | Purpose |
|---|---|
| inf-query | Query arguments |
| inf-query-id | Unique query identifier |
| inf-query-item | Item variable for each result |
| use-ajax | Enable AJAX loading |

### Common Query Fields

| Field | Purpose |
|---|---|
| post_type | Type of content |
| posts_per_page | Number of items |
| offset | Skip items |
| paged | Current page number |
| orderby | Sort field |
| order | Sort direction |
| ignore_sticky_posts | Ignore sticky posts |
| meta_query | Custom field filtering |
| tax_query | Taxonomy filtering |
| cache_results | Result caching |

### Posts Per Page

Examples:

- 3
- 6
- 9
- 12
- -1

Using -1 shows all posts.

### Offset

Offset skips a number of posts.

Example:

Offset 3 skips the first three posts.

### Paged

Paged sets the current pagination page.

Example:

Paged 1 shows the first page.  
Paged 2 shows the second page.

### Ignore Sticky Posts

Choose Yes or No.

If Yes, sticky posts are not treated specially.

### Order By Options

Common orderby values:

| Value | Meaning |
|---|---|
| date | Post date |
| modified | Last modified date |
| title | Title |
| name | Slug |
| ID | Post ID |
| author | Author |
| parent | Parent |
| menu_order | Menu order |
| comment_count | Comment count |
| relevance | Search relevance |
| rand | Random |
| meta_value | Meta value |
| meta_value_num | Numeric meta value |
| post__in | Included posts order |
| none | No ordering |

### Order Direction

Use:

- ASC for ascending
- DESC for descending

Examples:

- date DESC: newest first
- title ASC: alphabetical A to Z
- menu_order ASC: manual menu order

---

## 22. Meta Query

Meta query filters posts by custom fields.

A meta query can contain clauses.

Each clause can define:

- key
- value
- compare
- type

### Meta Compare Operators

| Compare | Meaning |
|---|---|
| = | Equals |
| != | Not equals |
| > | Greater than |
| >= | Greater than or equal |
| < | Less than |
| <= | Less than or equal |
| LIKE | Contains |
| NOT LIKE | Not contains |
| IN | In list |
| NOT IN | Not in list |
| BETWEEN | Between values |
| NOT BETWEEN | Not between values |
| EXISTS | Field exists |
| NOT EXISTS | Field does not exist |

### Meta Types

| Type | Meaning |
|---|---|
| CHAR | Text |
| NUMERIC | Numeric |
| DECIMAL | Decimal |
| SIGNED | Signed integer |
| UNSIGNED | Unsigned integer |
| DATE | Date |
| DATETIME | Date and time |
| TIME | Time |
| BINARY | Binary |

### Meta Query Example Concept

Show products where:

- color equals blue
- size equals large

Use relation AND.

Show posts where:

- featured_score exists

Use EXISTS.

Show public courses where:

- _tutor_is_public_course equals yes

Use = compare.

### Date Compare Operators

Date comparisons can use:

- =
- !=
- >
- >=
- <
- <=

---

## 23. Taxonomy Query

Taxonomy query filters posts by categories, tags, or custom taxonomies.

A taxonomy clause can define:

- taxonomy
- field
- terms
- operator
- relation

Example taxonomy fields:

- slug
- term_id
- name

Example taxonomy operators:

- IN
- NOT IN
- AND
- EXISTS
- NOT EXISTS

### Taxonomy Query Example Concept

Show posts in categories:

- news
- updates

Use taxonomy category and field slug.

Show products with tags:

- sale
- featured

Use taxonomy post_tag and field slug.

---

## 24. Query Workflow

To create a dynamic query:

1. Add a container element.
2. Select it.
3. Open Traits.
4. Enable Inf Query.
5. Choose the post type.
6. Set posts per page.
7. Set order and orderby.
8. Add category, tag, meta, or taxonomy filters if needed.
9. Set a unique query ID.
10. Set the query item variable.
11. Add child elements that use tokens from the query item.

### Query Example Concept

Query:

- post type: post
- posts per page: 6
- orderby: date
- order: DESC
- query id: latest_posts
- query item: article

Inside the query container use:

- {{ article.title }}
- {{ article.excerpt }}
- {{ article.url }}
- {{ article.thumbnail }}

### Important Rule

The inf-query value must be a JSON string when stored as an attribute.

Inner quotes must be escaped.

---

## 25. Pagination

Pagination adds page navigation to dynamic queries.

Pagination uses:

- inf-pagination
- inf-pagination-id

### Pagination Attributes

| Attribute | Purpose |
|---|---|
| inf-pagination-id | Must match the target inf-query-id |
| allow-numbers | Show numbered links |
| allow-prev-next | Show previous/next links |
| max-show | Maximum number links to display |
| max-style | Window style for number links |

### Link Pagination to a Query

The pagination ID must match the query ID.

Example:

Query ID: latest_posts  
Pagination ID: latest_posts

### Pagination Context

Pagination provides variables such as:

- pagination.prev_link
- pagination.next_link
- pagination.pagination_links
- pagination.current
- pagination.max_number

Inside pagination link loops:

- pagination_link.url
- pagination_link.text

### Pagination Example Concept

Create a navigation area.

Add previous link:

href = {{ pagination.prev_link }}

Add page number loop:

loop over {{ pagination.pagination_links }}
item name pagination_link

Each link uses:

href = {{ pagination_link.url }}
text = {{ pagination_link.text }}

Add next link:

href = {{ pagination.next_link }}

### Pagination Options Example

Use:

- allow-numbers: true
- allow-prev-next: true
- max-show: 2
- max-style: window-first-last

---

## 26. Server-Side Fetch

Server-side fetch loads external API data during rendering.

It is commonly controlled with:

- inf-ssr
- url
- method
- headers
- response-ver

Child loop controls include:

- ssr-for
- ssr-loop
- ssr-for-item
- ssr-for-index

### SSR Fields

| Field | Purpose |
|---|---|
| url | API endpoint |
| method | HTTP method |
| headers | Request headers |
| response-ver | Dot path to response data |
| ssr-loop | Dot path to list inside response |
| ssr-for-item | Item variable name |
| ssr-for-index | Index variable name |

### SSR Workflow

1. Add an SSR container.
2. Set the API URL.
3. Choose GET or POST.
4. Add headers if needed.
5. Set response-ver to the location of the data.
6. Add child elements.
7. Enable SSR loop on the child.
8. Use tokens from the SSR item variable.

### SSR Example Concept

API URL:

https://api.example.com/products

Response path:

data.items

Loop variable:

product_loop

Use tokens:

- {{ product_loop.name }}
- {{ product_loop.price }}
- {{ product_loop.image }}

---

## 27. Symbols

A symbol is a reusable named component.

Use symbols for elements that appear in many places, such as:

- buttons
- cards
- badges
- nav items
- footers
- headers
- icons
- repeated widgets

### Create a Symbol

1. Select the element.
2. Use Create Symbol.
3. Give it a name.
4. Save.

### Symbol Rules

A valid symbol should be:

- one element
- properly named
- identifiable by its symbol attribute
- reusable without depending on a single page context

If a symbol contains multiple root elements, it is invalid.

If a symbol does not have the required symbol ID attribute, it cannot be saved.

### Symbol Reference

Symbols can be referenced inside components using:

inf-symbol-id

### Edit a Symbol

Select the symbol instance and edit it.

Depending on the symbol setup, edits may affect all instances.

### Delete a Symbol

Remove the symbol from Symbols & Templates or remove instances from pages.

There is a project setting that can remove symbols after they are removed from pages.

---

## 28. Templates

Templates are reusable saved sections or components.

Use templates for:

- hero sections
- feature sections
- footer sections
- pricing sections
- testimonial sections
- repeated page layouts

### Save a Template

1. Select the section or element.
2. Use Save as Template.
3. Give it a name.

### Use a Template

1. Open Blocks.
2. Find Templates.
3. Drag the template to the canvas.

### Templates vs Symbols

| Feature | Use When |
|---|---|
| Template | You want to reuse a saved section |
| Symbol | You want a reusable named component that can update instances |

---

## 29. Dynamic Templates

Ignored

### Dynamic Templates vs Pages

Pages contain actual page content.

Dynamic templates contain reusable dynamic logic or structure.

Do not confuse a page with a dynamic template.

---

## 30. REST API Models

REST API Models connect external API data to the builder.

Open REST API Models from the editor navigation.

### Model Fields

| Field | Purpose |
|---|---|
| Name | Model display name |
| Method | GET, POST, PUT, DELETE |
| URL | API endpoint |
| Headers | Request headers |
| Body | Request body |
| Response Path | Dot path to data |
| Variable Name | Token variable name |

### Test a Model

1. Configure the model.
2. Use Fetch or Test.
3. Review the response.
4. Confirm that the response path returns the expected data.

### Use Model Data

If the variable name is products, use:

- {{ products.name }}
- {{ products.price }}
- {{ products.description }}

---

## 31. Commands

Commands are actions used by interactions and automation.

Commands can control elements, variables, classes, navigation, and content.

### Command Variables

Commands can use variables.

Variable scopes:

- global
- local

Global variables commonly use the $ prefix.

Local variables commonly use the : prefix.

Example variable names:

- $userName
- $cartItems
- :activeTab
- :isOpen

### Set Variable

Use set variable to create or update a variable.

Example concept:

Set $userName to Ahmed.

Set :isOpen to true.

### Set Object Variable

Use set object variable when the variable contains multiple named fields.

Example concept:

Set $user to an object containing name, email, and role.

### Set Array Variable

Use set array variable when the variable contains a list.

Example concept:

Set $items to a list of products.

### Make Object

Use make when you want to create a new object from a class or structure.

Example concept:

Make a new object from a class and store it in a variable.

---

## 32. Common Command Actions

| Command | Purpose |
|---|---|
| add class | Add a class to an element |
| remove class | Remove a class from an element |
| toggle class | Toggle a class |
| add selector | Add a class to matching elements |
| remove selector | Remove a class from matching elements |
| remove element | Remove an element from the DOM |
| append | Add content to a target |
| show | Show an element |
| hide | Hide an element |
| toggle visibility | Toggle visibility |
| scroll to | Scroll to an element |
| navigate | Go to a URL |
| set attribute | Change an attribute |
| set text | Change text content |
| set HTML | Change HTML content |
| call function | Call a helper function |
| run code | Run custom logic |
| set global variable | Set global data |
| set local variable | Set local data |

### Add Class Example

Add active to .menu-item.

### Remove Class Example

Remove active from .menu-item.

### Add Selector Example

Add .highlight to all elements that have .card.

### Remove Element Example

Remove .temporary-banner.

### Append Example

Append a new message to .notification-list.

---

## 33. Helper Functions

Helper functions are ready-made actions that can be called from commands or interactions.

### Theme Helpers

| Function | Purpose |
|---|---|
| initTheme | Initialize theme system |
| setUserTheme | Apply a user theme |
| setUserMode | Apply light/dark or custom mode |

### Layout Helpers

| Function | Purpose |
|---|---|
| setMaxHeightVH | Set max-height using viewport height |
| setMaxWidthVW | Set max-width using viewport width |

### Element Movement Helpers

| Function | Purpose |
|---|---|
| moveElementBefore | Move an element before another element |
| moveElementAfter | Move an element after another element |

### Clipboard Helper

| Function | Purpose |
|---|---|
| copyTextToClipboard | Copy element text to clipboard |

### Attribute Helpers

| Function | Purpose |
|---|---|
| setElementId | Set element ID |
| setElementName | Set element name |

### Style Helpers

| Function | Purpose |
|---|---|
| setFilter | Apply CSS filter |
| setBackdropFilter | Apply backdrop filter |
| setTextDecoration | Set text decoration |
| setBorderCollapse | Set border collapse |
| setTableLayout | Set table layout |

### Interaction Helper

| Function | Purpose |
|---|---|
| addClickClass | Add a class when an element is clicked |

### Helper Examples

Example 1:

Use setUserTheme with theme slug dark.

Example 2:

Use setMaxHeightVH with selector .panel and value 80.

Example 3:

Use moveElementAfter with selector .tooltip and target .button.

Example 4:

Use copyTextToClipboard with selector .coupon-code.

---

## 34. Animation Builder

Animation Builder is the system used for CSS-based animation behavior.

It is not the Motion Builder.

It does not create GSAP motion recipes.

It does not create motion-instance-id attributes.

It does not create ScrollTrigger timelines.

Animation Builder is used when the animation should behave like a CSS animation or a utility animation.

### What Animation Builder Is Used For

Use Animation Builder for:

- simple loading spinners
- pulse effects
- ping effects
- bounce effects
- repeating background effects
- lightweight hover animations
- simple enter animations
- CSS keyframe-based effects
- utility animation classes

### Animation Builder Technology

Animation Builder works with CSS animation concepts.

It may use:

- animation styles
- keyframes
- animation utility classes
- CSS variables for animation presets
- Tailwind-style animate utilities

### Common Animation Builder Concepts

| Concept | Meaning |
|---|---|
| animation name | The keyframe or animation preset to use |
| duration | How long the animation runs |
| delay | Wait time before animation starts |
| timing function | Easing behavior |
| iteration count | How many times the animation repeats |
| direction | Normal, reverse, alternate, alternate-reverse |
| fill mode | How styles apply before/after animation |
| play state | Running or paused |

### Built-in Animation Concepts

The project may include common animation presets such as:

- spin
- ping
- pulse
- bounce

These are lightweight CSS animation concepts.

Examples:

Spin:

Use for loaders or rotating icons.

Ping:

Use for notification dots or expanding attention effects.

Pulse:

Use for subtle opacity breathing effects.

Bounce:

Use for small vertical bouncing effects.

### Animation Builder Workflow

1. Select the element.
2. Open Animation Builder or animation style controls.
3. Choose an animation preset or define a CSS animation.
4. Set duration.
5. Set delay if needed.
6. Set repeat behavior if needed.
7. Set easing if needed.
8. Preview the result.
9. Save.

### Animation Builder Example 1: Spinner

Element:

icon loader

Animation concept:

- animation: spin
- duration: 1s
- timing: linear
- iteration: infinite

Result:

The icon rotates continuously.

### Animation Builder Example 2: Pulse Badge

Element:

notification badge

Animation concept:

- animation: pulse
- duration: 2s
- timing: ease-in-out
- iteration: infinite

Result:

The badge gently fades in and out.

### Animation Builder Example 3: Hover Button Attention

Element:

button

Use state hover with a subtle transform or CSS animation.

Example:

- hover scale slightly
- hover shadow increase
- hover animation duration short

Result:

The button feels interactive without needing GSAP.

### Animation Builder Output

Animation Builder usually results in:

- CSS classes
- CSS animation styles
- utility animation classes
- keyframe references

It does not usually result in:

- motion-id
- motion-instance-id
- v-gsap
- ScrollTrigger configuration
- SplitText configuration

### When to Use Animation Builder

Use Animation Builder when:

- the animation is simple
- the animation repeats automatically
- you do not need scroll-based control
- you do not need complex sequencing
- you do not need split text
- you want lightweight behavior
- you want CSS-based behavior

### When Not to Use Animation Builder

Do not use Animation Builder when:

- you need scroll scrubbing
- you need pinned sections
- you need complex timelines
- you need character-by-character text animation
- you need advanced GSAP easing and sequencing
- you need motion instances with IDs

For those cases, use Motion Builder.

---

## 35. Motion Builder

Motion Builder is the system used for advanced GSAP-based motion behavior.

It is not the Animation Builder.

Motion Builder creates motion recipes.

Motion Builder uses GSAP concepts and can use:

- GSAP core
- ScrollTrigger
- SplitText

### What Motion Builder Is Used For

Use Motion Builder for:

- advanced entrance motion
- scroll-based reveals
- pinned scroll sections
- scrubbed scroll animations
- timeline sequences
- staggered motion
- text splitting animation
- parallax effects
- interactive motion
- motion recipes applied by ID
- motion instances

### Motion Builder Technology

Motion Builder works with GSAP runtime behavior.

It may resolve to:

- v-gsap attributes
- registered motion scripts
- motion IDs
- motion instance IDs

For loops, the builder may also add:

- v-scope
- v-effect

These help motion behavior initialize correctly inside repeated items.

### Motion Attributes

| Attribute | Purpose |
|---|---|
| motion-id | References a saved motion recipe |
| motion-instance-id | References a specific motion instance |

### Important Motion Rule

Do not manually invent motion IDs.

Use the Motion Builder to create and manage motion recipes.

The builder assigns and manages motion IDs and motion instance IDs.

### Motion Recipe Concepts

A motion recipe can contain:

- motion ID
- motion type
- target behavior
- duration
- delay
- easing
- from values
- to values
- transform values
- opacity values
- scale values
- rotation values
- x position values
- y position values
- stagger behavior
- scroll trigger settings
- split text settings
- timeline steps
- instance overrides

### Motion Instances

A motion recipe can be reused on multiple elements through instances.

A motion instance allows the same motion recipe to be applied to a specific element.

Motion instances can allow instance-specific behavior or identification.

Use instances when:

- the same motion is reused on multiple elements
- you want to identify a specific motion application
- you want to manage the motion separately from the element content

### Motion Builder Workflow

1. Select the element.
2. Open Motion Builder.
3. Create a new motion recipe.
4. Choose motion values.
5. Set duration, delay, and easing.
6. Add scroll trigger settings if needed.
7. Add split text settings if needed.
8. Add timeline steps if needed.
9. Save the motion.
10. Apply the motion to the element through the builder.

The builder then connects the element to the motion recipe using motion attributes.

### Motion Builder Example 1: Fade Up on Load

Element:

hero title

Motion concept:

- opacity from 0 to 1
- y from 30 to 0
- duration 0.8
- ease power2.out

Result:

The title fades in and moves upward when loaded.

### Motion Builder Example 2: Scroll Reveal

Element:

feature card

Motion concept:

- start when card enters viewport
- opacity from 0 to 1
- y from 40 to 0
- duration 0.7

Result:

The card reveals as the user scrolls.

### Motion Builder Example 3: Scroll Scrub

Element:

section background or image

Motion concept:

- scrub with scroll
- move or scale based on scroll progress

Result:

The motion follows the user's scroll position.

### Motion Builder Example 4: Pinned Section

Element:

storytelling section

Motion concept:

- pin section during scroll
- animate inner content while pinned

Result:

The section stays fixed while content animates.

### Motion Builder Example 5: Split Text Heading

Element:

heading

Motion concept:

- split text into words or characters
- animate each piece with stagger
- fade or slide each piece

Result:

The heading appears word by word or character by character.

### Motion Builder and Loops

When a motion is used inside a loop, the builder may add:

- v-scope
- v-effect

This helps each repeated item initialize its motion correctly.

Do not remove these attributes manually unless you understand the effect.

### Motion Builder Output

Motion Builder usually results in:

- motion-id
- motion-instance-id
- v-gsap behavior
- registered motion scripts
- scroll trigger behavior
- split text behavior

It does not usually result in:

- simple CSS animation classes
- CSS keyframe references
- Tailwind animate utilities

Those belong to Animation Builder.

### When to Use Motion Builder

Use Motion Builder when:

- you need advanced motion
- you need scroll-triggered motion
- you need timeline sequencing
- you need split text
- you need pinned sections
- you need scrubbed animations
- you need reusable motion recipes
- you need motion instances

### When Not to Use Motion Builder

Do not use Motion Builder when:

- a simple CSS animation is enough
- you only need spin, pulse, ping, or bounce
- you want lightweight behavior
- you do not need GSAP features

For those cases, use Animation Builder.

---

## 36. Interactions

Interactions are event-driven behaviors.

They are separate from Animation Builder and Motion Builder.

An interaction can trigger commands, visibility changes, class changes, navigation, or other behaviors.

### Interaction Attributes

| Attribute | Purpose |
|---|---|
| interaction-id | Direct interaction reference |
| main-interaction-id | Parent interaction reference |
| interaction-instance-id | Specific interaction instance |

### Interaction Runtime

Interactions may resolve to runtime behavior such as:

- registered scripts
- v-gsap behavior when connected to motion-related actions
- command execution
- event listeners

For loops, the builder may also add:

- v-scope
- v-effect

### Common Triggers

- click
- hover
- mouse enter
- mouse leave
- load
- scroll
- change
- submit
- focus
- blur

### Create an Interaction

1. Select the element.
2. Open Interactions.
3. Add a new interaction.
4. Choose the trigger.
5. Add commands.
6. Configure targets.
7. Save.

### Interaction Examples

Example 1: Open menu

When .menu-button is clicked, add .open to .menu.

Example 2: Close popup

When .close-popup is clicked, hide .popup.

Example 3: Scroll to section

When .hero-button is clicked, scroll to #features.

Example 4: Toggle dark mode

When .theme-toggle is clicked, call setUserTheme.

### Interaction vs Motion Builder

| System | Purpose |
|---|---|
| Interaction | Responds to events and runs commands |
| Motion Builder | Creates GSAP motion recipes |

An interaction may trigger motion, but it is not itself a motion recipe.

Do not describe interactions as Motion Builder.

Do not describe Motion Builder as Interactions.

---

## 37. Animation Builder vs Motion Builder vs Interactions

Use this table whenever there is confusion.

| Feature | Animation Builder | Motion Builder | Interactions |
|---|---|---|---|
| Main technology | CSS | GSAP | Commands/events |
| Uses keyframes | Yes | Not required | Not required |
| Uses motion-id | No | Yes | No |
| Uses motion-instance-id | No | Yes | No |
| Uses interaction-id | No | No | Yes |
| Uses main-interaction-id | No | No | Yes |
| Uses interaction-instance-id | No | No | Yes |
| Uses ScrollTrigger | No | Yes | Only if connected |
| Uses SplitText | No | Yes | No |
| Uses CSS animation styles | Yes | Not primary | No |
| Best for | Simple lightweight animation | Advanced motion | Event behavior |
| Example | Pulse badge | Scroll reveal with stagger | Click to open menu |

---

## 38. Canvas Directives

Directives are special attributes that add behavior to canvas elements.

Many directives are influenced by PetiteVue-style syntax.

### Common Directives

| Directive | Purpose |
|---|---|
| v-scope | Define a reactive scope |
| v-if | Conditional rendering |
| v-show | Show/hide element |
| v-for | Loop rendering |
| v-bind | Dynamic attribute binding |
| v-model | Two-way binding |
| v-text | Set text content |
| v-html | Set HTML content |
| v-effect | Run reactive side effect |
| v-ref | Element reference |
| v-view | View reference |
| v-auto-animate | Automatic transition animation |
| v-in | Enter animation |
| v-out | Leave animation |
| v-animated-for | Animated loop rendering |
| v-gsap | GSAP-related runtime behavior |

### v-gsap

The v-gsap directive is related to Motion Builder or GSAP runtime behavior.

It may be added by the builder when motion or interaction behavior requires GSAP runtime handling.

Do not manually add v-gsap unless you understand the motion or interaction recipe it connects to.

### v-scope and v-effect in Loops

Inside loops, the builder may add:

- v-scope
- v-effect

This is common when motion or interaction behavior needs to initialize per repeated item.

Do not remove these manually unless you are fixing a known issue.

### v-scope Example Concept

Use v-scope to define local data for an area.

Example data:

show: false  
items: list of products

### v-show Example Concept

Show an element only when a value is true.

Example:

Show notification when isOpen is true.

### v-if Example Concept

Render an element only when a condition is true.

Unlike v-show, v-if removes the element from rendering when false.

### v-for Example Concept

Loop over items and render each one.

Use item and index variables.

### v-bind Example Concept

Bind an attribute to dynamic data.

Example:

Bind href to a dynamic URL.

Bind src to a dynamic image.

### v-model Example Concept

Bind an input value to a variable.

Example:

Bind email input to userEmail.

### v-html Example Concept

Insert HTML content dynamically.

Use carefully. Only use trusted content.

### v-auto-animate Example Concept

Add automatic animation when list items are added, removed, or reordered.

### v-in and v-out Example Concept

Use v-in for enter animation.

Use v-out for leave animation.

Example concept:

v-in from opacity 0 to opacity 1.

v-out from opacity 1 to opacity 0.

### v-animated-for Example Concept

Use v-animated-for when rendering an animated list.

Each item can animate when added or removed.

---

## 39. PetiteVue

PetiteVue is a lightweight reactive library used for canvas interactivity.

It provides:

- reactive state
- conditional rendering
- list rendering
- event binding
- attribute binding
- scoped data

### When PetiteVue Is Used

PetiteVue is useful for:

- small interactive areas
- show/hide behavior
- dynamic text
- dynamic attributes
- simple component-like behavior
- lightweight reactivity without a full framework

### Important PetiteVue Rule

PetiteVue should be loaded as a classic script when it needs to expose global behavior.

Do not force it to become a module if the canvas expects global availability.

---

## 40. GSAP, ScrollTrigger, and SplitText

These libraries belong to Motion Builder.

They are not part of Animation Builder.

### GSAP Core

GSAP is the animation engine for Motion Builder.

It supports:

- tweening
- timelines
- easing
- delay
- repeat
- stagger
- callbacks
- transforms
- opacity
- scaling
- rotation
- motion sequencing

### GSAP ScrollTrigger

ScrollTrigger controls motion based on scrolling.

Use ScrollTrigger for:

- fade in on scroll
- parallax
- pinned sections
- scrubbed motion
- scroll-based reveals
- progress-linked motion

Common ScrollTrigger concepts:

- start
- end
- scrub
- pin
- markers
- trigger element

Example:

Start when the top of the element reaches the center of the viewport.

Example:

Scrub motion progress with scrolling.

### GSAP SplitText

SplitText splits text into smaller pieces.

It can split into:

- characters
- words
- lines

Use SplitText for:

- character reveal
- word fade-in
- line slide
- staggered headline animation

Example:

Animate each character of a heading with a small delay.

### GSAP Settings

Project settings may enable or disable:

- GSAP core
- ScrollTrigger
- SplitText

If Motion Builder behavior is not working, check these settings.

---

## 41. Swiper

Swiper is used for sliders and carousels.

Use Swiper for:

- image sliders
- product carousels
- testimonial sliders
- hero slides
- gallery sliders

### Swiper Features

- slides
- arrows
- pagination dots
- autoplay
- loop
- touch/swipe
- responsive breakpoints
- effects
- lazy loading
- keyboard control
- mousewheel control

### Common Swiper Options

| Option | Purpose |
|---|---|
| slidesPerView | Number of visible slides |
| spaceBetween | Space between slides |
| loop | Repeat slides |
| autoplay | Automatic sliding |
| pagination | Dots navigation |
| navigation | Arrow navigation |
| effect | Slide transition effect |
| speed | Transition speed |

### Slider Examples

Example 1: Simple image slider

- one slide per view
- arrows enabled
- pagination enabled
- autoplay enabled

Example 2: Product carousel

- three slides per view on desktop
- two slides per view on tablet
- one slide per view on mobile
- space between slides

Example 3: Fade hero slider

- one slide per view
- fade effect
- autoplay
- loop

---

## 42. Spline

Spline is used for interactive 3D scenes.

Use the Spline component to embed a 3D scene.

### Add Spline

1. Add the Spline block.
2. Provide the Spline scene URL.
3. Set width and height.
4. Preview performance.

### Spline Best Practices

- test on real devices
- avoid heavy scenes on mobile
- provide fallback content if needed
- check loading time
- check interaction behavior

---

## 43. Auto-Animate

Auto-animate adds simple transitions automatically.

It is useful when elements are:

- added
- removed
- reordered

Use auto-animate for:

- lists
- notifications
- todo items
- cards
- simple show/hide transitions

### Usage Concept

Apply the auto-animate behavior to a container.

When children change, they animate automatically.

Auto-animate is separate from Animation Builder and Motion Builder.

It is best for simple automatic DOM transitions.

---

## 44. Tailwind Support

Infinitely Studio can work with Tailwind-style utility concepts and generated utility styles.

Tailwind support may be enabled through project settings.

### What Tailwind Provides

Tailwind provides utility classes for:

- spacing
- layout
- flexbox
- grid
- typography
- color
- background
- border
- shadow
- transform
- transition
- animation utilities
- responsive variants
- state variants

### Tailwind Animation Utilities

Tailwind may provide animation utilities such as:

- animate-spin
- animate-ping
- animate-pulse
- animate-bounce

These belong to CSS-based animation behavior and are related to Animation Builder concepts.

They are not Motion Builder recipes.

### Example Utility Concepts

Layout:

- flex
- grid
- block
- hidden
- relative
- absolute

Spacing:

- p-4
- px-6
- py-10
- m-auto
- mt-5

Typography:

- text-sm
- text-lg
- font-bold
- text-center
- uppercase

Sizing:

- w-full
- h-screen
- max-w-xl

Flex:

- items-center
- justify-between
- flex-col
- gap-4

Grid:

- grid-cols-3
- col-span-2
- gap-6

Responsive:

- md:flex
- lg:grid-cols-4
- sm:hidden

State:

- hover:bg-blue-600
- focus:ring
- active:scale-95

Animation:

- animate-spin
- animate-pulse
- animate-bounce
- animate-ping

### When to Use Tailwind

Use Tailwind classes when:

- you want fast utility styling
- you prefer class-based design
- you need responsive variants
- you need state variants
- you need lightweight CSS animation utilities

Use the visual Styles panel when:

- you prefer visual editing
- you need fine control over a single element
- you want to manage classes manually

---

## 45. Library Installer

The Library Installer manages external JavaScript and CSS libraries.

Open Library Installer from the editor navigation.

### Search Libraries

1. Type a library name.
2. Browse results.
3. Choose a library.
4. Install it.

### Install Location

Choose where the library loads:

- header
- footer

Header is useful for scripts needed early.

Footer is useful for most scripts that can load later.

### Upload a Library

Use the Upload tab to add local files.

Supported concepts:

- JavaScript files
- CSS files

Choose header or footer placement after upload.

### Installed Libraries

From the Installed tab you can:

- view installed libraries
- reorder libraries
- remove libraries
- check placement
- manage loading behavior

### Async and Defer

Script loading behavior can include:

- async
- defer

Use async when the script can load independently.

Use defer when the script should run after HTML parsing.

### Library Bundling Options

Project settings may combine libraries into fewer files.

Bundling options can include:

- combine JS libraries into one file
- combine CSS libraries into one file
- combine header scripts
- combine footer scripts

Bundling can improve loading simplicity but may require testing.

### Libraries and Builders

| Library | Related System |
|---|---|
| GSAP | Motion Builder |
| ScrollTrigger | Motion Builder |
| SplitText | Motion Builder |
| Swiper | Slider component |
| Spline | 3D component |
| PetiteVue | Canvas reactivity |
| auto-animate | Automatic DOM transitions |
| Tailwind | Utility styling and CSS animation utilities |

---

## 46. Fonts Installer

The Fonts Installer manages fonts.

Open Fonts Installer from the editor navigation.

### Google Fonts

Use the Google Fonts tab to:

- search fonts
- preview fonts
- install fonts
- manage installed fonts

### Upload Fonts

Use the Upload tab to add custom font files.

Provide:

- font family name
- font files
- weight/style if needed

### Font Management

You can:

- view installed fonts
- uninstall fonts
- rename font files
- save font data to the project
- upload font files to WordPress when needed

### Use a Font

After installing a font:

1. Select a text element.
2. Open Styles.
3. Go to Typography.
4. Choose the font family.
5. Set weight and style.

---

## 47. Files Manager

The Files Manager lets you view and manage project files.

Open Files Manager from the editor navigation.

### File Categories

Common categories:

- HTML
- CSS
- JS
- global files
- page files
- tailwind files
- fonts
- assets

### Common Project File Concepts

A project may contain files such as:

- index page
- global JavaScript
- global CSS
- page HTML
- page CSS
- page JavaScript
- tailwind page CSS
- editor page files
- playground files

### View a File

Click a file to view its content.

### Edit a File

Use the file editor to modify file content.

Be careful. File editing can affect the whole project.

### File Conflict Detection

If a file was updated elsewhere, the system may detect a conflict.

If a conflict appears:

- review the file
- pull or reload if needed
- avoid overwriting unknown changes
- save again after resolving the conflict

### File Editor Options

The file editor may support:

- syntax highlighting
- formatting with Prettier
- file size display
- file type detection

---

## 48. Themes

Themes control reusable design variables and appearance modes.

Use themes for:

- colors
- fonts
- spacing variables
- dark mode
- light mode
- brand styles
- user-selected themes

### Theme Actions

Common theme actions:

- initialize theme
- set user theme
- set user mode

### Theme Example

Example theme names:

- light
- dark
- brand
- high-contrast

Example modes:

- light
- dark
- system

### Use Theme Variables

Theme variables can be used in styles and components.

Use consistent names for theme values.

Examples:

- primary color
- secondary color
- surface color
- text color
- border color
- radius
- spacing

### CSS Variables

Theme variables often appear as CSS variables.

Example concept:

var(--color-primary)

Use the CSS token picker when available.

---

## 49. WordPress Integration

WordPress mode connects Infinitely Studio to a WordPress site.

### Connect WordPress

You need:

- website URL
- username
- application password

Application passwords are generated from WordPress user profile settings.

### WordPress Features

When connected, you can:

- query WordPress content
- use WordPress media
- save page code to WordPress
- preview WordPress pages
- publish content
- work with custom post types
- access ACF fields when available
- access WooCommerce data when available
- manage WordPress-specific tools

### WordPress Save States

WordPress projects use save states.

| State | Meaning |
|---|---|
| saved | Published/live saved content |
| before_save | Draft/preview state before publishing |

When you save, the content may be stored as a preview/draft state before becoming fully published.

### Save WordPress Code

Saving WordPress code stores the page structure and assets into WordPress meta.

Saved data can include:

- HTML structure
- CSS
- JavaScript
- global CSS
- global JavaScript
- save state

### Publish WordPress Changes

After saving and previewing, publish the content to make it live.

### WordPress REST Data

WordPress content can provide fields such as:

- ID
- id
- title
- post_title
- content
- post_content
- excerpt
- post_excerpt
- link
- author
- featured media
- parent
- menu order
- comment status
- ping status
- template
- class list
- meta
- ACF data

### ACF Integration

If Advanced Custom Fields is available, tokens can access ACF fields.

Example:

{{ post.acf.subtitle }}

{{ post.acf.hero_image }}

{{ post.acf.price }}

### WooCommerce Integration

If WooCommerce is available, product content can include extra data such as:

- price
- SKU
- stock
- gallery
- product attributes
- cart endpoints

---

## 50. Infinitely AI

Infinitely AI assists with website building inside the editor.

Open Infinitely AI from the editor navigation.

### AI Purpose

Use AI for:

- page structure suggestions
- content rewriting
- layout help
- component suggestions
- responsive advice
- accessibility checks
- dynamic content help
- troubleshooting help

AI should stay focused on Infinitely Studio and website building.

### AI Chats

You can create multiple chats.

Use separate chats for separate tasks.

Examples:

- Homepage hero
- Pricing section
- Blog archive
- Product card
- Footer redesign

### Pin Chats

Pin important chats to keep them accessible.

### AI Providers

AI may support multiple providers.

Provider setup can include:

- provider name
- API key
- model selection
- default provider
- max tokens

### AI Best Practices

When asking AI for help, provide:

- page purpose
- target audience
- section goal
- content requirements
- responsive requirements
- brand style
- component type
- dynamic data requirements
- accessibility requirements

Keep requests focused.

### AI Content Rules

AI should not produce unrelated, inappropriate, or prohibited content.

Use AI for constructive website-building tasks.

### Agent Task Completion

If an AI agent completes a task, it should clearly mark completion.

A completion marker may be used when required by the integration.

Example concept:

Task complete.

---

## 51. Code Manager

Code Manager is for advanced users who need direct control over project code files.

Use Code Manager when visual controls are not enough.

### Use Cases

Use Code Manager for:

- custom JavaScript
- custom CSS
- global code
- page-specific code
- debugging
- advanced integrations
- third-party snippets

### Safety Rules

Before editing code:

- save your project
- understand what the code affects
- test in preview
- avoid breaking page structure
- keep backups

---

## 52. CSS Editor

The CSS Editor is used for custom CSS.

Use custom CSS when:

- a style property is not available visually
- you need a complex selector
- you need a special effect
- you need a project-specific override

### Global CSS

Global CSS applies across pages.

Use it for:

- font-face rules
- keyframes
- base styles
- shared utilities
- global overrides

### Page CSS

Page CSS applies to a specific page.

Use it for page-specific adjustments.

### Keyframes and Animation Builder

If you create custom CSS keyframes, they belong to CSS animation behavior.

They are related to Animation Builder concepts.

They are not Motion Builder recipes.

---

## 53. Settings

Project settings control editor behavior and output behavior.

### Editor Settings

Examples:

- auto save
- lazy loading
- Prettier formatting
- Tailwind support
- Spline viewer
- Swiper support
- PetiteVue support
- GSAP support
- ScrollTrigger support
- SplitText support

### Motion-Related Settings

GSAP, ScrollTrigger, and SplitText settings affect Motion Builder.

They do not primarily affect Animation Builder.

If Motion Builder behavior is missing, check these settings.

### Output Settings

Examples:

- CSS purge
- optimize outlines
- disable will-change in editor
- remove GSAP markers on build
- stop all animations on page

### Script Settings

Examples:

- async header scripts
- defer header scripts
- async footer scripts
- defer footer scripts

### Export Settings

Examples:

- include symbols in export
- include blocks/templates in export
- include WordPress assets in export

### Build Settings

Examples:

- combine JS libraries
- combine CSS libraries
- combine header scripts
- combine footer scripts

---

## 54. Preview

Preview shows the page closer to the final visitor experience.

Use Preview to check:

- real spacing
- scripts
- CSS animations
- GSAP motions
- interactions
- dynamic content
- external resources
- responsive behavior
- fonts
- media
- forms
- navigation

### Preview vs Canvas

The canvas is for editing.

Preview is for verification.

Do not rely only on the canvas for final QA.

### Animation and Motion Preview

Animation Builder CSS animations may be visible in the canvas or preview.

Motion Builder behavior, especially ScrollTrigger, should be tested in Preview or Frontend view.

Scroll-based motion may not behave fully inside the editing canvas.

### Preview Checklist

Check:

- desktop layout
- tablet layout
- mobile layout
- navigation
- buttons
- links
- forms
- images
- videos
- sliders
- CSS animations
- GSAP motions
- dynamic queries
- pagination
- symbols
- templates
- fonts
- performance

---

## 55. Frontend View

Frontend view shows the project in a frontend context.

Use it to inspect the website closer to how an end user sees it.

Frontend view is useful for:

- runtime checks
- script behavior
- final layout
- interaction testing
- dynamic data testing
- Motion Builder testing

---

## 56. Save

Save your project often.

Save after:

- major layout changes
- adding reusable resources
- editing Animation Builder effects
- editing Motion Builder recipes
- editing interactions
- changing settings
- importing assets
- modifying code
- modifying dynamic queries
- modifying templates or symbols

For WordPress projects, saving may create a before_save state.

Publishing makes saved content live.

---

## 57. Share

Share allows sharing the project through supported services.

When sharing:

- a share URL can be generated
- the URL may be copied automatically
- shared links may expire after a limited time

Example expiration:

Shared URLs may expire after 60 minutes.

Confirm the share result before sending the link to someone.

---

## 58. Export

Export downloads project files.

Export can include:

- pages
- HTML
- CSS
- JavaScript
- global files
- project configuration
- symbols
- templates
- blocks
- WordPress assets

Export options depend on project settings.

### Export Checklist

Before exporting:

- save the project
- preview all pages
- check responsive layouts
- check dynamic content
- check CSS animations
- check GSAP motions
- remove unused resources
- confirm export settings
- test exported output if possible

---

## 59. Import

Import brings project or page files into the builder.

### Import Validation

Imported files must be valid.

Checks may include:

- valid JSON
- required fields exist
- page name exists
- paths exist
- HTML content exists
- no duplicate page name

If validation fails, the import is rejected.

---

## 60. Backup Strategy

For important projects, keep multiple backups.

### Full Project Backup

Use project export.

### Page Backup

Download important pages individually.

### Reusable Resource Backup

Export:

- symbols
- templates
- dynamic templates if supported

### Asset Backup

Keep original source files for important assets.

Examples:

- original images
- font files
- videos
- documents
- design sources

---

## 61. Component Object Reference

Inside Infinitely Studio, components are structured objects.

This section helps users and AI agents understand component data without editing source code.

### Component Fields

| Field | Purpose |
|---|---|
| tagName | HTML tag |
| type | Special component type |
| attributes | HTML attributes |
| classes | CSS classes |
| components | Child components |
| content | Text or raw content |

### Text Node Rule

Text should be placed inside a text node.

Do not put raw text directly as a child when a text node is expected.

Example concept:

A heading component contains a child text node with content Heading.

### Classes Rule

Classes should be a list of class names.

Example:

classes: p-10, card, text-center

### Attributes Rule

Attributes are key/value pairs.

Example attributes:

- href: /about
- target: _blank
- src: /image.jpg
- alt: Image description

### Component Example Concepts

Heading component concept:

- tagName: h1
- classes: p-10
- child text node: Heading

Input component concept:

- tagName: input
- attributes include placeholder: Type text here

Table component concept:

- type: table
- droppable areas: tbody, thead, tfoot
- classes: w-full

---

## 62. Dynamic Component Rules

When creating dynamic components, follow these rules.

1. Use text nodes for text.
2. Use arrays for classes.
3. Use key/value pairs for attributes.
4. Use tokens for dynamic values.
5. Use the correct loop variable inside loops.
6. Match pagination ID with query ID.
7. Use unique IDs for queries and pagination.
8. Use conditions to control visibility.
9. Use SSR for external API data.
10. Use symbols for reusable components.
11. Use templates for reusable sections.
12. Use dynamic templates for reusable dynamic logic.
13. Use Animation Builder for CSS animation behavior.
14. Use Motion Builder for GSAP motion behavior.
15. Use Interactions for event behavior.

---

## 63. Page Object Reference

A page object contains page data.

Important page concepts:

| Field | Purpose |
|---|---|
| name | Page name |
| html | Page HTML content |
| css | Page CSS content |
| js | Page JavaScript content |
| pathes | File paths for page assets |
| bodyAttributes | Body tag attributes |
| helmet | SEO/head metadata |

### Helmet Concepts

Helmet can include:

- title
- description
- author
- keywords
- custom meta tags

### Page Paths

Page paths define where page files are stored.

Examples:

- editor/pages/name.html
- css/name.css
- js/name.js

---

## 64. Project Data Concepts

A project can contain:

- pages
- dynamic templates
- symbols
- templates
- commands
- interactions
- motions
- fonts
- libraries
- files
- settings
- AI chats
- theme data
- WordPress metadata
- current editing page
- current page meta

### Motion Data

Motion data belongs to Motion Builder.

It may include motion recipes and motion instances.

Do not store Motion Builder recipes as simple CSS animation data.

### Interaction Data

Interaction data belongs to Interactions.

It may include event triggers and commands.

Do not store Interaction data as Motion Builder data.

### Pages vs Dynamic Templates

Pages use page storage.

Dynamic templates use dynamic template storage.

When editing commands or dynamic logic, the builder may save to either pages or dynamicTemplates depending on context.

---

## 65. Commands Panel

The Commands panel lets you create and manage command sequences.

### Command Management Actions

You can:

- add command
- remove command
- duplicate command
- copy commands
- paste commands
- clear all commands
- edit command parameters
- reorder commands

### Copy Commands

Use copy commands to copy command data to the clipboard.

### Paste Commands

Use paste commands to restore copied command data.

Pasting may replace current commands if the pasted data is valid.

### Clear All Commands

Use clear all commands to remove all commands.

Confirm before clearing.

---

## 66. Command Script Concepts

Commands can be represented as readable instructions.

Examples:

- set $name to value
- add .active to .menu
- remove .hidden from .panel
- append message to .log
- remove .old-banner

Commands can be chained.

A chain can use then logic between steps.

Example concept:

add .loading to .button then hide .error then show .success

---

## 67. Interactions Panel

The Interactions panel manages interaction recipes.

Each interaction can have:

- ID
- trigger
- commands
- target selectors
- variables
- conditions
- enabled state

### Interaction Instance Concepts

An interaction can be applied to elements using attributes.

An element may reference:

- interaction ID
- main interaction ID
- interaction instance ID

This allows reusable interaction logic.

### Mark Used Interactions

When an interaction is attached to an element, it can be marked as used.

This helps identify unused interactions.

---

## 68. Motion Builder Panel

The Motion Builder panel manages GSAP motion recipes.

Each motion can contain:

- ID
- motion steps
- timeline settings
- split text settings
- trigger settings
- instances
- scroll trigger settings

### Motion Editing

You can edit:

- duration
- delay
- ease
- from values
- to values
- transform values
- opacity
- scale
- rotation
- x position
- y position
- stagger
- scroll trigger start/end
- scrub
- pin

### Timeline Motions

Use timelines when multiple motion steps must run in sequence.

Example:

1. Fade in title.
2. Move subtitle upward.
3. Scale button slightly.

### Split Text Motions

Use split text for text motion.

Choose split type:

- chars
- words
- lines

Then animate each piece.

Example:

Fade in each word with stagger.

### Motion Instances

Use instances to reuse a motion.

You can:

- edit main motion
- edit instance
- copy instance ID
- clone motion to another element
- remove instance
- remove main motion

### Motion Attributes Applied to Elements

The builder applies Motion Builder results using:

- motion-id
- motion-instance-id

These attributes connect the element to the motion recipe.

Do not confuse these with CSS animation styles.

---

## 69. Animation Builder Panel

The Animation Builder panel manages CSS-based animation behavior.

It may manage:

- animation presets
- animation styles
- keyframe references
- duration
- delay
- iteration
- direction
- fill mode
- play state

### Animation Editing

You can edit:

- animation name
- duration
- delay
- timing function
- iteration count
- direction
- fill mode
- play state

### Animation Presets

Common presets may include:

- spin
- ping
- pulse
- bounce

### Animation Output

Animation Builder output usually appears as:

- CSS classes
- CSS animation styles
- utility animation classes

It does not appear as:

- motion-id
- motion-instance-id
- v-gsap
- ScrollTrigger settings
- SplitText settings

---

## 70. Styles Panel Details

The Styles panel supports selector-based editing.

### Current Selector

The current selector may be based on:

- selected element
- class selector
- state selector
- media condition

### Media Conditions

Styles can depend on media conditions.

Examples:

- desktop
- tablet
- mobile
- custom width
- custom height
- dark mode
- print
- pointer coarse
- pointer fine

### State Selectors

State selectors can include:

- hover
- focus
- active
- visited
- disabled
- first-child
- last-child
- before
- after

### Copy Styles Behavior

Copy styles uses the current selector and media context.

If no styles exist, copying is not possible.

### Paste Styles Behavior

Paste styles overwrites existing styles after confirmation.

---

## 71. Class Management Details

The builder can collect classes from multiple sources:

- editor CSS
- CSS libraries
- inline styles
- page styles

This helps provide class suggestions when assigning classes.

### Class Suggestions

When selecting a class, the builder may suggest classes already present in the project.

Use suggestions to maintain consistency.

### Class Naming Tips

Use short, meaningful names.

Good examples:

- btn
- btn-primary
- card
- section-title
- nav-link
- footer-grid

Avoid overly generic or confusing names.

---

## 72. Media Query and Device Details

The builder supports responsive editing through device views and media conditions.

### Common Breakpoint Concepts

| Device | Typical Use |
|---|---|
| Desktop | Large screens |
| Tablet | Medium screens |
| Mobile | Small screens |

### Custom Media Conditions

Additional conditions may include:

- dark mode
- print
- pointer coarse
- pointer fine
- pointer none
- inverted colors
- forced colors

Use these when designing for special environments.

---

## 73. Accessibility Guide

Accessibility helps make websites usable for more people.

### Use Semantic Elements

Use meaningful elements for content.

Examples:

- heading for titles
- nav for navigation
- button for actions
- link for navigation links
- label for form fields
- section for grouped content

### Use Alt Text

Images should have meaningful alt text.

Example:

alt: Product dashboard screenshot

For decorative images, use empty alt text.

### Use Readable Text

Ensure:

- enough font size
- enough contrast
- clear line height
- readable paragraph width

### Use Accessible Forms

Forms should have:

- labels
- placeholders as help only
- clear error messages
- required indicators
- accessible input types

### Use Keyboard-Friendly Interactions

Interactive elements should work with keyboard navigation.

Check:

- focus states
- tab order
- buttons
- menus
- modals
- links

### Do Not Rely Only on Color

Do not use color alone to communicate meaning.

Add text, icons, or labels.

### Motion Accessibility

Be careful with strong motion.

For users who prefer reduced motion:

- avoid excessive scroll motion
- avoid heavy parallax
- avoid rapid flashing
- provide simple fallbacks when possible

CSS animations may be easier to disable or reduce than complex Motion Builder sequences.

---

## 74. Performance Guide

Performance affects user experience and SEO.

### Reduce Libraries

Install only necessary libraries.

### Optimize Images

Use appropriate image sizes and formats.

### Test Animation and Motion

Heavy CSS animations can affect performance.

Heavy GSAP motions can affect performance more, especially on mobile.

Use Motion Builder carefully on large sections and mobile devices.

### Check External Resources

External iframes, videos, fonts, and 3D scenes can slow pages.

### Use Lazy Loading

Use lazy loading for images and heavy content when appropriate.

### Bundle Carefully

Bundling can reduce requests but may increase file size.

Test after bundling.

---

## 75. Preview QA Checklist

Before publishing or exporting, check:

### Content

- spelling
- headings
- links
- images
- forms
- buttons

### Layout

- spacing
- alignment
- wrapping
- overflow
- stacking

### Responsive

- desktop
- tablet
- mobile
- custom widths

### Dynamic Data

- tokens resolve
- queries return data
- loops render correctly
- conditions work
- pagination works
- SSR data loads

### Animation Builder

- CSS animation plays correctly
- duration is correct
- repeat behavior is correct
- animation does not block interaction
- animation does not cause layout issues

### Motion Builder

- motion-id is attached correctly
- motion-instance-id is correct when used
- GSAP is enabled
- ScrollTrigger is enabled if needed
- SplitText is enabled if needed
- motion works in preview
- scroll behavior works
- loop items initialize correctly

### Interactions

- click behavior works
- hover behavior works
- menus open/close
- classes toggle correctly
- variables update correctly
- commands run correctly

### Performance

- page loads quickly
- media is optimized
- scripts are necessary
- fonts load correctly

### Accessibility

- alt text exists
- labels exist
- focus states exist
- contrast is sufficient
- motion is not excessive

---

## 76. Troubleshooting

### Element Cannot Be Selected

Solutions:

- use Layers
- select parent first
- check if element is hidden
- check if another element covers it
- rename layers for clarity

### Styles Do Not Apply

Solutions:

- check selected element
- check device view
- check state selector
- check class overrides
- check media condition

### Dynamic Content Does Not Appear

Solutions:

- check token path
- check data source
- check loop variable
- check condition
- check query ID
- check pagination ID
- check API response

### Query Returns No Results

Solutions:

- check post type
- check posts per page
- check filters
- check meta query
- check taxonomy query
- check ordering
- check published status

### Pagination Does Not Work

Solutions:

- match query ID and pagination ID
- ensure query returns enough items
- ensure pagination component exists
- check pagination links tokens

### Animation Builder Does Not Work

Solutions:

- check animation name or preset
- check duration
- check delay
- check iteration count
- check play state
- check class conflicts
- check keyframe availability
- check if the element has display none
- test in Preview

### Motion Builder Does Not Work

Solutions:

- check motion-id
- check motion-instance-id
- check GSAP is enabled
- check ScrollTrigger is enabled if needed
- check SplitText is enabled if needed
- check target element exists
- check loop scopes
- check v-scope and v-effect if inside a loop
- test in Preview or Frontend view

### Interaction Does Not Work

Solutions:

- check interaction-id
- check main-interaction-id
- check interaction-instance-id
- check trigger event
- check command target selectors
- check variables
- check command order
- test in Preview

### Library Does Not Work

Solutions:

- check installed list
- check header/footer placement
- check async/defer
- check load order
- check module/classic script compatibility

### Fonts Do Not Appear

Solutions:

- check font installed
- check font family name
- check font weight
- check font file format
- reload page

### WordPress Save Fails

Solutions:

- check connection
- check application password
- check permissions
- check network
- check WordPress REST API availability

### Import Fails

Solutions:

- check file validity
- check required fields
- check duplicate page name
- check paths
- use a valid exported file

---

## 77. Best Practices

### Structure First

Build structure before fine styling.

Recommended order:

1. sections
2. containers
3. content blocks
4. typography
5. spacing
6. layout
7. responsive adjustments
8. interactions
9. Animation Builder effects
10. Motion Builder effects
11. final QA

### Reuse Wisely

Use templates for repeated sections.

Use symbols for repeated components.

Use classes for repeated styles.

Use dynamic templates for repeated dynamic logic.

Use motion instances for reused GSAP motion recipes.

### Name Things Clearly

Use clear names for:

- pages
- templates
- symbols
- classes
- variables
- commands
- interactions
- motions

### Keep Projects Organized

Remove unused:

- pages
- templates
- symbols
- libraries
- fonts
- commands
- interactions
- motions
- CSS animations

### Test Often

Preview after major changes.

Test on multiple devices.

Test dynamic content with real data.

Test Motion Builder in Preview or Frontend view.

### Save Before Big Changes

Save or export before:

- deleting resources
- refactoring layout
- changing settings
- editing code
- importing files
- updating libraries
- deleting motions or interactions

---

## 78. AI Agent Workflow

This section is for AI agents working with Infinitely Studio.

### Agent Priorities

When helping a user, an AI agent should:

1. Understand the requested page or component.
2. Identify required blocks.
3. Use existing reusable resources if available.
4. Use correct traits and attributes.
5. Use tokens for dynamic content.
6. Use loops for repeated data.
7. Use conditions for visibility rules.
8. Use queries for WordPress content.
9. Use pagination with matching IDs.
10. Use responsive styles for all devices.
11. Avoid unnecessary code.
12. Prefer visual builder features when possible.
13. Use Animation Builder for CSS animation behavior.
14. Use Motion Builder for GSAP motion behavior.
15. Use Interactions for event behavior.

### Agent Animation Decision Rule

If the user asks for:

- spin
- pulse
- ping
- bounce
- simple CSS animation
- lightweight repeating effect

Use Animation Builder.

If the user asks for:

- scroll reveal
- scroll scrub
- pinned section
- split text
- timeline motion
- GSAP effect
- motion recipe
- motion instance

Use Motion Builder.

If the user asks for:

- click to open
- hover to show
- submit action
- class toggle
- navigate on click
- set variable on event

Use Interactions.

### Agent Content Rules

An agent should:

- stay focused on website building
- avoid unrelated topics
- avoid inappropriate content
- avoid unsafe or prohibited content
- produce clear, practical builder instructions

### Agent Output Style

An agent should provide:

- clear steps
- component structure
- trait values
- style values
- token paths
- example content
- responsive notes
- accessibility notes
- correct builder system names

### Agent Checklist Before Completion

Before marking a task complete, check:

- page purpose is satisfied
- selected elements are correct
- traits are configured
- styles are responsive
- tokens are valid
- loops are correct
- conditions are correct
- reusable resources are used appropriately
- no unnecessary duplication exists
- Animation Builder and Motion Builder are not mixed
- preview is recommended

---

## 79. Common Workflows

### Workflow: Build a Hero Section

1. Add a Section.
2. Add a Container.
3. Add a Heading.
4. Add a Text block.
5. Add a Button.
6. Style typography.
7. Style spacing.
8. Add background.
9. Adjust tablet and mobile.
10. Add hover state to button.
11. Add Motion Builder fade-up if advanced motion is needed.
12. Save.

### Workflow: Build a Card Grid

1. Add a Section.
2. Add a Container.
3. Add a grid wrapper.
4. Add a card component.
5. Style the card.
6. Duplicate the card or use a loop.
7. Set responsive grid columns.
8. Add Motion Builder scroll reveal if needed.
9. Save.

### Workflow: Build a WordPress Post List

1. Add a Section.
2. Add a Container.
3. Add a query container.
4. Enable Inf Query.
5. Set post type to post.
6. Set posts per page.
7. Set query ID.
8. Set query item variable.
9. Add article structure.
10. Add title, excerpt, image, and link tokens.
11. Add pagination with matching ID.
12. Save.

### Workflow: Build a Product Loop from API

1. Add SSR container.
2. Set API URL.
3. Set method.
4. Set response path.
5. Add child loop.
6. Set SSR loop path.
7. Set item variable.
8. Add product title, price, and image tokens.
9. Save.

### Workflow: Build a Slider

1. Add Slider block.
2. Add slides.
3. Add images or content to slides.
4. Enable navigation.
5. Enable pagination.
6. Configure autoplay if needed.
7. Test mobile behavior.
8. Save.

### Workflow: Build a Reusable Button Symbol

1. Create button structure.
2. Style the button.
3. Add hover state.
4. Convert to Symbol.
5. Name it clearly.
6. Reuse it across pages.

### Workflow: Build a Dark Mode Toggle

1. Add toggle button.
2. Create theme variables.
3. Add interaction on click.
4. Call setUserTheme or setUserMode.
5. Test light and dark styles.
6. Save.

### Workflow: Build a Simple CSS Pulse Effect

1. Select badge or icon.
2. Open Animation Builder.
3. Choose pulse or define CSS pulse animation.
4. Set duration.
5. Set infinite repeat if needed.
6. Preview.
7. Save.

### Workflow: Build a Scroll Reveal with Motion Builder

1. Select card or section.
2. Open Motion Builder.
3. Create motion recipe.
4. Set opacity from 0 to 1.
5. Set y from 40 to 0.
6. Enable ScrollTrigger.
7. Set start when element enters viewport.
8. Save.
9. Test in Preview.

### Workflow: Build a Split Text Heading Motion

1. Select heading.
2. Open Motion Builder.
3. Enable SplitText.
4. Choose words or characters.
5. Set stagger.
6. Set fade or slide values.
7. Save.
8. Test in Preview.

---

## 80. Examples by Feature

### Text Example

Use a Text block for paragraphs.

Content example:

Build responsive websites visually.

Style example:

- font size: 16px
- line height: 1.7
- color: gray

### Heading Example

Use Heading for titles.

Content example:

Welcome to Our Studio

Style example:

- font size: 48px
- font weight: bold
- text align: center

### Button Example

Label example:

Get Started

Attributes example:

- href: /contact
- target: _self

Style example:

- padding: 12px 24px
- radius: 8px
- background: brand color
- hover: darker background

### Image Example

Attributes example:

- src: /images/hero.jpg
- alt: Hero visual
- loading: lazy

Style example:

- width: 100%
- object-fit: cover
- radius: 12px

### Input Example

Attributes example:

- type: email
- name: email
- placeholder: Enter your email
- required: true

### Video Example

Attributes example:

- src: /videos/intro.mp4
- controls: true
- muted: true
- loop: true

### Iframe Example

Attributes example:

- src: external embed URL
- title: Embedded content

Check embedding permissions before publishing.

### Loop Example

Loop over items:

Array token: {{ items }}

Item variable: item

Use:

- {{ item.title }}
- {{ item.description }}

### Condition Example

Show only when user role includes administrator.

### Query Example

Query latest posts:

- post type: post
- posts per page: 6
- orderby: date
- order: DESC

Item variable: article

Use:

- {{ article.title }}
- {{ article.excerpt }}
- {{ article.url }}

### Pagination Example

Query ID: latest_posts

Pagination ID: latest_posts

Use:

- previous link
- page number loop
- next link

### SSR Example

Fetch external products.

URL:

https://api.example.com/products

Response path:

data.products

Item variable:

product_loop

Use:

- {{ product_loop.name }}
- {{ product_loop.price }}

### Animation Builder Example

Pulse notification badge.

Settings:

- animation: pulse
- duration: 2s
- iteration: infinite
- timing: ease-in-out

### Motion Builder Example

Fade up hero title.

Settings:

- opacity from 0 to 1
- y from 30 to 0
- duration 0.8
- ease power2.out

### Motion Builder Scroll Example

Reveal card on scroll.

Settings:

- start when element enters viewport
- opacity from 0 to 1
- y from 40 to 0

### Interaction Example

Click a button to open a menu.

Trigger:

click

Command:

add .open to .menu

---

## 81. Quick Reference Tables

### Main Panels

| Panel | Purpose |
|---|---|
| Blocks | Add components |
| Layers | Manage hierarchy |
| Pages | Manage pages |
| Styles | Edit visual styles |
| Traits | Edit attributes and settings |
| Animation Builder | Manage CSS animation behavior |
| Motion Builder | Manage GSAP motion recipes |
| Interactions | Manage event behavior |
| Symbols & Templates | Manage reusable resources |
| Dynamic Templates | Manage dynamic reusable resources |
| REST API Models | Manage API sources |
| Library Installer | Manage libraries |
| Fonts Installer | Manage fonts |
| Files Manager | Manage files |
| Settings | Manage project settings |

### Main Actions

| Action | Purpose |
|---|---|
| Save | Store changes |
| Preview | Test page |
| Frontend | View frontend context |
| Export | Download project |
| Share | Share project |
| Download Page | Export one page |
| Upload Page | Import one page |

### Dynamic Attributes

| Attribute | Purpose |
|---|---|
| inf-for | Loop |
| inf-for-item | Loop item variable |
| inf-for-index | Loop index variable |
| inf-if-json | Condition |
| inf-query | WordPress query |
| inf-query-id | Query identifier |
| inf-query-item | Query item variable |
| inf-pagination | Enable pagination |
| inf-pagination-id | Pagination identifier |
| inf-ssr | Server-side fetch |
| ssr-loop | SSR loop path |
| ssr-for-item | SSR item variable |
| inf-symbol-id | Symbol reference |

### Motion Attributes

| Attribute | Purpose |
|---|---|
| motion-id | Motion recipe reference |
| motion-instance-id | Motion instance reference |

### Interaction Attributes

| Attribute | Purpose |
|---|---|
| interaction-id | Interaction reference |
| main-interaction-id | Parent interaction reference |
| interaction-instance-id | Interaction instance reference |

### WordPress Query Fields

| Field | Purpose |
|---|---|
| post_type | Content type |
| posts_per_page | Number of items |
| offset | Skip items |
| paged | Pagination page |
| orderby | Sort field |
| order | Sort direction |
| ignore_sticky_posts | Sticky post behavior |
| meta_query | Meta filtering |
| tax_query | Taxonomy filtering |
| cache_results | Caching |

### Meta Compare Operators

| Operator | Meaning |
|---|---|
| = | Equals |
| != | Not equals |
| > | Greater than |
| >= | Greater or equal |
| < | Less than |
| <= | Less or equal |
| LIKE | Contains |
| NOT LIKE | Not contains |
| IN | In list |
| NOT IN | Not in list |
| BETWEEN | Between |
| NOT BETWEEN | Not between |
| EXISTS | Exists |
| NOT EXISTS | Does not exist |

### Meta Types

| Type | Meaning |
|---|---|
| CHAR | Text |
| NUMERIC | Numeric |
| DECIMAL | Decimal |
| SIGNED | Signed integer |
| UNSIGNED | Unsigned integer |
| DATE | Date |
| DATETIME | Date/time |
| TIME | Time |
| BINARY | Binary |

### Order By Values

| Value | Meaning |
|---|---|
| date | Date |
| modified | Modified date |
| title | Title |
| name | Slug |
| ID | Post ID |
| author | Author |
| parent | Parent |
| menu_order | Menu order |
| comment_count | Comment count |
| relevance | Search relevance |
| rand | Random |
| meta_value | Meta value |
| meta_value_num | Numeric meta value |
| post__in | Included posts order |
| none | No ordering |

---

## 82. Do and Do Not Rules

### Do

- select elements before editing
- use Layers for nested elements
- use classes for repeated styles
- use responsive views
- use tokens for dynamic values
- use unique IDs for queries and pagination
- use templates and symbols for reuse
- use Animation Builder for CSS animations
- use Motion Builder for GSAP motions
- use Interactions for event behavior
- preview before publishing
- export backups before major changes
- keep names clear

### Do Not

- do not rely only on canvas for final QA
- do not duplicate styles unnecessarily
- do not use wrong loop variables
- do not forget matching query/pagination IDs
- do not publish without preview
- do not install unnecessary libraries
- do not use untrusted HTML content
- do not delete reusable resources without checking usage
- do not edit files without saving backups
- do not describe Motion Builder as Animation Builder
- do not describe Animation Builder as Motion Builder
- do not manually add motion attributes without knowing the recipe ID

---

## 83. Glossary

| Term | Meaning |
|---|---|
| Workspace | Project management screen |
| Canvas | Visual editing area |
| Page | Editable document |
| Block | Draggable building piece |
| Component | Page element |
| Layer | Hierarchy item |
| Trait | Element property |
| Class | Reusable style selector |
| State | Style condition |
| Symbol | Reusable named component |
| Template | Reusable saved section |
| Dynamic Template | Reusable dynamic resource |
| Token | Dynamic placeholder |
| Query | Content request |
| Loop | Repeated rendering |
| Condition | Visibility rule |
| Pagination | Page navigation |
| SSR | Server-side fetch |
| Animation Builder | CSS-based animation system |
| Motion Builder | GSAP-based motion recipe system |
| Motion | GSAP motion recipe |
| Motion Instance | Specific application of a motion recipe |
| Interaction | Event behavior |
| Command | Action instruction |
| OPFS | Local browser file storage |
| Helmet | Head/SEO metadata |
| Save State | Saved or before_save status |

---

## 84. Final Cheat Sheet

| Need | Use |
|---|---|
| Create project | Workspace |
| Add content | Blocks |
| Select nested element | Layers |
| Edit element properties | Traits |
| Edit visual design | Styles |
| Reuse style | Classes |
| Hover/focus styles | States |
| Repeated section | Template |
| Repeated component | Symbol |
| Dynamic reusable content | Dynamic Template |
| WordPress posts | Inf Query |
| Repeat items | Inf For |
| Show/hide conditionally | Inf If |
| Page navigation | Inf Pagination |
| External API data | Inf SSR |
| Simple CSS animation | Animation Builder |
| Spin/pulse/ping/bounce | Animation Builder |
| GSAP motion | Motion Builder |
| Scroll reveal | Motion Builder |
| Scroll scrub | Motion Builder |
| Pinned section | Motion Builder |
| Split text heading | Motion Builder |
| Click behavior | Interactions |
| Event commands | Interactions |
| External libraries | Library Installer |
| Fonts | Fonts Installer |
| Project files | Files Manager |
| WordPress tools | WordPress panel |
| AI help | Infinitely AI |
| Project options | Settings |
| Test result | Preview |
| Make live | Save/Publish |
| Download | Export |
| Send to others | Share |

---

## 85. Recommended Working Order

For any new page, use this order:

1. Create or open the project.
2. Create the page.
3. Add page settings and SEO metadata.
4. Add main sections.
5. Add containers and blocks.
6. Add content.
7. Configure traits and attributes.
8. Apply styles.
9. Create reusable classes.
10. Adjust responsive views.
11. Add symbols or templates if needed.
12. Add dynamic data if needed.
13. Add interactions if needed.
14. Add Animation Builder effects if lightweight CSS animation is needed.
15. Add Motion Builder effects if advanced GSAP motion is needed.
16. Preview.
17. Fix issues.
18. Save.
19. Export or publish.

---

## 86. Summary

Infinitely Studio is a complete visual builder for creating websites using pages, blocks, styles, traits, layers, reusable resources, dynamic data, Animation Builder, Motion Builder, interactions, libraries, fonts, files, and WordPress integration.

The corrected separation is:

Animation Builder = CSS-based animation behavior.

Motion Builder = GSAP-based motion recipe behavior.

Interactions = event-driven command behavior.

The most important workflow is:

Select an element, edit its traits, style it, make it responsive, reuse it when needed, connect dynamic data when needed, choose the correct animation or motion system, preview carefully, then save or publish.