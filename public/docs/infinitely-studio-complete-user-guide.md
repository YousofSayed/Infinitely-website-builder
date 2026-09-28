# Infinitely Studio — Complete User Guide

> A single user-facing reference for building, editing, managing, exporting, and publishing websites with Infinitely Studio.
>
> This guide describes the builder as it currently behaves. It focuses on what a user can do and how to do it, not on React, TypeScript, GrapesJS, workers, databases, or internal implementation.

---

## 1. What Infinitely Studio Is

Infinitely Studio is a visual website builder for creating websites by assembling blocks, editing elements visually, styling them, managing pages, adding interactions and animations, and exporting or connecting projects to WordPress.

The builder supports two main project contexts:

- **Normal project** — the website is edited and stored locally as an Infinitely Studio project.
- **WordPress project** — the builder connects to a WordPress website and can work with WordPress pages, media, dynamic content, queries, templates, symbols, and publishing-related features.

The same editor experience contains most of the normal visual-building tools, while WordPress projects expose additional WordPress-specific controls.

---

# 2. The Basic Builder Workflow

A typical website-building workflow is:

1. Open the **Workspace**.
2. Create a new project.
3. Choose the project type.
4. Open a page.
5. Add blocks/components to the canvas.
6. Select elements and edit their content.
7. Configure attributes and traits.
8. Style the selected element.
9. Arrange the page using Layers.
10. Repeat for other pages.
11. Add responsive styles for desktop, tablet, and mobile.
12. Add animations or interactions when needed.
13. Create reusable Symbols or Templates for repeated content.
14. Add assets, fonts, libraries, or custom code when needed.
15. Configure page settings/SEO metadata.
16. Save, preview, export, share, or publish depending on the project type.

---

# 3. Workspace

The Workspace is the project-level screen shown before entering a project.

## 3.1 Create a New Site

Use **New site** in the Workspace.

A new project can contain information such as:

- Project name
- Project description
- Project type

For a normal project, the project is created locally.

For a WordPress project, additional connection information is required.

---

## 3.2 Search Projects

The Workspace has a project search field.

Use it to quickly filter the project list by project name.

Search is useful when many projects exist.

---

## 3.3 Open an Existing Project

Select a project from the Workspace to open it in the editor.

The project keeps its own pages, blocks, reusable resources, settings, and other project data.

---

## 3.4 WordPress Project Creation

When creating a WordPress project, provide:

- WordPress website URL
- Username
- Password

Infinitely Studio validates the website URL and attempts to connect to the WordPress website.

After a successful connection, Infinitely Studio checks the site's Infinitely configuration and initializes the project.

If the connection fails, check:

- Website URL
- Username
- Password
- WordPress availability
- Network connectivity
- WordPress configuration required by the project

---

# 4. Understanding the Editor

The editor is divided into several working areas.

The exact arrangement can vary depending on the active view, but the important areas are:

- **Top editor toolbar**
- **Left-side builder panels**
- **Main canvas**
- **Right-side editing panels**
- **Pages**
- **Layers**
- **Blocks**
- **Traits**
- **Styles**
- **Assets**
- **Reusable resources**
- **WordPress tools**
- **Themes**
- **AI**
- **Settings**
- **Code**
- **Preview/export controls**

The most important rule is:

> Select an element first, then use the editing panels to change that element.

---

# 5. Canvas

The canvas is the visual website area where the page is built.

You can:

- Select elements.
- Move elements.
- Add blocks.
- Edit editable text.
- Change styles.
- Change element properties.
- Reorder content.
- Create reusable resources.
- Configure responsive behavior.
- Add animations and interactions.

The canvas reflects the current page and the currently selected responsive device.

---

# 6. Responsive Devices

The top toolbar provides responsive device controls.

Available standard device views include:

- **Desktop**
- **Tablet**
- **Mobile**

The standard device controls represent:

- Desktop: default/full editor width
- Tablet: up to approximately **900px**
- Mobile: up to approximately **360px**

The editor can also detect and expose additional media-query breakpoints when they exist in the project.

---

## 6.1 Editing a Responsive Version

To edit a responsive state:

1. Select the desired device.
2. Select an element.
3. Change its style or layout.
4. Check the canvas at the selected size.
5. Repeat for other devices as required.

Responsive styles should be tested across all relevant device sizes.

---

## 6.2 Custom Width and Height

The toolbar provides width and height controls for the editor viewport.

These are useful when testing a design at a specific viewport size.

---

## 6.3 Media Condition

The responsive toolbar can use:

- `min-width`
- `max-width`

This controls how responsive media rules are interpreted when working with custom breakpoints.

---

## 6.4 Zoom

The editor also provides a **Zoom** value.

Zoom changes how large the editor canvas appears on screen.

It does not mean that the website's CSS `zoom` property has been intentionally added to your published design; it is primarily an editor viewing control.

---

# 7. Pages

A project can contain multiple pages.

Open the **Pages** manager from the editor navigation.

The Pages manager provides:

- Search
- Create page
- Upload pages
- Page list
- Page settings
- Page download
- Page deletion

---

## 7.1 Create a Page

1. Open **Pages**.
2. Enter a page name in **Page Name**.
3. Click the create-page button or press Enter.

The new page becomes part of the project.

---

## 7.2 Search Pages

Use the Pages search field to find a page by name.

This is useful when a project contains many pages.

---

## 7.3 Page Settings

Each page has a settings action.

Use it to access page-specific configuration such as page/head information managed by the builder.

The page settings workflow is separate from the visual content itself.

---

## 7.4 Download a Page

Each page provides a **Download page** action.

Use it when you want to export that page's page data.

---

## 7.5 Upload Pages

The Pages manager supports uploading page JSON files.

1. Open **Pages**.
2. Choose **Upload pages**.
3. Select one or more `.json` files.
4. Let Infinitely Studio import the pages.

Use this for moving page definitions between compatible projects/workflows.

---

## 7.6 Deleting Pages

Pages have a delete action.

The normal project's **Index** page is protected from deletion.

Before deleting a page, make sure no important content or navigation depends on it.

---

# 8. Blocks

Blocks are the main building pieces of a page.

Open the **Blocks** panel to browse the available blocks.

