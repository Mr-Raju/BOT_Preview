# Custom Dashboard Builder — UX Wireframes

**Version:** 2.0  
**Date:** April 9, 2026  
**Based On:** Nextiva-CX/S360 Dashboard Implementation Analysis

---

## 1. Overall Layout Architecture

### 1.1 Three-Panel Layout (Desktop)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ [Logo] Dashboard Builder    │ "My Custom Dashboard" ✏️ │ [Save] [Preview] [⋯] │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
├──────────────┬────────────────────────────────────────────────┬────────────────────┤
│              │                                                │                    │
│   WIDGET     │                  CANVAS                        │   WIDGET           │
│   LIBRARY    │               (Drop Zone)                      │   CONFIG           │
│    (LHS)     │                                                │   PANEL            │
│              │                                                │    (RHS)           │
│   200-240px  │              Fluid Width                       │   280-320px        │
│              │                                                │   (Collapsible)    │
│              │                                                │                    │
└──────────────┴────────────────────────────────────────────────┴────────────────────┘
```

### 1.2 Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| > 1200px | Full three-panel |
| 900-1200px | LHS collapses to icons, RHS slides over canvas |
| < 900px | Single column with bottom sheet for config |

---

## 2. Widget Library Panel (LHS)

### 2.1 Collapsed State (Icon Only)

```
┌──────┐
│  🔍  │ ← Search toggle
├──────┤
│      │
│  📊  │ KPI
│      │
│  📈  │ Charts
│      │
│  📋  │ Tables
│      │
│  🔧  │ Filters
│      │
└──────┘
  48px
```

### 2.2 Expanded State (Default)

Based on existing S360 chart components:

```
┌─────────────────────────────┐
│ WIDGETS                     │
│ ┌─────────────────────────┐ │
│ │ 🔍 Search widgets...    │ │
│ └─────────────────────────┘ │
│                             │
│ ▼ KPI CARDS (3)             │
│ ┌─────────────────────────┐ │
│ │ ┌───────┐ ┌───────┐     │ │
│ │ │ 📊    │ │ 📊    │     │ │
│ │ │ Text  │ │ Brand │     │ │
│ │ │ Chart │ │ Score │     │ │
│ │ └───────┘ └───────┘     │ │
│ │ ┌───────┐               │ │
│ │ │ 📊    │               │ │
│ │ │Summary│               │ │
│ │ │Profile│               │ │
│ │ └───────┘               │ │
│ └─────────────────────────┘ │
│                             │
│ ▼ LINE CHARTS (3)           │
│ │ Spline, SplineCustom,    │
│ │ DoubleAxis               │
│                             │
│ ▼ PIE/DONUT (4)             │
│ │ Pie, Donut, DrilldownPie,│
│ │ Sunburst                 │
│                             │
│ ▼ BAR CHARTS (2)            │
│ │ Bar, SourceDist          │
│                             │
│ ▼ STREAMS (4)               │
│ │ News, Message, Listen,   │
│ │ Campaign                 │
│                             │
│ ▼ PROFILES (3)              │
│ │ Influencers, KeyProfiles,│
│ │ PostPerformance          │
│                             │
│ ▼ MAPS (2)                  │
│ │ GeoTaggedPost, IndiaChart│
│                             │
│ ▼ VISUALIZATIONS (5)        │
│ │ WordCloud, PictureCloud, │
│ │ PostCollage, Spider,     │
│ │ Matrix3DBubble           │
│                             │
└─────────────────────────────┘
         200-240px
```

### 2.3 Widget Tile States

```
┌─ DEFAULT ────────┐   ┌─ HOVER ───────────┐   ┌─ DRAGGING ────────┐
│                  │   │  ╔════════════════╗│   │                   │
│   📊             │   │  ║ 📊             ║│   │   📊  (ghost)     │
│   Calls          │   │  ║ Calls          ║│   │   Calls           │
│   Offered        │   │  ║ Offered        ║│   │   Offered         │
│                  │   │  ╚════════════════╝│   │                   │
│   border: 1px    │   │   border: accent   │   │   opacity: 0.5    │
│   bg: card       │   │   bg: hover        │   │   + drag preview  │
└──────────────────┘   └───────────────────┘   └───────────────────┘
```

### 2.4 Drag Preview (Following Cursor)

```
          ↖ cursor
         ╭──────────────────╮
         │  📊 Calls Offered │
         │  KPI Card        │
         ╰──────────────────╯
           shadow + slight rotation
