import { useCallback } from 'react';
import { Editor } from '@monaco-editor/react';

interface CodeEditorProps {
  content: string;
  language: string;
  onChange: (value: string) => void;
  onSave: () => void;
  theme: 'vs-dark' | 'vs-light';
}

export function CodeEditor({
  content,
  language,
  onChange,
  onSave,
  theme,
}: Readonly<CodeEditorProps>) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
    },
    [onSave],
  );

  return (
    <div className="h-full" onKeyDown={handleKeyDown}>
      <Editor
        height="100%"
        language={language}
        value={content}
        theme={theme}
        onChange={(val) => onChange(val ?? '')}
        options={{
          minimap: { enabled: true },
          fontSize: 13,
          lineNumbers: 'on' as const,
          wordWrap: 'on' as const,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}
