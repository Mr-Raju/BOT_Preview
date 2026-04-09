# Custom Dashboard Builder — Technical Architecture

**Version:** 1.0  
**Date:** April 9, 2026  
**Stack:** React 19 + TypeScript + Vite  

---

## 1. Architecture Overview

### 1.1 High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD BUILDER APP                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         PRESENTATION LAYER                              │ │
│  │  ┌────────────┐  ┌─────────────────────┐  ┌───────────────────────────┐ │ │
│  │  │  Widget    │  │       Canvas        │  │     Config Panel          │ │ │
│  │  │  Library   │  │  (DnD Drop Zone)    │  │   (RHS Inspector)         │ │ │
│  │  │  (LHS)     │  │                     │  │                           │ │ │
│  │  └────────────┘  └─────────────────────┘  └───────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│  ┌─────────────────────────────────▼───────────────────────────────────────┐ │
│  │                          STATE LAYER                                    │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐ │ │
│  │  │  DashboardStore  │  │  DragDropContext │  │   SelectionContext     │ │ │
│  │  │  (Zustand)       │  │  (DnD Kit)       │  │   (React Context)      │ │ │
│  │  └──────────────────┘  └──────────────────┘  └────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│  ┌─────────────────────────────────▼───────────────────────────────────────┐ │
│  │                         SERVICE LAYER                                   │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐ │ │
│  │  │  WidgetRegistry  │  │  DashboardAPI    │  │   DataFetcher          │ │ │
│  │  │                  │  │                  │  │                        │ │ │
│  │  └──────────────────┘  └──────────────────┘  └────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│  ┌─────────────────────────────────▼───────────────────────────────────────┐ │
│  │                         PERSISTENCE LAYER                               │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │ │
│  │  │  REST API / LocalStorage / IndexedDB                             │   │ │
│  │  └──────────────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| UI Framework | React 19 | Existing stack, concurrent features |
| Language | TypeScript 5.9 | Type safety, IDE support |
| Build Tool | Vite 8 | Fast HMR, existing config |
| State Management | Zustand | Lightweight, TypeScript-first |
| Drag & Drop | @dnd-kit | Modern, accessible, tree-shakeable |
| Charts | Chart.js 4 | Existing integration |
| Styling | CSS Modules + CSS Variables | Existing pattern |
| Persistence | REST API + LocalStorage fallback | Server-first with offline support |

---

## 2. Data Model & Types

### 2.1 Core Type Definitions

```typescript
// src/types/dashboard.ts

export interface Dashboard {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
  rows: DashboardRow[];
  globalFilters: FilterConfig[];
  theme: DashboardTheme;
}

export interface DashboardRow {
  id: string;
  title: string;
  order: number;
  collapsed: boolean;
  height: 'auto' | number; // px
  columns: DashboardColumn[];
}

export interface DashboardColumn {
  id: string;
  widthPercent: number;   // 0-100, must sum to 100 per row
  widget: WidgetInstance | null;
}

export interface WidgetInstance {
  id: string;
  widgetType: WidgetTypeId;
  config: WidgetConfig;
}

export interface WidgetConfig {
  title?: string;
  filters: FilterConfig[];
  pivot?: PivotConfig;
  display: DisplayOptions;
  thresholds?: ThresholdConfig[];
  refreshInterval?: number; // seconds, 0 = inherit
}

export interface FilterConfig {
  id: string;
  field: string;
  operator: FilterOperator;
  value: FilterValue;
  inherited: boolean;     // true = from global filters
}

export type FilterOperator = 
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'notIn' | 'contains' | 'startsWith'
  | 'between' | 'isNull' | 'isNotNull';

export type FilterValue = 
  | string | number | boolean | null
  | string[] | number[]
  | { from: string | number; to: string | number };

export interface PivotConfig {
  groupBy: string[];
  aggregation: AggregationType;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  limit?: number;
}

export type AggregationType = 
  | 'sum' | 'avg' | 'count' | 'min' | 'max' 
  | 'countDistinct' | 'median' | 'percentile';

export interface DisplayOptions {
  colorTheme: ColorTheme;
  showTrend: boolean;
  showComparison: boolean;
  showSparkline: boolean;
  numberFormat: NumberFormat;
  chartOptions?: ChartDisplayOptions;
}

export interface ThresholdConfig {
  id: string;
  condition: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'between';
  value: number | [number, number];
  color: string;
  label?: string;
}

export type ColorTheme = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'teal';
export type NumberFormat = 'full' | 'compact' | 'percent' | 'currency' | 'duration';

export interface DashboardTheme {
  id: string;
  name: string;
  variables: Record<string, string>;
}
```

### 2.2 Widget Registry Types