```

---

## 3. Canvas (Center Area)

### 3.1 Empty State

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                                                                     │
│                     ┌──────────────────────────┐                    │
│                     │                          │                    │
│                     │     📊                   │                    │
│                     │                          │                    │
│                     │   Drag widgets here      │                    │
│                     │   to start building      │                    │
│                     │   your dashboard         │                    │
│                     │                          │                    │
│                     │   ─────── or ───────     │                    │
│                     │                          │                    │
│                     │   [+ Add First Row]      │                    │
│                     │                          │                    │
│                     └──────────────────────────┘                    │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Row Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌─ ROW 1 ───────────────────────────────────────────────────────┐  │
│  │ ┌─────────────────────────────────────────────────────────┐   │  │
│  │ │ ≡ │ Executive KPIs                    │ [⚙️] [🗑️] [⋮] │   │  │
│  │ └─────────────────────────────────────────────────────────┘   │  │
│  │ ┌────────────┬────────────┬────────────┬────────────────────┐ │  │
│  │ │            │            │            │                    │ │  │
│  │ │   Widget   │   Widget   │   Widget   │      Widget        │ │  │
│  │ │            │            │            │                    │ │  │
│  │ └────────────┴────────────┴────────────┴────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ ROW 2 ───────────────────────────────────────────────────────┐  │
│  │ ┌─────────────────────────────────────────────────────────┐   │  │
│  │ │ ≡ │ Trend Analysis                    │ [⚙️] [🗑️] [⋮] │   │  │
│  │ └─────────────────────────────────────────────────────────┘   │  │
│  │ ┌───────────────────────────┬───────────────────────────────┐ │  │
│  │ │                           │                               │ │  │
│  │ │         Chart A           │          Chart B              │ │  │
│  │ │                           │                               │ │  │
│  │ └───────────────────────────┴───────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      [+ Add Row]                                ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Row Header (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌───┐                                                                   │
│ │ ≡ │  Executive KPIs                           [⚙️] [↑] [↓] [🗑️] [⋮] │
│ └───┘  ↑ drag handle    ↑ editable title        ↑ row actions          │
└─────────────────────────────────────────────────────────────────────────┘

Legend:
  ≡   = Drag handle (reorder rows)
  ⚙️  = Row settings (column layout)
  ↑↓  = Move row up/down
  🗑️  = Delete row
  ⋮   = More options (duplicate, collapse)
```

### 3.4 Row Settings Popover

Based on existing S360 `manageRowsModal.jsp` column layouts:

```
                          ┌────────────────────────────────┐
                          │ Manage Rows                    │
                          │ ──────────────────────────────│
                          │                                │
                          │ Row Number                     │
                          │ [Select row ▼]  (1-5)          │
                          │                                │
                          │ Column Layout*                 │
                          │ ⓘ Changing layout erases       │
                          │   existing widgets in row      │
                          │                                │
                          │ ┌─────────────────────────────┐│
                          │ │                             ││
                          │ │ ┌─────┐  col-a (100%)       ││
                          │ │ │█████│                     ││
                          │ │ └─────┘                     ││
                          │ │                             ││
                          │ │ ┌──┬──┐  col-aa (50/50)     ││
                          │ │ │██│██│                     ││
                          │ │ └──┴──┘                     ││
                          │ │                             ││
                          │ │ ┌────┬─┐ col-ba (66/33)     ││
                          │ │ │████│█│                    ││
                          │ │ └────┴─┘                    ││
                          │ │                             ││
                          │ │ ┌─┬────┐ col-ab (33/66)     ││
                          │ │ │█│████│                    ││
                          │ │ └─┴────┘                    ││
                          │ │                             ││
                          │ │ ┌─┬─┬─┐  col-aaa (33/33/33) ││
                          │ │ │█│█│█│                     ││
                          │ │ └─┴─┴─┘                     ││
                          │ │                             ││
                          │ └─────────────────────────────┘│
                          │                                │
                          │ [Save]               [Done]    │
                          └────────────────────────────────┘

Layout to CSS Width Mapping:
  col-a   → col-md-12
  col-aa  → col-md-6 + col-md-6
  col-ba  → col-md-8 + col-md-4
  col-ab  → col-md-4 + col-md-8
  col-aaa → col-md-4 + col-md-4 + col-md-4
```

