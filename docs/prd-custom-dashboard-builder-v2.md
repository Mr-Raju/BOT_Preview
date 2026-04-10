# Product Requirements Document: Custom Dashboard Builder v2

**Version:** 2.0  
**Date:** April 9, 2026  
**Status:** Draft  
**Source:** Based on Nextiva-CX/S360 Dashboard Implementation Analysis

---

## 1. Executive Summary

### 1.1 Problem Statement
The current Nextiva CX platform has multiple pre-built dashboards (Listen, Care, Insights, Reviews) with fixed layouts. Users need a **Custom Dashboard Builder** that allows them to:
- Create personalized dashboard layouts
- Select from the existing 25+ widget/chart types
- Configure row and column layouts
- Apply widget-level filters and customize display

### 1.2 Solution Overview
Build a **drag-and-drop Dashboard Builder** using the existing cockpit template system as a foundation, extending it with:
- Visual canvas for layout design
- Widget library panel with all available chart components
- Right-hand configuration panel for widget customization
- Row management with configurable column layouts

### 1.3 Target Users
| User Type | Primary Use Case |
|-----------|------------------|
| Brand Managers | Custom views combining Listen + Care metrics |
| Operations Managers | Real-time monitoring with queue + agent stats |
| Executives | High-level KPIs across all categories |
| Analysts | Deep-dive dashboards with pivot/filter combinations |

---

## 2. Current System Analysis

### 2.1 Existing Dashboard Categories

From `dashboardHome.jsp`:

| Category | Dashboards | Permission |
|----------|------------|------------|
| **My Dashboards** | Queue Mgmt, ML, Toothsi, IKEA Survey, Zee5, Cockpit Templates | Various |
| **Listen** | Summary, Campaign, Compare, Influencer, Tags, Tags Comparison | 479-484 |
| **Care** | Brand Performance, SRS, Bot, Case Performance, Live, Live Chat, Customer Service, Case Form, Survey | 482-490, 515 |
| **Insights** | Facebook, Twitter, Instagram, LinkedIn, Post, Group Report, Industry, Brand, Training | 491-496, 511-512 |
| **Reviews** | E-commerce, Location | 497-498 |

### 2.2 Existing Widget/Chart Components

From `cockpit/home.jsp` and related files:

| Component | Type | Description |
|-----------|------|-------------|
| `SplineChartParent` | Line Chart | Time-series trend visualization |
| `PieChartParent` | Pie Chart | Distribution visualization |
| `DonutChartParent` | Donut Chart | Distribution with center value |
| `BarChartParent` | Bar Chart | Categorical comparison |
| `TextChartParent` | KPI Card | Single metric with value |
| `WordCloudParent` | Word Cloud | Topic/keyword visualization |
| `BrandScoreParent` | Score Card | Brand health metrics |
| `PostPerformanceParent` | Post Card | Social post performance |
| `NewsStreamParent` | Stream | Live news feed |
| `SplineChartCustomizableParent` | Custom Line | Configurable line chart |
| `InfluencersParent` | Profile List | Top influencer display |
| `SourceDistCharParent` | Distribution | Source breakdown |
| `DoubleAxisChartParent` | Dual Axis | Two-metric comparison |
| `GeoTaggedPostChartParent` | Map | Geographic post distribution |
| `KeyProfilesParent` | Profile Cards | Key account profiles |
| `DrilldownPieChartParent` | Interactive Pie | Clickable drill-down |
| `PictureCloudParent` | Image Grid | Visual content display |
| `PostCollageChartParent` | Collage | Post image collage |
| `SpiderChartParent` | Radar Chart | Multi-dimensional comparison |
| `Matrix3DBubbleChart` | Bubble Chart | 3D metric visualization |
| `MessageStreamParent` | Stream | Live message feed |
| `ListenStreamParent` | Stream | Listening feed |
| `CampaignPostPerformanceParent` | Campaign | Campaign metrics |
| `CampaignStreamingParent` | Stream | Campaign activity |
| `SunburstChartParent` | Sunburst | Hierarchical data |
| `IndiaChartParent` | Map | India-specific geography |
| `SummaryProfileParent` | Summary | Profile summary card |