Blocks are organized into categories.

Typical built-in building blocks include elements such as:

- Section
- Container
- Text
- Heading
- Link
- Button
- Image
- Media
- Video
- Audio
- Input
- Filter/Input controls
- Slider
- Iframe
- SVG
- Splitter
- Spline scene
- Dynamic content
- Looper
- Load More
- Next/Previous
- Symbols
- Templates

The exact list can grow as additional block types or project resources are available.

---

## 8.1 Add a Block

The normal workflow is:

1. Open **Blocks**.
2. Find a block category.
3. Find the desired block.
4. Drag it onto the canvas.
5. Drop it where you want it.

After dropping the block, select it and configure it using the editing panels.

---

## 8.2 Search Blocks

Use the Blocks search field to find blocks quickly.

Search is especially useful when the project contains many custom blocks, Symbols, or Templates.

---

## 8.3 Block Categories

Blocks can appear under categories.

A reusable resource may use a custom category, while built-in blocks are grouped into their own categories.

When a Template or Symbol is created, it can become available through the Blocks system.

---

# 9. Selecting Elements

Most editing operations begin by selecting an element on the canvas.

After selecting an element, Infinitely Studio can expose:

- Element content
- Traits
- Attributes
- Styles
- Classes
- States
- Layers
- Animations
- Interactions
- Reusable-resource tools

If a control seems unavailable, first verify that the correct element is selected.

---

# 10. Traits

Traits are element-specific controls.

Traits are useful for changing properties that are not necessarily ordinary CSS styles.

Depending on the selected component, a trait can provide:

- Text inputs
- Numbers
- Select controls
- Checkboxes
- Color controls
- Media/file selection
- Buttons
- Objects
- Arrays
- Dynamic values
- Commands
- Other specialized controls

Open the **Traits** area after selecting an element.

---

## 10.1 Type Content

For editable elements, Infinitely Studio can expose a **Type Content** area.

This allows you to edit content directly when the selected component supports editable content.

---

## 10.2 Props (Advanced)

The Traits panel can expose **Props (Advanced)**.

This area is intended for component properties that require more direct control than normal user-facing traits.

Use it carefully because changing advanced properties can affect how a component behaves.

---

## 10.3 Attributes

The Traits panel also provides an **Attributes** section.

You can:

- Inspect existing attributes.
- Edit attribute values.
- Add attributes.
- Remove attributes.

Examples of common HTML attributes include:

- `id`
- `class`
- `title`
- `href`
- `target`
- `src`
- `alt`
- `aria-*`
- `data-*`

The exact attributes available depend on the selected element.

---

# 11. Content Editing

When an element supports editable content:

1. Select the element.
2. Open its content controls.
3. Enter or edit the content.
4. Confirm that the content appears correctly on the canvas.

For text-based content, use semantic elements such as headings, paragraphs, links, and buttons appropriately.

---

# 12. Styles

The **Styles** area controls the visual appearance of the selected element.

The style system is organized into sections such as:

- Layout
- Typography
- Size
- Spacing
- Background
- Border
- Border radius
- Positioning
- Effects
- Other CSS properties

The exact controls shown depend on the selected element and active style state.

---

# 13. Classes

The Style area provides a **Classes** section.

Classes are useful when multiple elements should share styling.

A class can contain CSS rules that apply to every element using that class.

Typical workflow:

1. Select an element.
2. Open **Classes**.
3. Add/select a class.
4. Edit its styles.
5. Apply the same class to other elements when needed.

This is preferable to duplicating the same styles across many elements when the design intentionally shares them.

---

# 14. States

The Style area also provides **States**.

States allow styling behavior for different interaction conditions.

Depending on the available component/state configuration, examples can include states such as:

- Normal
- Hover
- Active
- Focus
- Other supported states

Use states when the appearance should change according to user interaction rather than creating separate elements.

---

# 15. Layout

The Layout controls are used to manage how elements are arranged.

Depending on the selected element, layout controls can include:

- Display
- Width
- Height
- Position
- Flex
- Grid
- Alignment
- Direction
- Gap
- Child behavior

---

# 16. Flex Layout

Flexbox controls can be used for parent containers and their children.

Typical flex concepts include:

- Direction
- Justification
- Alignment
- Wrapping
- Gap
- Child sizing
- Growth
- Shrinking
- Basis
- Order

A common workflow is:

1. Select the parent container.
2. Set its display/layout to flex.
3. Choose row or column direction.
4. Set alignment.
5. Set justification.
6. Set gap.
7. Select children if individual child sizing is required.

---

# 17. Grid Layout

Grid controls can be used to create multi-column or multi-row layouts.

Typical workflow:

1. Select the parent.
2. Enable grid layout.
3. Configure columns/rows.
4. Set gaps.
5. Configure child placement or sizing when required.

Grid is useful for cards, galleries, dashboards, product layouts, and structured sections.

---

# 18. Spacing

Spacing controls include the box-model concepts:

- Margin
- Padding

Use padding for internal space inside an element.

Use margin for external space around an element.

Responsive values can be adjusted independently when the design requires different spacing on smaller screens.

---

# 19. Size

Size controls can configure dimensions such as:

- Width
- Height
- Minimum width
- Maximum width
- Minimum height
- Maximum height

Use responsive device views to test whether fixed dimensions still behave correctly on smaller screens.

---

# 20. Positioning

Positioning controls are used when an element needs special placement.

Depending on the selected element, controls can include:

- Position mode
- Top
- Right
- Bottom
- Left
- Z-index
- Related positioning settings

Use positioning carefully for responsive designs because absolute/fixed placement can behave differently at different viewport sizes.

---

# 21. Typography

Typography controls can change text appearance.

Common typography controls include:

- Font family
- Font size
- Font weight
- Line height
- Letter spacing
- Text alignment
- Text decoration
- Text transformation
- Text color

Typography should be checked at desktop, tablet, and mobile widths.

---

# 22. Fonts

Infinitely Studio includes font-management tools.

The editor provides access to:

- Installed fonts
- Font installation
- Google Fonts-related tools
- Custom font tools

Use the font tools when the project needs typography that is not already available.

---

# 23. Colors