```typescript
// src/types/widget-registry.ts

export type WidgetTypeId = 
  | 'kpi-calls-offered' | 'kpi-calls-handled' | 'kpi-missed-calls'
  | 'kpi-voicemails' | 'kpi-ivr-contained' | 'kpi-ivr-abandon'
  | 'kpi-queue-abandon' | 'kpi-abandon-rate' | 'kpi-service-level'
  | 'kpi-asa' | 'kpi-aht' | 'kpi-fcr' | 'kpi-occupancy'
  | 'kpi-adherence' | 'kpi-callback-kept' | 'kpi-csat'
  | 'chart-outcomes' | 'chart-volume' | 'chart-ivr' | 'chart-queues'
  | 'table-queue-snapshot';

export type WidgetCategory = 'kpi' | 'chart' | 'table' | 'filter' | 'custom';

export interface WidgetDefinition {
  id: WidgetTypeId;
  name: string;
  description: string;
  category: WidgetCategory;
  icon: string;              // Icon component name or SVG path
  minWidth: number;          // px
  minHeight: number;         // px
  defaultConfig: Partial<WidgetConfig>;
  supportedFilters: string[];
  supportsPivot: boolean;
  dataSource: DataSourceConfig;
  component: React.ComponentType<WidgetProps>;
  configComponent: React.ComponentType<WidgetConfigProps>;
}

export interface WidgetProps {
  instance: WidgetInstance;
  width: number;
  height: number;
  isSelected: boolean;
  isPreview: boolean;
  data: unknown;
  loading: boolean;
  error: Error | null;
  onSelect: () => void;
}

export interface WidgetConfigProps {
  instance: WidgetInstance;
  definition: WidgetDefinition;
  onChange: (config: WidgetConfig) => void;
  onApply: () => void;
  onReset: () => void;
}

export interface DataSourceConfig {
  endpoint: string;
  method: 'GET' | 'POST';
  defaultParams: Record<string, unknown>;
  transform?: (raw: unknown) => unknown;
  refreshable: boolean;
}
```

### 2.3 Drag & Drop Types

```typescript
// src/types/dnd.ts

export type DraggableType = 'widget-palette' | 'widget-canvas' | 'row';

export interface DragData {
  type: DraggableType;
  widgetType?: WidgetTypeId;     // For palette items
  instanceId?: string;           // For canvas widgets
  rowId?: string;                // For row reordering
  sourceColumnId?: string;       // For moving between columns
}

export interface DropTarget {
  type: 'column' | 'row-gap' | 'trash';
  rowId?: string;
  columnId?: string;
  insertIndex?: number;
}
```

---

## 3. Component Architecture

### 3.1 Component Tree

```
<App>
├── <DashboardBuilderProvider>          # Context providers wrapper
│   ├── <DndContext>                    # @dnd-kit provider
│   │   ├── <Header>
│   │   │   ├── <Logo>
│   │   │   ├── <DashboardNameEditor>
│   │   │   └── <HeaderActions>
│   │   │
│   │   └── <BuilderShell>              # 3-panel grid layout
│   │       ├── <WidgetLibrary>         # LHS
│   │       │   ├── <SearchInput>
│   │       │   └── <WidgetCategoryList>
│   │       │       └── <WidgetPaletteItem>*
│   │       │
│   │       ├── <Canvas>                # Center
│   │       │   ├── <CanvasEmptyState>
│   │       │   └── <RowList>
│   │       │       └── <DashboardRow>*
│   │       │           ├── <RowHeader>
│   │       │           │   ├── <DragHandle>
│   │       │           │   ├── <RowTitleEditor>
│   │       │           │   └── <RowActions>
│   │       │           └── <ColumnGrid>
│   │       │               └── <Column>*
│   │       │                   ├── <ColumnDropZone>
│   │       │                   ├── <WidgetContainer>
│   │       │                   │   └── <Widget>     # Dynamic
│   │       │                   └── <ColumnResizer>
│   │       │
│   │       └── <ConfigPanel>           # RHS
│   │           ├── <ConfigPanelEmpty>
│   │           └── <WidgetConfigurator>
│   │               ├── <WidgetHeader>
│   │               ├── <FilterSection>
│   │               ├── <PivotSection>
│   │               ├── <DisplaySection>
│   │               ├── <ThresholdSection>
│   │               └── <ConfigActions>
│   │
│   └── <DragOverlay>                   # Floating drag preview
│
└── <PreviewModal>                      # Full-screen preview
```

### 3.2 Key Component Files