### 2.3 Existing Row/Column Layout System

From `manageRowsModal.jsp`:

| Layout Code | Description | Visual |
|-------------|-------------|--------|
| `col-a` | Single column (100%) | `████████████` |
| `col-aa` | Two equal columns (50/50) | `██████ ██████` |
| `col-ba` | Two columns (66/33) | `████████ ████` |
| `col-ab` | Two columns (33/66) | `████ ████████` |
| `col-aaa` | Three equal columns (33/33/33) | `████ ████ ████` |

### 2.4 Existing Filter System

From `brand/home.jsp`:

| Filter | Type | Options |
|--------|------|---------|
| Date Type | Select | Case Started Between, Case Acted Between |
| Date Range | Date Picker | Start/End date selection |
| Working Hours | Radio | All, Within Business, Outside Business |
| Profile | Multi-select | Required - account profiles |
| Source | Multi-select | Social platforms (workflow_source.jsp) |
| Channels | Multi-select | Query/sub-query channels |
| Workbasket | Select | Work queue selection |
| User | Select | Agent/user selection |
| Calculate Holiday | Toggle | Include/exclude holidays |

---

## 3. Custom Dashboard Builder Requirements

### 3.1 Three-Panel Architecture

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  HEADER: Dashboard Name | [Save] [Preview] [Share] [Export]                    │
├────────────────┬───────────────────────────────────────────┬───────────────────┤
│                │                                           │                   │
│   WIDGET       │              CANVAS                       │   WIDGET          │
│   LIBRARY      │        (Drag & Drop Zone)                 │   CONFIG          │
│                │                                           │   PANEL           │
│   - Categories │   ┌─ Row 1: "Title" ──────────────────┐   │                   │
│   - Search     │   │ [Widget] [Widget] [Widget]        │   │   - Filters       │
│   - Drag items │   └───────────────────────────────────┘   │   - Pivot         │
│                │                                           │   - Display       │
│   200-240px    │   ┌─ Row 2: "Title" ──────────────────┐   │   - Thresholds    │
│                │   │ [Widget]      [Widget]            │   │                   │
│                │   └───────────────────────────────────┘   │   280-320px       │
│                │                                           │                   │
│                │   [+ Add Row]                             │                   │
│                │                                           │                   │
└────────────────┴───────────────────────────────────────────┴───────────────────┘
```

### 3.2 Widget Library Panel (LHS)

#### 3.2.1 Widget Categories

| Category | Widgets | Icon |
|----------|---------|------|
| **KPI Cards** | TextChart, BrandScore, SummaryProfile | 📊 |
| **Line Charts** | Spline, SplineCustomizable, DoubleAxis | 📈 |
| **Pie/Donut** | Pie, Donut, DrilldownPie, Sunburst | 🥧 |
| **Bar Charts** | Bar, SourceDist | 📊 |
| **Streams** | News, Message, Listen, Campaign | 📰 |
| **Profiles** | Influencers, KeyProfiles, PostPerformance | 👤 |
| **Maps** | GeoTaggedPost, IndiaChart | 🗺️ |
| **Visualizations** | WordCloud, PictureCloud, PostCollage, Spider, Matrix3DBubble | ☁️ |

#### 3.2.2 Widget Tile Display

```
┌─────────────────────────┐
│   📊                    │
│   Text Chart            │
│   Single KPI display    │
│   ─────────────────     │
│   Drag to canvas        │
└─────────────────────────┘
```

### 3.3 Canvas (Center Area)

#### 3.3.1 Row Management

| Requirement | Description |
|-------------|-------------|
| **R1** | Users can create rows with configurable column count (1-3) |
| **R2** | Each row has an editable title/label |
| **R3** | Rows can be inserted below existing rows |
| **R4** | Rows can be reordered via drag handle |
| **R5** | Rows can be deleted (with confirmation) |
| **R6** | Rows can be collapsed/expanded |

#### 3.3.2 Column Layout Selection

When creating/editing a row, show layout options:

```
┌────────────────────────────────────────────────────┐
│ Select Column Layout                               │
│                                                    │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│ │█████████│  │████ ████│  │████████ │             │
│ │  col-a  │  │  col-aa │  │████  col│             │
│ │  100%   │  │  50/50  │  │  col-ba │             │
│ └─────────┘  └─────────┘  │  66/33  │             │
│                           └─────────┘             │
│ ┌─────────┐  ┌─────────┐                          │
│ │ ████████│  │███ ███ █│                          │
│ │████  col│  │ col-aaa │                          │
│ │  col-ab │  │ 33/33/33│                          │
│ │  33/66  │  └─────────┘                          │
│ └─────────┘                                       │
│                                                    │
│ [Cancel]                            [Apply]        │
└────────────────────────────────────────────────────┘
```

#### 3.3.3 Row Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ≡ │ Executive KPIs                              │ [⚙️] [↕️] [🗑️]  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐         │
│ │                  │ │                  │ │                  │         │
│ │   TextChart      │ │   TextChart      │ │   DonutChart     │         │
│ │   (KPI)          │ │   (KPI)          │ │                  │         │
│ │                  │ │                  │ │                  │         │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘

Legend:
  ≡   = Drag handle for row reordering
  ⚙️  = Row settings (change column layout)
  ↕️  = Collapse/expand toggle
  🗑️  = Delete row
```