Color controls are available for supported style properties.

They can be used for:

- Text color
- Background color
- Border color
- Gradient colors
- Other supported color properties

---

# 24. Backgrounds

Background controls can configure visual backgrounds.

Depending on the selected element, you can work with:

- Background color
- Background image
- Position
- Size
- Repeat
- Other background properties

---

# 25. Gradients

Infinitely Studio includes gradient controls.

Gradients can be used for backgrounds and supported visual properties.

Common gradient concepts include:

- Linear gradients
- Color stops
- Direction
- Position
- Multiple colors

---

# 26. Borders

Border controls include settings for:

- Border width
- Border style
- Border color
- Individual sides where supported

Use borders to create outlines, separators, cards, inputs, buttons, and other UI surfaces.

---

# 27. Border Radius

Border-radius controls allow rounded corners.

You can use them for:

- Buttons
- Cards
- Images
- Containers
- Inputs
- Pills
- Circular elements

Different corner values can be used when asymmetric shapes are required.

---

# 28. Assets and Media

The **Assets** manager is used to manage project media.

Assets can include files such as:

- Images
- Other supported media
- Uploaded files

The asset system is separate from the visual styling controls, although selected assets can be assigned to components through traits or style controls.

---

## 28.1 Upload Assets

Use the Assets manager to upload files.

After uploading, assets become available for supported media components and controls.

---

## 28.2 Remove Assets

The Assets manager provides asset removal controls.

Before removing an asset, verify that it is not needed by another page or component.

---

# 29. Layers

The **Layers** panel represents the page hierarchy.

Layers are useful when:

- Elements overlap.
- An element is difficult to select on the canvas.
- A deeply nested element must be edited.
- You need to understand parent/child relationships.
- You need to reorder elements.

A typical hierarchy can look like:

```text
Page
├── Section
│   ├── Container
│   │   ├── Heading
│   │   └── Paragraph
│   └── Image
└── Footer
```

Selecting an item in Layers selects the corresponding element.

---

# 30. Reordering Elements

Use Layers or the canvas to change element order.

Reordering is especially useful for:

- Sections
- Navigation
- Cards
- Lists
- Footer content
- Nested containers

After reordering, check responsive behavior and overlapping elements.

---

# 31. Symbols

A **Symbol** is a reusable component intended for repeated content.

Symbols are useful when the same component should be reused across pages.

Examples:

- Header
- Footer
- Repeated CTA
- Reusable card
- Repeated navigation section
- Repeated UI component

Open the **Symbols & Templates** manager and use the Symbols area to manage saved Symbols.

---

## 31.1 Create a Symbol

Typical workflow:

1. Select the component you want to reuse.
2. Use the **Create Symbol** tool.
3. Give the Symbol a name.
4. Save it.
5. The Symbol becomes available as a reusable resource.

---

## 31.2 Manage Symbols

The Symbols manager provides functionality such as:

- Search
- Delete
- Export
- Manage reusable Symbols

Be careful when deleting a Symbol because Symbol instances can exist across pages.

---

## 31.3 Export Symbols

A Symbol can be exported as JSON.

Use export when you want to keep or transfer the reusable resource.

---

# 32. Templates

A **Template** is a reusable saved component that can be added to pages as a block.

Templates are useful for reusable sections and page-building patterns.

Examples:

- Hero sections
- Pricing sections
- Product cards
- Testimonials
- Footers
- Contact sections
- Feature sections

---

## 32.1 Create a Template

1. Select the element/component you want to reuse.
2. Open the **Create Template** action.
3. Enter a Template name.
4. Save.

The selected component is captured as a reusable Template.

The current creation UI primarily asks for a name. Template category handling exists in the saved resource model, but the active creation interface does not require you to configure a category manually.

---

## 32.2 Use a Template

After a Template exists:

1. Open **Blocks**.
2. Find the Template's category.
3. Drag the Template onto the canvas.
4. Configure the inserted instance as needed.

Templates are intended to make repeated page construction faster.

---

## 32.3 Manage Templates

Open:

**Symbols & Templates → Templates**

The Templates manager provides:

- Search
- Delete all
- Export all
- Delete an individual Template
- Export an individual Template

---

## 32.4 Export One Template

Each Template can be exported individually as JSON.

The export contains the reusable Template's saved content and style information.

---

## 32.5 Export All Templates

Use **Export All** to export the project's Templates together.

The resulting export is a JSON file containing the Template collection.

---

## 32.6 Delete a Template

Deleting a Template removes the saved reusable resource.

Because other pages may use reusable resources, review the project before deleting important Templates.

---

# 33. Symbols vs Templates

Do not treat Symbols and Templates as exactly the same thing.

### Symbols

Use Symbols when you want a named reusable component that is managed as a reusable Symbol resource.

### Templates

Use Templates when you want reusable page-building content that can be exposed as a block and inserted into pages.

### Practical choice

Use a **Template** when your main goal is:

> "I want to save this section/component and drag it into another page later."

Use a **Symbol** when your main goal is:

> "I want this to be a reusable named component."

---

# 34. Uploading Reusable Blocks

The Symbols & Templates manager includes an **Upload** tab.

This area can import JSON exports for reusable resources.

The uploader validates the resource type before importing it.

For normal projects, supported reusable upload data includes the project's reusable block types such as:

- `template`
- `symbol`

For WordPress projects, WordPress reusable block data uses the corresponding Infinitely resource types.

---

## 34.1 Safe Import Workflow

1. Open **Symbols & Templates**.
2. Select **Upload**.
3. Choose the exported JSON file.
4. Review the resources shown by the uploader.
5. Save/import them.
6. Check Blocks/Symbols afterward.

Use compatible exports from Infinitely Studio whenever possible.

---

# 35. Dynamic Templates

Infinitely Studio also contains a separate **Dynamic Templates** system.

Do not confuse:

- Templates
- Dynamic Templates

with each other.

A normal **Template** is a reusable saved component/block.

A **Dynamic Template** is designed for dynamic/API-driven reusable content and has its own manager.

Open **Dynamic Templates** from the editor navigation.

---

## 35.1 Dynamic Template Management

The Dynamic Templates manager provides actions such as:

- Search
- Create
- Edit
- Delete
- Upload
- Download/export

Use Dynamic Templates when your content needs to be driven by dynamic data rather than simply reusing a static visual section.

---

# 36. REST API Models

Infinitely Studio provides a **REST API Models** area.

This is useful when a project works with API-driven data.

Depending on the configured model, API resources can be used by dynamic components and related builder features.

The exact API model configuration depends on the project and the API you connect to.

---

# 37. Dynamic Content

The builder contains components and traits intended for dynamic content.

Dynamic features are useful when the final website should render content from data rather than hard-coded text.

Examples of use cases:

- Products
- Posts
- Lists
- Repeated cards
- API results
- WordPress content

Dynamic content should be tested in the context where the data will actually exist.

---

# 38. Looper

The **Looper** component is designed for repeated content.

Use it when a component should be rendered repeatedly from a collection/data source.

Typical conceptual structure:

```text
Collection
└── Repeated item
    ├── Image
    ├── Title
    └── Description
```

Use dynamic bindings and data configuration appropriate to the project.

---

# 39. Load More

The builder includes a **Load More** type of component for paginated/repeated content.

It is useful for:

- Product lists
- Post lists
- API results
- Long collections

The exact behavior depends on the data source and dynamic configuration.

---

# 40. Next / Previous

The builder includes Next/Previous functionality for dynamic or navigable content.

Use it when a design needs controls to move through a collection or paginated data.

---

# 41. WordPress Projects

WordPress mode adds WordPress-specific functionality to the builder.

It can work with:

- WordPress pages
- WordPress posts
- WordPress media
- WordPress metadata
- WordPress queries
- WordPress taxonomies
- Dynamic WordPress content
- WordPress templates
- WordPress symbols
- WordPress scripts/settings
- WordPress preview/publishing workflows

---

# 42. WordPress Connection

When creating a WordPress project:

1. Enter the WordPress website URL.
2. Enter the username.
3. Enter the password.
4. Connect.
5. Allow Infinitely Studio to check the project's configuration.
6. Continue into the builder.

The WordPress website must be reachable and the supplied credentials must have the required permissions.

---

# 43. WordPress Pages

WordPress projects have page-management functionality separate from ordinary local pages.

The page manager can display WordPress page information such as the page ID/type.

Use the WordPress page tools when working with content that exists on the connected website.

---

# 44. WordPress Media

WordPress projects include WordPress-aware media management.

Use the media manager when you need to work with media stored on the connected WordPress site.

---

# 45. WordPress Queries

The builder includes tools for creating WordPress queries.

Query-building features include controls related to:

- Post types
- Taxonomies
- Meta queries
- Conditions
- Dynamic selections

Use these tools when a design must retrieve WordPress data instead of using static content.

---

# 46. WordPress Taxonomies

Taxonomy tools allow dynamic WordPress content to be filtered by taxonomy-related information.

Examples of WordPress taxonomy concepts include:

- Categories
- Tags
- Custom taxonomies

The available configuration depends on the connected WordPress site.

---

# 47. WordPress Dynamic Content

WordPress-specific dynamic components can use WordPress data.

This can be used to build:

- Post listings
- Product listings
- Dynamic titles
- Dynamic images
- Query-driven sections
- Pagination
- Conditional content

Always test dynamic templates with real WordPress data before publishing.

---

# 48. WordPress Conditions

The builder includes condition-building controls.

Conditions are useful when an element should only appear when specific WordPress data or query conditions are met.

Use them carefully so that the page still has useful output when the condition is false.

---

# 49. WordPress Pagination

The builder includes WordPress pagination-related functionality.

Pagination can be used with dynamic lists and query results.

The exact pagination behavior depends on the query and page structure.

---

# 50. WordPress SSR / Dynamic Rendering

The builder includes WordPress-specific server/dynamic rendering features.

These are intended for cases where content needs to be rendered from WordPress rather than being completely static.

When using dynamic WordPress functionality, verify the result on the actual WordPress site.

---

# 51. Themes

The **Themes** area is used to define reusable design variables.

A theme can contain:

- Theme name
- Theme description
- Default status
- Multiple modes
- Categories
- Variables

---

## 51.1 Theme Modes

Infinitely Studio's theme system is not limited to only `light` and `dark`.

A theme can have multiple named modes.

Examples of possible design modes include:

- Light
- Dark
- High contrast
- Brand
- Seasonal
- Custom modes

The mode names are configurable.

---

## 51.2 Theme Categories

Inside a mode, variables can be grouped into categories.

Examples:

```text
Colors
Typography
Spacing
Buttons
Surfaces
Borders
```

Category names are configurable.

---

## 51.3 Theme Variables

A theme category can contain variables such as:

```text
primary = #2563EB
surface = #FFFFFF
text = #111827
radius = 12px
spacing = 16px
```

The exact variables are project-defined.

---

## 51.4 Add a Theme

Use the Themes builder to create a theme and give it a name.

Then configure its modes, categories, and variables.

---

## 51.5 Add a Mode

Inside a theme:

1. Add a mode.
2. Give it a mode name.
3. Add categories.
4. Add variables.
5. Define their values.

---

## 51.6 Add a Category

1. Enter a category name.
2. Add the category.
3. Open the category.
4. Add variables.

---

## 51.7 Add a Variable

A variable has:

- Key/name
- Value

Use meaningful variable names so the design system remains understandable.

---

# 52. Code Manager

The editor provides a **Code manager**.

Use it when you need to work with code-related project functionality instead of only visual controls.

The code manager is intended for advanced users who need more direct control.

Before changing custom code, make sure you understand how it interacts with the page and project.

---

# 53. CSS Editor

Infinitely Studio provides a CSS editor for cases where visual controls are not enough.

Use custom CSS when:

- A specific CSS property is not exposed visually.
- You need advanced selectors.
- You need custom effects.
- You need project-specific styling.

Keep custom CSS organized and avoid duplicating styles unnecessarily.

---

# 54. JavaScript and Libraries

The builder includes library-management functionality.

You can work with installed JavaScript libraries and related project resources.

This is useful for advanced websites that need third-party functionality.

Before adding a library, consider:

- Whether the site actually needs it.
- Whether it conflicts with existing scripts.
- Whether it increases page size.
- Whether it affects editor performance.

---

# 55. Library Installer

The **Library Installer** is available from the editor navigation.

Use it to install/manage supported libraries.

Installed libraries can then become available to the project where supported.

---

# 56. Custom Fonts Installer

The editor navigation provides font-related installation tools.

Use them when a project requires fonts beyond its existing font set.

After installing a font, verify that:

- The font appears in the font controls.
- The correct weight/style is available.
- The page renders correctly on the target site.

---

# 57. File Manager

The editor navigation includes a **Files Manager**.

Use it when you need to inspect or work with project files exposed by the builder.

The file system should be treated as project data rather than as a replacement for the visual editor.

---

# 58. Animations

Infinitely Studio provides an **Animations Builder**.

Animations can be used to add motion to elements.

Common use cases:

- Entrance animations
- Scroll effects
- Reveals
- Movement
- Scaling
- Rotation
- Interactive effects

---

## 58.1 Animation Workflow

A typical workflow is:

1. Select the target element.
2. Open the animation controls.
3. Create/configure an animation.
4. Define its behavior.
5. Apply it to the element.
6. Test it in the editor.
7. Preview the page.

---

## 58.2 Stop Animations

Project settings include an option to stop all animations on a page.

This is useful for testing or for projects where animations should be disabled.

---

## 58.3 Cleaning Unused Motions

Settings provides **Clean unused motions**.

Use this when the project has accumulated animation definitions that are no longer referenced.

Run cleanup intentionally and verify the result afterward.

---

# 59. Interactions

Infinitely Studio provides an **Interactions** system.

Interactions are useful when an event should trigger an action.

Conceptually:

```text
Event
  ↓
Interaction
  ↓
Action(s)
```

Examples of event-driven behavior include:

- Click
- Hover
- View/visibility
- Other supported events

---

## 59.1 Add an Interaction

Typical workflow:

1. Select the relevant element.
2. Open Interactions.
3. Add an interaction/event.
4. Configure one or more actions.
5. Save/test the behavior.

---

## 59.2 Multiple Actions

An interaction can contain multiple actions.

For example:

```text
Click
├── Add class
├── Start animation
└── Change another property
```

The available actions depend on the current interaction system.

---

## 59.3 Interaction Instances

The interaction system supports reusable interaction definitions and instances.

This can be useful when the same behavior needs to be applied in multiple places.

---

## 59.4 Cleaning Unused Interactions

Settings provides **Clean unused interactions**.

Use this to remove interaction definitions that are no longer used.

---

# 60. Preview

The editor header provides **Preview mode**.

Use Preview to inspect the page without the normal editing workflow.

Preview is especially useful for checking:

- Spacing
- Responsive behavior
- Interactions
- Animations
- Typography
- Images
- Navigation
- Overall visual appearance

Always preview important pages before export or publishing.

---

# 61. Frontend View

The editor also provides a control for showing the project in the frontend context.

Use this when you want to inspect the website closer to how an end user will see it.

---

# 62. Save

The editor provides a **Save** action.

Save the project regularly, especially after:

- Major layout changes
- Adding reusable resources
- Editing animations
- Editing interactions
- Changing project settings
- Importing assets
- Working with WordPress

---

# 63. Auto Save

Project settings include:

**Enable auto save**

When enabled, the editor automatically stores project changes according to its save workflow.

When disabled, you should use the Save action intentionally.

If you are performing large edits or importing many resources, make sure the project has finished saving before closing it.

---

# 64. Sharing

The editor provides a **Share** action.

Use Share when you want to expose the project through the builder's sharing workflow.

The exact sharing result depends on the current project/environment.

---

# 65. Exporting

The editor provides an **Export** action.

Export is intended for taking the project/site output outside the editor.

A project export can contain website resources such as:

- HTML
- CSS
- JavaScript
- Assets
- Fonts
- Libraries
- Project/editor data
- Page data

The exact contents depend on the project and enabled features.

---

# 66. Project Export

For a normal project, use the editor's Export control to generate the project output.

A project export can be used as a backup or as a way to move the website output to another environment.

Keep backups of important project exports.

---

# 67. Template and Resource Export

Reusable resources have their own export controls.

These should not be confused with the full project export.

Examples:

- Template JSON
- All Templates JSON
- Symbol JSON
- Pages JSON

Use resource exports when you want to transfer only specific reusable content.

---

# 68. Import vs Export

Use:

- **Project export** for the broader project/site.
- **Page export** for page-level data.
- **Template export** for reusable Templates.
- **Symbol export** for reusable Symbols.
- **Upload** tools to bring compatible JSON resources back into a project.

Keep exported files organized so you know what each file contains.

---

# 69. Dropbox

The Workspace includes Dropbox integration.

When connected, Dropbox can be used to access project files stored there.

The Workspace can:

- Check Dropbox sign-in state.
- List available Dropbox project files.
- Load a selected Dropbox project.

Use Dropbox when you want a cloud-backed workflow for compatible project files.

---

# 70. Project Settings

Open **Settings** from the editor navigation.

Settings can be searched.

The settings interface presents project settings as switches where supported.

Current project-level options include settings related to:

- Tailwind
- Spline viewer
- Stopping all animations
- Auto save
- Swiper.js
- Editor rendering/performance behavior
- Outline optimization
- GSAP features

WordPress projects can also have WordPress-specific script/configuration behavior.

---

# 71. Tailwind Setting

The project settings include:

**Enable Tailwind**

When enabled, the project can use the project's Tailwind-related workflow.

Changing this setting can trigger style/class processing.

After changing it, inspect the page to make sure expected styles are still present.

---

# 72. Spline Viewer

The project includes an option related to enabling the Spline viewer.

Use it when the project uses Spline-based 3D content.

---

# 73. Swiper.js

The project includes an option to enable Swiper.js.

This is relevant to components such as sliders/carousels that depend on Swiper functionality.

---

# 74. GSAP Features

Settings include controls for GSAP-related features such as:

- GSAP core
- ScrollTrigger
- SplitText

Disable these only when the project does not need the corresponding functionality.

If an animation or motion stops working after disabling a feature, check whether the animation depends on it.

