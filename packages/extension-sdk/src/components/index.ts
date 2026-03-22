// RenreKit Extension SDK — Shared Components (shadcn/ui based)

// Custom components
export { Panel } from './Panel';
export type { PanelProps } from './Panel';

export { DataTable } from './DataTable';
export type { DataTableProps, DataTableColumn } from './DataTable';

export { CodeBlock } from './CodeBlock';
export type { CodeBlockProps } from './CodeBlock';

export { MarkdownRenderer } from './MarkdownRenderer';
export type { MarkdownRendererProps } from './MarkdownRenderer';

export { LogViewer } from './LogViewer';
export type { LogViewerProps } from './LogViewer';

export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export { Spinner } from './Spinner';
export type { SpinnerProps } from './Spinner';

export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { SearchBar } from './SearchBar';
export type { SearchBarProps } from './SearchBar';

export { Split } from './Split';
export type { SplitProps } from './Split';

export { SidebarNav } from './SidebarNav';
export type { SidebarNavProps, SidebarNavItem } from './SidebarNav';

export { StatusWidget } from './StatusWidget';
export type { StatusWidgetProps } from './StatusWidget';

export { MyTasksWidget } from './MyTasksWidget';
export type { MyTasksWidgetProps } from './MyTasksWidget';

export { ConfluenceUpdatesWidget } from './ConfluenceUpdatesWidget';
export type { ConfluenceUpdatesWidgetProps } from './ConfluenceUpdatesWidget';

export { CommentsWidget } from './CommentsWidget';
export type { CommentsWidgetProps } from './CommentsWidget';

// shadcn/ui — Layout
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './ui/card';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
export { Separator } from './ui/separator';
export { ScrollArea, ScrollBar } from './ui/scroll-area';

// shadcn/ui — Forms
export { Button, buttonVariants } from './ui/button';
export { Input } from './ui/input';
export { Label } from './ui/label';
export { Checkbox } from './ui/checkbox';
export { Switch } from './ui/switch';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from './ui/select';

// shadcn/ui — Feedback
export { Alert, AlertTitle, AlertDescription } from './ui/alert';
export { Badge, badgeVariants } from './ui/badge';
export { Skeleton } from './ui/skeleton';
export { Progress } from './ui/progress';
export {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './ui/toast';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip';

// shadcn/ui — Data
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './ui/table';

// shadcn/ui — Overlays
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