### 3.5 Drop Zone States

```
┌─ IDLE ────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ┌───────────────────┬───────────────────┬───────────────────┐       │
│  │                   │                   │                   │       │
│  │     Widget A      │     Widget B      │    (empty col)    │       │
│  │                   │                   │   dashed border   │       │
│  └───────────────────┴───────────────────┴───────────────────┘       │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌─ DRAG OVER (valid) ───────────────────────────────────────────────────┐
│                                                                       │
│  ┌───────────────────┬───────────────────┬╔═══════════════════╗      │
│  │                   │                   │║                   ║      │
│  │     Widget A      │     Widget B      │║   DROP HERE       ║      │
│  │                   │                   │║   accent glow     ║      │
│  └───────────────────┴───────────────────┴╚═══════════════════╝      │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌─ DRAG OVER ROW (insert between) ──────────────────────────────────────┐
│                                                                       │
│  ┌─ Row 1 ──────────────────────────────────────────────────────────┐ │
│  │     Widget A      │     Widget B      │     Widget C             │ │
│  └───────────────────────────────────────────────────────────────────┘│
│  ╔═══════════════════════════════════════════════════════════════════╗│
│  ║  ━━━━━━━━━━━━━━━━━━ Insert Row Here ━━━━━━━━━━━━━━━━━━━━━          ║│
│  ╚═══════════════════════════════════════════════════════════════════╝│
│  ┌─ Row 2 ──────────────────────────────────────────────────────────┐ │
│  │     Widget D      │     Widget E                                  │ │
│  └───────────────────────────────────────────────────────────────────┘│
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### 3.6 Widget in Column (Placed State)

```
┌───────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────┐  │
│  │  ╭─────────────────────────────────────────╮│  │
│  │  │                     ┌──────┐            ││  │
│  │  │  Calls Offered      │  ⋮   │            ││  │
│  │  │  ──────────────     └──────┘            ││  │
│  │  │       12,847                            ││  │
│  │  │  ▲ 4.2% vs prior                        ││  │
│  │  │                                         ││  │
│  │  ╰─────────────────────────────────────────╯│  │
│  │                                              │  │
│  │  ↑ Actual widget renders here               │  │
│  │  ↑ Click to select → opens RHS config       │  │
│  │  ↑ Kebab menu: Edit, Remove, Duplicate      │  │
│  └─────────────────────────────────────────────┘  │
│   ↑ Column container with resize handles          │
└───────────────────────────────────────────────────┘
```

### 3.7 Column Resize Interaction

```
┌────────────────┐│┌────────────────────────────────┐
│                ││                                 │
│   Widget A     ├┤        Widget B                 │
│                ││                                 │
│   33%          ││        66%                      │
└────────────────┘│└────────────────────────────────┘
                 ↑
                 Drag handle (cursor: col-resize)
                 Shows width % on hover

During drag:
┌─────────────────────┐│┌───────────────────────────┐
│                     ││                            │
│   Widget A          ├┤        Widget B            │
│                     ││  ┌──────┐                  │
│   [42%]             ││  │ 58%  │                  │
└─────────────────────┘│  └──────┘                  │
                       │└───────────────────────────┘
                       ↑
                       Tooltip shows live %
```

---

## 4. Widget Selection & Configuration (RHS)

### 4.1 No Selection State

```
┌─────────────────────────────┐
│                             │
│  CONFIGURATION              │
│  ─────────────────────────  │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    👆                 │  │
│  │                       │  │
│  │    Click a widget     │  │
│  │    to configure       │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│                             │
│                             │
│                             │
│                             │
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

### 4.2 Widget Selected State

Based on existing S360 filter patterns from `brand/home.jsp`:

```
┌────────────────────────────────┐
│ [←] WIDGET CONFIGURATION       │
│ ───────────────────────────────│
│                                │
│ ┌────────────────────────────┐ │
│ │ 📈 Spline Chart            │ │
│ │ Trend Analysis             │ │
│ └────────────────────────────┘ │
│                                │
│ ▼ BASIC SETTINGS               │
│ ┌────────────────────────────┐ │
│ │ Widget Name                │ │
│ │ [Trend Analysis_______]    │ │
│ │                            │ │
│ │ Size:  [100 ▼]             │ │
│ │ Color: [#3d9cf5 🎨]        │ │
│ └────────────────────────────┘ │
│                                │
│ ▼ DATA SOURCE                  │
│ ┌────────────────────────────┐ │
│ │ Profile(s)*                │ │
│ │ [Select profiles...   ▼]   │ │
│ │ (Multi-select, required)   │ │
│ │                            │ │
│ │ Sources                    │ │
│ │ [Twitter, Facebook    ▼]   │ │
│ │                            │ │
│ │ Channels                   │ │
│ │ [All Channels         ▼]   │ │
│ └────────────────────────────┘ │
│                                │
│ ▼ DATE RANGE                   │
│ ┌────────────────────────────┐ │
│ │ Date Type                  │ │
│ │ ○ Case Started Between     │ │
│ │ ○ Case Acted Between       │ │
│ │                            │ │
│ │ Range                      │ │
│ │ [04/01/2026 TO 04/09/2026] │ │
│ │                            │ │
│ │ Working Hours              │ │
│ │ ○ All Working Hours        │ │
│ │ ○ Within Business Hours    │ │
│ │ ○ Outside Business Hours   │ │
│ └────────────────────────────┘ │
│                                │
│ ▶ ADDITIONAL FILTERS           │
│   (Workbasket, User,           │
│    Sentiment, Holiday calc)    │
│                                │
│ ▶ DISPLAY OPTIONS              │
│   (Auto-refresh, Interval,     │
│    Timeout toggle)             │
│                                │
│ ┌────────────────────────────┐ │
│ │  [Reset]     [Apply]       │ │
│ └────────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

### 4.3 Expanded Sections

#### Pivot / Group By

```
│ ▼ PIVOT / GROUP BY             │
│ ┌────────────────────────────┐ │
│ │                            │ │
│ │ Group By                   │ │
│ │ [Hour              ▼]      │ │
│ │                            │ │
│ │ Aggregation                │ │
│ │ [Sum               ▼]      │ │
│ │                            │ │
│ │ Sort Order                 │ │
│ │ ○ Ascending ● Descending   │ │
│ │                            │ │
│ │ Limit Results              │ │
│ │ [Top 10            ▼]      │ │
│ │                            │ │
│ └────────────────────────────┘ │
```

#### Display Options

```
│ ▼ DISPLAY OPTIONS              │
│ ┌────────────────────────────┐ │
│ │                            │ │
│ │ Widget Title               │ │
│ │ [Calls Offered_________]   │ │
│ │                            │ │
│ │ Color Theme                │ │
│ │ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │ │
│ │ │🔵│ │🟢│ │🟡│ │🔴│ │🟣│  │ │
│ │ └──┘ └──┘ └──┘ └──┘ └──┘  │ │
│ │   ↑ selected               │ │
│ │                            │ │
│ │ ☑ Show trend indicator     │ │
│ │ ☑ Show comparison period   │ │
│ │ ☐ Show sparkline           │ │
│ │                            │ │
│ │ Number Format              │ │
│ │ [Compact (12.8K)      ▼]   │ │
│ │                            │ │
│ └────────────────────────────┘ │
```

#### Thresholds & Alerts (for KPIs)

```
│ ▼ THRESHOLDS & ALERTS          │
│ ┌────────────────────────────┐ │
│ │                            │ │
│ │ Warning Threshold          │ │
│ │ When value [< ▼] [10000__] │ │
│ │ Color: [🟡 Yellow ▼]       │ │
│ │                            │ │
│ │ Critical Threshold         │ │
│ │ When value [< ▼] [5000___] │ │
│ │ Color: [🔴 Red ▼]          │ │
│ │                            │ │
│ │ [+ Add Threshold]          │ │
│ │                            │ │
│ └────────────────────────────┘ │
```

### 4.4 Chart-Specific Options

```
│ ▼ CHART OPTIONS                │
│ ┌────────────────────────────┐ │
│ │                            │ │
│ │ Chart Type                 │ │
│ │ ┌────┐ ┌────┐ ┌────┐       │ │
│ │ │ 📊 │ │ 📈 │ │ 🍩 │       │ │
│ │ │Bar │ │Line│ │Donut       │ │
│ │ └────┘ └────┘ └────┘       │ │
│ │                            │ │
│ │ Orientation                │ │
│ │ ○ Vertical  ● Horizontal   │ │
│ │                            │ │
│ │ ☑ Show legend              │ │
│ │ ☑ Show data labels         │ │
│ │ ☐ Stack series             │ │
│ │ ☐ Enable drill-down        │ │
│ │                            │ │
│ │ X-Axis Label               │ │
│ │ [Time___________________]  │ │
│ │                            │ │
│ │ Y-Axis Label               │ │
│ │ [Count_________________]   │ │
│ │                            │ │
│ └────────────────────────────┘ │
```

---

## 5. Interaction Flows

### 5.1 Adding a Widget Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  1. BROWSE                 2. DRAG                   3. DROP                │
│  ┌───────────────┐        ┌───────────────┐         ┌───────────────┐      │
│  │ Search or     │        │ Drag from     │         │ Release over  │      │
│  │ expand        │   →    │ LHS panel     │    →    │ valid drop    │      │
│  │ categories    │        │ to canvas     │         │ zone          │      │
│  └───────────────┘        └───────────────┘         └───────────────┘      │
│         │                        │                         │                │
│         ↓                        ↓                         ↓                │
│  ┌───────────────┐        ┌───────────────┐         ┌───────────────┐      │
│  │ Widget tiles  │        │ Ghost preview │         │ Widget placed │      │
│  │ with hover    │        │ + drop zone   │         │ in column,    │      │
│  │ states        │        │ highlighting  │         │ auto-selected │      │
│  └───────────────┘        └───────────────┘         └───────────────┘      │
│                                                             │                │
│                                                             ↓                │
│                                                     ┌───────────────┐      │
│                                                     │ RHS config    │      │
│                                                     │ panel opens   │      │
│                                                     └───────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Creating a Row Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  1. INITIATE               2. CONFIGURE              3. CONFIRM             │
│  ┌───────────────┐        ┌───────────────┐         ┌───────────────┐      │
│  │ Click         │        │ Row settings  │         │ Row created   │      │
│  │ "+ Add Row"   │   →    │ popover opens │    →    │ with empty    │      │
│  │ button        │        │ (col count)   │         │ columns       │      │
│  └───────────────┘        └───────────────┘         └───────────────┘      │
│                                                                             │
│  Alternative: Drag widget to "+ Add Row" area                               │
│  ┌───────────────┐        ┌───────────────┐         ┌───────────────┐      │
│  │ Drag widget   │        │ Auto-create   │         │ Widget in     │      │
│  │ to bottom     │   →    │ single-col    │    →    │ new row       │      │
│  │ of canvas     │        │ row           │         │               │      │
│  └───────────────┘        └───────────────┘         └───────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Configuring a Widget Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  1. SELECT                 2. MODIFY                  3. APPLY              │
│  ┌───────────────┐        ┌───────────────┐         ┌───────────────┐      │
│  │ Click widget  │        │ Change values │         │ Click Apply   │      │
│  │ on canvas     │   →    │ in RHS panel  │    →    │ button        │      │
│  │               │        │               │         │               │      │
│  └───────────────┘        └───────────────┘         └───────────────┘      │
│         │                        │                         │                │
│         ↓                        ↓                         ↓                │
│  ┌───────────────┐        ┌───────────────┐         ┌───────────────┐      │
│  │ Widget gets   │        │ Live preview  │         │ Config saved  │      │
│  │ selection     │        │ (optional)    │         │ Widget        │      │
│  │ border        │        │               │         │ updates       │      │
│  └───────────────┘        └───────────────┘         └───────────────┘      │
│                                                                             │
│  Alternative: Click away to deselect, auto-apply pending changes            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Reordering Rows Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─ Before ────────────────┐      ┌─ During Drag ─────────────┐            │
│  │ ┌─ Row 1 ─────────────┐ │      │                           │            │
│  │ │ ≡  Executive KPIs   │ │      │ ┌─ Row 2 ───────────────┐ │            │
│  │ └─────────────────────┘ │      │ │ ≡  Trend Analysis     │ │            │
│  │                         │      │ └─────────────────────────┘            │
│  │ ┌─ Row 2 ─────────────┐ │      │ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │            │
│  │ │ ≡  Trend Analysis   │ │  →   │   Drop indicator line     │            │
│  │ └─────────────────────┘ │      │ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │            │
│  │                         │      │ ╔═══════════════════════╗ │            │
│  │ ┌─ Row 3 ─────────────┐ │      │ ║ ≡  Executive KPIs     ║ │ ← dragging │
│  │ │ ≡  Queue Health     │ │      │ ╚═══════════════════════╝ │            │
│  │ └─────────────────────┘ │      │ ┌─ Row 3 ───────────────┐ │            │
│  │                         │      │ │ ≡  Queue Health       │ │            │
│  └─────────────────────────┘      │ └───────────────────────┘ │            │
│                                   └───────────────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Header Bar Details

Based on existing S360 dashboard headers from `brand/home.jsp`:

### 6.1 Header Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│  ┌─────────────────────────────────┬────────────────────────────────────────────┐   │
│  │                                 │                                            │   │
│  │  Dashboard Builder              │  [🕐] [📌] [⚙️ Filter] [⬇️ Download ▼]    │   │
│  │  ─────────────────              │                                            │   │
│  │  Dashboard > Custom Builder     │  [💾 Save Pin] [📅 Schedule]              │   │
│  │                                 │                                            │   │
│  └─────────────────────────────────┴────────────────────────────────────────────┘   │
│                                                                                     │
│  "My Custom Dashboard" ✏️                              [Toggle Full Screen]         │
│  ↑ editable title                                                                   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

Header Actions (from existing implementation):
  🕐  = Saved Schedule Downloads (dropdown)
  📌  = Saved Filters / Pins (dropdown)
  ⚙️  = Filter Panel Toggle (collapse/expand)
  ⬇️  = Download Options (Excel, PDF, PPT)
  💾  = Save as Pin (creates saved filter)
  📅  = Schedule Download (recurring reports)
```