---

# 75. Editor Performance Options

Settings include editor-performance-related options such as:

- Disable `will-change` behavior in the editor
- Optimize outlines

These are editor behavior settings and should be changed only when needed.

---

# 76. Screenshot

Settings provides **Take Screenshot**.

Use it to capture the current editor/page view when you need a visual snapshot.

---

# 77. Cleaning Project Data

Settings provides cleanup tools for unused:

- Motions
- Interactions

Use cleanup after substantial editing sessions if the project has accumulated unused definitions.

Always save important project data before performing destructive cleanup.

---

# 78. AI

The editor includes **Infinitely AI**.

The AI area provides a conversational interface for working with AI providers/models.

Depending on the configured provider, AI can be used to assist with website-building tasks.

---

## 78.1 AI Providers

The AI system can work with configured model providers.

The exact available providers/models depend on the current AI configuration.

---

## 78.2 AI Chats

The AI area supports conversations/chats.

Use separate chats when you want to keep different website-building tasks or contexts isolated.

---

## 78.3 AI and Website Context

When asking AI to modify or generate website content, provide enough context about:

- Page purpose
- Target audience
- Content structure
- Brand style
- Responsive requirements
- Components required
- Dynamic data requirements
- Existing design constraints

For large projects, keep the requested task focused.

---

# 79. Media and Images

When adding images:

1. Upload/select the asset.
2. Assign it to the image/media component.
3. Configure dimensions.
4. Check object fitting/cropping.
5. Test responsive behavior.

Do not assume an image that looks correct on desktop will automatically look correct on mobile.

---

# 80. Video and Audio

The builder includes video and audio components.

Use them when the design requires media playback.

Check:

- Source
- Dimensions
- Controls
- Autoplay behavior
- Responsive sizing
- Browser compatibility
- Performance

Large media files can significantly affect page loading.

---

# 81. Iframes

The builder includes an Iframe component.

Use it for embedded external content.

Before publishing an iframe-based section, verify:

- The external site permits embedding.
- The iframe works in the target browser.
- The content is responsive.
- Security restrictions do not block it.

---

# 82. SVG

The builder supports SVG content.

SVG can be useful for:

- Logos
- Icons
- Illustrations
- Decorative graphics

Test SVG behavior in both the editor and final frontend.

---

# 83. Slider

Infinitely Studio includes a Slider component.

The project can use Swiper-related functionality for slider behavior.

Typical slider configuration includes:

- Slides
- Navigation
- Autoplay
- Looping
- Effects
- Responsive behavior

Always test sliders on mobile as well as desktop.

---

# 84. Spline

The builder includes Spline scene support.

Use Spline content when the website needs interactive 3D scenes.

Because 3D content can be expensive to render, test performance on the actual target devices.

---

# 85. Buttons and Links

Buttons and links can be configured through their traits and attributes.

For links, verify:

- Destination
- Target behavior
- Text
- Accessibility-related attributes

For buttons, verify:

- Label
- Action
- Interaction behavior
- Visual states

---

# 86. Forms and Inputs

The builder includes input-related components.

Use them for:

- Search
- Contact forms
- Filters
- User input
- Other form interfaces

Configure labels, placeholders, attributes, and actions according to the intended behavior.

A visual form does not automatically mean that the form has a backend submission process. Verify the actual submission/integration behavior separately.

---

# 87. Accessibility-Oriented Editing

When building a site, use meaningful:

- Headings
- Link text
- Image alternative text
- Form labels
- Button labels
- Semantic structure

Do not use visual styling alone to communicate important information.

Use the Attributes/Trait controls when accessibility-related HTML attributes are required.

---

# 88. Responsive Design Checklist

For each important page:

### Desktop

- Check section widths.
- Check typography.
- Check horizontal spacing.
- Check navigation.
- Check images.
- Check cards.

### Tablet

- Check wrapping.
- Check columns.
- Check spacing.
- Check navigation.
- Check media.

### Mobile

- Check text size.
- Check buttons.
- Check overflow.
- Check horizontal scrolling.
- Check images.
- Check stacking order.
- Check menus.
- Check fixed/absolute elements.

---

# 89. Recommended Page-Building Method

A practical workflow is:

1. Build the page structure.
2. Add sections and containers.
3. Add content blocks.
4. Configure typography.
5. Configure colors.
6. Configure spacing.
7. Configure layout.
8. Configure responsive states.
9. Add interactions.
10. Add animations.
11. Save reusable sections as Templates.
12. Convert truly reusable components into Symbols where appropriate.
13. Test the page.
14. Preview.
15. Save/export/publish.

Do not start by polishing every tiny detail before the page structure is correct.

---

# 90. Reusable Design Strategy

Use reusable resources deliberately.

A useful distinction is:

```text
One-time content
    ↓
Normal page element

Reusable page section
    ↓
Template

Reusable named component
    ↓
Symbol

Data-driven reusable structure
    ↓
Dynamic Template / dynamic components
```

This keeps projects easier to maintain.

---

# 91. Naming Things

Use clear names for:

- Pages
- Templates
- Symbols
- Classes
- Theme variables
- Categories
- Dynamic resources

Prefer:

```text
Hero - Coffee
Product Card
Primary Button
Footer - Main
Pricing Card
Blog Grid
```

over names such as:

```text
test
new
copy
abc
section2
```

Clear names become increasingly important as a project grows.

---

# 92. Working With Large Projects

When a project becomes large:

- Use page naming consistently.
- Use reusable Templates.
- Use Symbols where appropriate.
- Use classes instead of duplicated styling.
- Keep theme variables organized.
- Remove unused motions.
- Remove unused interactions.
- Keep assets organized.
- Avoid installing libraries that are not needed.
- Preview pages regularly.
- Export backups.

---

# 93. Troubleshooting: Element Cannot Be Selected

Try:

1. Select the element from Layers.
2. Check whether another element is covering it.
3. Check whether the element is inside a nested container.
4. Verify that the correct device is active.
5. Refresh/reopen the relevant editor state if necessary.

---

# 94. Troubleshooting: Style Does Not Appear

Check:

1. Correct element is selected.
2. Correct class is selected.
3. Correct responsive device is active.
4. Correct state is active.
5. Another rule is not overriding the style.
6. The project setting related to styling is enabled when required.
7. Preview the page to determine whether the problem is editor-only or frontend-visible.

---

# 95. Troubleshooting: Template Does Not Appear

Check:

1. The Template was saved successfully.
2. The Templates manager contains it.
3. The Blocks panel has refreshed.
4. Search/filter text is not hiding it.
5. The correct project is open.
6. For WordPress projects, the WordPress connection is working.
7. Reload the Blocks/Templates data if the UI provides a reload action.

---

# 96. Troubleshooting: Dynamic Content Is Empty

Check:

- Data source configuration.
- API/WordPress connection.
- Query configuration.
- Conditions.
- Collection existence.
- Dynamic bindings.
- Pagination.
- Required permissions.
- Preview environment.

A dynamic component can be structurally correct while showing no content if its data source returns nothing.

---

# 97. Troubleshooting: Animation Does Not Run

Check:

1. The animation is attached to the intended element.
2. The animation definition still exists.
3. The relevant GSAP setting is enabled when required.
4. The page has not enabled the setting that stops all animations.
5. The interaction/event that should trigger the animation is configured.
6. Preview the page.

---

# 98. Troubleshooting: Interaction Does Not Run

Check:

1. Correct element is selected.
2. Correct event is configured.
3. At least one action exists.
4. Action configuration is valid.
5. Required dynamic/animation functionality is enabled.
6. Test in Preview/frontend context.

---

# 99. Troubleshooting: WordPress Data Is Missing

Check:

- WordPress connection.
- Credentials/permissions.
- Website availability.
- Query configuration.
- Post type.
- Taxonomy.
- Meta conditions.
- Dynamic field mapping.
- WordPress-side configuration.
- Whether the requested content actually exists.

---

# 100. Troubleshooting: Export Is Missing Content

Check:

1. Save the project first.
2. Make sure all pages are saved.
3. Check that assets are part of the project/export.
4. Check whether the content depends on an external API.
5. Check whether custom libraries/scripts are required.
6. Check whether the feature is dynamic and therefore requires a runtime data source.

---

# 101. Preview vs Editor

The editor is not always identical to the final frontend.

Use Preview/frontend viewing to verify:

- Actual spacing
- Runtime scripts
- Interactions
- Animations
- Dynamic data
- External resources
- Responsive behavior

Do not rely only on the editing canvas for final QA.

---

# 102. Project Backup Strategy

For important projects, keep multiple kinds of backups:

### Full project backup

Use the project export.

### Page backup

Download important pages.

### Reusable-resource backup

Export:

- Templates
- Symbols

### External assets

Keep original source assets separately when they are important.

---

# 103. Safe Deletion Checklist

Before deleting a resource, ask:

- Is another page using it?
- Is another component using it?
- Is it a Template?
- Is it a Symbol?
- Is it a class used elsewhere?
- Is it an animation referenced by an interaction?
- Is it a dynamic resource?
- Is it needed by WordPress?

If unsure, export the resource before deleting it.

---

# 104. Project Organization Example

A medium project can be organized conceptually like this:

```text
Project
├── Pages
│   ├── Index
│   ├── About
│   ├── Products
│   ├── Product Details
│   └── Contact
│
├── Templates
│   ├── Hero
│   ├── Product Card
│   ├── Feature Section
│   └── Footer
│
├── Symbols
│   ├── Header
│   └── Main Navigation
│
├── Theme
│   ├── Light
│   ├── Dark
│   └── Brand
│
├── Assets
│   ├── Images
│   ├── Icons
│   └── Media
│
├── Animations
└── Interactions
```

---

# 105. Complete Editor Navigation Reference

The editor navigation currently exposes tools/actions including:

- Pages
- Dynamic Templates
- Symbols & Templates
- REST API Models
- Library Installer
- Fonts Installer
- Files Manager
- WordPress
- Infinitely AI
- Themes
- Settings
- Return to Workspace

Some tools are contextual and are more relevant to specific project types.

---

# 106. Top Toolbar Reference

The editor header provides controls related to:

- Desktop/tablet/mobile device views
- Additional responsive media conditions
- Media condition
- Width
- Height
- Zoom
- Pages
- Canvas/iframe controls
- Code manager
- Preview
- Frontend view
- Save
- Share
- Export
- Component editing
- Adding blocks

Use tooltips when unsure about an icon.

---

# 107. The Most Important Concepts

If you remember only a few things, remember these:

### 1. Select first

Most editing controls apply to the selected element.

### 2. Use Layers for difficult selections

The layer tree is the reliable way to find deeply nested elements.

### 3. Use Classes for shared styling

Do not duplicate the same style unnecessarily.

### 4. Use responsive device views

Desktop styling is not enough.

### 5. Use Templates for reusable page content

Save sections/components you want to reuse.

### 6. Use Symbols for reusable named components

Keep repeated components manageable.

### 7. Use Dynamic Templates for data-driven reusable content

Do not confuse dynamic resources with ordinary Templates.

### 8. Preview before publishing

The editor canvas is not a replacement for final QA.

### 9. Export backups

Especially before major cleanup or structural changes.

### 10. WordPress content is data-driven

When something is missing, check the WordPress connection and query/data configuration rather than only the visual layout.

---

# 108. Fast Reference: Building a Landing Page

```text
1. Create project
2. Open Index page
3. Add Header
4. Add Hero section
5. Add Features
6. Add Product/Service section
7. Add Testimonials
8. Add CTA
9. Add Footer
10. Style sections
11. Configure typography
12. Configure responsive views
13. Add hover states
14. Add animations/interactions
15. Preview
16. Save
17. Export/share/publish
```

---

# 109. Fast Reference: Creating a Reusable Section

```text
1. Build the section
2. Select the section
3. Create Template
4. Give it a clear name
5. Save
6. Open Blocks
7. Find the Template
8. Drag it into another page
```

---

# 110. Fast Reference: Creating a Reusable Component

```text
1. Build the component
2. Select it
3. Create Symbol
4. Name it
5. Save
6. Manage it from Symbols & Templates
```

---