### 3.4 Widget Configuration Panel (RHS)

#### 3.4.1 Configuration Sections

When a widget is selected on the canvas:

| Section | Fields | Description |
|---------|--------|-------------|
| **Basic** | Name, Size, Color | Widget title and appearance |
| **Data Source** | Profile(s), Sources, Channels | Data selection |
| **Date Range** | Date Type, Start/End, Working Hours | Time filtering |
| **Filters** | Sentiment, Workbasket, User, Query | Additional filters |
| **Display** | Interval, Timeout, Refresh | Auto-refresh settings |
| **Thresholds** | Warning, Critical values | Alerting configuration |

#### 3.4.2 Configuration Panel Layout

```
┌────────────────────────────────────┐
│ [←] WIDGET CONFIGURATION           │
│ ────────────────────────────────── │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 📊 Spline Chart                │ │
│ │ Trend Analysis                 │ │
│ └────────────────────────────────┘ │
│                                    │
│ ▼ BASIC                            │
│ ┌────────────────────────────────┐ │
│ │ Widget Name                    │ │
│ │ [Trend Analysis___________]    │ │
│ │                                │ │
│ │ Size: [100 ▼]                  │ │
│ │ Color: [#3d9cf5 🎨]            │ │
│ └────────────────────────────────┘ │
│                                    │
│ ▼ DATA SOURCE                      │
│ ┌────────────────────────────────┐ │
│ │ Profile(s) *                   │ │
│ │ [Brand A, Brand B       ▼]     │ │
│ │                                │ │
│ │ Sources                        │ │
│ │ [Twitter, Facebook      ▼]     │ │
│ │                                │ │
│ │ Channels                       │ │
│ │ [All Channels           ▼]     │ │
│ └────────────────────────────────┘ │
│                                    │
│ ▶ DATE RANGE                       │
│ ▶ FILTERS                          │
│ ▶ DISPLAY OPTIONS                  │
│ ▶ THRESHOLDS                       │
│                                    │
│ ┌────────────────────────────────┐ │
│ │  [Reset]           [Apply]     │ │
│ └────────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```

### 3.5 Header Bar Actions

| Action | Description |
|--------|-------------|
| **Dashboard Name** | Inline editable title |
| **Save** | Persist dashboard configuration |
| **Preview** | Full-screen preview without edit chrome |
| **Share** | Share dashboard with users/teams |
| **Export** | Download as JSON for backup/transfer |
| **Toggle Full Screen** | Presentation mode |

---

## 4. Technical Data Model

### 4.1 Dashboard Template Structure

Based on existing `cockpit` system (`getTemplateDetailsCockpit`):