### 6.2 Global Filter Panel (Collapsible)

From existing S360 dashboard pattern - appears below header when Filter button clicked:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ▼ FILTERS                                                             [Collapse ▲] │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌────────────────────────┬─────────────────────────────────────────────────────┐   │
│  │ Date Type              │ Date Range                                          │   │
│  │ [Case Started Btwn ▼]  │ [04/01/2026 TO 04/09/2026_____________________]     │   │
│  └────────────────────────┴─────────────────────────────────────────────────────┘   │
│                                                                                     │
│  Working Hours:  ○ All Working Hours  ○ Within Business  ○ Outside Business        │
│                                                                                     │
│  ┌─────────────────────────────────────┬────────────────────────────────────────┐   │
│  │ Profile(s)*                         │ Sources                                │   │
│  │ [Brand A, Brand B, Brand C     ▼]   │ [Twitter, Facebook, Instagram    ▼]   │   │
│  └─────────────────────────────────────┴────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────┬────────────────────────────────────────┐   │
│  │ Channels                            │ Workbasket                             │   │
│  │ [All Channels                  ▼]   │ [All Work Baskets               ▼]    │   │
│  └─────────────────────────────────────┴────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────┐                                            │
│  │ User                                │  ☐ Calculate excluding holidays           │
│  │ [All Users                     ▼]   │                                            │
│  └─────────────────────────────────────┘                                            │
│                                                                                     │
│                         [Filter]  [Reset]                                           │
│                                                                                     │
│  *Note: Please select account to get more details                                   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Dashboard Name Inline Edit

