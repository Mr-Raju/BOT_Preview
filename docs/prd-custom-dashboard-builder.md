# Product Requirements Document: Custom Dashboard Builder

**Version:** 1.0 (High-Level)  
**Date:** April 9, 2026  
**Status:** Draft  

---

## 1. Executive Summary

### 1.1 Problem Statement
Current dashboards in the Nextiva CCaaS platform are pre-configured with fixed layouts, limiting users' ability to personalize their analytics workspace. Users need the flexibility to create custom dashboard layouts that match their specific operational focus and workflow preferences.

### 1.2 Solution Overview
Build a **Custom Dashboard Builder** that provides a drag-and-drop canvas interface allowing users to:
- Select from existing dashboard widgets in a left-hand panel
- Arrange widgets on a configurable grid-based canvas
- Customize row/column layouts with independent sizing
- Apply widget-level filters and pivot configurations

### 1.3 Target Users
- Contact Center Supervisors
- Operations Managers
- Business Analysts
- Executives requiring personalized views

---

## 2. Core Requirements

### 2.1 Widget Library Panel (Left-Hand Side)

| Requirement | Description |
|-------------|-------------|
| Widget Catalog | Display all available dashboard widgets in a scrollable, categorized panel |
| Widget Categories | Group widgets by type: KPI Cards, Charts, Tables, Real-time Monitors |
| Widget Preview | Show thumbnail/icon representation with widget name |
| Search/Filter | Enable quick search within widget library |
| Drag Initiation | Widgets are draggable from the panel to the canvas |

**Existing Widgets to Support (from current dashboard):**

| Category | Widget Types |
|----------|--------------|
| KPI Cards | Calls Offered, Calls Handled, Missed Calls, Voicemails, IVR Contained, IVR Abandon, Queue Abandoned, Abandon Rate, Service Level, ASA, AHT, FCR, Occupancy, Adherence, Callback Kept, CSAT |
| Charts | Call Outcome Mix (Doughnut), Hourly Contact Volume (Line), IVR Funnel (Bar), Queue Health (Bar) |
| Tables | Live Queue Snapshot |
| Filters | Date Range Selector, Queue Filter |

---

### 2.2 Canvas (Center Area)

| Requirement | Description |
|-------------|-------------|
| Drop Zone | Accept widgets dragged from LHS panel |
| Visual Feedback | Highlight valid drop zones during drag operations |
| Grid System | Row-based layout with configurable columns per row |
| Empty State | Display instructional placeholder when canvas is empty |

---

### 2.3 Row Management

| Requirement | Description | Details |
|-------------|-------------|---------|
| **R1: Create Row** | Users can create a new row on the canvas | Button/action to "Add Row" |
| **R2: Column Configuration** | Define number of columns per row | Options: 1, 2, 3, 4, 6, or custom |
| **R3: Insert Row Position** | Insert new rows below existing rows | Sequential row addition with drag-to-reorder |
| **R4: Independent Sizing** | Each row and column is independently customizable | Column widths adjustable per row (e.g., 50/50, 33/66, 25/25/50) |
| **R5: Row Title/Label** | Each row has an editable title field | Title displays above the row widgets |
| **R6: Row Actions** | Row-level operations | Delete row, Move up/down, Duplicate row, Collapse/Expand |

**Row Configuration UI:**

```
┌─────────────────────────────────────────────────────────────┐
│ [Row Title: "Call Volume Metrics" ] ✏️     [⋮] Row Options  │
├──────────────────────┬──────────────────────────────────────┤
│      Widget A        │              Widget B                │
│    (1/3 width)       │            (2/3 width)               │
└──────────────────────┴──────────────────────────────────────┘
```

---

### 2.4 Column Customization

| Requirement | Description |
|-------------|-------------|
| Flexible Widths | Columns can be resized by dragging borders |
| Predefined Ratios | Quick-select common layouts (Equal, 1:2, 2:1, 1:2:1, etc.) |
| Min/Max Constraints | Minimum column width to ensure widget usability |
| Widget Fit | Widgets auto-resize to fit column dimensions |

---

### 2.5 Widget Configuration Panel (Right-Hand Side)

When a widget is selected on the canvas, a right-hand panel opens for configuration:

| Requirement | Description |
|-------------|-------------|
| **W1: Filter Configuration** | Apply data filters specific to the widget |
| **W2: Pivot Options** | Configure data grouping/aggregation for supported widgets |
| **W3: Display Settings** | Widget title, color scheme, display options |
| **W4: Data Source** | Select/modify data source or metric |
| **W5: Refresh Settings** | Auto-refresh interval (for real-time widgets) |

**RHS Panel Structure:**

```
┌─────────────────────────────┐
│ Widget Configuration        │
│ ─────────────────────────── │
│ 📊 [Widget Name]            │
│                             │
│ ▼ Filters                   │
│   • Date Range: [Today ▼]   │
│   • Queue: [All Queues ▼]   │
│   • Agent: [All Agents ▼]   │
│                             │
│ ▼ Pivot / Group By          │
│   • Group: [Hour ▼]         │
│   • Aggregate: [Sum ▼]      │
│                             │
│ ▼ Display Options           │
│   • Title: [________]       │
│   • Theme: [Default ▼]      │
│   • Show Legend: [✓]        │
│                             │
│ [Apply] [Reset]             │
└─────────────────────────────┘
```

---

## 3. UI/UX Layout Specification

### 3.1 Three-Panel Architecture

```
┌───────────────┬─────────────────────────────────────────┬──────────────────┐
│               │                                         │                  │
│   WIDGET      │              CANVAS                     │   WIDGET         │
│   LIBRARY     │         (Drop Zone)                     │   CONFIG         │
│    (LHS)      │                                         │    (RHS)         │
│               │   ┌─────────────────────────────────┐   │                  │
│ ┌───────────┐ │   │ Row 1: "Executive KPIs"         │   │  Appears when   │
│ │ KPI Cards │ │   │ ┌─────┬─────┬─────┬─────┬─────┐ │   │  widget is      │
│ │  • Calls  │ │   │ │ KPI │ KPI │ KPI │ KPI │ KPI │ │   │  selected       │
│ │  • AHT    │ │   │ └─────┴─────┴─────┴─────┴─────┘ │   │                  │
│ │  • CSAT   │ │   └─────────────────────────────────┘   │                  │
│ └───────────┘ │                                         │                  │
│               │   ┌─────────────────────────────────┐   │                  │
│ ┌───────────┐ │   │ Row 2: "Trend Analysis"         │   │                  │
│ │  Charts   │ │   │ ┌───────────┬───────────────────┐ │ │                  │
│ │  • Line   │ │   │ │  Chart A  │     Chart B       │ │ │                  │
│ │  • Bar    │ │   │ └───────────┴───────────────────┘ │ │                  │
│ │  • Donut  │ │   └─────────────────────────────────┘   │                  │
│ └───────────┘ │                                         │                  │
│               │           [+ Add Row]                   │                  │
│               │                                         │                  │
└───────────────┴─────────────────────────────────────────┴──────────────────┘
     ~240px              Fluid (remaining space)              ~300px
                                                          (collapsible)
```

### 3.2 Interaction Flow

1. **Start**: User opens Dashboard Builder with empty canvas
2. **Add Row**: Click "+ Add Row" → Configure columns (1-6)
3. **Name Row**: Enter row title/label
4. **Add Widget**: Drag widget from LHS → Drop into column
5. **Configure Widget**: Click widget → RHS panel opens → Set filters/pivots
6. **Resize**: Drag column borders to adjust widths
7. **Reorder**: Drag rows to reorder vertically
8. **Save**: Save dashboard configuration

---

## 4. Technical Considerations

### 4.1 Data Model

```typescript
interface CustomDashboard {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  rows: DashboardRow[];
}

interface DashboardRow {
  id: string;
  title: string;
  order: number;
  columns: DashboardColumn[];
}

interface DashboardColumn {
  id: string;
  widthPercent: number; // e.g., 33.33 for 1/3
  widget: WidgetConfig | null;
}

interface WidgetConfig {
  widgetType: string; // 'kpi-calls-offered', 'chart-volume', etc.
  filters: FilterConfig[];
  pivotConfig?: PivotConfig;
  displayOptions: DisplayOptions;
}

interface FilterConfig {
  field: string;
  operator: string;
  value: any;
}

interface PivotConfig {
  groupBy: string[];
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
}
```

### 4.2 Technology Stack Alignment