```
src/
├── components/
│   ├── dashboard-builder/
│   │   ├── BuilderShell.tsx
│   │   ├── BuilderShell.module.css
│   │   │
│   │   ├── widget-library/
│   │   │   ├── WidgetLibrary.tsx
│   │   │   ├── WidgetCategoryList.tsx
│   │   │   ├── WidgetPaletteItem.tsx
│   │   │   └── WidgetLibrary.module.css
│   │   │
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx
│   │   │   ├── CanvasEmptyState.tsx
│   │   │   ├── DashboardRow.tsx
│   │   │   ├── RowHeader.tsx
│   │   │   ├── Column.tsx
│   │   │   ├── ColumnDropZone.tsx
│   │   │   ├── ColumnResizer.tsx
│   │   │   ├── WidgetContainer.tsx
│   │   │   └── Canvas.module.css
│   │   │
│   │   ├── config-panel/
│   │   │   ├── ConfigPanel.tsx
│   │   │   ├── WidgetConfigurator.tsx
│   │   │   ├── FilterSection.tsx
│   │   │   ├── PivotSection.tsx
│   │   │   ├── DisplaySection.tsx
│   │   │   ├── ThresholdSection.tsx
│   │   │   └── ConfigPanel.module.css
│   │   │
│   │   └── common/
│   │       ├── DragHandle.tsx
│   │       ├── InlineEditor.tsx
│   │       └── ActionMenu.tsx
│   │
│   └── widgets/
│       ├── registry.ts
│       ├── WidgetRenderer.tsx
│       │
│       ├── kpi/
│       │   ├── KpiCard.tsx
│       │   ├── KpiCardConfig.tsx
│       │   └── kpi.module.css
│       │
│       ├── charts/
│       │   ├── OutcomesChart.tsx
│       │   ├── VolumeChart.tsx
│       │   ├── IvrFunnelChart.tsx
│       │   ├── QueueHealthChart.tsx
│       │   └── ChartConfig.tsx
│       │
│       └── tables/
│           ├── QueueSnapshotTable.tsx
│           └── TableConfig.tsx
│
├── stores/
│   ├── dashboardStore.ts
│   ├── selectionStore.ts
│   └── undoStore.ts
│
├── hooks/
│   ├── useDashboard.ts
│   ├── useWidgetData.ts
│   ├── useColumnResize.ts
│   ├── useRowDrag.ts
│   └── useUndoRedo.ts
│
├── services/
│   ├── dashboardApi.ts
│   ├── widgetDataService.ts
│   └── persistenceService.ts
│
├── types/
│   ├── dashboard.ts
│   ├── widget-registry.ts
│   └── dnd.ts
│
└── utils/
    ├── idGenerator.ts
    ├── layoutCalculations.ts
    └── filterBuilder.ts
```

---

## 4. State Management

### 4.1 Dashboard Store (Zustand)

```typescript
// src/stores/dashboardStore.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Dashboard, DashboardRow, DashboardColumn, WidgetInstance } from '@/types/dashboard';

interface DashboardState {
  // Data
  dashboard: Dashboard | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  
  // Actions - Dashboard
  loadDashboard: (id: string) => Promise<void>;
  saveDashboard: () => Promise<void>;
  setDashboardName: (name: string) => void;
  setGlobalFilters: (filters: FilterConfig[]) => void;
  
  // Actions - Rows
  addRow: (columns: number, insertAfter?: string) => string;
  removeRow: (rowId: string) => void;
  moveRow: (rowId: string, newIndex: number) => void;
  setRowTitle: (rowId: string, title: string) => void;
  setRowColumns: (rowId: string, columns: number) => void;
  toggleRowCollapse: (rowId: string) => void;
  
  // Actions - Columns
  setColumnWidth: (rowId: string, columnId: string, widthPercent: number) => void;
  redistributeColumns: (rowId: string, widths: number[]) => void;
  
  // Actions - Widgets
  addWidget: (rowId: string, columnId: string, widgetType: WidgetTypeId) => string;
  removeWidget: (rowId: string, columnId: string) => void;
  moveWidget: (
    sourceRowId: string, 
    sourceColumnId: string, 
    targetRowId: string, 
    targetColumnId: string
  ) => void;
  updateWidgetConfig: (instanceId: string, config: Partial<WidgetConfig>) => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        dashboard: null,
        isDirty: false,
        isSaving: false,
        lastSaved: null,

        // Dashboard actions
        loadDashboard: async (id) => {
          const dashboard = await dashboardApi.load(id);
          set({ dashboard, isDirty: false });
        },

        saveDashboard: async () => {
          const { dashboard } = get();
          if (!dashboard) return;
          
          set({ isSaving: true });
          try {
            await dashboardApi.save(dashboard);
            set({ isDirty: false, lastSaved: new Date().toISOString() });
          } finally {
            set({ isSaving: false });
          }
        },

        setDashboardName: (name) => {
          set((state) => {
            if (state.dashboard) {
              state.dashboard.name = name;
              state.isDirty = true;
            }
          });
        },

        // Row actions
        addRow: (columns, insertAfter) => {
          const rowId = generateId('row');
          set((state) => {
            if (!state.dashboard) return;
            
            const newRow: DashboardRow = {
              id: rowId,
              title: 'Untitled Row',
              order: state.dashboard.rows.length,
              collapsed: false,
              height: 'auto',
              columns: Array.from({ length: columns }, (_, i) => ({
                id: generateId('col'),
                widthPercent: 100 / columns,
                widget: null,
              })),
            };

            if (insertAfter) {
              const index = state.dashboard.rows.findIndex(r => r.id === insertAfter);
              state.dashboard.rows.splice(index + 1, 0, newRow);
            } else {
              state.dashboard.rows.push(newRow);
            }
            
            reorderRows(state.dashboard.rows);
            state.isDirty = true;
          });
          return rowId;
        },

        moveRow: (rowId, newIndex) => {
          set((state) => {
            if (!state.dashboard) return;
            
            const rows = state.dashboard.rows;
            const currentIndex = rows.findIndex(r => r.id === rowId);
            if (currentIndex === -1) return;
            
            const [row] = rows.splice(currentIndex, 1);
            rows.splice(newIndex, 0, row);
            reorderRows(rows);
            state.isDirty = true;
          });
        },

        // Widget actions
        addWidget: (rowId, columnId, widgetType) => {
          const instanceId = generateId('widget');
          set((state) => {
            if (!state.dashboard) return;
            
            const row = state.dashboard.rows.find(r => r.id === rowId);
            const column = row?.columns.find(c => c.id === columnId);
            if (!column) return;

            const definition = widgetRegistry.get(widgetType);
            column.widget = {
              id: instanceId,
              widgetType,
              config: {
                title: definition.name,
                filters: [],
                display: { ...definition.defaultConfig.display },
              },
            };
            state.isDirty = true;
          });
          return instanceId;
        },

        moveWidget: (sourceRowId, sourceColumnId, targetRowId, targetColumnId) => {
          set((state) => {
            if (!state.dashboard) return;
            
            const sourceRow = state.dashboard.rows.find(r => r.id === sourceRowId);
            const targetRow = state.dashboard.rows.find(r => r.id === targetRowId);
            const sourceCol = sourceRow?.columns.find(c => c.id === sourceColumnId);
            const targetCol = targetRow?.columns.find(c => c.id === targetColumnId);
            
            if (!sourceCol?.widget || !targetCol) return;
            
            // Swap if target has widget, otherwise just move
            const temp = targetCol.widget;
            targetCol.widget = sourceCol.widget;
            sourceCol.widget = temp;
            state.isDirty = true;
          });
        },

        updateWidgetConfig: (instanceId, configPatch) => {
          set((state) => {
            if (!state.dashboard) return;
            
            for (const row of state.dashboard.rows) {
              for (const col of row.columns) {
                if (col.widget?.id === instanceId) {
                  col.widget.config = {
                    ...col.widget.config,
                    ...configPatch,
                  };
                  state.isDirty = true;
                  return;
                }
              }
            }
          });
        },

        // ... additional actions
      })),
      {
        name: 'dashboard-builder',
        partialize: (state) => ({ dashboard: state.dashboard }),
      }
    ),
    { name: 'DashboardStore' }
  )
);
```