# 111. Fast Reference: Responsive Editing

```text
Desktop
   ↓
Build the main layout
   ↓
Tablet
   ↓
Fix columns, spacing and typography
   ↓
Mobile
   ↓
Fix stacking, width, text, buttons and overflow
   ↓
Preview
```

---

# 112. Fast Reference: WordPress Dynamic Listing

```text
1. Connect WordPress
2. Configure the required REST/API model or WordPress query
3. Create the page structure
4. Add dynamic/list components
5. Configure query/data source
6. Bind content
7. Configure pagination/load more if needed
8. Add conditions if needed
9. Preview with real WordPress data
10. Verify on the WordPress frontend
```

---

# 113. Fast Reference: Before Publishing

Use this checklist:

- [ ] All pages exist.
- [ ] Page names are correct.
- [ ] Navigation links work.
- [ ] Images are correct.
- [ ] Image alternative text is set where needed.
- [ ] Typography is consistent.
- [ ] Desktop layout works.
- [ ] Tablet layout works.
- [ ] Mobile layout works.
- [ ] No unexpected horizontal overflow.
- [ ] Buttons work.
- [ ] Forms/integrations are configured.
- [ ] Dynamic content loads.
- [ ] WordPress queries return expected data.
- [ ] Animations work.
- [ ] Interactions work.
- [ ] External embeds work.
- [ ] Custom code works.
- [ ] Project is saved.
- [ ] Important reusable resources are backed up.
- [ ] Preview has been checked.

---

# 114. Glossary

**Block**  
A component that can be added to the page through the Blocks panel.

**Canvas**  
The visual editing area where the current page is displayed.

**Class**  
A reusable styling selector that can be applied to multiple elements.

**Dynamic Content**  
Content whose value comes from a data source rather than only static page content.

**Dynamic Template**  
A reusable resource intended for dynamic/API-driven content.

**Interaction**  
An event-driven behavior made of an event and one or more actions.

**Layer**  
A representation of an element's place in the page hierarchy.

**Mode**  
A named theme variation.

**Page**  
A document/route-like unit containing its own page content.

**Symbol**  
A reusable named component.

**Template**  
A reusable saved component/section that can be exposed as a block.

**Trait**  
A component-specific property/control.

**Theme**  
A collection of design modes, categories, and variables.

**WordPress Project**  
A project connected to a WordPress website and capable of using WordPress-specific functionality.

---

# 115. Final Mental Model

Think of Infinitely Studio as several systems working together:

```text
                    INFinitely Studio
                           │
          ┌────────────────┼────────────────┐
          │                │                │
        Pages            Design           Data
          │                │                │
      ┌───┴───┐       ┌────┼────┐      ┌────┼────┐
      │       │       │    │    │      │    │    │
   Content  Layout  Styles Themes Assets API WordPress
      │       │       │    │    │      │    │    │
      └───────┴───────┴────┴────┴──────┴────┴────┘
                           │
                    Reusable Content
                           │
                  ┌────────┼────────┐
                  │        │        │
               Blocks   Templates Symbols
                  │        │        │
                  └────────┼────────┘
                           │
                    Behavior & Motion
                           │
                  ┌────────┴────────┐
                  │                 │
             Interactions       Animations
                  │                 │
                  └────────┬────────┘
                           │
                      Final Website
                           │
              ┌────────────┼────────────┐
              │            │            │
            Preview       Export      WordPress
```

The most effective way to use the builder is to build the structure first, make the design reusable, handle responsive behavior deliberately, then add dynamic behavior and polish.

---

# 116. One-Screen Cheat Sheet

| Need | Go to |
|---|---|
| Create/open a project | Workspace |
| Create a page | Pages |
| Find a page | Pages → Search |
| Add content | Blocks |
| Find reusable content | Blocks |
| Save a section for reuse | Create Template |
| Save a reusable named component | Create Symbol |
| Manage Templates | Symbols & Templates → Templates |
| Manage Symbols | Symbols & Templates → Symbols |
| Import reusable JSON | Symbols & Templates → Upload |
| Dynamic reusable content | Dynamic Templates |
| Edit element properties | Traits |
| Edit HTML attributes | Traits → Attributes |
| Edit CSS | Styles |
| Shared styling | Styles → Classes |
| Hover/focus-style behavior | Styles → States |
| Change hierarchy | Layers |
| Upload/manage images | Assets |
| Change viewport | Desktop / Tablet / Mobile |
| Test custom viewport | Width / Height |
| Change editor zoom | Zoom |
| Create animations | Animations |
| Create event behavior | Interactions |
| Manage design variables | Themes |
| Custom code | Code Manager / CSS Editor |
| Install libraries | Library Installer |
| Install fonts | Fonts Installer |
| WordPress content | WordPress tools |
| API-driven content | REST API Models / Dynamic Content |
| AI assistance | Infinitely AI |
| Project options | Settings |
| Preview | Preview mode |
| Save | Save |
| Share | Share |
| Export | Export |
| Return to projects | Workspace / Out to projects |

---

# 117. Important Distinctions

Keep these distinctions clear:

```text
Block
= something you add to a page

Template
= reusable saved page/component content

Symbol
= reusable named component

Dynamic Template
= reusable dynamic/API-oriented resource

Page
= a page containing actual website content

Theme
= reusable design variables and modes

Trait
= component property

Style
= visual CSS styling

Class
= reusable styling selector

State
= conditional interaction style

Interaction
= event → action behavior

Animation
= motion behavior

Asset
= media/file resource

WordPress Query
= data retrieval configuration
```

---

# 118. Final Rule

When something in Infinitely Studio feels confusing, identify which category it belongs to first:

1. **Structure** → Blocks / Layers / Pages
2. **Content** → Traits / Content / Dynamic Content
3. **Appearance** → Styles / Classes / States / Themes
4. **Media** → Assets / Fonts / Libraries
5. **Reuse** → Templates / Symbols / Dynamic Templates
6. **Behavior** → Interactions / Animations
7. **Data** → REST API Models / WordPress Queries
8. **Project** → Settings / Save / Export / Share
9. **Runtime** → Preview / Frontend / WordPress

Once the category is clear, the correct builder tool is usually much easier to find.