| Component | Technology |
|-----------|------------|
| Drag & Drop | HTML5 DnD API or React DnD / dnd-kit |
| State Management | React Context / Redux / Zustand |
| Grid System | CSS Grid with dynamic template columns |
| Persistence | REST API to backend database |
| Charts | Chart.js (existing) |

### 4.3 Integration Points

- **Widget Registry**: Central registry of available widgets with metadata
- **Data API**: Existing dashboard data APIs for metric retrieval
- **User Preferences**: Save/load custom dashboard configurations
- **Filter Propagation**: Global vs widget-level filter inheritance

---

## 5. Acceptance Criteria

### 5.1 Widget Library (LHS)
- [ ] All existing widgets displayed in categorized list
- [ ] Widgets are draggable to canvas
- [ ] Search/filter functionality works

### 5.2 Canvas
- [ ] Accepts dropped widgets
- [ ] Visual feedback during drag operations
- [ ] Empty state with instructions displayed

### 5.3 Row Management
- [ ] Can create rows with configurable column count
- [ ] Can add row title/label (editable)
- [ ] Rows can be inserted below existing rows
- [ ] Rows can be reordered via drag
- [ ] Rows can be deleted

### 5.4 Column Customization
- [ ] Column widths are independently adjustable
- [ ] Predefined layout ratios available
- [ ] Widgets resize to fit column

### 5.5 Widget Configuration (RHS)
- [ ] Panel opens on widget selection
- [ ] Filter configuration applies to widget data
- [ ] Pivot/grouping options available for supported widgets
- [ ] Display options (title, theme) configurable
- [ ] Changes apply immediately or on "Apply"

### 5.6 Persistence
- [ ] Dashboard configuration saves
- [ ] Dashboard loads on revisit
- [ ] Multiple custom dashboards supported per user

---

## 6. Out of Scope (v1.0)

| Item | Rationale |
|------|-----------|
| Sharing dashboards between users | Future enhancement |
| Template library | Future enhancement |
| Export to PDF/Image | Future enhancement |
| Real-time collaboration | Complexity for v1 |
| Custom widget creation | Requires separate builder |
| Mobile-optimized drag/drop | Desktop-first for v1 |

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Dashboard creation completion rate | > 80% |
| Average time to create first custom dashboard | < 5 minutes |
| User adoption (% users with custom dashboards) | > 40% within 3 months |
| Support tickets related to dashboard customization | < 10 per month |

---

## 8. Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| Widget metadata registry | Backend Team | Needed |
| Dashboard persistence API | Backend Team | Needed |
| User preferences service | Platform Team | Existing |
| Existing widget components | Frontend Team | Existing |

---

## 9. Open Questions

1. **Permissions**: Can users share custom dashboards with teams?
2. **Defaults**: Should there be a "reset to default" option?
3. **Widget Limits**: Maximum widgets per dashboard?
4. **Data Refresh**: Global refresh vs per-widget refresh?
5. **Mobile**: Responsive behavior for tablets?

---

## Appendix A: Existing Widget Inventory

Reference: `ccaas-contact-center-dashboard-data-dictionary.md`

| Widget ID | Type | Description |
|-----------|------|-------------|
| `kpi-offered` | KPI Card | Calls offered count |
| `kpi-handled` | KPI Card | Calls handled count |
| `kpi-missed` | KPI Card | Missed calls count |
| `kpi-vm` | KPI Card | Voicemails count |
| `kpi-ivr` | KPI Card | IVR contained % |
| `kpi-ivrAbandon` | KPI Card | IVR abandon % |
| `kpi-abandon` | KPI Card | Queue abandoned count |
| `kpi-abandonRate` | KPI Card | Abandon rate % |
| `kpi-sl` | KPI Card | Service level (20s) % |
| `kpi-asa` | KPI Card | ASA duration |
| `kpi-aht` | KPI Card | AHT duration |
| `kpi-fcr` | KPI Card | FCR % |
| `kpi-occ` | KPI Card | Occupancy % |
| `kpi-adh` | KPI Card | Adherence % |
| `kpi-cb` | KPI Card | Callback kept % |
| `kpi-csat` | KPI Card | CSAT score |
| `chart-outcomes` | Doughnut | Call outcome mix |
| `chart-volume` | Line | Hourly contact volume |
| `chart-ivr` | Bar | IVR funnel |
| `chart-queues` | Bar | Queue health |
| `table-queue-snapshot` | Table | Live queue snapshot |

---

*End of Document*