```
┌─ Default ──────────────────┐    ┌─ Editing ───────────────────────────────┐
│                            │    │                                         │
│  "My Dashboard" ✏️         │ →  │ ┌─────────────────────────────────────┐ │
│                            │    │ │ My Custom Analytics Dashboard      │ │
│                            │    │ └─────────────────────────────────────┘ │
│                            │    │  ↑ auto-focus, select-all               │
│                            │    │  Enter/Blur = save, Esc = cancel        │
│                            │    │                                         │
└────────────────────────────┘    └─────────────────────────────────────────┘
```

### 6.4 Download Options Menu

From existing S360 implementation:

```
                              ┌────────────────────────────┐
                              │ Choose Download Format     │
                              │ ─────────────────────────  │
                              │ 📊 Excel                   │
                              │ 📄 PDF                     │
                              │ 📰 PPT                     │
                              └────────────────────────────┘
```

### 6.5 Saved Filters Menu

```
                              ┌────────────────────────────┐
                              │ 📌 Saved Pins              │
                              │ ─────────────────────────  │
                              │ 📌 Q1 Performance    [✕]   │
                              │ 📌 Weekly Review     [✕]   │
                              │ 📌 Agent Stats       [✕]   │
                              │ ─────────────────────────  │
                              │ No Saved Pin (if empty)    │
                              └────────────────────────────┘
```