### 4.2 Selection Store

```typescript
// src/stores/selectionStore.ts

import { create } from 'zustand';

interface SelectionState {
  selectedWidgetId: string | null;
  selectedRowId: string | null;
  hoveredColumnId: string | null;
  
  selectWidget: (instanceId: string | null) => void;
  selectRow: (rowId: string | null) => void;
  setHoveredColumn: (columnId: string | null) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedWidgetId: null,
  selectedRowId: null,
  hoveredColumnId: null,

  selectWidget: (instanceId) => set({ 
    selectedWidgetId: instanceId,
    selectedRowId: null,
  }),
  
  selectRow: (rowId) => set({ 
    selectedRowId: rowId,
    selectedWidgetId: null,
  }),
  
  setHoveredColumn: (columnId) => set({ hoveredColumnId: columnId }),
  
  clearSelection: () => set({ 
    selectedWidgetId: null, 
    selectedRowId: null,
  }),
}));
```

### 4.3 Undo/Redo Store

```typescript
// src/stores/undoStore.ts

import { create } from 'zustand';
import type { Dashboard } from '@/types/dashboard';

interface UndoState {
  past: Dashboard[];
  future: Dashboard[];
  maxHistory: number;
  
  pushState: (dashboard: Dashboard) => void;
  undo: () => Dashboard | null;
  redo: () => Dashboard | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

export const useUndoStore = create<UndoState>((set, get) => ({
  past: [],
  future: [],
  maxHistory: 50,

  pushState: (dashboard) => {
    set((state) => ({
      past: [...state.past.slice(-state.maxHistory + 1), structuredClone(dashboard)],
      future: [], // Clear redo stack on new action
    }));
  },

  undo: () => {
    const { past } = get();
    if (past.length === 0) return null;
    
    const previous = past[past.length - 1];
    set((state) => ({
      past: state.past.slice(0, -1),
      future: [previous, ...state.future],
    }));
    return previous;
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return null;
    
    const next = future[0];
    set((state) => ({
      past: [...state.past, next],
      future: state.future.slice(1),
    }));
    return next;
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  clear: () => set({ past: [], future: [] }),
}));
```

---

## 5. Drag & Drop Implementation

### 5.1 DnD Kit Setup

```typescript
// src/components/dashboard-builder/DndProvider.tsx

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import type { DragData, DropTarget } from '@/types/dnd';

export function DashboardDndProvider({ children }: { children: React.ReactNode }) {
  const [activeData, setActiveData] = useState<DragData | null>(null);
  const [overTarget, setOverTarget] = useState<DropTarget | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData;
    setActiveData(data);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const over = event.over;
    if (!over) {
      setOverTarget(null);
      return;
    }
    setOverTarget(over.data.current as DropTarget);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !activeData) {
      setActiveData(null);
      setOverTarget(null);
      return;
    }

    const target = over.data.current as DropTarget;
    
    if (activeData.type === 'widget-palette' && target.type === 'column') {
      // Add new widget from palette
      useDashboardStore.getState().addWidget(
        target.rowId!,
        target.columnId!,
        activeData.widgetType!
      );
    } else if (activeData.type === 'widget-canvas' && target.type === 'column') {
      // Move existing widget
      useDashboardStore.getState().moveWidget(
        activeData.rowId!,
        activeData.sourceColumnId!,
        target.rowId!,
        target.columnId!
      );
    } else if (activeData.type === 'row' && target.type === 'row-gap') {
      // Reorder row
      useDashboardStore.getState().moveRow(activeData.rowId!, target.insertIndex!);
    }

    setActiveData(null);
    setOverTarget(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      
      <DragOverlay dropAnimation={null}>
        {activeData && <DragPreview data={activeData} />}
      </DragOverlay>
    </DndContext>
  );
}
```

