import type { OpenTab } from './types.js';
import { TabBar } from './TabBar.js';
import { CodeEditor } from './CodeEditor.js';

interface EditorAreaProps {
  tabs: OpenTab[];
  activeTabIndex: number;
  activeTab: OpenTab | null;
  theme: 'vs-dark' | 'vs-light';
  onSelectTab: (index: number) => void;
  onCloseTab: (index: number) => void;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onToggleTheme: () => void;
}

export function EditorArea({
  tabs,
  activeTabIndex,
  activeTab,
  theme,
  onSelectTab,
  onCloseTab,
  onContentChange,
  onSave,
  onToggleTheme,
}: Readonly<EditorAreaProps>) {
  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
        <div className="text-6xl">{'\uD83D\uDCDD'}</div>
        <div className="text-lg font-medium">No file open</div>
        <div className="text-sm">Select a file from the explorer to start editing</div>
        <div className="text-xs text-muted-foreground/60 mt-4 space-y-1 text-center">
          <div>Ctrl+S {'\u2014'} Save file</div>
          <div>Right-click {'\u2014'} Context menu</div>
          <div>Drag & drop {'\u2014'} Move files</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TabBar
        tabs={tabs}
        activeIndex={activeTabIndex}
        onSelect={onSelectTab}
        onClose={onCloseTab}
      />

      <div className="flex items-center justify-between px-3 py-1 border-b bg-muted/20">
        <span className="text-xs text-muted-foreground truncate">
          {activeTab?.path}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {activeTab?.language}
          </span>
          <button
            className="text-xs px-2 py-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            onClick={onToggleTheme}
          >
            {theme === 'vs-dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          </button>
          <button
            className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            onClick={onSave}
            disabled={!activeTab?.modified}
          >
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab && (
          <CodeEditor
            content={activeTab.content}
            language={activeTab.language}
            onChange={onContentChange}
            onSave={onSave}
            theme={theme}
          />
        )}
      </div>
    </>
  );
}