### 6.6 More Options Menu (⋮)

```
                              ┌────────────────────────────┐
                              │ Duplicate Dashboard        │
                              │ ─────────────────────────  │
                              │ Export as JSON             │
                              │ Import Layout              │
                              │ ─────────────────────────  │
                              │ Share Dashboard            │
                              │ Reset to Default           │
                              │ 🗑️ Delete Dashboard        │
                              └────────────────────────────┘
```

---

## 7. Preview Mode

### 7.1 Preview Modal/Overlay

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  [✕ Close Preview]                                      [Full Screen]  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │   MY CUSTOM ANALYTICS DASHBOARD                                         │ │
│ │   ─────────────────────────────────────────────────────────────────     │ │
│ │                                                                         │ │
│ │   ┌─ Executive KPIs ────────────────────────────────────────────────┐   │ │
│ │   │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │ │
│ │   │ │  12,847  │ │  11,204  │ │    412   │ │    189   │            │   │ │
│ │   │ │ Offered  │ │ Handled  │ │  Missed  │ │   VM     │            │   │ │
│ │   │ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │   │ │
│ │   └─────────────────────────────────────────────────────────────────┘   │ │
│ │                                                                         │ │
│ │   ┌─ Trend Analysis ────────────────────────────────────────────────┐   │ │
│ │   │ ┌─────────────────────────┐ ┌─────────────────────────────────┐ │   │ │
│ │   │ │                         │ │                                 │ │   │ │
│ │   │ │     [LINE CHART]        │ │      [BAR CHART]                │ │   │ │
│ │   │ │                         │ │                                 │ │   │ │
│ │   │ └─────────────────────────┘ └─────────────────────────────────┘ │   │ │
│ │   └─────────────────────────────────────────────────────────────────┘   │ │
│ │                                                                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Note: Preview hides all editing chrome (drag handles, settings buttons, etc.)
```

---

## 8. Keyboard Shortcuts & Existing Patterns

### 8.1 Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Save dashboard |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Delete / Backspace` | Remove selected widget |
| `Escape` | Deselect / Close panel |
| `Cmd/Ctrl + D` | Duplicate selected widget |
| `Arrow keys` | Move selection between widgets |
| `Tab` | Next widget |
| `Shift + Tab` | Previous widget |
| `F11` | Toggle full screen (existing pattern) |

### 8.2 Existing S360 Component Patterns

From cockpit implementation:

```javascript
// Full screen toggle pattern
toggleFullScreen() {
  if (document.fullScreenElement || document.mozFullScreen) {
    // Exit full screen
    document.exitFullscreen();
    // Restore UI elements
    $(".navbar-inner").css('display','inline-block');
    $(".page-sidebar").css('display','inline-block');
  } else {
    // Enter full screen
    document.documentElement.requestFullscreen();
    // Hide UI elements
    $(".navbar-inner").css('display','none');
    $(".page-sidebar").css('display','none');
  }
}

// Chart creation pattern
createChart(ChartName, data, handler) {
  var Component = window[ChartName];
  return <Component data={data} handler={handler} />
}

// Row rendering pattern
renderMainChart() {
  this.state.tempEleMap.map((object, i) => {
    if (rowNum != object.rowPosition) {
      rowNum = object.rowPosition;
      // Create row with columns
      return <div className="row mainChartRow">{cols}</div>
    }
  });
}
```

