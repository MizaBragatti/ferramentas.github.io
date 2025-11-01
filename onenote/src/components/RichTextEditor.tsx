

import dynamic from 'next/dynamic';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Type,
  Palette
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  editable?: boolean;
}

function RichTextEditorComponent({ content, onUpdate, editable = true }: RichTextEditorProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!isClient || !editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      {editable && (
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
          {/* ...existing code... */}
        </div>
      )}
      <EditorContent 
        editor={editor} 
        className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(RichTextEditorComponent), { ssr: false });