### 5.2 Draggable Palette Item

```typescript
// src/components/dashboard-builder/widget-library/WidgetPaletteItem.tsx

import { useDraggable } from '@dnd-kit/core';
import type { WidgetDefinition } from '@/types/widget-registry';
import type { DragData } from '@/types/dnd';
import styles from './WidgetLibrary.module.css';

interface Props {
  definition: WidgetDefinition;
}

export function WidgetPaletteItem({ definition }: Props) {
  const dragData: DragData = {
    type: 'widget-palette',
    widgetType: definition.id,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.id}`,
    data: dragData,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.paletteItem} ${isDragging ? styles.dragging : ''}`}
      {...listeners}
      {...attributes}
    >
      <span className={styles.paletteIcon}>{definition.icon}</span>
      <div>
        <div className={styles.paletteName}>{definition.name}</div>
        <div className={styles.paletteDesc}>{definition.description}</div>
      </div>
    </div>
  );
}
```

### 5.3 Droppable Column

```typescript
// src/components/dashboard-builder/canvas/ColumnDropZone.tsx

import { useDroppable } from '@dnd-kit/core';
import type { DropTarget } from '@/types/dnd';
import styles from './Canvas.module.css';

interface Props {
  rowId: string;
  columnId: string;
  children: React.ReactNode;
  hasWidget: boolean;
}

export function ColumnDropZone({ rowId, columnId, children, hasWidget }: Props) {
  const dropData: DropTarget = {
    type: 'column',
    rowId,
    columnId,
  };

  const { setNodeRef, isOver, active } = useDroppable({
    id: `drop-${columnId}`,
    data: dropData,
    disabled: hasWidget, // Can't drop on occupied column
  });

  const showDropIndicator = isOver && active && !hasWidget;

  return (
    <div
      ref={setNodeRef}
      className={`${styles.column} ${showDropIndicator ? styles.dropTarget : ''}`}
    >
      {children}
      {!hasWidget && (
        <div className={styles.emptyPlaceholder}>
          Drop widget here
        </div>
      )}
    </div>
  );
}
```

---

## 6. Widget Registry Pattern

### 6.1 Registry Implementation

```typescript
// src/components/widgets/registry.ts

import type { WidgetDefinition, WidgetTypeId } from '@/types/widget-registry';

// KPI Widgets
import { KpiCard, KpiCardConfig, kpiDefinitions } from './kpi';
import { OutcomesChart, OutcomesChartConfig } from './charts/OutcomesChart';
import { VolumeChart, VolumeChartConfig } from './charts/VolumeChart';
import { IvrFunnelChart, IvrFunnelChartConfig } from './charts/IvrFunnelChart';
import { QueueHealthChart, QueueHealthChartConfig } from './charts/QueueHealthChart';
import { QueueSnapshotTable, QueueSnapshotTableConfig } from './tables/QueueSnapshotTable';

const definitions: WidgetDefinition[] = [
  // KPI Cards (16 total)
  ...kpiDefinitions,
  
  // Charts
  {
    id: 'chart-outcomes',
    name: 'Call Outcome Mix',
    description: 'Doughnut chart of handled, missed, IVR, abandon',
    category: 'chart',
    icon: '🍩',
    minWidth: 280,
    minHeight: 260,
    supportedFilters: ['dateRange', 'queue'],
    supportsPivot: false,
    dataSource: {
      endpoint: '/api/metrics/outcomes',
      method: 'GET',
      defaultParams: {},
      refreshable: true,
    },
    defaultConfig: {
      display: {
        colorTheme: 'blue',
        showTrend: false,
        showComparison: false,
        showSparkline: false,
        numberFormat: 'full',
        chartOptions: { showLegend: true, cutout: '62%' },
      },
    },
    component: OutcomesChart,
    configComponent: OutcomesChartConfig,
  },
  {
    id: 'chart-volume',
    name: 'Hourly Contact Volume',
    description: 'Line chart of offered vs answered',
    category: 'chart',
    icon: '📈',
    minWidth: 320,
    minHeight: 260,
    supportedFilters: ['dateRange', 'queue'],
    supportsPivot: true,
    dataSource: {
      endpoint: '/api/metrics/volume',
      method: 'GET',
      defaultParams: { groupBy: 'hour' },
      refreshable: true,
    },
    defaultConfig: {
      display: {
        colorTheme: 'blue',
        showTrend: false,
        showComparison: false,
        showSparkline: false,
        numberFormat: 'full',
        chartOptions: { showLegend: true, fill: true },
      },
    },
    component: VolumeChart,
    configComponent: VolumeChartConfig,
  },
  // ... more chart definitions
  
  // Tables
  {
    id: 'table-queue-snapshot',
    name: 'Live Queue Snapshot',
    description: 'Real-time queue status table',
    category: 'table',
    icon: '📋',
    minWidth: 400,
    minHeight: 200,
    supportedFilters: ['queue'],
    supportsPivot: false,
    dataSource: {
      endpoint: '/api/realtime/queues',
      method: 'GET',
      defaultParams: {},
      refreshable: true,
    },
    defaultConfig: {
      display: {
        colorTheme: 'blue',
        showTrend: false,
        showComparison: false,
        showSparkline: false,
        numberFormat: 'full',
      },
    },
    component: QueueSnapshotTable,
    configComponent: QueueSnapshotTableConfig,
  },
];

class WidgetRegistry {
  private definitions = new Map<WidgetTypeId, WidgetDefinition>();

  constructor() {
    definitions.forEach(def => this.definitions.set(def.id, def));
  }

  get(id: WidgetTypeId): WidgetDefinition {
    const def = this.definitions.get(id);
    if (!def) throw new Error(`Widget "${id}" not found in registry`);
    return def;
  }

  getAll(): WidgetDefinition[] {
    return Array.from(this.definitions.values());
  }

  getByCategory(category: WidgetCategory): WidgetDefinition[] {
    return this.getAll().filter(d => d.category === category);
  }

  getCategories(): WidgetCategory[] {
    const categories = new Set(this.getAll().map(d => d.category));
    return Array.from(categories);
  }
}

export const widgetRegistry = new WidgetRegistry();
```