---

## 9. Error & Empty States

### 9.1 Widget Load Error

```
┌────────────────────────────────────┐
│                                    │
│   ┌────────────────────────────┐   │
│   │          ⚠️                │   │
│   │                            │   │
│   │   Unable to load widget    │   │
│   │                            │   │
│   │   [Retry]   [Remove]       │   │
│   └────────────────────────────┘   │
│                                    │
└────────────────────────────────────┘
```

### 9.2 Empty Column Placeholder

```
┌────────────────────────────────────┐
│                                    │
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│   │                            │   │
│        Drop widget here            │
│   │                            │   │
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
│                                    │
│   dashed border, muted text        │
│                                    │
└────────────────────────────────────┘
```

### 9.3 No Widgets Available (Search)

```
┌─────────────────────────────┐
│ WIDGETS                     │
│ ┌─────────────────────────┐ │
│ │ 🔍 "xyzabc"             │ │
│ └─────────────────────────┘ │
│                             │
│   ┌─────────────────────┐   │
│   │                     │   │
│   │   No widgets found  │   │
│   │   matching "xyzabc" │   │
│   │                     │   │
│   │   [Clear search]    │   │
│   │                     │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

---

## 10. Existing S360 Widget Component Reference

### 10.1 Widget Categories (from cockpit/home.jsp)

| Category | Components | Render Component |
|----------|------------|------------------|
| **KPI Cards** | Text, BrandScore, Summary | TextChartParent, BrandScoreParent, SummaryProfileParent |
| **Line Charts** | Spline, Customizable Spline, Double Axis | SplineChartParent, SplineChartCustomizableParent, DoubleAxisChartParent |
| **Pie Charts** | Pie, Donut, Drilldown, Sunburst | PieChartParent, DonutChartParent, DrilldownPieChartParent, SunburstChartParent |
| **Bar Charts** | Bar, Source Distribution | BarChartParent, SourceDistCharParent |
| **Streams** | News, Message, Listen, Campaign | NewsStreamParent, MessageStreamParent, ListenStreamParent, CampaignStreamingParent |
| **Profiles** | Influencers, Key Profiles, Post Performance | InfluencersParent, KeyProfilesParent, PostPerformanceParent |
| **Maps** | GeoTagged Posts, India Map | GeoTaggedPostChartParent, IndiaChartParent |
| **Visualizations** | Word Cloud, Picture Cloud, Post Collage, Spider, Matrix Bubble | WordCloudParent, PictureCloudParent, PostCollageChartParent, SpiderChartParent, Matrix3DBubbleChart |

### 10.2 Column Layout CSS Classes

| Layout | CSS Class | Width |
|--------|-----------|-------|
| col-a | col-md-12 | 100% |
| col-aa (position 1) | col-md-6 | 50% |
| col-aa (position 2) | col-md-6 | 50% |
| col-ba (position 1) | col-md-8 | 66.67% |
| col-ba (position 2) | col-md-4 | 33.33% |
| col-ab (position 1) | col-md-4 | 33.33% |
| col-ab (position 2) | col-md-8 | 66.67% |
| col-aaa (all) | col-md-4 | 33.33% |

### 10.3 Filter Component Reference

| Filter | Component | CSS Class |
|--------|-----------|-----------|
| Profile | Select2 multi-select | `.profileData` |
| Sources | Select2 multi-select | `.sourcefltr` |
| Channels | Select2 multi-select | `.channels-filter` |
| Date Range | Bootstrap daterangepicker | `.date-range` |
| Sentiment | Select2 multi-select | `.sentiments-filter` |
| Working Hours | Radio buttons | `input[name="workingHours"]` |
| Workbasket | Select2 | `#basket` |
| User | Select2 | `#user` |

### 10.4 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `cockpit/getTemplateDetailsCockpit` | POST | Load dashboard template |
| `cockpit/getRowDetailsCockpit` | POST | Get row configuration |
| `cockpit/saveRowDetailsCockpit` | POST | Save row changes |
| `cockpit/getTrendCockpit` | POST | Fetch trend data |
| `cockpit/Cockpit` | GET | View dashboard |

---

*End of UX Wireframes Document v2*