```typescript
interface DashboardTemplate {
  id: number;
  name: string;
  description: string;
  createdOn: Date;
  updatedOn: Date;
  userMap: {
    sharedBy: number;    // Owner user ID
    sharedWith: number[]; // Shared user IDs
  };
  tempEleMap: TemplateElement[];
}

interface TemplateElement {
  id: number;
  templateId: number;
  rowPosition: number;      // 1-5
  columnPosition: number;   // Position within row
  columnLayout: ColumnLayout;
  width: ColumnWidth;
  name: string;
  elementId: number;
  element: ElementDefinition;
  elementFilter: FilterConfig;   // Widget-specific filters
  configFilter: ConfigOptions;   // Display configuration
  url: string;                   // Data fetch endpoint
  active: boolean;
  createdOn: Date;
  updatedOn: Date;
}

type ColumnLayout = 'col-a' | 'col-aa' | 'col-ba' | 'col-ab' | 'col-aaa';
type ColumnWidth = 'col-md-12' | 'col-md-8' | 'col-md-6' | 'col-md-4';

interface ElementDefinition {
  id: number;
  elementName: string;
  elementDesc: string;
  type: ChartType;
  renderComp: string;     // React component name
  filterComp: string;     // Filter component name
  active: boolean;
}

type ChartType = 
  | 'spline' | 'pie' | 'donut' | 'bar' | 'text' 
  | 'wordcloud' | 'spider' | 'sunburst' | 'map'
  | 'stream' | 'profile' | 'collage';

interface FilterConfig {
  profileIds: FilterField;
  sources: FilterField;
  sentiment?: FilterField;
  gender?: FilterField;
  topics?: FilterField;
  map?: FilterField;
}

interface FilterField {
  multiple: boolean;
  value: string | string[];
  required: boolean;
}

interface ConfigOptions {
  size: number;
  color: string;
  interval: number;      // Refresh interval in ms
  timeout: boolean;      // Auto-refresh enabled
  influencerCount?: number;
  dateRange?: string;
  excludeAdminPosts?: boolean;
}
```

### 4.2 API Endpoints

Based on existing implementation:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `cockpit/getTemplateDetailsCockpit` | POST | Load dashboard template |
| `cockpit/getRowDetailsCockpit` | POST | Get row configuration |
| `cockpit/saveRowDetailsCockpit` | POST | Save row layout changes |
| `cockpit/getTrendCockpit` | POST | Fetch trend data |
| `cockpit/Cockpit` | GET | View dashboard |

### 4.3 Widget Registry

```typescript
const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  'SplineChartParent': {
    id: 1,
    name: 'Spline Chart',
    type: 'spline',
    category: 'line',
    filterComp: 'CommonChartFilter',
    renderComp: 'SplineChartParent',
    defaultConfig: { size: 100, interval: 5000, timeout: true },
    supportedFilters: ['profileIds', 'sources', 'dateRange'],
  },
  'PieChartParent': {
    id: 2,
    name: 'Pie Chart',
    type: 'pie',
    category: 'pie',
    filterComp: 'CommonChartFilter',
    renderComp: 'PieChartParent',
    defaultConfig: { size: 100 },
    supportedFilters: ['profileIds', 'sources', 'sentiment'],
  },
  // ... all 25+ widgets
};
```

---

## 5. Acceptance Criteria

### 5.1 Widget Library (LHS)

- [ ] All 25+ existing widgets displayed in categorized list
- [ ] Search/filter functionality for widgets
- [ ] Drag initiation with visual feedback
- [ ] Widget preview tooltip on hover

### 5.2 Canvas

- [ ] Drop zones highlight during drag
- [ ] Empty state with instructions
- [ ] Row creation with column layout selection (5 options)
- [ ] Row title editing (inline)
- [ ] Row reordering via drag
- [ ] Row collapse/expand
- [ ] Row deletion with confirmation
- [ ] Widget placement in columns
- [ ] Widget selection with visual indicator

### 5.3 Widget Configuration (RHS)

- [ ] Opens on widget selection
- [ ] Profile multi-select (required)
- [ ] Source multi-select
- [ ] Channel selection
- [ ] Date range picker with type selection
- [ ] Working hours radio options
- [ ] Display options (size, color, interval)
- [ ] Threshold configuration
- [ ] Apply/Reset buttons