### 6.2 Widget Renderer

```typescript
// src/components/widgets/WidgetRenderer.tsx

import { Suspense, useMemo } from 'react';
import { widgetRegistry } from './registry';
import { useWidgetData } from '@/hooks/useWidgetData';
import type { WidgetInstance } from '@/types/dashboard';
import styles from './Widget.module.css';

interface Props {
  instance: WidgetInstance;
  width: number;
  height: number;
  isSelected: boolean;
  isPreview?: boolean;
  onSelect: () => void;
}

export function WidgetRenderer({ 
  instance, 
  width, 
  height, 
  isSelected, 
  isPreview = false,
  onSelect,
}: Props) {
  const definition = useMemo(
    () => widgetRegistry.get(instance.widgetType),
    [instance.widgetType]
  );

  const { data, loading, error, refetch } = useWidgetData(
    definition.dataSource,
    instance.config.filters
  );

  const WidgetComponent = definition.component;

  return (
    <div 
      className={`${styles.widgetContainer} ${isSelected ? styles.selected : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <Suspense fallback={<WidgetSkeleton width={width} height={height} />}>
        <WidgetComponent
          instance={instance}
          width={width}
          height={height}
          isSelected={isSelected}
          isPreview={isPreview}
          data={data}
          loading={loading}
          error={error}
          onSelect={onSelect}
        />
      </Suspense>
      
      {!isPreview && (
        <button className={styles.kebabMenu} onClick={(e) => {
          e.stopPropagation();
          // Show context menu
        }}>
          ⋮
        </button>
      )}
    </div>
  );
}
```

---

## 7. API Integration

### 7.1 Dashboard API Service

```typescript
// src/services/dashboardApi.ts

import type { Dashboard } from '@/types/dashboard';

const API_BASE = '/api/dashboards';

export const dashboardApi = {
  async list(): Promise<DashboardSummary[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to load dashboards');
    return res.json();
  },

  async load(id: string): Promise<Dashboard> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Failed to load dashboard');
    return res.json();
  },

  async save(dashboard: Dashboard): Promise<Dashboard> {
    const method = dashboard.id.startsWith('new-') ? 'POST' : 'PUT';
    const url = method === 'POST' ? API_BASE : `${API_BASE}/${dashboard.id}`;
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dashboard),
    });
    
    if (!res.ok) throw new Error('Failed to save dashboard');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete dashboard');
  },

  async duplicate(id: string): Promise<Dashboard> {
    const res = await fetch(`${API_BASE}/${id}/duplicate`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to duplicate dashboard');
    return res.json();
  },
};
```

### 7.2 Widget Data Hook

```typescript
// src/hooks/useWidgetData.ts

import { useEffect, useState, useCallback } from 'react';
import type { DataSourceConfig, FilterConfig } from '@/types/dashboard';

