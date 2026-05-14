import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, List, ListOrdered, Link2, Eraser } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  insertUnorderedList: boolean;
  insertOrderedList: boolean;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>({
    bold: false,
    italic: false,
    underline: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  // Sync value in when not focused
  useEffect(() => {
    if (!editorRef.current || isFocused) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value, isFocused]);

  // Update active format states based on current selection
  const updateActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  // Listen for selection changes to update toolbar state
  useEffect(() => {
    document.addEventListener("selectionchange", updateActiveFormats);
    return () => document.removeEventListener("selectionchange", updateActiveFormats);
  }, [updateActiveFormats]);

  const exec = (command: string, arg?: string) => {
    // Focus first, then execute — this is the key fix for bold not working
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    // Small trick: use mousedown instead of click so selection is never lost.
    // But as a fallback, if selection is collapsed inside editor, we still exec.
    document.execCommand(command, false, arg ?? undefined);

    // Notify parent of new HTML
    onChange(editor.innerHTML || "");

    // Refresh toolbar states
    updateActiveFormats();
  };

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || "";
    onChange(html);
    updateActiveFormats();
  };

  const handleLink = () => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    exec("createLink", url);
  };

  const toolbarButton = (
    command: keyof ActiveFormats | null,
    icon: React.ReactNode,
    onClick: () => void,
    title: string
  ) => {
    const isActive = command ? activeFormats[command] : false;
    return (
      <Button
        type="button"
        size="sm"
        title={title}
        variant={isActive ? "default" : "outline"}
        className={`transition-colors ${
          isActive
            ? "bg-foreground text-background hover:bg-foreground/90 border-foreground"
            : ""
        }`}
        // Use onMouseDown + preventDefault to prevent the editor from losing focus/selection
        onMouseDown={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        {icon}
      </Button>
    );
  };

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1.5 p-2 rounded-t-md border border-b-0 border-input bg-muted/40">
        {toolbarButton("bold", <Bold className="h-4 w-4" />, () => exec("bold"), "Bold")}
        {toolbarButton("italic", <Italic className="h-4 w-4" />, () => exec("italic"), "Italic")}
        {toolbarButton("underline", <Underline className="h-4 w-4" />, () => exec("underline"), "Underline")}
        <div className="w-px bg-border mx-0.5 self-stretch" />
        {toolbarButton(
          "insertUnorderedList",
          <List className="h-4 w-4" />,
          () => exec("insertUnorderedList"),
          "Bullet list"
        )}
        {toolbarButton(
          "insertOrderedList",
          <ListOrdered className="h-4 w-4" />,
          () => exec("insertOrderedList"),
          "Numbered list"
        )}
        <div className="w-px bg-border mx-0.5 self-stretch" />
        {toolbarButton(null, <Link2 className="h-4 w-4" />, handleLink, "Insert link")}
        {toolbarButton(null, <Eraser className="h-4 w-4" />, () => exec("removeFormat"), "Clear formatting")}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={`min-h-40 w-full rounded-b-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring
          prose prose-sm prose-neutral dark:prose-invert max-w-none
          [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5`}
        onInput={handleInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onFocus={() => {
          setIsFocused(true);
          updateActiveFormats();
        }}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {placeholder && (
        <style>{`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
        `}</style>
      )}
    </div>
  );
};

export default RichTextEditor;