### 5.4 Persistence

- [ ] Dashboard save (creates/updates template)
- [ ] Dashboard load (restores full configuration)
- [ ] Dashboard share (user selection)
- [ ] Dashboard export (JSON)
- [ ] Dashboard delete (with confirmation)

### 5.5 Preview Mode

- [ ] Full-screen toggle
- [ ] Hides all editing chrome
- [ ] Auto-refresh continues
- [ ] ESC to exit

---

## 6. UI/UX Considerations

### 6.1 Existing Design Patterns

From analyzed files, maintain consistency with:

- **Cards**: `.card`, `.cardStyle` with rounded corners
- **Colors**: Brand colors (`#401366`, `#1777A8`, `#3B5998`, etc.)
- **Icons**: Font Awesome icons
- **Forms**: Select2 dropdowns, date range pickers
- **Buttons**: `.btn`, `.btn-outline-primary`

### 6.2 Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| > 1200px | Full three-panel layout |
| 900-1200px | LHS collapses to icons |
| < 900px | Single column, bottom sheet config |

---

## 7. Migration Path

### Phase 1: Foundation
- Extend existing cockpit template system
- Create widget registry from existing components
- Build three-panel shell

### Phase 2: Widget Library
- Categorize all existing chart components
- Implement drag-and-drop from palette
- Create widget thumbnails

### Phase 3: Canvas Builder
- Implement row management (create, reorder, delete)
- Column layout selection UI
- Drop zone functionality

### Phase 4: Configuration Panel
- Port existing filter components
- Build configuration form generator
- Implement apply/reset logic

### Phase 5: Persistence & Polish
- Save/load dashboard templates
- Share functionality
- Export/import
- Undo/redo

---

## 8. Dependencies

| Dependency | Status | Owner |
|------------|--------|-------|
| Existing chart components | Available | Frontend |
| Template CRUD APIs | Available | Backend |
| Filter components | Available | Frontend |
| User/profile APIs | Available | Backend |
| Permission system | Available | Backend |

---

## 9. Open Questions

1. **Permissions**: Should custom dashboards require new permissions or use existing cockpit (499)?
2. **Widget Limits**: Maximum widgets per dashboard?
3. **Template Sharing**: Organization-wide vs team-based sharing?
4. **Data Refresh**: Global refresh vs per-widget refresh intervals?
5. **Mobile**: Support for tablet editing?

---

## Appendix A: Existing Widget Component Map

| Render Component | Filter Component | Type |
|------------------|------------------|------|
| SplineChartParent | CommonChartFilter | spline |
| PieChartParent | CommonChartFilter | pie |
| DonutChartParent | CommonChartFilter | donut |
| BarChartParent | CommonChartFilter | bar |
| TextChartParent | CommonChartFilter | text |
| WordCloudParent | CommonChartFilter | wordcloud |
| BrandScoreParent | CommonChartFilter | score |
| PostPerformanceParent | CommonChartFilter | post |
| NewsStreamParent | NewsStreamFilter | stream |
| SplineChartCustomizableParent | CustomChartFilter | spline |
| InfluencersParent | InfluencerFilter | profile |
| SourceDistCharParent | CommonChartFilter | distribution |
| DoubleAxisChartParent | CommonChartFilter | dualaxis |
| GeoTaggedPostChartParent | GeoFilter | map |
| KeyProfilesParent | ProfileFilter | profile |
| DrilldownPieChartParent | CommonChartFilter | pie |
| PictureCloudParent | CommonChartFilter | cloud |
| PostCollageChartParent | CommonChartFilter | collage |
| SpiderChartParent | CommonChartFilter | radar |
| Matrix3DBubbleChart | CommonChartFilter | bubble |
| MessageStreamParent | StreamFilter | stream |
| ListenStreamParent | StreamFilter | stream |
| CampaignPostPerformanceParent | CampaignFilter | campaign |
| CampaignStreamingParent | CampaignFilter | stream |
| SunburstChartParent | HierarchyFilter | sunburst |
| IndiaChartParent | GeoFilter | map |
| SummaryProfileParent | ProfileFilter | summary |

---

*End of PRD v2*