interface UseWidgetDataResult<T = unknown> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useWidgetData<T = unknown>(
  dataSource: DataSourceConfig,
  filters: FilterConfig[]
): UseWidgetDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      // Add default params
      Object.entries(dataSource.defaultParams).forEach(([key, value]) => {
        params.set(key, String(value));
      });
      
      // Add filter params
      filters.forEach(filter => {
        if (!filter.inherited) {
          params.set(filter.field, serializeFilterValue(filter));
        }
      });

      const url = `${dataSource.endpoint}?${params}`;
      const res = await fetch(url, { method: dataSource.method });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      let rawData = await res.json();
      
      if (dataSource.transform) {
        rawData = dataSource.transform(rawData);
      }
      
      setData(rawData as T);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [dataSource, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

---

## 8. Layout & Styling

### 8.1 CSS Variables (Theme)

```css
/* src/styles/theme.css */

:root {
  /* Background */
  --bg-deep: #0b0f14;
  --bg-panel: rgba(18, 24, 31, 0.92);
  --bg-card: #161d27;
  --bg-hover: #1c2533;
  
  /* Borders */
  --border-default: rgba(255, 255, 255, 0.08);
  --border-active: rgba(61, 156, 245, 0.5);
  --border-drop: rgba(52, 211, 153, 0.6);
  
  /* Text */
  --text-primary: #e8edf4;
  --text-muted: #8b9cb3;
  --text-accent: #3d9cf5;
  
  /* Accent colors */
  --accent-blue: #3d9cf5;
  --accent-green: #34d399;
  --accent-yellow: #fbbf24;
  --accent-red: #f87171;
  --accent-purple: #a78bfa;
  --accent-teal: #2dd4bf;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Layout */
  --sidebar-width: 220px;
  --config-panel-width: 300px;
  --header-height: 56px;
  --row-header-height: 40px;
  
  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  
  /* Shadows */
  --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.3);
  --shadow-drag: 0 12px 40px rgba(0, 0, 0, 0.5);
  --shadow-dropdown: 0 8px 24px rgba(0, 0, 0, 0.4);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
}

/* Light theme override (if needed) */
[data-theme="light"] {
  --bg-deep: #f5f7fa;
  --bg-panel: rgba(255, 255, 255, 0.95);
  --bg-card: #ffffff;
  --bg-hover: #f0f2f5;
  --border-default: rgba(0, 0, 0, 0.08);
  --text-primary: #1a1f25;
  --text-muted: #6b7684;
}
```

### 8.2 Builder Shell Grid

```css
/* src/components/dashboard-builder/BuilderShell.module.css */

.shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr var(--config-panel-width);
  grid-template-rows: 1fr;
  height: calc(100vh - var(--header-height));
  min-height: 0;
}

.shell[data-config-collapsed="true"] {
  grid-template-columns: var(--sidebar-width) 1fr 0;
}

.lhs {
  grid-column: 1;
  border-right: 1px solid var(--border-default);
  background: var(--bg-panel);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.canvas {
  grid-column: 2;
  overflow: auto;
  padding: var(--spacing-lg);
  background: var(--bg-deep);
}

.rhs {
  grid-column: 3;
  border-left: 1px solid var(--border-default);
  background: var(--bg-panel);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
}

/* Responsive */
@media (max-width: 1100px) {
  .shell {
    grid-template-columns: 48px 1fr 0;
  }
  
  .shell[data-config-open="true"] {
    grid-template-columns: 48px 1fr var(--config-panel-width);
  }
  
  .lhs {
    /* Icon-only mode */
  }
  
  .rhs {
    position: fixed;
    right: 0;
    top: var(--header-height);
    bottom: 0;
    width: var(--config-panel-width);
    transform: translateX(100%);
    z-index: 100;
    box-shadow: var(--shadow-dropdown);
  }
  
  .shell[data-config-open="true"] .rhs {
    transform: translateX(0);
  }
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// src/stores/__tests__/dashboardStore.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore } from '../dashboardStore';

describe('DashboardStore', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      dashboard: {
        id: 'test-1',
        name: 'Test Dashboard',
        ownerId: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rows: [],
        globalFilters: [],
        theme: { id: 'default', name: 'Default', variables: {} },
      },
      isDirty: false,
    });
  });

  it('should add a row with correct columns', () => {
    const store = useDashboardStore.getState();
    const rowId = store.addRow(3);
    
    const dashboard = useDashboardStore.getState().dashboard!;
    expect(dashboard.rows).toHaveLength(1);
    expect(dashboard.rows[0].columns).toHaveLength(3);
    expect(dashboard.rows[0].columns[0].widthPercent).toBe(33.333);
  });

  it('should move widget between columns', () => {
    const store = useDashboardStore.getState();
    const rowId = store.addRow(2);
    
    const dashboard = useDashboardStore.getState().dashboard!;
    const col1Id = dashboard.rows[0].columns[0].id;
    const col2Id = dashboard.rows[0].columns[1].id;
    
    store.addWidget(rowId, col1Id, 'kpi-calls-offered');
    store.moveWidget(rowId, col1Id, rowId, col2Id);
    
    const updated = useDashboardStore.getState().dashboard!;
    expect(updated.rows[0].columns[0].widget).toBeNull();
    expect(updated.rows[0].columns[1].widget).not.toBeNull();
  });
});
```

### 9.2 Component Tests

```typescript
// src/components/widgets/__tests__/KpiCard.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from '../kpi/KpiCard';

describe('KpiCard', () => {
  const mockInstance = {
    id: 'widget-1',
    widgetType: 'kpi-calls-offered' as const,
    config: {
      title: 'Calls Offered',
      filters: [],
      display: {
        colorTheme: 'blue' as const,
        showTrend: true,
        showComparison: true,
        showSparkline: false,
        numberFormat: 'compact' as const,
      },
    },
  };

  it('renders value correctly', () => {
    render(
      <KpiCard
        instance={mockInstance}
        width={200}
        height={150}
        isSelected={false}
        isPreview={false}
        data={{ value: 12847, trend: 4.2, comparison: 12320 }}
        loading={false}
        error={null}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('12.8K')).toBeInTheDocument();
    expect(screen.getByText('▲ 4.2%')).toBeInTheDocument();
  });

  it('shows loading skeleton', () => {
    render(
      <KpiCard
        instance={mockInstance}
        width={200}
        height={150}
        isSelected={false}
        isPreview={false}
        data={null}
        loading={true}
        error={null}
        onSelect={() => {}}
      />
    );

    expect(screen.getByTestId('kpi-skeleton')).toBeInTheDocument();
  });
});
```

### 9.3 E2E Tests (Playwright)

```typescript
// e2e/dashboard-builder.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dashboard Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/builder');
  });

  test('should create a row and add widget', async ({ page }) => {
    // Click add row
    await page.click('[data-testid="add-row-btn"]');
    
    // Select 3 columns
    await page.click('[data-testid="col-option-3"]');
    await page.click('[data-testid="apply-row-settings"]');
    
    // Verify row created
    await expect(page.locator('[data-testid="dashboard-row"]')).toHaveCount(1);
    
    // Drag widget to first column
    const widget = page.locator('[data-testid="palette-kpi-calls-offered"]');
    const column = page.locator('[data-testid="column-drop-zone"]').first();
    
    await widget.dragTo(column);
    
    // Verify widget placed
    await expect(page.locator('[data-testid="widget-container"]')).toHaveCount(1);
  });

  test('should configure widget via RHS panel', async ({ page }) => {
    // Setup: create row with widget
    await page.click('[data-testid="add-row-btn"]');
    await page.click('[data-testid="col-option-1"]');
    await page.click('[data-testid="apply-row-settings"]');
    
    const widget = page.locator('[data-testid="palette-kpi-calls-offered"]');
    const column = page.locator('[data-testid="column-drop-zone"]').first();
    await widget.dragTo(column);
    
    // Click widget to open config
    await page.click('[data-testid="widget-container"]');
    
    // Verify config panel opened
    await expect(page.locator('[data-testid="config-panel"]')).toBeVisible();
    
    // Change title
    await page.fill('[data-testid="widget-title-input"]', 'My Custom Title');
    await page.click('[data-testid="apply-config-btn"]');
    
    // Verify title updated
    await expect(page.locator('.widget-title')).toHaveText('My Custom Title');
  });
});
```

---

## 10. Performance Considerations

### 10.1 Virtualization for Large Dashboards

```typescript
// For dashboards with many rows, use virtualization
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedRowList({ rows }: { rows: DashboardRow[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => rows[index].height === 'auto' ? 280 : rows[index].height,
    overscan: 2,
  });

  return (
    <div ref={parentRef} className={styles.rowListContainer}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <DashboardRow
            key={rows[virtualRow.index].id}
            row={rows[virtualRow.index]}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              width: '100%',
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### 10.2 Memoization Strategy

```typescript
// Memoize expensive computations
const MemoizedWidget = memo(WidgetRenderer, (prev, next) => {
  return (
    prev.instance.id === next.instance.id &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.isSelected === next.isSelected &&
    shallowEqual(prev.instance.config, next.instance.config)
  );
});

// Memoize row components
const MemoizedRow = memo(DashboardRow, (prev, next) => {
  return (
    prev.row.id === next.row.id &&
    prev.row.title === next.row.title &&
    prev.row.collapsed === next.row.collapsed &&
    prev.row.columns.length === next.row.columns.length
  );
});
```

### 10.3 Debounced Auto-Save

```typescript
// src/hooks/useAutoSave.ts

import { useEffect, useRef } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';

export function useAutoSave(intervalMs = 30000) {
  const saveTimeoutRef = useRef<number>();
  const { isDirty, saveDashboard } = useDashboardStore();

  useEffect(() => {
    if (isDirty) {
      // Debounce save
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(() => {
        saveDashboard();
      }, 5000); // 5 second debounce
    }

    return () => clearTimeout(saveTimeoutRef.current);
  }, [isDirty, saveDashboard]);

  // Also save on interval if dirty
  useEffect(() => {
    const interval = setInterval(() => {
      const { isDirty } = useDashboardStore.getState();
      if (isDirty) {
        saveDashboard();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, saveDashboard]);
}
```

---

## 11. Deployment Considerations

### 11.1 Feature Flags

```typescript
// src/config/features.ts

export const featureFlags = {
  DASHBOARD_BUILDER_ENABLED: true,
  CUSTOM_WIDGETS: false,
  COLLABORATIVE_EDITING: false,
  EXPORT_PDF: false,
  REALTIME_PREVIEW: true,
};
```

### 11.2 Error Boundary

```typescript
// src/components/ErrorBoundary.tsx

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Dashboard Builder Error:', error, info);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 12. Migration Path

### 12.1 Phase 1: Foundation
- Set up project structure and types
- Implement dashboard store with basic CRUD
- Build widget registry with existing widgets
- Create three-panel shell layout

### 12.2 Phase 2: Core Features
- Implement drag & drop with @dnd-kit
- Build row/column management
- Create widget configuration panel
- Add persistence (save/load)

### 12.3 Phase 3: Polish
- Add undo/redo
- Implement keyboard shortcuts
- Add preview mode
- Performance optimization

### 12.4 Phase 4: Advanced
- Collaborative editing (future)
- Custom widget creation (future)
- Export/Import functionality
- Mobile responsive layout

---

*End of Technical Architecture Document*
