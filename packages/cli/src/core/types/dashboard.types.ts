export interface WidgetPlacement {
  id: string;
  extensionName: string;
  widgetId: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
}

export interface DashboardLayout {
  widgets: WidgetPlacement[];
}
